import React from 'react';
import {
  Bluetooth,
  BluetoothConnected,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  ExternalLink,
  QrCode,
  Bell,
  Bot
} from 'lucide-react';
import { HotelSettings } from '../types';

interface NavbarProps {
  settings: HotelSettings;
  isBluetoothConnected: boolean;
  connectedPrinterName: string | null;
  onOpenPrinterTab: () => void;
  onOpenAppTab?: () => void;
  onOpenAIAssistant?: () => void;
  onOpenTableQRTab?: () => void;
  onOpenTableOrdersTab?: () => void;
  pendingOrdersCount?: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  nextBillNumber: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isBluetoothConnected,
  connectedPrinterName,
  onOpenPrinterTab,
  onOpenAppTab,
  onOpenAIAssistant,
  onOpenTableQRTab,
  onOpenTableOrdersTab,
  pendingOrdersCount = 0,
  isDarkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  nextBillNumber,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-red-900 via-red-800 to-amber-950 text-white shadow-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Hotel Kohinoor Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-[9px] bg-white p-0.5"
              />
            ) : (
              <div className="w-full h-full bg-red-950 rounded-[10px] flex items-center justify-center text-amber-300 font-bold text-lg">
                👑
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-lg tracking-wide truncate text-white uppercase font-serif">
                {settings.hotelName || 'HOTEL KOHINOOR'}
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded">
                POS
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80 truncate">
              {settings.address.split(',')[0]} • Chh. Sambhajinagar
            </p>
          </div>
        </div>

        {/* Right: Bill No, Bluetooth Status, Sound, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

          {/* Live Table Orders Alert Badge */}
          {pendingOrdersCount > 0 && onOpenTableOrdersTab && (
            <button
              id="nav-live-orders-btn"
              onClick={onOpenTableOrdersTab}
              title={`${pendingOrdersCount} नवीन टेबल ऑर्डर्स`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-black bg-amber-400 text-stone-950 shadow-md animate-bounce border border-amber-300"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{pendingOrdersCount} टेबल ऑर्डर</span>
            </button>
          )}

          {/* Table QR Button */}
          {onOpenTableQRTab && (
            <button
              id="nav-table-qr-btn"
              onClick={onOpenTableQRTab}
              title="टेबल QR कोड्स तयार व प्रिंट करा"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-black/30 hover:bg-black/40 text-amber-200 border border-amber-400/30 transition shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>टेबल QR</span>
            </button>
          )}

          {/* Live Next Bill Indicator */}
          <div className="hidden xs:flex flex-col items-end px-2 py-1 bg-black/25 rounded-lg border border-white/10">
            <span className="text-[9px] text-amber-200/80 font-medium leading-none">अगला बिल (Bill No)</span>
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 leading-tight">
              {nextBillNumber}
            </span>
          </div>

          {/* AI Assistant Button */}
          {onOpenAIAssistant && (
            <button
              onClick={onOpenAIAssistant}
              title="AI Assistant"
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition border border-blue-400"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Assistant</span>
            </button>
          )}

          {/* Mobile App Install Button */}
          {onOpenAppTab && (
            <button
              id="nav-app-btn"
              onClick={onOpenAppTab}
              title="Android ऐप इंस्टॉल करें"
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-red-950 shadow-sm transition border border-amber-300"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ऐप (App)</span>
            </button>
          )}


          {/* Bluetooth Status Pill */}
          <button
            id="nav-bluetooth-btn"
            onClick={onOpenPrinterTab}
            title={isBluetoothConnected ? `प्रिंटर: ${connectedPrinterName}` : 'प्रिंटर कनेक्ट करें'}
            className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition border ${
              isBluetoothConnected
                ? 'bg-emerald-600/90 text-white border-emerald-400 shadow-sm'
                : 'bg-black/30 hover:bg-black/40 text-amber-100 border-white/15'
            }`}
          >
            {isBluetoothConnected ? (
              <>
                <BluetoothConnected className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                <span className="hidden md:inline font-semibold truncate max-w-[100px]">
                  {connectedPrinterName || 'प्रिंटर कनेक्ट'}
                </span>
                <span className="md:hidden text-[11px] font-semibold">प्रिंटर ON</span>
              </>
            ) : (
              <>
                <Bluetooth className="w-3.5 h-3.5 text-amber-300/80" />
                <span className="hidden sm:inline text-[11px] text-amber-200">प्रिंटर जोड़ें</span>
              </>
            )}
          </button>

          {/* Audio toggle */}
          <button
            id="nav-sound-toggle-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'साउंड चालू' : 'साउंड बंद'}
            className="p-2 rounded-lg bg-black/20 hover:bg-black/30 text-amber-200 border border-white/10 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>

          {/* Dark / Light Mode */}
          <button
            id="nav-theme-toggle-btn"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'लाइट मोड' : 'डार्क मोड'}
            className="p-2 rounded-lg bg-black/20 hover:bg-black/30 text-amber-200 border border-white/10 transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-amber-100" />}
          </button>

          {/* Open in New Tab (Bypasses iframe permissions policy for Bluetooth) */}
          <button
            id="nav-popout-btn"
            onClick={() => window.open(window.location.href, '_blank')}
            title="नई टैब में खोलें (Open in New Tab for full Bluetooth access)"
            className="p-2 rounded-lg bg-black/20 hover:bg-black/30 text-amber-200 border border-white/10 transition flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
