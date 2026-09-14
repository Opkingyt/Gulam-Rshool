import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { BillingScreen } from './components/BillingScreen';
import { CartView } from './components/CartView';
import { BillHistoryScreen } from './components/BillHistoryScreen';
import { SalesDashboard } from './components/SalesDashboard';
import { MenuManagement } from './components/MenuManagement';
import { BluetoothPrinterScreen } from './components/BluetoothPrinterScreen';
import { HotelSettingsScreen } from './components/HotelSettingsScreen';
import { ReceiptModal } from './components/ReceiptModal';
import { PrintableReceipt } from './components/PrintableReceipt';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { MobileAppScreen } from './components/MobileAppScreen';
import { AIAssistantScreen } from './components/AIAssistantScreen';
import { TableQR } from './components/TableQR';
import { CustomerOrderView } from './components/CustomerOrderView';
import { LiveTableOrdersScreen } from './components/LiveTableOrdersScreen';
import { IncomingOrderBanner } from './components/IncomingOrderBanner';
import { tableOrderService } from './services/tableOrderService';

import {
  ActiveTab,
  Bill,
  CartItem,
  Category,
  HotelSettings,
  MenuItem,
  PaymentMethod,
  TableOrder,
} from './types';
import {
  DEFAULT_CATEGORIES,
  storageService,
} from './services/storage';
import { soundService } from './services/audio';
import { bluetoothPrinterService } from './services/printer';

