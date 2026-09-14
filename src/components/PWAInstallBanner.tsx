import React, { useState } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  // Android / Chromium in-app install banner
  if (isInstallable) {
    return (
      <div className="bg-gradient-to-r from-red-800 to-amber-900 text-white px-3 py-2 sm:px-4 text-xs flex items-center justify-between gap-2 shadow-inner border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-400 text-red-950 flex items-center justify-center font-bold text-xs flex-shrink-0">
            📱
          </div>
          <span className="truncate">
            <strong>Android ऐप इंस्टॉल करें:</strong> बिना इंटरनेट तेज़ बिलिंग के लिए होम स्क्रीन पर जोड़ें।
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            id="pwa-install-btn"
            onClick={install}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-red-950 font-extrabold rounded-lg shadow-xs transition text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>इंस्टॉल (Install)</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-white/70 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <div className="bg-stone-900 text-stone-200 px-3 py-1.5 text-xs flex items-center justify-between border-b border-stone-800">
          <span className="text-[11px]">iPhone / iPad पर ऐप की तरह चलाएं</span>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="text-amber-400 font-bold underline text-xs"
          >
            निर्देश देखें
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-stone-900">
              <h3 className="text-base font-bold mb-2">Safari में इंस्टॉल करने का तरीका</h3>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                1. सफारी के नीचे <strong>Share</strong> बटन दबाएं।
                <br />
                2. नीचे स्क्रॉल करके <strong>Add to Home Screen (होम स्क्रीन में जोड़ें)</strong> चुनें।
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-stone-900 text-white py-2 text-xs font-bold"
              >
                समझ गया (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
