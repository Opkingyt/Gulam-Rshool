import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  Printer,
  FilePlus2,
  Share2,
  CreditCard,
  Banknote,
  Smartphone,
  AlertCircle,
  Eye,
  CheckCircle2,
  Tag,
  User,
  Hash,
  UtensilsCrossed,
} from 'lucide-react';
import { CartItem, HotelSettings, PaymentMethod } from '../types';
import { getTranslations, getItemDisplayName } from '../services/i18n';

interface CartViewProps {
  cart: CartItem[];
  onAddToCart: (item: CartItem['item']) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onDeleteLineItem: (itemId: string) => void;
  onPrintBill: (paymentDetails: {
    paymentMethod: PaymentMethod;
    tableNo?: string;
    waiterName?: string;
    customerName?: string;
    customerPhone?: string;
    discount: number;
  }) => void;
  onPreviewReceipt: () => void;
  settings: HotelSettings;
  currentBillNumber: string;
  isBluetoothConnected: boolean;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onDeleteLineItem,
  onPrintBill,
  onPreviewReceipt,
  settings,
  currentBillNumber,
  isBluetoothConnected,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [tableNo, setTableNo] = useState<string>('');
  const [waiterName, setWaiterName] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [showDiscountInput, setShowDiscountInput] = useState<boolean>(false);

  const lang = settings.language || 'hi';
  const t = getTranslations(lang);

  // Totals calculations
  const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  const discount = Math.min(discountAmount, subtotal);
  const grandTotal = Math.max(0, subtotal - discount);

  const handlePrintClick = () => {
    if (cart.length === 0) return;
    onPrintBill({
      paymentMethod,
      tableNo: tableNo.trim() || undefined,
      waiterName: waiterName.trim() || undefined,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      discount,
    });
  };

