import React, { useState, useEffect } from 'react';
import { MenuItem, Category, HotelSettings, TableOrderItem } from '../types';
import { tableOrderService } from '../services/tableOrderService';
import { ShoppingCart, ArrowLeft, Plus, Minus, Image as ImageIcon } from 'lucide-react';

interface CustomerOrderViewProps {
  tableNo: string;
  menu: MenuItem[];
  categories: Category[];
  settings: HotelSettings;
  onExitToPOS: () => void;
}

export const CustomerOrderView: React.FC<CustomerOrderViewProps> = ({ tableNo, menu: initialMenu, categories, settings, onExitToPOS }) => {
  const [cart, setCart] = useState<TableOrderItem[]>([]);
  const [activeCat, setActiveCat] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);

  useEffect(() => {
    // Fetch the menu from cloud to get the latest photos and custom items on customer device
    tableOrderService.getMenuFromCloud().then((cloudMenu) => {
      if (cloudMenu && cloudMenu.length > 0) {
        setMenu(cloudMenu);
      }
    });
  }, []);
  
  const filteredMenu = activeCat === 'all' ? menu : menu.filter(m => m.category === activeCat);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === item.id);
      if (existing) {
        return prev.map(c => c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { itemId: item.id, name: item.name, price: item.price, quantity: 1, isVeg: item.isVeg }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.itemId === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.itemId !== itemId);
    });
  };

  const total = cart.reduce((acc, c) => acc + c.price * c.quantity, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await tableOrderService.submitOrder({
        orderNumber: Math.floor(Math.random() * 10000),
        tableNo,
        items: cart,
        subtotal: total,
        total,
        totalItems: cart.reduce((acc, c) => acc + c.quantity, 0),
        status: 'NEW',
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      });
      setOrderPlaced(true);
      setCart([]);
    } catch (e) {
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-stone-50 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-3xl font-black mb-2">Order Placed!</h1>
        <p className="text-stone-500 mb-8">Your order has been sent to the kitchen.</p>
        <button onClick={() => setOrderPlaced(false)} className="px-6 py-3 bg-amber-400 text-stone-900 font-bold rounded-xl">
          Order More Items
        </button>
        <button onClick={onExitToPOS} className="mt-8 text-sm text-stone-400 underline">Return to POS (Admin)</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-amber-500">{settings.hotelName}</h1>
          <p className="text-sm font-bold text-stone-500">Table {tableNo}</p>
        </div>
        <button onClick={onExitToPOS} className="p-2 bg-stone-100 rounded-full text-stone-500"><ArrowLeft className="w-5 h-5"/></button>
      </header>

      <div className="overflow-x-auto px-4 py-3 flex gap-2 hide-scrollbar bg-white border-b">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${activeCat === cat.id ? 'bg-amber-400 text-amber-950' : 'bg-stone-100 text-stone-600'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="p-4 grid gap-3">
        {filteredMenu.map(item => {
          const cartItem = cart.find(c => c.itemId === item.id);
          return (
            <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border flex justify-between items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-xl shadow-sm bg-stone-100" />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                    <h3 className="font-bold leading-tight text-stone-800">{item.name}</h3>
                  </div>
                  <p className="font-black text-amber-600">₹{item.price}</p>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                {cartItem ? (
                  <div className="flex items-center gap-3 bg-stone-100 rounded-xl p-1">
                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm"><Minus className="w-4 h-4"/></button>
                    <span className="font-bold w-4 text-center">{cartItem.quantity}</span>
                    <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm"><Plus className="w-4 h-4"/></button>
                  </div>
                ) : (
                  <button onClick={() => addToCart(item)} className="px-5 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-sm transition text-stone-700">
                    ADD
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-500">{cart.reduce((a,c)=>a+c.quantity,0)} Items</p>
              <p className="text-xl font-black">₹{total}</p>
            </div>
            <button
              onClick={submitOrder}
              disabled={isSubmitting}
              className="px-8 py-3 bg-amber-400 hover:bg-amber-500 text-stone-900 font-black rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {isSubmitting ? 'PLACING...' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
