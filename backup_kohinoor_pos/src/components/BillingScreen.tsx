import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Sparkles,
  Check,
  X,
  Flame,
  Wheat,
  Soup,
  Utensils,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { Category, MenuItem, CartItem, HotelSettings } from '../types';
import { getTranslations, getItemDisplayName } from '../services/i18n';

interface BillingScreenProps {
  menu: MenuItem[];
  categories: Category[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  onOpenCart: () => void;
  settings: HotelSettings;
}

export const BillingScreen: React.FC<BillingScreenProps> = ({
  menu,
  categories,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onOpenCart,
  settings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const lang = settings.language || 'hi';
  const t = getTranslations(lang);

  // Map cart items for quick O(1) quantity lookups
  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach(c => map.set(c.item.id, c.quantity));
    return map;
  }, [cart]);

  // Total items and total amount in cart
  const totalCartItems = useMemo(() => cart.reduce((acc, c) => acc + c.quantity, 0), [cart]);
  const totalCartAmount = useMemo(() => cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0), [cart]);

  // Filter menu items
  const filteredItems = useMemo(() => {
    return menu.filter(item => {
      const matchesCategory =
        selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const displayName = getItemDisplayName(item, lang).toLowerCase();
      const matchesSearch =
        !q ||
        displayName.includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.hindiName && item.hindiName.toLowerCase().includes(q)) ||
        (item.marathiName && item.marathiName.toLowerCase().includes(q)) ||
        (item.englishName && item.englishName.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery, lang]);

  // Helper icon for categories
  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'special_veg':
        return <Soup className="w-4 h-4 text-emerald-500" />;
      case 'roti_papad':
        return <Wheat className="w-4 h-4 text-amber-600" />;
      case 'non_veg':
        return <Flame className="w-4 h-4 text-red-600" />;
      case 'chinese':
        return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'chicken_non_veg':
        return <Flame className="w-4 h-4 text-red-700" />;
      default:
        return <Utensils className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="pb-24 pt-2">
      {/* Search Bar & Stats */}
      <div className="px-3 sm:px-4 mb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            id="billing-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-xl border border-stone-300 dark:border-stone-700 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-red-600 dark:focus:ring-amber-500 text-sm font-medium transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (Horizontal scrollable for Android) */}
      <div className="px-3 sm:px-4 mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const categoryLabel = lang === 'mr' ? cat.marathiName || cat.hindiName : cat.hindiName;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-700 to-red-800 text-white shadow-md shadow-red-900/20 scale-[1.02]'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{categoryLabel}</span>
                {cat.id === 'all' && (
                  <span className="text-[11px] opacity-75 font-normal">({menu.length})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="px-3 sm:px-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-stone-800 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 p-6">
            <p className="text-stone-500 dark:text-stone-400 font-medium">{t.noItemsFound}</p>
            <p className="text-xs text-stone-400 mt-1">खोज शब्द बदलें या मेनू में नया आइटम जोड़ें</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {filteredItems.map(item => {
              const qty = cartQuantityMap.get(item.id) || 0;
              const isInCart = qty > 0;
              const displayName = getItemDisplayName(item, lang);

              return (
                <div
                  key={item.id}
                  id={`menu-card-${item.id}`}
                  onClick={() => onAddToCart(item)}
                  className={`group relative flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.98] overflow-hidden ${
                    isInCart
                      ? 'bg-red-50/70 dark:bg-red-950/30 border-red-400 dark:border-red-700/60 shadow-sm ring-2 ring-red-500/20'
                      : 'bg-white dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 hover:border-amber-400/60 dark:hover:border-amber-600/60 shadow-xs'
                  }`}
                >
                  {/* Food Item Photo or Placeholder */}
                  <div className="w-full h-24 sm:h-28 rounded-xl bg-stone-100 dark:bg-stone-900 overflow-hidden relative border border-stone-150 dark:border-stone-700/60 mb-2 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-400 dark:text-stone-600 p-2">
                        {item.category === 'special_veg' ? (
                          <Soup className="w-8 h-8 text-emerald-500/70 mb-1" />
                        ) : item.category === 'roti_papad' ? (
                          <Wheat className="w-8 h-8 text-amber-500/70 mb-1" />
                        ) : item.category === 'chinese' ? (
                          <Utensils className="w-8 h-8 text-orange-500/70 mb-1" />
                        ) : (
                          <Flame className="w-8 h-8 text-red-500/70 mb-1" />
                        )}
                        <span className="text-[10px] font-semibold tracking-wider uppercase opacity-70">
                          {item.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>
                    )}

                    {/* Veg / Non-Veg Indicator Badge Overlay */}
                    <span
                      className={`absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                        item.isVeg === false ? 'bg-red-600' : 'bg-emerald-600'
                      }`}
                      title={item.isVeg === false ? 'Non-Veg' : 'Veg'}
                    />

                    {/* Quantity Badge in card corner when added */}
                    {isInCart && (
                      <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-red-700 text-white font-mono font-black text-xs shadow-md">
                        {qty}
                      </span>
                    )}
                  </div>

                  {/* Item Name */}
                  <div className="mb-1 flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
                      {displayName}
                    </h3>
                    {item.englishName && item.englishName !== displayName && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {item.englishName}
                      </p>
                    )}
                  </div>

                  {/* Price & Stepper Buttons */}
                  <div className="mt-1.5 pt-2 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between gap-1">
                    <span className="text-base sm:text-lg font-extrabold text-red-700 dark:text-amber-400 font-mono">
                      ₹{item.price}
                    </span>

                    {/* Stepper Buttons */}
                    <div
                      className="flex items-center gap-1"
                      onClick={e => e.stopPropagation()} // Prevent double trigger
                    >
                      {isInCart ? (
                        <div className="flex items-center bg-red-600 text-white rounded-xl shadow-xs overflow-hidden">
                          <button
                            id={`btn-minus-${item.id}`}
                            onClick={() => onRemoveFromCart(item.id)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-red-700 active:bg-red-800 transition text-white font-bold"
                            title="कम करें"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-black font-mono">
                            {qty}
                          </span>
                          <button
                            id={`btn-plus-${item.id}`}
                            onClick={() => onAddToCart(item)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-red-700 active:bg-red-800 transition text-white font-bold"
                            title="बढ़ाएं"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-add-${item.id}`}
                          onClick={() => onAddToCart(item)}
                          className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-red-600 text-stone-700 hover:text-white dark:bg-stone-700 dark:hover:bg-red-600 dark:text-stone-200 flex items-center justify-center transition shadow-xs"
                          title="कार्ट में जोड़ें"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Quick Cart Summary Bar on Mobile */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-3 py-2 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              id="billing-floating-cart-btn"
              onClick={onOpenCart}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-700 via-red-800 to-amber-800 text-white rounded-2xl shadow-xl shadow-red-950/40 border border-amber-400/30 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold text-amber-200">
                    {totalCartItems} {lang === 'mr' ? 'आयटम निवडले' : lang === 'en' ? 'items selected' : 'आइटम चुने गए'}
                  </span>
                  <div className="text-base font-black font-mono leading-none">
                    ₹{totalCartAmount}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm font-bold text-amber-300">
                <span>{lang === 'mr' ? 'बिल आणि कार्ट पहा' : lang === 'en' ? 'View Bill & Cart' : 'बिल और कार्ट देखें'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