  const handleNewBillClick = () => {
    if (cart.length === 0) return;
    const confirmMsg = lang === 'mr'
      ? 'नवीन बिल सुरू करायचे आहे का? चालू कार्ट रिकामी होईल.'
      : 'क्या आप नया बिल शुरू करना चाहते हैं? वर्तमान कार्ट साफ़ हो जाएगा।';

    if (window.confirm(confirmMsg)) {
      onClearCart();
      setTableNo('');
      setWaiterName('');
      setCustomerName('');
      setCustomerPhone('');
      setDiscountAmount(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 pb-28">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 border border-stone-200 dark:border-stone-700 shadow-xs mb-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {t.billNumberLabel}
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black font-mono text-red-700 dark:text-amber-400">
                {currentBillNumber}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-semibold">
                (सामान्य नंबर: 1, 2, 3...)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                id="cart-new-bill-btn"
                onClick={handleNewBillClick}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-xl transition"
                title="नया बिल बनाएं"
              >
                <FilePlus2 className="w-4 h-4 text-red-600 dark:text-amber-400" />
                <span>{t.newBill}</span>
              </button>
            )}
          </div>
        </div>

        {/* Customer, Table & Waiter details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-0.5">
              {t.tableNumber}
            </label>
            <input
              id="cart-table-input"
              type="text"
              placeholder="e.g. 1"
              value={tableNo}
              onChange={e => setTableNo(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-0.5">
              {t.waiterName}
            </label>
            <input
              id="cart-waiter-input"
              type="text"
              placeholder="उदा. राहुल"
              value={waiterName}
              onChange={e => setWaiterName(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-0.5">
              {t.customerName}
            </label>
            <input
              id="cart-customer-name-input"
              type="text"
              placeholder="Guest"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-0.5">
              {t.customerPhone}
            </label>
            <input
              id="cart-customer-phone-input"
              type="tel"
              placeholder="9876543210"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono font-medium focus:ring-1 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      {/* Cart Items Table */}
      {cart.length === 0 ? (
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-10 text-center border border-dashed border-stone-300 dark:border-stone-700 mb-4">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-stone-900 dark:text-white mb-1">
            {t.cartEmpty}
          </h3>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            {t.cartEmptyDesc}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xs overflow-hidden mb-3">
          {/* Table Header */}
          <div className="px-3 py-2 bg-stone-50 dark:bg-stone-750 border-b border-stone-200 dark:border-stone-700 grid grid-cols-12 text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            <span className="col-span-5 sm:col-span-6">{t.colItem}</span>
            <span className="col-span-2 text-center">{t.colRate}</span>
            <span className="col-span-3 sm:col-span-2 text-center">{t.colQty}</span>
            <span className="col-span-2 text-right">{t.colAmount}</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {cart.map(c => {
              const lineTotal = c.item.price * c.quantity;
              const displayName = getItemDisplayName(c.item, lang);
              return (
                <div
                  key={c.item.id}
                  className="px-3 py-2.5 grid grid-cols-12 items-center hover:bg-stone-50/70 dark:hover:bg-stone-750 transition"
                >
                  {/* Name & Delete icon */}
                  <div className="col-span-5 sm:col-span-6 pr-1">
                    <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                      {displayName}
                    </div>
                    {c.item.englishName && c.item.englishName !== displayName && (
                      <div className="text-[10px] text-stone-400 dark:text-stone-400 truncate">
                        {c.item.englishName}
                      </div>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div className="col-span-2 text-center text-xs font-mono font-medium text-stone-600 dark:text-stone-300">
                    ₹{c.item.price}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                    <div className="flex items-center bg-stone-100 dark:bg-stone-700 rounded-lg p-0.5 shadow-2xs">
                      <button
                        onClick={() => onRemoveFromCart(c.item.id)}
                        className="w-6 h-6 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-red-600 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono text-stone-900 dark:text-stone-100">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => onAddToCart(c.item)}
                        className="w-6 h-6 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-red-600 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <span className="text-xs sm:text-sm font-extrabold font-mono text-red-700 dark:text-amber-400">
                      ₹{lineTotal}
                    </span>
                    <button
                      onClick={() => onDeleteLineItem(c.item.id)}
                      className="text-stone-400 hover:text-red-600 p-1 transition"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Mode Selector */}
      {cart.length > 0 && (
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-700 shadow-xs mb-3">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
            {t.paymentMode}:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'CASH' as PaymentMethod, label: t.payCash, icon: Banknote },
              { id: 'UPI' as PaymentMethod, label: t.payUPI, icon: Smartphone },
              { id: 'CARD' as PaymentMethod, label: t.payCard, icon: CreditCard },
              { id: 'DUE' as PaymentMethod, label: t.payDue, icon: Tag },
            ].map(method => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  id={`pay-${method.id.toLowerCase()}`}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-2 px-1 flex flex-col items-center justify-center rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-red-700 text-white border-red-700 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[11px] truncate">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Discount option */}
          <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-xs">
            {!showDiscountInput ? (
              <button
                onClick={() => setShowDiscountInput(true)}
                className="text-red-700 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>+ {t.addDiscount}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <span className="text-stone-500 font-semibold whitespace-nowrap">{t.discount}:</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discountAmount || ''}
                  onChange={e => setDiscountAmount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-24 px-2 py-1 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg text-xs font-mono font-bold"
                />
                <button
                  onClick={() => {
                    setDiscountAmount(0);
                    setShowDiscountInput(false);
                  }}
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  {t.removePhoto}
                </button>
              </div>
            )}
            {discount > 0 && (
              <span className="font-mono text-red-600 font-bold">-₹{discount}</span>
            )}
          </div>
        </div>
      )}

      {/* Grand Total & Action Buttons Bar */}
      {cart.length > 0 && (
        <div className="bg-gradient-to-br from-stone-900 via-red-950 to-stone-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-amber-500/20 mb-4">
          <div className="flex items-end justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-300/90 font-bold block mb-0.5">
                {t.grandTotal}
              </span>
              <span className="text-xs text-stone-400">
                {cart.reduce((a, b) => a + b.quantity, 0)} Items | {paymentMethod}
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300 tracking-tight">
                ₹{grandTotal}
              </span>
            </div>
          </div>

          {/* Big Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Main Print Button */}
            <button
              id="cart-print-bill-btn"
              onClick={handlePrintClick}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-[0.98] text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition border border-amber-400/30"
            >
              <Printer className="w-5 h-5 animate-pulse" />
              <span>{t.printBill}</span>
            </button>

            {/* Preview & WhatsApp buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="cart-preview-bill-btn"
                onClick={onPreviewReceipt}
                className="py-3 px-3 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-amber-200 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition border border-white/10"
              >
                <Eye className="w-4 h-4" />
                <span>{t.viewReceipt}</span>
              </button>

              <button
                id="cart-whatsapp-bill-btn"
                onClick={() => {
                  handlePrintClick();
                }}
                className="py-3 px-3 bg-emerald-700 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.shareWhatsApp}</span>
              </button>
            </div>
          </div>

          {/* Bluetooth Connection notice if disconnected */}
          {!isBluetoothConnected && (
            <div className="mt-3 flex items-center gap-2 p-2 bg-amber-500/15 rounded-xl border border-amber-500/30 text-[11px] text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                Bluetooth प्रिंटर कनेक्ट नहीं है। 'प्रिंट' दबाने पर सिस्टम प्रिंट / रसीद खुलेगी या प्रिंटर मेनू से कनेक्ट करें।
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
