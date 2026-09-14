import React from 'react';
import { TableOrder } from '../types';
import { tableOrderService } from '../services/tableOrderService';
import { UtensilsCrossed, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';

interface LiveTableOrdersScreenProps {
  orders: TableOrder[];
  onConvertOrderToBill: (order: TableOrder) => void;
  onOpenTableQR: () => void;
}

export const LiveTableOrdersScreen: React.FC<LiveTableOrdersScreenProps> = ({ orders, onConvertOrderToBill, onOpenTableQR }) => {
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  const updateStatus = (id: string, status: any) => {
    tableOrderService.updateStatus(id, status);
  };

  const deleteOrder = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      tableOrderService.deleteOrder(id);
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-24">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">Live Table Orders</h2>
          <p className="text-stone-500 dark:text-stone-400">Real-time orders from customers via QR</p>
        </div>
        <button onClick={onOpenTableQR} className="px-4 py-2 bg-stone-200 dark:bg-stone-800 dark:text-stone-200 rounded-xl font-bold text-sm">
          QR Settings
        </button>
      </div>

      {activeOrders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900/50 rounded-3xl border border-dashed dark:border-stone-800">
          <UtensilsCrossed className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-stone-400 dark:text-stone-500">No active orders</h3>
          <p className="text-stone-400 dark:text-stone-500 text-sm">Customer orders will appear here in real-time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOrders.map(order => (
            <div key={order.id} className={`bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm border-2 ${order.status === 'NEW' || order.status === 'pending' ? 'border-amber-400 shadow-amber-100 dark:shadow-none' : 'border-transparent dark:border-stone-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black">Table {order.tableNo}</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 font-bold">{new Date(order.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${order.status === 'NEW' || order.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                  {order.status === 'NEW' ? 'NEW' : order.status}
                </div>
              </div>

              <div className="space-y-2 mb-4 bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border dark:border-stone-800">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="font-bold">{item.quantity}x {item.name}</span>
                    <span className="text-stone-500 dark:text-stone-400">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="pt-2 border-t dark:border-stone-800 flex justify-between font-black mt-2">
                  <span>Total</span>
                  <span className="text-amber-600 dark:text-amber-400">₹{order.total}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {(order.status === 'NEW' || order.status === 'pending') && (
                  <button 
                    onClick={() => updateStatus(order.id, 'accepted')}
                    className="flex-1 flex justify-center items-center gap-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 py-2.5 rounded-xl font-bold text-sm transition"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept
                  </button>
                )}
                
                <button 
                  onClick={() => onConvertOrderToBill(order)}
                  className="flex-1 flex justify-center items-center gap-1 bg-amber-400 hover:bg-amber-500 text-stone-900 py-2.5 rounded-xl font-bold text-sm transition shadow-md"
                >
                  Create Bill <ArrowRight className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => deleteOrder(order.id)}
                  className="w-12 flex justify-center items-center bg-stone-100 hover:bg-red-100 hover:text-red-600 dark:bg-stone-800 dark:hover:bg-red-900/40 dark:hover:text-red-400 text-stone-400 py-2.5 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
