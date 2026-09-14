import React, { useState, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  Check,
  X,
  Soup,
  Flame,
  Wheat,
  Utensils,
  Tag,
  Camera,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { Category, MenuItem, AppLanguage } from '../types';
import { soundService } from '../services/audio';
import { compressImageFile } from '../services/storage';
import { getTranslations, getItemDisplayName } from '../services/i18n';

interface MenuManagementProps {
  menu: MenuItem[];
  categories: Category[];
  language?: AppLanguage;
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onResetMenu: () => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  menu,
  categories,
  language = 'hi' as AppLanguage,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onResetMenu,
}) => {
  const currentLang: AppLanguage = (language as AppLanguage) || 'hi';
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form fields
  const [name, setName] = useState<string>('');
  const [hindiName, setHindiName] = useState<string>('');
  const [marathiName, setMarathiName] = useState<string>('');
  const [englishName, setEnglishName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('special_veg');
  const [isVeg, setIsVeg] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslations(currentLang);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setHindiName('');
    setMarathiName('');
    setEnglishName('');
    setPrice('');
    setCategory('special_veg');
    setIsVeg(true);
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setHindiName(item.hindiName || '');
    setMarathiName(item.marathiName || '');
    setEnglishName(item.englishName || '');
    setPrice(String(item.price));
    setCategory(item.category);
    setIsVeg(item.isVeg !== false);
    setImageUrl(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)/i)) {
      alert('कृपया केवल JPG, JPEG या PNG इमेज फ़ाइल चुनें।');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const base64 = await compressImageFile(file, 360, 0.82);
      setImageUrl(base64);
      soundService.playSuccess();
    } catch (err) {
      console.error('Error reading photo:', err);
      alert('फोटो लोड करने में त्रुटि हुई।');
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setImageUrl('');
    soundService.playClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (!name.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('कृपया सही नाम और कीमत दर्ज करें (Please enter valid item name and price)');
      return;
    }

    if (editingItem) {
      onUpdateMenuItem({
        ...editingItem,
        name: name.trim(),
        hindiName: hindiName.trim() || undefined,
        marathiName: marathiName.trim() || undefined,
        englishName: englishName.trim() || undefined,
        price: parsedPrice,
        category,
        isVeg,
        imageUrl: imageUrl.trim() || undefined,
      });
      soundService.playSuccess();
    } else {
      onAddMenuItem({
        name: name.trim(),
        hindiName: hindiName.trim() || undefined,
        marathiName: marathiName.trim() || undefined,
        englishName: englishName.trim() || undefined,
        price: parsedPrice,
        category,
        isVeg,
        imageUrl: imageUrl.trim() || undefined,
      });
      soundService.playSuccess();
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: MenuItem) => {
    const confirmMsg = language === 'mr'
      ? `तुम्ही "${item.name}" ला मेनूमधून काढू इच्छिता?`
      : language === 'en'
      ? `Are you sure you want to delete "${item.name}"?`
      : `क्या आप "${item.name}" को मेनू से हटाना चाहते हैं?`;

    if (window.confirm(confirmMsg)) {
      onDeleteMenuItem(item.id);
      soundService.playDelete();
    }
  };

  const handleReset = () => {
    const confirmMsg = language === 'mr'
      ? 'डिफ़ॉल्ट हॉटेल कोहिनूर मेनू रीसेट करायचा आहे का?'
      : 'क्या आप डिफ़ॉल्ट होटल कोहिनूर मेनू रीसेट करना चाहते हैं?';

    if (window.confirm(confirmMsg)) {
      onResetMenu();
      soundService.playSuccess();
    }
  };

  const filteredItems = menu.filter(item => {
    const matchCat = selectedCat === 'all' || item.category === selectedCat;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.hindiName && item.hindiName.toLowerCase().includes(q)) ||
      (item.marathiName && item.marathiName.toLowerCase().includes(q)) ||
      (item.englishName && item.englishName.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 pb-28">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <span>{t.menuTitle}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-amber-400 font-mono font-bold">
              {menu.length}
            </span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            आइटम जोड़ें, फोटो लगाएं या कीमत बदलें।
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>डिफ़ॉल्ट</span>
          </button>

          <button
            id="menu-add-item-btn"
            onClick={openAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addItem}</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-3 border border-stone-200 dark:border-stone-700 shadow-sm mb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-red-600"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id as string)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <span>{language === 'mr' ? cat.marathiName || cat.hindiName : cat.hindiName}</span>
                {cat.id === 'all' && (
                  <span className="text-[10px] opacity-75 font-mono">({menu.length})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Item Cards List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 text-center border border-stone-200 dark:border-stone-700 text-stone-400">
            <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold">{t.noItemsFound}</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const displayName = getItemDisplayName(item, currentLang);
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-stone-800 rounded-2xl p-3 border border-stone-200 dark:border-stone-700 shadow-xs flex items-center justify-between gap-3 hover:border-red-200 transition"
              >
                {/* Left: Food Photo Thumbnail + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Photo Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-stone-900 overflow-hidden flex-shrink-0 relative border border-stone-200 dark:border-stone-700 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-stone-300 dark:text-stone-600">
                        {item.category === 'chicken' ? (
                          <Flame className="w-6 h-6 text-red-400 opacity-60" />
                        ) : item.category === 'roti' ? (
                          <Wheat className="w-6 h-6 text-amber-500 opacity-60" />
                        ) : (
                          <Soup className="w-6 h-6 text-emerald-500 opacity-60" />
                        )}
                      </div>
                    )}
                    {/* Veg / Non-Veg Indicator Badge */}
                    <span
                      className={`absolute top-1 left-1 w-3 h-3 rounded-full border border-white flex items-center justify-center shadow-xs ${
                        item.isVeg !== false ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-stone-900 dark:text-white truncate">
                      {displayName}
                    </h3>
                    {item.englishName && item.englishName !== displayName && (
                      <p className="text-xs text-stone-400 truncate">{item.englishName}</p>
                    )}
                    <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 uppercase font-semibold">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Right: Price & Edit/Delete Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-black text-base text-stone-900 dark:text-amber-400">
                      ₹{item.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 transition"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900 text-red-600 dark:text-red-300 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                {editingItem ? t.editItem : t.addItem}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Food Item Photo Selection */}
              <div className="p-3 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  {t.itemPhoto}
                </label>
                <div className="flex items-center gap-3">
                  {/* Image Preview Box */}
                  <div className="w-20 h-20 rounded-xl bg-white dark:bg-stone-800 border-2 border-dashed border-stone-300 dark:border-stone-700 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-stone-400" />
                    )}
                  </div>

                  {/* Image Controls */}
                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="food-photo-input"
                    />
                    <div className="flex flex-wrap gap-2">
                      <label
                        htmlFor="food-photo-input"
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{imageUrl ? t.changePhoto : t.addPhoto}</span>
                      </label>

                      {imageUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.removePhoto}</span>
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      गैलरी या कैमरे से फोटो चुनें (बिल में प्रिंट नहीं होगी)
                    </span>
                  </div>
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {t.itemName} *
                </label>
                <input
                  id="menu-item-name-input"
                  type="text"
                  required
                  placeholder="उदा. दाल तड़का, चिकन करी"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t.itemPrice} *
                  </label>
                  <input
                    id="menu-item-price-input"
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="240"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-stone-100 font-mono font-bold focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t.itemCategory} *
                  </label>
                  <select
                    id="menu-item-category-select"
                    value={category}
                    onChange={e => {
                      const newCat = e.target.value;
                      setCategory(newCat);
                      // Auto-suggest veg/non-veg if not customized
                      if (newCat === 'special_veg' || newCat === 'roti_papad') {
                        setIsVeg(true);
                      } else if (newCat === 'non_veg' || newCat === 'chinese' || newCat === 'chicken_non_veg') {
                        setIsVeg(false);
                      }
                    }}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-red-600"
                  >
                    {categories
                      .filter(c => c.id !== 'all')
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({language === 'mr' ? cat.marathiName || cat.hindiName : cat.hindiName})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Multi-language names */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-0.5">
                    मराठी नाव (Marathi Name)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. डाळ तडका"
                    value={marathiName}
                    onChange={e => setMarathiName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-0.5">
                    English Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dal Tadka"
                    value={englishName}
                    onChange={e => setEnglishName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Veg / Non-Veg Radio */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  प्रकार (Food Type):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVeg(true)}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                      isVeg
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-300'
                        : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>शाकाहारी (Veg)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVeg(false)}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                      !isVeg
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-600 text-red-700 dark:text-red-300'
                        : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span>मांसाहारी (Non-Veg)</span>
                  </button>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  रद्द करें
                </button>
                <button
                  id="menu-save-item-btn"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs shadow-md transition"
                >
                  {editingItem ? 'सेव करें' : 'जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
