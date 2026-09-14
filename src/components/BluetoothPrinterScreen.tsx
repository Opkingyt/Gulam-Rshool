import React, { useState } from 'react';
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Settings2,
  RefreshCw,
  ShieldCheck,
  Zap,
  ExternalLink,
  Info,
} from 'lucide-react';
import { HotelSettings } from '../types';
import { bluetoothPrinterService } from '../services/printer';
import { soundService } from '../services/audio';

interface BluetoothPrinterScreenProps {
  settings: HotelSettings;
  onUpdateSettings: (newSettings: HotelSettings) => void;
  isBluetoothConnected: boolean;
  connectedPrinterName: string | null;
  onPrinterStateChange: (connected: boolean, name: string | null) => void;
}

export const BluetoothPrinterScreen: React.FC<BluetoothPrinterScreenProps> = ({
  settings,
  onUpdateSettings,
  isBluetoothConnected,
  connectedPrinterName,
  onPrinterStateChange,
}) => {
  const [connecting, setConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'iframe_restricted' | 'info';
    text: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const isBluetoothSupported = bluetoothPrinterService.isSupported();
  const isInsideIframe = bluetoothPrinterService.isInsideIframe();

  // Handle Scan & Connect
  const handleConnect = async () => {
    setConnecting(true);
    setStatusMessage(null);

    try {
      const res = await bluetoothPrinterService.connect();
      if (res.success && res.deviceName) {
        onPrinterStateChange(true, res.deviceName);
        soundService.playSuccess();
        setStatusMessage({
          type: 'success',
          text: `"${res.deviceName}" सफलतापूर्वक कनेक्ट हो गया! (Connected successfully)`,
        });
      } else if (res.isIframeRestricted) {
        setStatusMessage({
          type: 'iframe_restricted',
          text: res.error || 'आईफ्रेम प्रीव्यू में ब्लूटूथ की अनुमति नहीं है।',
        });
      } else if (res.isCancelled) {
        setStatusMessage({
          type: 'info',
          text: res.error || 'प्रिंटर चयन रद्द कर दिया गया।',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'प्रिंटर कनेक्ट नहीं हो सका। कृपया सुनिश्चित करें कि प्रिंटर ऑन है और ब्लूटूथ चालू है।',
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Bluetooth error';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setConnecting(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    await bluetoothPrinterService.disconnect();
    onPrinterStateChange(false, null);
    soundService.playDelete();
    setStatusMessage({
      type: 'success',
      text: 'प्रिंटर डिस्कनेक्ट कर दिया गया।',
    });
  };

  // Handle Test Print
  const handleTestPrint = async () => {
    if (!isBluetoothConnected) {
      setStatusMessage({
        type: 'error',
        text: 'कृपया पहले ब्लूटूथ प्रिंटर कनेक्ट करें। (Please connect printer first)',
      });
      return;
    }

    setTesting(true);
    setStatusMessage(null);
    try {
      const res = await bluetoothPrinterService.printTestReceipt(settings);
      if (res.success) {
        soundService.playSuccess();
        setStatusMessage({
          type: 'success',
          text: 'टेस्ट रसीद प्रिंटर पर भेज दी गई! (Test print sent to printer)',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `टेस्ट प्रिंट विफल: ${res.error || 'अज्ञात त्रुटि'}`,
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Test print failed';
      setStatusMessage({ type: 'error', text: `टेस्ट प्रिंट विफल: ${msg}` });
    } finally {
      setTesting(false);
    }
  };

  // Toggle Paper Width (58mm vs 80mm)
  const setPaperWidth = (width: '58mm' | '80mm') => {
    const updated = { ...settings, printerWidth: width };
    onUpdateSettings(updated);
    soundService.playBeep();
  };

  const setPrintMode = (mode: 'image' | 'text') => {
    const updated = { ...settings, printMode: mode };
    onUpdateSettings(updated);
    soundService.playBeep();
  };

  const handleOpenNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 pb-28">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
          <Printer className="w-6 h-6 text-red-700 dark:text-amber-400" />
          <span>ब्लूटूथ थर्मल प्रिंटर (Bluetooth Thermal Printer)</span>
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          अपने Android फ़ोन से 58mm / 80mm ESC/POS थर्मल प्रिंटर पर बिल प्रिंट करें।
        </p>
      </div>

      {/* Iframe Preview Notice Banner */}
      {isInsideIframe && (
        <div className="p-4 mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-stone-900 dark:text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                आईफ्रेम प्रीव्यू सूचना (Iframe Permissions Policy)
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                ब्राउज़र सुरक्षा नीति के कारण इस एम्बेडेड प्रीव्यू में ब्लूटूथ ब्लॉक रहता है। हार्डवेयर थर्मल प्रिंटर को सीधे ब्लूटूथ से जोड़ने के लिए ऐप को नई टैब में खोलें।
              </p>
            </div>
          </div>
          <button
            id="iframe-open-tab-btn"
            onClick={handleOpenNewTab}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-700 to-amber-600 text-white rounded-xl text-xs font-bold shadow-sm hover:from-red-600 hover:to-amber-500 transition whitespace-nowrap self-stretch sm:self-auto cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>नए टैब में खोलें (Open in New Tab)</span>
          </button>
        </div>
      )}

      {/* Unsupported Browser Warning (if any) */}
      {!isBluetoothSupported && (
        <div className="p-4 mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Web Bluetooth सूचना (Bluetooth Notice):</span>
          </div>
          <p>
            इस ब्राउज़र में Web Bluetooth सपोर्ट नहीं मिला है। Android फ़ोन पर Chrome ब्राउज़र का उपयोग करें, या सीधे 'सिस्टम प्रिंट (Print / PDF)' का उपयोग करके बिल निकालें।
          </p>
        </div>
      )}

      {/* Printer Status Card */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200 dark:border-stone-700 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isBluetoothConnected
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-400'
              }`}
            >
              {isBluetoothConnected ? (
                <BluetoothConnected className="w-6 h-6 animate-pulse" />
              ) : (
                <BluetoothOff className="w-6 h-6" />
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-stone-400 block">प्रिंटर स्थिति (Status)</span>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-white">
                {isBluetoothConnected ? connectedPrinterName || 'कनेक्टेड (Connected)' : 'प्रिंटर कनेक्ट नहीं है'}
              </h3>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isBluetoothConnected
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
            }`}
          >
            {isBluetoothConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* Buttons: Connect & Disconnect */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {!isBluetoothConnected ? (
            <button
              id="printer-scan-connect-btn"
              onClick={handleConnect}
              disabled={connecting}
              className="w-full sm:flex-1 py-3.5 px-4 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98] cursor-pointer"
            >
              <Bluetooth className={`w-5 h-5 ${connecting ? 'animate-spin' : ''}`} />
              <span>{connecting ? 'प्रिंटर खोजा जा रहा है...' : 'प्रिंटर स्कैन और कनेक्ट करें (Scan & Connect)'}</span>
            </button>
          ) : (
            <>
              <button
                id="printer-test-print-btn"
                onClick={handleTestPrint}
                disabled={testing}
                className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{testing ? 'प्रिंट हो रहा है...' : 'टेस्ट प्रिंट निकालें (Test Print)'}</span>
              </button>

              <button
                id="printer-disconnect-btn"
                onClick={handleDisconnect}
                className="w-full sm:w-auto py-3 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-2xl font-bold text-sm transition cursor-pointer"
              >
                डिस्कनेक्ट (Disconnect)
              </button>
            </>
          )}
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-2xl text-xs transition ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : statusMessage.type === 'iframe_restricted'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                : statusMessage.type === 'info'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
              ) : statusMessage.type === 'iframe_restricted' ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              ) : statusMessage.type === 'info' ? (
                <Info className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium leading-relaxed">{statusMessage.text}</p>
                {statusMessage.type === 'iframe_restricted' && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleOpenNewTab}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>नई टैब में खोलें (Open in New Tab)</span>
                    </button>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      या आप बिना ब्लूटूथ के सिस्टम प्रिंट (Print / PDF) भी कर सकते हैं
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Paper Width Settings Card */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200 dark:border-stone-700 shadow-sm mb-4">
        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white mb-2 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-red-700 dark:text-amber-400" />
          <span>थर्मल पेपर रोल साइज़ (Paper Roll Size)</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
          अपने प्रिंटर के अनुसार रसीद की चौड़ाई चुनें (58mm = 32 अक्षर प्रति लाइन, 80mm = 48 अक्षर प्रति लाइन):
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            id="paper-size-58mm-btn"
            onClick={() => setPaperWidth('58mm')}
            className={`p-3 rounded-2xl border text-left transition ${
              settings.printerWidth === '58mm'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-600 text-red-950 dark:text-white ring-2 ring-red-500/20'
                : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">58mm (2 इंच)</span>
              {settings.printerWidth === '58mm' && (
                <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-amber-400" />
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              मिनी पोर्टेबल ब्लूटूथ प्रिंटर (PT-210, MPT-II, GOOJPRT आदि)
            </p>
          </button>

          <button
            id="paper-size-80mm-btn"
            onClick={() => setPaperWidth('80mm')}
            className={`p-3 rounded-2xl border text-left transition ${
              settings.printerWidth === '80mm'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-600 text-red-950 dark:text-white ring-2 ring-red-500/20'
                : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">80mm (3 इंच)</span>
              {settings.printerWidth === '80mm' && (
                <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-amber-400" />
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              KPC307-UEWB (80mm) एवं अन्य बड़े काउंटर प्रिंटर (Epson, TVS, Xprinter)
            </p>
          </button>
        </div>
      </div>

      {/* Print Mode Settings Card */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200 dark:border-stone-700 shadow-sm mb-4">
        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white mb-2 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          <span>प्रिंटिंग मोड (Print Mode)</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
          यदि इमेज मोड में प्रिंट नहीं निकल रहा है, तो टेक्स्ट मोड का उपयोग करें:
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPrintMode('image')}
            className={`p-3 rounded-2xl border text-left transition ${
              (settings.printMode || 'image') === 'image'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-950 dark:text-white ring-2 ring-blue-500/20'
                : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Image Mode</span>
              {(settings.printMode || 'image') === 'image' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              लोगो आणि मराठी/हिंदी नावे (High Quality)
            </p>
          </button>

          <button
            onClick={() => setPrintMode('text')}
            className={`p-3 rounded-2xl border text-left transition ${
              settings.printMode === 'text'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-950 dark:text-white ring-2 ring-blue-500/20'
                : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Text Mode</span>
              {settings.printMode === 'text' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              जलद प्रिंट (Fast, English Only). जर इमेज काम करत नसेल.
            </p>
          </button>
        </div>
      </div>

      {/* Android Bluetooth Permissions & Connection Guide */}
      <div className="bg-stone-50 dark:bg-stone-850 rounded-3xl p-5 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-stone-800 dark:text-stone-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Android ब्लूटूथ सेटअप गाइड (Bluetooth Setup Guide)</span>
        </div>

        <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
          <li>
            <strong>प्रिंटर चालू करें:</strong> सुनिश्चित करें कि थर्मल प्रिंटर में पेपर रोल ठीक से लगा हो और ब्लू/हरी लाइट जल रही हो।
          </li>
          <li>
            <strong>फ़ोन के ब्लूटूथ में जोड़ें (Pair):</strong> अपने Android फोन की <em>Settings → Bluetooth</em> में जाकर प्रिंटर को पेयर करें (डिफ़ॉल्ट पिन: <strong>0000</strong> या <strong>1234</strong>)।
          </li>
          <li>
            <strong>परमिशन अनुमति (Permissions):</strong>
            <span className="font-mono text-[11px] text-red-700 dark:text-amber-300 block mt-0.5">
              • BLUETOOTH_SCAN (नजदीकी प्रिंटर खोजने के लिए)
              <br />
              • BLUETOOTH_CONNECT (डेटा भेजने के लिए)
              <br />
              • GPS / Location (Android 11/12 में ब्लूटूथ स्कैनिंग के लिए आवश्यक)
            </span>
          </li>
          <li>
            <strong>स्कैन बटन दबाएं:</strong> ऊपर <em>"प्रिंटर स्कैन और कनेक्ट करें"</em> दबाएं और लिस्ट में से अपने प्रिंटर का नाम (जैसे MPT-II, POS-58, Bluetooth Printer) चुनें।
          </li>
        </ol>
      </div>
    </div>
  );
};
