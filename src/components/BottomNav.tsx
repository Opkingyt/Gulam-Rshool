import React from 'react';
import {
  Receipt,
  ShoppingCart,
  History,
  BarChart3,
  UtensilsCrossed,
  Printer,
  Settings,
  QrCode,
  Bell
} from 'lucide-react';
import { ActiveTab, AppLanguage } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  cartCount: number;
  cartTotal: number;
  isBluetoothConnected: boolean;
  language?: AppLanguage;
  pendingOrdersCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  cartTotal,
  isBluetoothConnected,
  language = 'hi',
  pendingOrdersCount = 0,
}) => {
  const getTabLabel = (id: ActiveTab) => {
    if (language === 'mr') {
      switch (id) {
        case 'billing': return 'बिलिंग';
        case 'cart': return 'कार्ट';
        case 'history': return 'इतिहास';
        case 'sales': return 'विक्री';
        case 'menu': return 'मेनू';
        case 'printer': return 'प्रिंटर';
        case 'settings': return 'सेटिंग्ज';
        case 'table_qr': return 'QR मेनू';
        case 'table_orders': return 'ऑर्डर्स';
        case 'app': return 'ॲप';
      }
    } else if (language === 'en') {
      switch (id) {
        case 'billing': return 'Billing';
        case 'cart': return 'Cart';
        case 'history': return 'History';
        case 'sales': return 'Sales';
        case 'menu': return 'Menu';
        case 'printer': return 'Printer';
        case 'settings': return 'Settings';
        case 'table_qr': return 'Table QR';
        case 'table_orders': return 'Orders';
        case 'app': return 'App';
      }
    }
    // Hindi default
    switch (id) {
      case 'billing': return 'बिलिंग';
      case 'cart': return 'कार्ट';
      case 'history': return 'इतिहास';
      case 'sales': return 'बिक्री';
      case 'menu': return 'मेनू';
      case 'printer': return 'प्रिंटर';
      case 'settings': return 'सेटिंग्स';
      case 'table_qr': return 'QR मेनू';
      case 'table_orders': return 'ऑर्डर्स';
      case 'app': return 'ऐप';
    }
  };

  const navItems = [
    { id: 'billing' as ActiveTab, icon: Receipt },
    {
      id: 'cart' as ActiveTab,
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'table_orders' as ActiveTab,
      icon: Bell,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'table_qr' as ActiveTab, icon: QrCode },
    { id: 'history' as ActiveTab, icon: History },
    { id: 'sales' as ActiveTab, icon: BarChart3 },
    { id: 'menu' as ActiveTab, icon: UtensilsCrossed },
    {
      id: 'printer' as ActiveTab,
      icon: Printer,
      indicator: isBluetoothConnected,
    },
    { id: 'settings' as ActiveTab, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-t border-stone-200 dark:border-stone-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-1 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const label = getTabLabel(item.id);
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`relative flex-1 py-2 px-1 flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'text-red-700 dark:text-amber-400 font-bold'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-medium'
              }`}
            >
              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-full" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.indicator && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-stone-900" />
                )}
              </div>

              <span className="text-[11px] leading-tight mt-1 truncate max-w-[56px] text-center">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
