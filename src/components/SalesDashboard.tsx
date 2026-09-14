import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Banknote,
  Smartphone,
  CreditCard,
  Download,
  Award,
  Clock,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { Bill, HotelSettings } from '../types';

interface SalesDashboardProps {
  bills: Bill[];
  settings: HotelSettings;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ bills, settings }) => {
  const [selectedRange, setSelectedRange] = useState<'today' | 'yesterday' | 'week' | 'all' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  // Filter bills by selected range
  const scopedBills = useMemo(() => {
    return bills.filter(b => {
      if (selectedRange === 'today') return b.date === todayStr;
      if (selectedRange === 'yesterday') return b.date === yesterdayStr;
      if (selectedRange === 'week') return b.date >= weekAgoStr;
      if (selectedRange === 'custom') return b.date === customDate;
      return true; // 'all'
    });
  }, [bills, selectedRange, todayStr, yesterdayStr, weekAgoStr, customDate]);

  // Calculations
  const totalSales = useMemo(() => scopedBills.reduce((acc, b) => acc + b.grandTotal, 0), [scopedBills]);
  const totalBillsCount = scopedBills.length;
  const avgBillAmount = totalBillsCount > 0 ? Math.round(totalSales / totalBillsCount) : 0;
  const maxBillAmount = scopedBills.length > 0 ? Math.max(...scopedBills.map(b => b.grandTotal)) : 0;

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const counts = { CASH: 0, UPI: 0, CARD: 0, DUE: 0 };
    scopedBills.forEach(b => {
      counts[b.paymentMethod] = (counts[b.paymentMethod] || 0) + b.grandTotal;
    });
    return counts;
  }, [scopedBills]);

  // Top Selling Items
  const topItems = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    scopedBills.forEach(b => {
      b.items.forEach(item => {
        const curr = map.get(item.name) || { name: item.name, qty: 0, revenue: 0 };
        curr.qty += item.quantity;
        curr.revenue += item.total;
        map.set(item.name, curr);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [scopedBills]);

  // Export to CSV
  const exportSalesCSV = () => {
    if (scopedBills.length === 0) {
      alert('एक्सपोर्ट करने के लिए कोई डेटा उपलब्ध नहीं है (No sales data to export)');
      return;
    }

    const headers = ['Bill Number', 'Date', 'Time', 'Customer', 'Table', 'Payment Method', 'Items Count', 'Grand Total'];
    const rows = scopedBills.map(b => [
      b.billNumber,
      b.date,
      b.time,
      `"${b.customerName || 'Walk-in'}"`,
      b.tableNo || '-',
      b.paymentMethod,
      b.items.reduce((s, i) => s + i.quantity, 0),
      b.grandTotal,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kohinoor_Sales_${selectedRange}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 pb-28">
      {/* Title & Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-700 dark:text-amber-400" />
            <span>दैनिक बिक्री रिपोर्ट (Sales Dashboard)</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            होटल कोहिनूर की बिक्री विश्लेषण और आय विवरण।
          </p>
        </div>

        <button
          onClick={exportSalesCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>CSV डाउनलोड</span>
        </button>
      </div>

      {/* Range Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-4 py-1">
        {[
          { id: 'today' as const, label: 'आज (Today)' },
          { id: 'yesterday' as const, label: 'कल (Yesterday)' },
          { id: 'week' as const, label: 'पिछले 7 दिन (7 Days)' },
          { id: 'all' as const, label: 'लाइफटाइम (All Time)' },
          { id: 'custom' as const, label: 'तारीख चुनें (Select Date)' },
        ].map(r => (
          <button
            key={r.id}
            id={`sales-range-${r.id}`}
            onClick={() => setSelectedRange(r.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedRange === r.id
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50'
            }`}
          >
            {r.label}
          </button>
        ))}

        {selectedRange === 'custom' && (
          <input
            type="date"
            value={customDate}
            onChange={e => setCustomDate(e.target.value)}
            className="px-2 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono font-bold"
          />
        )}
      </div>

      {/* 3 Main Metric Cards requested in prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Metric 1: Sales */}
        <div className="bg-gradient-to-br from-red-800 via-red-900 to-amber-950 text-white p-4 rounded-2xl shadow-md border border-amber-500/20">
          <span className="text-xs text-amber-200/90 font-bold block mb-1">
            कुल बिक्री (Total Sales)
          </span>
          <div className="text-3xl font-black font-mono text-amber-300">
            ₹{totalSales}
          </div>
          <span className="text-[11px] text-stone-300 block mt-1">
            {selectedRange === 'today' ? "आज की बिक्री (Today's Sales)" : 'चयनित अवधि की कुल आय'}
          </span>
        </div>

        {/* Metric 2: Bills */}
        <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl shadow-xs border border-stone-200 dark:border-stone-700">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-bold block mb-1">
            कुल बिल (Total Bills)
          </span>
          <div className="text-3xl font-black font-mono text-stone-900 dark:text-white">
            {totalBillsCount}
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">
            {selectedRange === 'today' ? "Today's Bills" : 'काटे गए बिलों की संख्या'}
          </span>
        </div>

        {/* Metric 3: Average Bill */}
        <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl shadow-xs border border-stone-200 dark:border-stone-700">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-bold block mb-1">
            औसत बिल (Average Bill)
          </span>
          <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ₹{avgBillAmount}
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">
            अधिकतम बिल: ₹{maxBillAmount}
          </span>
        </div>
      </div>

      {/* Payment Split & Top Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Payment Breakdown Card */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 border border-stone-200 dark:border-stone-700 shadow-xs">
          <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-3 flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>भुगतान विवरण (Payment Split)</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'नकद (Cash)', amount: paymentBreakdown.CASH, color: 'bg-emerald-500' },
              { label: 'UPI / QR', amount: paymentBreakdown.UPI, color: 'bg-blue-500' },
              { label: 'कार्ड (Card)', amount: paymentBreakdown.CARD, color: 'bg-purple-500' },
              { label: 'उधारी (Due)', amount: paymentBreakdown.DUE, color: 'bg-amber-500' },
            ].map(p => {
              const pct = totalSales > 0 ? Math.round((p.amount / totalSales) * 100) : 0;
              return (
                <div key={p.label}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-stone-700 dark:text-stone-300">{p.label}</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-white">
                      ₹{p.amount} <span className="text-stone-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 border border-stone-200 dark:border-stone-700 shadow-xs">
          <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>सबसे ज्यादा बिकने वाले आइटम (Top Selling)</span>
          </h3>

          {topItems.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">इस अवधि में कोई बिक्री नहीं हुई।</p>
          ) : (
            <div className="space-y-2">
              {topItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-750 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-amber-400 font-black flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200 truncate max-w-[150px]">
                      {item.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-stone-900 dark:text-white">
                      ₹{item.revenue}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      {item.qty} प्लेट / नग
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
