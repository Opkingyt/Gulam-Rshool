import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  Copy,
  Maximize,
  Minimize,
  Wifi,
  WifiOff,
  Bluetooth,
  Vibrate,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  QrCode,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { HotelSettings } from '../types';
import { soundService } from '../services/audio';

interface MobileAppScreenProps {
  settings: HotelSettings;
  billsCount: number;
  menuCount: number;
  isBluetoothConnected: boolean;
  onOpenPrinterTab: () => void;
}

export const MobileAppScreen: React.FC<MobileAppScreenProps> = ({
  settings,
  billsCount,
  menuCount,
  isBluetoothConnected,
  onOpenPrinterTab,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [vibrating, setVibrating] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState<string | null>(null);

  // Monitor online / offline network state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', checkFullscreen);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('fullscreenchange', checkFullscreen);
    };
  }, []);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      soundService.playSuccess();
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*${settings.hotelName || 'HOTEL KOHINOOR'} - Restaurant POS App*\nमोबाइल पर बिलिंग ऐप खोलने और इंस्टॉल करने के लिए इस लिंक पर टैप करें:\n${currentUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleTestVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
      setVibrating(true);
      setTimeout(() => setVibrating(false), 500);
    } else {
      alert('इस ब्राउज़र/डिवाइस पर वाइब्रेशन सपोर्ट नहीं है।');
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    currentUrl
  )}`;

  return (
    <div className="p-3 sm:p-5 max-w-4xl mx-auto space-y-4 pb-24">
      {/* Hero Banner: App Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900 via-red-800 to-amber-950 text-white p-5 sm:p-6 shadow-xl border border-amber-500/30">
        <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-red-950 rounded-[14px] flex items-center justify-center text-amber-300 text-2xl font-bold">
                👑
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-wide font-serif uppercase">
                  {settings.hotelName || 'HOTEL KOHINOOR'}
                </h2>
                <span className="px-2 py-0.5 bg-amber-400 text-red-950 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  Android App
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                रेस्तरां और होटल बिलिंग - पूर्ण Android POS अनुभव
              </p>
              
              {/* App Status pill */}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {isInstalled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ऐप सफलतापूर्वक इंस्टॉल है (Installed Mode)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded-full text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    मोबाइल ऐप में बदलने के लिए तैयार
                  </span>
                )}
                
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isOnline ? 'ऑनलाइन' : '100% ऑफ़लाइन चालू'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Install Action Button */}
          <div className="w-full sm:w-auto flex flex-col gap-2">
            {isInstallable ? (
              <button
                id="btn-app-screen-install"
                onClick={install}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-red-950 font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>फ़ोन में ऐप इंस्टॉल करें (Install App)</span>
              </button>
            ) : isInstalled ? (
              <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/15 text-center text-xs text-amber-100">
                ⭐ स्टैंडअलोन फुल-स्क्रीन मोड में सक्रिय
              </div>
            ) : (
              <button
                onClick={() => setShowGuideModal('chrome')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition"
              >
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span>होम स्क्रीन पर ऐप जोड़ें (गाइड देखें)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 1. Fullscreen / Terminal Mode | 2. QR Code to Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fullscreen Cashier Terminal Mode */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                <Maximize className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                  फुलस्क्रीन POS टर्मिनल मोड
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  ब्राउज़र बार छुपाकर काउंटर पर असली मशीन की तरह चलाएं
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-2">
              यह मोड ब्राउज़र का एड्रेस बार, टैब और नेविगेशन छुपा देता है, जिससे काउंटर पर बिलिंग करते समय कोई अन्य टैब गलती से न खुले।
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">
              {isFullscreen ? '🟢 फुलस्क्रीन सक्रिय है' : '⚪ सामान्य मोड'}
            </span>
            <button
              id="btn-toggle-fullscreen"
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'स्क्रीन सामान्य करें' : 'फुलस्क्रीन चालू करें'}</span>
            </button>
          </div>
        </div>

        {/* Scan QR Code to open on phone */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-700 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                मोबाइल से QR कोड स्कैन करें
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                कैमरे से स्कैन करके सीधे अपने Android फोन में खोलें
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-xs flex-shrink-0">
              <img
                src={qrCodeUrl}
                alt="POS App QR Code"
                className="w-32 h-32 rounded-lg object-contain"
                loading="lazy"
              />
            </div>

            <div className="space-y-2 text-xs w-full">
              <p className="text-stone-600 dark:text-stone-300">
                1. अपने Android मोबाइल का <strong>कैमरा या Google Lens</strong> खोलें।
                <br />
                2. इस QR कोड को स्कैन करें और लिंक पर टैप करें।
                <br />
                3. ब्राउज़र में <strong>"Install App"</strong> दबाएं।
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  id="btn-copy-pos-url"
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold transition"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'कॉपी हो गया!' : 'लिंक कॉपी'}</span>
                </button>
                <button
                  id="btn-whatsapp-share-url"
                  onClick={handleShareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>व्हाट्सएप</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Badges: Offline, Bluetooth, Vibration */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-700 shadow-sm">
        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-red-600" />
          <span>Android ऐप की प्रमुख सुविधाएं (Key Features)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* 1. Offline */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <WifiOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                100% ऑफ़लाइन काम
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded">
                सुरक्षित
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              इंटरनेट न होने पर भी सभी {menuCount} मेनू आइटम और {billsCount} बिल आपके मोबाइल में तुरंत सुरक्षित रहते हैं।
            </p>
          </div>

          {/* 2. Bluetooth Printer */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Bluetooth className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ब्लूटूथ प्रिंटर सपोर्ट
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 font-bold rounded ${
                isBluetoothConnected
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
              }`}>
                {isBluetoothConnected ? 'कनेक्टेड' : 'तैयार'}
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-2">
              सभी मानक 58mm एवं 80mm ESC/POS थर्मल रसीद प्रिंटर के साथ 1-टैप वायरलेस प्रिंटिंग।
            </p>
            <button
              onClick={onOpenPrinterTab}
              className="text-red-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>प्रिंटर सेटिंग खोलें</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* 3. Haptic Touch */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Vibrate className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                हैप्टिक वाइब्रेशन
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold rounded">
                मोबाइल
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-2">
              बटन दबाने और बिल प्रिंट होने पर वास्तविक Android ऐप जैसा वाइब्रेशन फीडबैक।
            </p>
            <button
              onClick={handleTestVibration}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                vibrating
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-stone-200/70 hover:bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-600'
              }`}
            >
              {vibrating ? 'वाइब्रेट हो रहा है...' : 'वाइब्रेशन टेस्ट करें'}
            </button>
          </div>
        </div>
      </div>

      {/* Step-by-Step Android Browser Guide */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-700 shadow-sm">
        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-amber-600" />
          <span>Android मोबाइल में इंस्टॉल करने का तरीका (Browser Guide)</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
          यदि 1-क्लिक बटन काम न करे, तो अपने ब्राउज़र के अनुसार नीचे दिए गए निर्देश अपनाएं:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          {/* Chrome */}
          <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex flex-col justify-between">
            <div>
              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Google Chrome
              </div>
              <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                <li>ऊपर दाईं ओर <strong>⋮ (3 डॉट्स)</strong> दबाएं।</li>
                <li><strong>"Install app"</strong> या <strong>"Add to Home screen"</strong> चुनें।</li>
                <li><strong>"Install"</strong> पर टैप करें।</li>
              </ol>
            </div>
            <div className="mt-2 text-[10px] text-red-700 dark:text-red-300 font-semibold">
              ✔ स्वतः WebAPK बनता है
            </div>
          </div>

          {/* Samsung */}
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex flex-col justify-between">
            <div>
              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Samsung Internet
              </div>
              <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                <li>नीचे <strong>☰ मेन्यू</strong> दबाएं।</li>
                <li><strong>"+ Add page to"</strong> चुनें।</li>
                <li><strong>"Home screen"</strong> दबाएं।</li>
              </ol>
            </div>
            <div className="mt-2 text-[10px] text-blue-700 dark:text-blue-300 font-semibold">
              ✔ होम स्क्रीन पर आइकन
            </div>
          </div>

          {/* Vivo / Oppo / Realme / Xiaomi */}
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col justify-between">
            <div>
              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Vivo / Oppo / Xiaomi
              </div>
              <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                <li>ब्राउज़र मेन्यू (⋮ या ☰) खोलें।</li>
                <li><strong>"Add to Desktop"</strong> या <strong>"होम स्क्रीन पर जोड़ें"</strong> चुनें।</li>
                <li>अनुमति (Allow) दें।</li>
              </ol>
            </div>
            <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
              ✔ तुरंत डेस्कटॉप शॉर्टकट
            </div>
          </div>

          {/* iPhone / iPad */}
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/80 border border-stone-300 dark:border-stone-700 flex flex-col justify-between">
            <div>
              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-stone-500" />
                Apple Safari (iOS)
              </div>
              <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                <li>सफारी में नीचे <strong>Share</strong> बटन दबाएं।</li>
                <li>नीचे स्क्रॉल करके <strong>"Add to Home Screen"</strong> चुनें।</li>
                <li>ऊपर <strong>"Add"</strong> दबाएं।</li>
              </ol>
            </div>
            <div className="mt-2 text-[10px] text-stone-600 dark:text-stone-400 font-semibold">
              ✔ iOS फुल स्क्रीन ऐप
            </div>
          </div>
        </div>
      </div>

      {/* Native Android APK (Capacitor) Technical Build Box */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
              Android APK बिल्ड जानकारी (Capacitor Android Package)
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded font-semibold">
            com.hotelkohinoor.pos
          </span>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
          यह प्रोजेक्ट Capacitor और WebAPK दोनों के लिए पूरी तरह तैयार है। यदि आप इसे Android Studio में खोलकर <code>.apk</code> बनाना चाहते हैं, तो नीचे दी गई कमांड चलाएं:
        </p>

        <div className="bg-stone-900 text-amber-300 font-mono text-xs p-3 rounded-xl overflow-x-auto space-y-1">
          <div><span className="text-stone-500"># 1. सिंक और एंड्रॉइड डायरेक्टरी तैयार करें:</span></div>
          <div className="text-emerald-400">npm run build && npx cap sync android</div>
          <div><span className="text-stone-500"># 2. डिबग APK फ़ाइल कंपाइल करें:</span></div>
          <div className="text-emerald-400">cd android && ./gradlew assembleDebug</div>
          <div><span className="text-stone-400"># APK स्थान: android/app/build/outputs/apk/debug/app-debug.apk</span></div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
          <span>Android Permissions: BLUETOOTH_CONNECT, BLUETOOTH_SCAN, INTERNET</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✔ पूर्णतया कॉन्फ़िगर</span>
        </div>
      </div>
    </div>
  );
};
