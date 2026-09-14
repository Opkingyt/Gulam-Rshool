import React from 'react';
import { TableOrder } from '../types';
import { Bell } from 'lucide-react';

interface IncomingOrderBannerProps {
  orders: TableOrder[];
  onViewOrders: () => void;
}

export const IncomingOrderBanner: React.FC<IncomingOrderBannerProps> = ({ orders, onViewOrders }) => {
  const newOrders = orders.filter(o => o.status === 'NEW' || o.status === 'pending');
  
  if (newOrders.length === 0) return null;

  const latest = newOrders[0];

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <button 
        onClick={onViewOrders}
        className="bg-amber-400 px-6 py-3 rounded-full shadow-2xl border-2 border-amber-200 flex items-center gap-3 text-stone-900 font-bold hover:bg-amber-500 transition-colors"
      >
        <Bell className="w-6 h-6 animate-pulse" />
        <div className="text-left text-stone-900">
          <div className="text-xs font-bold tracking-wider leading-tight">🔔 NEW ORDER</div>
          <div className="text-lg font-bold leading-tight">TABLE {latest.tableNo} - ₹{latest.total}</div>
        </div>
        <div className="bg-stone-900 w-8 h-8 rounded-full flex items-center justify-center text-amber-400 ml-2 font-bold shadow-inner">
          {newOrders.length}
        </div>
      </button>
    </div>
  );
};