export default function App() {
  // Check URL for customer table QR scan (e.g. ?table=5)
  const [customerTableNo, setCustomerTableNo] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('table');
    }
    return null;
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('billing');

  // Core Data
  const [settings, setSettings] = useState<HotelSettings>(() => storageService.getSettings());
  const [menu, setMenu] = useState<MenuItem[]>(() => storageService.getMenu());
  const categories: Category[] = DEFAULT_CATEGORIES;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bills, setBills] = useState<Bill[]>(() => storageService.getBills());
  const [tableOrders, setTableOrders] = useState<TableOrder[]>([]);

  // Theme & Sound
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kohinoor_dark_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => settings.soundEnabled ?? true);

  // Bluetooth State
  const [isBluetoothConnected, setIsBluetoothConnected] = useState<boolean>(false);
  const [connectedPrinterName, setConnectedPrinterName] = useState<string | null>(null);

  // Receipt Modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [activeReceiptBill, setActiveReceiptBill] = useState<Bill | null>(null);

  // Live Next Bill Number
  const nextBillInfo = useMemo(() => {
    return storageService.getNextBillNumber();
  }, [bills, settings.currentBillCounter, settings.billPrefix]);

  // Sync Dark Mode class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kohinoor_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Subscribe to table orders & sync initial menu to cloud for customer devices
  useEffect(() => {
    const unsubscribe = tableOrderService.subscribeToOrders((orders) => {
      setTableOrders(orders);
    });
    
    // Push the local menu (with any existing photos) to cloud so customers can see them
    if (!customerTableNo) {
      tableOrderService.syncMenuToCloud(menu).catch(e => console.error("Initial menu sync failed", e));
    }

    return () => unsubscribe();
  }, []);

  const pendingOrdersCount = useMemo(() => {
    return tableOrders.filter((o) => o.status === 'NEW' || o.status === 'pending').length;
  }, [tableOrders]);

  // Periodic Bluetooth connection check
  useEffect(() => {
    const interval = setInterval(() => {
      const connected = bluetoothPrinterService.isConnected();
      if (connected !== isBluetoothConnected) {
        setIsBluetoothConnected(connected);
        setConnectedPrinterName(bluetoothPrinterService.getConnectedDeviceName());
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isBluetoothConnected]);

  // Sound & Haptic helper for mobile
  const playSfx = (type: 'beep' | 'success' | 'cash' | 'delete') => {
    if ('vibrate' in navigator) {
      try {
        if (type === 'beep') navigator.vibrate(15);
        if (type === 'delete') navigator.vibrate(25);
        if (type === 'cash' || type === 'success') navigator.vibrate([30, 40, 30]);
      } catch {}
    }
    if (!soundEnabled) return;
    if (type === 'beep') soundService.playBeep();
    if (type === 'success') soundService.playSuccess();
    if (type === 'cash') soundService.playCashRegister();
    if (type === 'delete') soundService.playDelete();
  };

  // Cart Management
  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const index = prev.findIndex(c => c.item.id === item.id);
      if (index > -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], quantity: updated[index].quantity + 1 };
        return updated;
      }
      return [...prev, { item, quantity: 1 }];
    });
    playSfx('beep');
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const index = prev.findIndex(c => c.item.id === itemId);
      if (index === -1) return prev;
      if (prev[index].quantity > 1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], quantity: updated[index].quantity - 1 };
        return updated;
      }
      return prev.filter(c => c.item.id !== itemId);
    });
    playSfx('delete');
  };

  const handleDeleteLineItem = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
    playSfx('delete');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Convert incoming table order directly into a completed Bill
  const handleConvertTableOrderToBill = async (order: TableOrder) => {
    const itemsToAdd: CartItem[] = [];
    for (const it of order.items) {
      let menuItem = menu.find(m => m.id === it.itemId);
      if (!menuItem) {
        menuItem = {
          id: it.itemId,
          name: it.name,
          price: it.price,
          category: 'special_veg',
          isVeg: it.isVeg ?? true,
        };
      }
      itemsToAdd.push({
        item: menuItem,
        quantity: it.quantity,
      });
    }

    const subtotal = itemsToAdd.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const { billNumber, nextCounter } = storageService.getNextBillNumber();

    const newBill: Bill = {
      id: 'bill-' + Date.now(),
      billNumber,
      date: dateStr,
      time: timeStr,
      timestamp: now.getTime(),
      items: itemsToAdd.map(c => ({
        id: c.item.id,
        name: c.item.name,
        hindiName: c.item.hindiName,
        marathiName: c.item.marathiName,
        englishName: c.item.englishName,
        price: c.item.price,
        quantity: c.quantity,
        total: c.item.price * c.quantity,
      })),
      subtotal,
      discount: 0,
      tax: 0,
      grandTotal: subtotal,
      paymentMethod: 'CASH',
      tableNo: order.tableNo,
    };

    // Commit to persistent local storage
    storageService.addBill(newBill);
    storageService.commitBillCounter(nextCounter);

    // Update state
    setBills(storageService.getBills());
    
    // Mark order as completed in Firestore so it immediately disappears from active lists & notifications
    await tableOrderService.updateStatus(order.id, 'completed');

    playSfx('cash');

    // If Bluetooth printer is connected, attempt direct print
    if (isBluetoothConnected) {
      try {
        await bluetoothPrinterService.printBill(newBill, settings);
      } catch (err) {
        console.warn('Bluetooth print failed', err);
      }
    }
  };

  // Complete and Print Bill
  const handlePrintBill = async (paymentDetails: {
    paymentMethod: PaymentMethod;
    tableNo?: string;
    waiterName?: string;
    customerName?: string;
    customerPhone?: string;
    discount: number;
  }) => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
    const discount = Math.min(paymentDetails.discount || 0, subtotal);
    const grandTotal = Math.max(0, subtotal - discount);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const { billNumber, nextCounter } = storageService.getNextBillNumber();

    const newBill: Bill = {
      id: 'bill-' + Date.now(),
      billNumber,
      date: dateStr,
      time: timeStr,
      timestamp: now.getTime(),
      items: cart.map(c => ({
        id: c.item.id,
        name: c.item.name,
        hindiName: c.item.hindiName,
        marathiName: c.item.marathiName,
        englishName: c.item.englishName,
        price: c.item.price,
        quantity: c.quantity,
        total: c.item.price * c.quantity,
      })),
      subtotal,
      discount,
      tax: 0,
      grandTotal,
      paymentMethod: paymentDetails.paymentMethod,
      tableNo: paymentDetails.tableNo,
      waiterName: paymentDetails.waiterName,
      customerName: paymentDetails.customerName,
      customerPhone: paymentDetails.customerPhone,
    };

    // Commit to persistent local storage
    storageService.addBill(newBill);
    storageService.commitBillCounter(nextCounter);

    // Update state
    setBills(storageService.getBills());
    setCart([]);

    playSfx('cash');

    // If Bluetooth printer is connected, attempt direct print
    if (isBluetoothConnected) {
      try {
        await bluetoothPrinterService.printBill(newBill, settings);
      } catch (err) {
        console.warn('Bluetooth print failed, opening modal instead', err);
      }
    }

    // Open receipt modal for preview, system print, or WhatsApp sharing
    setActiveReceiptBill(newBill);
    setIsReceiptModalOpen(true);
  };

  // Preview current cart as draft receipt
  const handlePreviewReceipt = () => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
    const now = new Date();

    const draftBill: Bill = {
      id: 'draft-bill',
      billNumber: nextBillInfo.billNumber + ' (DRAFT)',
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      timestamp: now.getTime(),
      items: cart.map(c => ({
        id: c.item.id,
        name: c.item.name,
        hindiName: c.item.hindiName,
        price: c.item.price,
        quantity: c.quantity,
        total: c.item.price * c.quantity,
      })),
      subtotal,
      discount: 0,
      tax: 0,
      grandTotal: subtotal,
      paymentMethod: 'CASH',
    };

    setActiveReceiptBill(draftBill);
    setIsReceiptModalOpen(true);
  };

  // Re-print or view bill from History
  const handleSelectBillToView = (bill: Bill) => {
    setActiveReceiptBill(bill);
    setIsReceiptModalOpen(true);
  };

  const handleQuickPrintBill = async (bill: Bill) => {
    if (isBluetoothConnected) {
      playSfx('beep');
      const res = await bluetoothPrinterService.printBill(bill, settings);
      if (res.success) {
        playSfx('success');
      } else {
        setActiveReceiptBill(bill);
        setIsReceiptModalOpen(true);
      }
    } else {
      setActiveReceiptBill(bill);
      setIsReceiptModalOpen(true);
    }
  };

  const handleAIPrintLatestOrder = () => {
    if (bills.length > 0) {
      const sortedBills = [...bills].sort((a, b) => b.timestamp - a.timestamp);
      const latestBill = sortedBills[0];
      handleQuickPrintBill(latestBill);
    }
  };

  const handleAIUpdateMenuItem = (itemName: string, newPrice?: number, newName?: string) => {
    const itemIndex = menu.findIndex(i => 
      i.name.toLowerCase().includes(itemName.toLowerCase()) || 
      (i.englishName && i.englishName.toLowerCase().includes(itemName.toLowerCase())) ||
      (i.hindiName && i.hindiName.toLowerCase().includes(itemName.toLowerCase()))
    );

    if (itemIndex !== -1) {
      const updatedMenu = [...menu];
      const currentItem = updatedMenu[itemIndex];
      const updatedItem = { ...currentItem };
      
      if (newPrice !== undefined) updatedItem.price = newPrice;
      if (newName !== undefined) {
        updatedItem.name = newName;
      }
      
      updatedMenu[itemIndex] = updatedItem;
      setMenu(updatedMenu);
      storageService.saveMenu(updatedMenu);
      playSfx('success');
    }
  };

  const handleDeleteBill = (id: string) => {
    const updated = storageService.deleteBill(id);
    setBills(updated);
  };

  // Menu Handlers
  const handleAddMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: 'item-' + Date.now(),
    };
    const updated = [newItem, ...menu];
    storageService.saveMenu(updated);
    setMenu(updated);
  };

  const handleUpdateMenuItem = (item: MenuItem) => {
    const updated = menu.map(m => (m.id === item.id ? item : m));
    storageService.saveMenu(updated);
    setMenu(updated);
  };

  const handleDeleteMenuItem = (id: string) => {
    const updated = menu.filter(m => m.id !== id);
    storageService.saveMenu(updated);
    setMenu(updated);
  };

  const handleResetMenu = () => {
    const reset = storageService.resetMenu();
    setMenu(reset);
  };

  // Settings Handler
  const handleUpdateSettings = (newSettings: HotelSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
    setSoundEnabled(newSettings.soundEnabled);
  };

  const handleDataImported = () => {
    setSettings(storageService.getSettings());
    setMenu(storageService.getMenu());
    setBills(storageService.getBills());
  };

  // Cart total counts for badge
  const cartCount = useMemo(() => cart.reduce((acc, c) => acc + c.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0), [cart]);

  // If customer scanned QR code with ?table=X in URL, show customer order screen directly
  if (customerTableNo) {
    return (
      <CustomerOrderView
        tableNo={customerTableNo}
        menu={menu}
        categories={categories}
        settings={settings}
        onExitToPOS={() => {
          setCustomerTableNo(null);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 transition-colors">
      {/* PWA In-App Install Banner for Android */}
      <PWAInstallBanner />

      {/* Top Header Navbar */}
      <Navbar
        settings={settings}
        isBluetoothConnected={isBluetoothConnected}
        connectedPrinterName={connectedPrinterName}
        onOpenPrinterTab={() => setActiveTab('printer')}
        onOpenAppTab={() => setActiveTab('app')}
        onOpenAIAssistant={() => setActiveTab('ai_assistant')}
        onOpenTableQRTab={() => setActiveTab('table_qr')}
        onOpenTableOrdersTab={() => setActiveTab('table_orders')}
        pendingOrdersCount={pendingOrdersCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          handleUpdateSettings({ ...settings, soundEnabled: next });
        }}
        nextBillNumber={nextBillInfo.billNumber}
      />

      {/* Realtime Incoming Table Order Floating Alert Banner */}
      <IncomingOrderBanner
        orders={tableOrders}
        onViewOrders={() => setActiveTab('table_orders')}
      />

      {/* Main Screen Content */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'billing' && (
          <BillingScreen
            menu={menu}
            categories={categories}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onOpenCart={() => setActiveTab('cart')}
            settings={settings}
          />
        )}

        {activeTab === 'cart' && (
          <CartView
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onDeleteLineItem={handleDeleteLineItem}
            onPrintBill={handlePrintBill}
            onPreviewReceipt={handlePreviewReceipt}
            settings={settings}
            currentBillNumber={nextBillInfo.billNumber}
            isBluetoothConnected={isBluetoothConnected}
          />
        )}

        {activeTab === 'table_qr' && (
          <TableQR
            settings={settings}
            onOpenCustomerView={(tableNo) => {
              setCustomerTableNo(tableNo);
            }}
          />
        )}

        {activeTab === 'table_orders' && (
          <LiveTableOrdersScreen
            orders={tableOrders}
            onConvertOrderToBill={handleConvertTableOrderToBill}
            onOpenTableQR={() => setActiveTab('table_qr')}
          />
        )}

        {activeTab === 'history' && (
          <BillHistoryScreen
            bills={bills}
            onSelectBillToView={handleSelectBillToView}
            onQuickPrintBill={handleQuickPrintBill}
            onDeleteBill={handleDeleteBill}
            settings={settings}
            isBluetoothConnected={isBluetoothConnected}
          />
        )}

        {activeTab === 'sales' && (
          <SalesDashboard bills={bills} settings={settings} />
        )}

        {activeTab === 'menu' && (
          <MenuManagement
            menu={menu}
            categories={categories}
            language={settings.language}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onResetMenu={handleResetMenu}
          />
        )}

        {activeTab === 'printer' && (
          <BluetoothPrinterScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            isBluetoothConnected={isBluetoothConnected}
            connectedPrinterName={connectedPrinterName}
            onPrinterStateChange={(connected, name) => {
              setIsBluetoothConnected(connected);
              setConnectedPrinterName(name);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <HotelSettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onDataImported={handleDataImported}
          />
        )}

        {activeTab === 'app' && (
          <MobileAppScreen
            settings={settings}
            billsCount={bills.length}
            menuCount={menu.length}
            isBluetoothConnected={isBluetoothConnected}
            onOpenPrinterTab={() => setActiveTab('printer')}
          />
        )}

        {activeTab === 'ai_assistant' && (
          <AIAssistantScreen
            menu={menu}
            bills={bills}
            settings={settings}
            tableOrders={tableOrders}
            isBluetoothConnected={isBluetoothConnected}
            onNavigate={setActiveTab}
            onPrintLatestOrder={handleAIPrintLatestOrder}
            onUpdateMenuItem={handleAIUpdateMenuItem}
          />
        )}
      </main>

      {/* Bottom Navigation for Android */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          playSfx('beep');
        }}
        cartCount={cartCount}
        cartTotal={cartTotal}
        isBluetoothConnected={isBluetoothConnected}
        language={settings.language}
        pendingOrdersCount={pendingOrdersCount}
      />


      {/* Receipt Modal */}
      <ReceiptModal
        bill={activeReceiptBill}
        settings={settings}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        isBluetoothConnected={isBluetoothConnected}
        onOpenPrinterScreen={() => setActiveTab('printer')}
      />

      {/* Hidden element strictly rendered for system @media print */}
      <PrintableReceipt bill={activeReceiptBill} settings={settings} />
    </div>
  );
}
