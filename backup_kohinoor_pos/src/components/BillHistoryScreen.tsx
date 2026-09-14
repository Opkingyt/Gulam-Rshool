import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Printer,
  Trash2,
  Eye,
  ArrowUpDown,
  FileText,
  Clock,
  CheckCircle,
  Share2,
} from 'lucide-react';
import { Bill, HotelSettings } from '../types';
import { soundService } from '../services/audio';

interface BillHistoryScreenProps {
  bills: Bill[];
  onSelectBillToView: (bill: Bill) => void;
  onQuickPrintBill: (bill: Bill) => void;
  onDeleteBill: (id: string) => void;
  settings: HotelSettings;
  isBluetoothConnected: boolean;
}

export const BillHistoryScreen: React.FC<BillHistoryScreenProps> = ({
  bills,
  onSelectBillToView,
  onQuickPrintBill,
  onDeleteBill,
  settings,
  isBluetoothConnected,
}) => {
  const [search, setSearch] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'yesterday' | 'all' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Filtered bills
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // Date filter
      if (filterPeriod === 'today' && bill.date !== todayStr) return false;
      if (filterPeriod === 'yesterday' && bill.date !== yesterdayStr) return false;
      if (filterPeriod === 'custom' && bill.date !== customDate) return false;

      // Search filter
      const q = search.trim().toLowerCase();
      if (!q) return true;
      const matchNum = bill.billNumber.toLowerCase().includes(q);
      const matchCust = bill.customerName?.toLowerCase().includes(q) || bill.customerPhone?.includes(q);
      const matchItem = bill.items.some(i => i.name.toLowerCase().includes(q));
      return matchNum || matchCust || matchItem;
    });
  }, [bills, filterPeriod, customDate, todayStr, yesterdayStr, search]);

  // Today's summary stats
  const todayBills = useMemo(() => bills.filter(b => b.date === todayStr), [bills, todayStr]);
  const todaySales = useMemo(() => todayBills.reduce((sum, b) => sum + b.grandTotal, 0), [todayBills]);
  const totalAllSales = useMemo(() => bills.reduce((sum, b) => sum + b.grandTotal, 0), [bills]);

  const handleDelete = (bill: Bill) => {
    if (window.confirm(`क्या आप बिल ${bill.billNumber} (₹${bill.grandTotal}) को हटाना चाहते हैं?`)) {
      onDeleteBill(bill.id);
      soundService.playDelete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 pb-28">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <div className="bg-gradient-to-br from-red-800 to-red-950 text-white p-3 sm:p-3.5 rounded-2xl shadow-xs border border-red-700/40">
          <span className="text-[10px] sm:text-xs text-red-200/90 font-semibold block">आज की बिक्री (Today)</span>
          <span className="text-lg sm:text-2xl font-black font-mono text-amber-300">
            ₹{todaySales}
          </span>
          <span className="text-[10px] text-red-200/70 block mt-0.5">{todayBills.length} बिल</span>
        </div>

        <div className="bg-white dark:bg-stone-800 p-3 sm:p-3.5 rounded-2xl shadow-xs border border-stone-200 dark:border-stone-700">
          <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-semibold block">
            कुल बिल (Total Bills)
          </span>
          <span className="text-lg sm:text-2xl font-black font-mono text-stone-900 dark:text-white">
            {bills.length}
          </span>
          <span className="text-[10px] text-stone-400 block mt-0.5">सभी रिकॉर्ड</span>
        </div>

        <div className="bg-white dark:bg-stone-800 p-3 sm:p-3.5 rounded-2xl shadow-xs border border-stone-200 dark:border-stone-700">
          <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-semibold block">
            कुल बिक्री (All Sales)
          </span>
          <span className="text-lg sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ₹{totalAllSales}
          </span>
          <span className="text-[10px] text-stone-400 block mt-0.5">लाइफटाइम</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="history-search-input"
            type="text"
            placeholder="बिल नंबर, ग्राहक या आइटम खोजें... (e.g. HK-0001)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-600 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all' as const, label: 'सभी (All)' },
            { id: 'today' as const, label: 'आज (Today)' },
            { id: 'yesterday' as const, label: 'कल (Yesterday)' },
            { id: 'custom' as const, label: 'तारीख चुनें (Custom)' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterPeriod(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterPeriod === f.id
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50'
              }`}
            >
              {f.label}
            </button>
          ))}

          {filterPeriod === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono font-bold"
            />
          )}
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-2.5">
        {filteredBills.length === 0 ? (
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 text-center border border-dashed border-stone-300 dark:border-stone-700">
            <FileText className="w-12 h-12 mx-auto text-stone-400 mb-2 opacity-60" />
            <p className="font-bold text-stone-700 dark:text-stone-300">कोई बिल नहीं मिला (No Bills Found)</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              बिलिंग स्क्रीन पर जाकर नया बिल बनाएं।
            </p>
          </div>
        ) : (
          filteredBills.map(bill => (
            <div
              key={bill.id}
              id={`history-bill-${bill.id}`}
              className="bg-white dark:bg-stone-800 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-700 shadow-xs hover:border-red-400/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Details */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-black text-base text-red-700 dark:text-amber-400">
                    {bill.billNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                    {bill.paymentMethod}
                  </span>
                  {bill.tableNo && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      Table: {bill.tableNo}
                    </span>
                  )}
                  {bill.customerName && (
                    <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                      • {bill.customerName}
                    </span>
                  )}
                </div>

                {/* Items Summary line */}
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
                  {bill.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                </p>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{bill.date} • {bill.time}</span>
                </div>
              </div>

              {/* Right: Total and Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-700">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-stone-400 block sm:hidden">राशि:</span>
                  <span className="font-mono font-black text-xl text-stone-900 dark:text-white">
                    ₹{bill.grandTotal}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* View Receipt */}
                  <button
                    id={`btn-view-bill-${bill.id}`}
                    onClick={() => onSelectBillToView(bill)}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-bold text-xs flex items-center gap-1 transition"
                    title="रसीद देखें"
                  >
                    <Eye className="w-4 h-4 text-red-600 dark:text-amber-400" />
                    <span className="hidden sm:inline">देखें</span>
                  </button>

                  {/* Re-Print to Bluetooth */}
                  <button
                    id={`btn-reprint-bill-${bill.id}`}
                    onClick={() => onQuickPrintBill(bill)}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                    title="दोबारा प्रिंट करें"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">प्रिंट</span>
                  </button>

                  {/* Delete bill */}
                  <button
                    id={`btn-delete-bill-${bill.id}`}
                    onClick={() => handleDelete(bill)}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    title="डिलीट करें"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
