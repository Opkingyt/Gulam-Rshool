import React, { useState, useRef } from 'react';
import {
  Hotel,
  MapPin,
  Phone,
  Receipt,
  Instagram,
  Mail,
  FileCheck,
  Save,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Hash,
  Volume2,
  Image as ImageIcon,
  Trash2,
  Globe,
  Printer,
} from 'lucide-react';
import { HotelSettings, AppLanguage } from '../types';
import { soundService } from '../services/audio';
import { storageService, DEFAULT_HOTEL_SETTINGS, compressImageFile } from '../services/storage';
import { getTranslations } from '../services/i18n';

interface HotelSettingsScreenProps {
  settings: HotelSettings;
  onUpdateSettings: (newSettings: HotelSettings) => void;
  onDataImported: () => void;
}

export const HotelSettingsScreen: React.FC<HotelSettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onDataImported,
}) => {
  const [formData, setFormData] = useState<HotelSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslations(formData.language || 'hi');

  const handleChange = (field: keyof HotelSettings, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)/i)) {
      alert('कृपया केवल JPG, JPEG या PNG इमेज फ़ाइल चुनें।');
      return;
    }

    try {
      setLogoUploading(true);
      const base64 = await compressImageFile(file, 400, 0.85);
      handleChange('logoUrl', base64);
      soundService.playSuccess();
    } catch (err) {
      console.error('Error compressing logo image', err);
      alert('लोगो लोड करने में विफल रहा।');
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    handleChange('logoUrl', '');
    soundService.playClick();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    soundService.playSuccess();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('क्या आप होटल कोहिनूर की डिफ़ॉल्ट जानकारी रीसेट करना चाहते हैं?')) {
      setFormData({ ...DEFAULT_HOTEL_SETTINGS });
      onUpdateSettings(DEFAULT_HOTEL_SETTINGS);
      soundService.playSuccess();
    }
  };

  // Export Data backup
  const handleExportBackup = () => {
    const dataStr = storageService.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hotel_Kohinoor_POS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundService.playSuccess();
  };

  // Import Data backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = storageService.importData(content);
      if (success) {
        setImportStatus('डेटा लोड हुआ! (Backup restored)');
        soundService.playSuccess();
        onDataImported();
      } else {
        setImportStatus('फ़ाइल लोड करने में त्रुटि हुई।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 pb-28">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
          <Hotel className="w-6 h-6 text-red-700 dark:text-amber-400" />
          <span>{t.hotelSettingsTitle}</span>
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t.hotelSettingsDesc}
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{t.settingsSaved}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200 dark:border-stone-700 shadow-sm space-y-5 mb-4">
        {/* 1. Language Selector */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-red-700 dark:text-amber-400" />
            <label className="text-xs font-bold text-stone-900 dark:text-white">
              {t.languageSelector}
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleChange('language', 'hi')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                formData.language === 'hi'
                  ? 'bg-red-700 text-white border-red-700 shadow-sm'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>हिंदी (Hindi)</span>
            </button>

            <button
              type="button"
              onClick={() => handleChange('language', 'mr')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                formData.language === 'mr'
                  ? 'bg-red-700 text-white border-red-700 shadow-sm'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>मराठी (Marathi)</span>
            </button>

            <button
              type="button"
              onClick={() => handleChange('language', 'en')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                formData.language === 'en'
                  ? 'bg-red-700 text-white border-red-700 shadow-sm'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>English</span>
            </button>
          </div>
        </div>

        {/* 2. Restaurant Logo Uploader & Size Control */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red-700 dark:text-amber-400" />
              <label className="text-xs font-bold text-stone-900 dark:text-white">
                {t.restaurantLogo}
              </label>
            </div>
            {formData.logoUrl && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                लोगो सुरक्षित सेव है
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t.restaurantLogoDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            {/* Logo Preview Box */}
            <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 flex items-center justify-center overflow-hidden flex-shrink-0 p-2 shadow-inner">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Restaurant Logo"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-stone-400 mb-1" />
                  <span className="text-[10px] text-stone-400 block font-medium">कोई लोगो नहीं</span>
                </div>
              )}
            </div>

            {/* Logo Controls */}
            <div className="flex-1 w-full space-y-2.5">
              <div className="flex flex-wrap gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleLogoFileChange}
                  className="hidden"
                  id="restaurant-logo-input"
                />
                <label
                  htmlFor="restaurant-logo-input"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.logoUrl ? t.changeLogo : t.chooseLogo}</span>
                </label>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.removeLogo}</span>
                  </button>
                )}
              </div>

              {/* Logo Size Selection */}
              {formData.logoUrl && (
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                    {t.logoSize} (Receipt Print Size)
                  </label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleChange('logoSize', size)}
                        className={`py-1 px-3 rounded-lg text-xs font-semibold border transition ${
                          (formData.logoSize || 'medium') === size
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        {size === 'small' ? t.sizeSmall : size === 'medium' ? t.sizeMedium : t.sizeLarge}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Hotel Name */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
            {t.hotelName} *
          </label>
          <input
            type="text"
            required
            value={formData.hotelName}
            onChange={e => handleChange('hotelName', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-900 dark:text-white focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Tagline / Subtitle */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
            {t.tagline}
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={e => handleChange('tagline', e.target.value)}
            className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
            {t.address} *
          </label>
          <textarea
            rows={2}
            required
            value={formData.address}
            onChange={e => handleChange('address', e.target.value)}
            className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Mobile & GSTIN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t.phone} *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-mono font-bold text-stone-900 dark:text-white focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t.gstin} (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 27AAAAA0000A1Z5"
              value={formData.gstin}
              onChange={e => handleChange('gstin', e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-mono text-stone-900 dark:text-white focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* Instagram & Gmail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Instagram ID
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">@</span>
              <input
                type="text"
                value={formData.instagram}
                onChange={e => handleChange('instagram', e.target.value)}
                className="w-full pl-8 pr-3.5 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Gmail ID
            </label>
            <input
              type="email"
              value={formData.gmail}
              onChange={e => handleChange('gmail', e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* 4. Bill Number Counter (Strictly plain sequential integers without leading zeros: 1, 2, 3...) */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-1">
            <Hash className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <label className="text-xs font-bold text-amber-900 dark:text-amber-200">
              {t.billCounter}
            </label>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="number"
              min="1"
              value={formData.currentBillCounter}
              onChange={e => handleChange('currentBillCounter', Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-32 px-3.5 py-2 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-xl text-base font-mono font-bold text-stone-900 dark:text-white focus:ring-2 focus:ring-red-600"
            />
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              {t.nextBillWillBe}: <span className="font-mono text-base font-black px-2 py-0.5 bg-amber-200 dark:bg-amber-900/60 rounded-md">{formData.currentBillCounter}</span>
              <span className="block text-[11px] font-normal text-stone-500 dark:text-stone-400 mt-0.5">
                (सामान्य नंबर: 1, 2, 3, 4, 5... कोई 0001 नहीं)
              </span>
            </div>
          </div>
        </div>

        {/* 5. Printer Paper Width (Default 80mm KPC307-UEWB) */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-red-700 dark:text-amber-400" />
              <div>
                <label className="text-xs font-bold text-stone-900 dark:text-white block">
                  {t.paperWidth}
                </label>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  KPC307-UEWB (80mm) थर्मल प्रिंटर
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleChange('printerWidth', '80mm')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition ${
                  formData.printerWidth === '80mm'
                    ? 'bg-red-700 text-white border-red-700 shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                }`}
              >
                80mm (Recommended)
              </button>
              <button
                type="button"
                onClick={() => handleChange('printerWidth', '58mm')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition ${
                  formData.printerWidth === '58mm'
                    ? 'bg-red-700 text-white border-red-700 shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                }`}
              >
                58mm
              </button>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
            रसीद फुटर संदेश (Receipt Footer Message)
          </label>
          <textarea
            rows={2}
            value={formData.footerMessage}
            onChange={e => handleChange('footerMessage', e.target.value)}
            className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Sound feedback toggle */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-stone-500" />
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              POS बटन साउंड (Audio Beep Feedback)
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleChange('soundEnabled', !formData.soundEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              formData.soundEnabled ? 'bg-red-700' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                formData.soundEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Submit & Reset Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-700">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          >
            {t.resetDefault}
          </button>

          <button
            id="settings-save-btn"
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveSettings}</span>
          </button>
        </div>
      </form>

      {/* Backup & Restore Card */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200 dark:border-stone-700 shadow-sm">
        <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
          डेटा बैकअप और रीस्टोर (Data Backup & Offline Export)
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
          फ़ोन बदलने या डेटा सुरक्षित रखने के लिए पूरा डेटा (मेनू, लोगो, बिल हिस्ट्री, सेटिंग्स) एक क्लिक में डाउनलोड करें।
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="w-full sm:flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>पूरा बैकअप डाउनलोड करें (Export JSON)</span>
          </button>

          <label className="w-full sm:flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-750 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border border-stone-300 dark:border-stone-600">
            <Upload className="w-4 h-4" />
            <span>बैकअप फ़ाइल लोड करें (Import JSON)</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {importStatus}
          </p>
        )}
      </div>
    </div>
  );
};
