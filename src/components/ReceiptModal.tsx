import React, { useState } from 'react';
import {
  Printer,
  Share2,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';
import { Bill, HotelSettings } from '../types';
import { bluetoothPrinterService } from '../services/printer';
import { soundService } from '../services/audio';
import { getTranslations, getItemDisplayName } from '../services/i18n';
import { PrintableReceipt } from './PrintableReceipt';

interface ReceiptModalProps {
  bill: Bill | null;
  settings: HotelSettings;
  isOpen: boolean;
  onClose: () => void;
  isBluetoothConnected: boolean;
  onOpenPrinterScreen: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  bill,
  settings,
  isOpen,
  onClose,
  isBluetoothConnected,
  onOpenPrinterScreen,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !bill) return null;

  const lang = bill.language || settings.language || 'hi';
  const t = getTranslations(lang);

  const handleBluetoothPrint = async () => {
    if (!isBluetoothConnected) {
      setPrintStatus({
        type: 'error',
        message: lang === 'mr'
          ? 'ब्लूटूथ प्रिंटर कनेक्ट नाही! कृपया आधी प्रिंटर मेनूमधून कनेक्ट करा.'
          : lang === 'en'
          ? 'Bluetooth printer not connected! Please connect via Printer tab first.'
          : 'Bluetooth प्रिंटर कनेक्ट नहीं है! कृपया पहले प्रिंटर मेनू से कनेक्ट करें।',
      });
      return;
    }

    setIsPrinting(true);
    setPrintStatus(null);
    try {
      const result = await bluetoothPrinterService.printBill(bill, settings);
      if (result.success) {
        soundService.playSuccess();
        setPrintStatus({
          type: 'success',
          message: lang === 'mr'
            ? 'बिल यशस्वीरित्या प्रिंटरला पाठवले गेले!'
            : lang === 'en'
            ? 'Bill sent to printer successfully!'
            : 'बिल सफलतापूर्वक प्रिंटर को भेजा गया!',
        });
      } else {
        setPrintStatus({
          type: 'error',
          message: result.error || 'प्रिंट करने में त्रुटि हुई।',
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Print error';
      setPrintStatus({ type: 'error', message: msg });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleSystemPrint = () => {
    bluetoothPrinterService.triggerSystemPrint();
  };

  const handleWhatsAppShare = () => {
    bluetoothPrinterService.shareViaWhatsApp(bill, settings, bill.customerPhone);
  };

  const handleNativeShare = async () => {
    const shared = await bluetoothPrinterService.shareNative(bill, settings);
    if (!shared) {
      navigator.clipboard.writeText(bluetoothPrinterService.generateShareText(bill, settings));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-red-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-300" />
            <span className="font-bold text-sm tracking-wide">{t.previewReceipt}</span>
          </div>
          <button
            id="receipt-modal-close"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Paper Simulation Container */}
        <div className="p-3 bg-stone-100 dark:bg-stone-950 flex justify-center max-h-[60vh] overflow-y-auto">
          <div className="w-full bg-white text-black rounded-xl shadow-md border border-stone-200 overflow-hidden">
            <PrintableReceipt bill={bill} settings={settings} />
          </div>
        </div>

        {/* Status Message */}
        {printStatus && (
          <div
            className={`mx-4 mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              printStatus.type === 'success'
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                : 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-300'
            }`}
          >
            {printStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
            )}
            <span className="flex-1">{printStatus.message}</span>
            {printStatus.type === 'error' && !isBluetoothConnected && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPrinterScreen();
                }}
                className="underline font-bold text-red-900 dark:text-red-200"
              >
                {lang === 'mr' ? 'कनेक्ट करा' : lang === 'en' ? 'Connect' : 'कनेक्ट करें'}
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 space-y-2 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
          {/* Primary Bluetooth Print Button */}
          <button
            id="receipt-modal-bt-print"
            onClick={handleBluetoothPrint}
            disabled={isPrinting}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition ${
              isBluetoothConnected
                ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>
              {isPrinting
                ? 'प्रिंट हो रहा है...'
                : `${t.bluetoothPrint} (80mm KPC307)`}
            </span>
          </button>

          {/* Secondary Action Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              id="receipt-modal-system-print"
              onClick={handleSystemPrint}
              className="py-2 px-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Smartphone className="w-3.5 h-3.5 text-stone-500" />
              <span>{t.systemPrint}</span>
            </button>

            <button
              id="receipt-modal-whatsapp"
              onClick={handleWhatsAppShare}
              className="py-2 px-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              id="receipt-modal-share"
              onClick={handleNativeShare}
              className="py-2 px-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>कॉपी हुआ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t.shareNative}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
