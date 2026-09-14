import { Bill, Category, HotelSettings, MenuItem } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: 'All', hindiName: 'सभी', marathiName: 'सर्व', englishName: 'All' },
  { id: 'special_veg', name: 'SPECIAL VEG', hindiName: 'स्पेशल वेज', marathiName: 'स्पेशल व्हेज', englishName: 'Special Veg' },
  { id: 'roti_papad', name: 'ROTI / PAPAD', hindiName: 'रोटी / पापड़', marathiName: 'रोटी / पापड', englishName: 'Roti / Papad' },
  { id: 'non_veg', name: 'NON VEG', hindiName: 'नॉन वेज', marathiName: 'नॉन व्हेज', englishName: 'Non Veg' },
  { id: 'chinese', name: 'CHINESE', hindiName: 'चायनीज', marathiName: 'चायनीज', englishName: 'Chinese' },
  { id: 'chicken_non_veg', name: 'CHICKEN NON VEG', hindiName: 'चिकन नॉन वेज', marathiName: 'चिकन नॉन व्हेज', englishName: 'Chicken Non Veg' },
];

export const DEFAULT_HOTEL_SETTINGS: HotelSettings = {
  hotelName: 'HOTEL KOHINOOR',
  tagline: 'Restaurant Billing / POS',
  address: 'Near Mukundwadi Railway Station, Chh. Sambhajinagar, Maharashtra',
  phone: '7219586544',
  gstin: '',
  instagram: 'hotel_kohinoor_09',
  gmail: 'hotelkohinoor33@gmail.com',
  footerMessage: 'धन्यवाद! फिर आइए।\nThank You! Visit Again',
  logoUrl: '',
  logoSize: 'medium',
  language: 'hi',
  printerWidth: '80mm', // Model: KPC307-UEWB 80mm
  printMode: 'image',
  billPrefix: '', // Plain sequential numbers: 1, 2, 3...
  currentBillCounter: 1,
  soundEnabled: true,
  currencySymbol: '₹',
};

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // ========================
  // CATEGORY: SPECIAL VEG
  // ========================
  { id: 'veg-1', name: 'पनीर मसाला', hindiName: 'Paneer Masala', marathiName: 'पनीर मसाला', englishName: 'Paneer Masala', price: 150, category: 'special_veg', isVeg: true },
  { id: 'veg-2', name: 'पनीर पालक', hindiName: 'Paneer Palak', marathiName: 'पनीर पालक', englishName: 'Paneer Palak', price: 150, category: 'special_veg', isVeg: true },
  { id: 'veg-3', name: 'दाल तड़का फ्राय', hindiName: 'Dal Tadka Fry', marathiName: 'डाळ तडका फ्राय', englishName: 'Dal Tadka Fry', price: 130, category: 'special_veg', isVeg: true },
  { id: 'veg-4', name: 'बैंगन मसाला', hindiName: 'Baingan Masala', marathiName: 'वांगी मसाला', englishName: 'Baingan Masala', price: 150, category: 'special_veg', isVeg: true },
  { id: 'veg-5', name: 'शेवगा मसाला', hindiName: 'Shevga Masala', marathiName: 'शेवगा मसाला', englishName: 'Shevga Masala', price: 150, category: 'special_veg', isVeg: true },
  { id: 'veg-6', name: 'शेव भाजी', hindiName: 'Shev Bhaji', marathiName: 'शेव भाजी', englishName: 'Shev Bhaji', price: 100, category: 'special_veg', isVeg: true },
  { id: 'veg-7', name: 'वेज बिरयानी', hindiName: 'Veg Biryani', marathiName: 'व्हेज बिर्याणी', englishName: 'Veg Biryani', price: 100, category: 'special_veg', isVeg: true },
  { id: 'veg-8', name: 'मिक्स वेज', hindiName: 'Mix Veg', marathiName: 'मिक्स व्हेज', englishName: 'Mix Veg', price: 150, category: 'special_veg', isVeg: true },
  { id: 'veg-9', name: 'जीरा राइस फुल', hindiName: 'Jeera Rice Full', marathiName: 'जिरा राईस फुल', englishName: 'Jeera Rice Full', price: 100, category: 'special_veg', isVeg: true },
  { id: 'veg-10', name: 'जीरा राइस हाफ', hindiName: 'Jeera Rice Half', marathiName: 'जिरा राईस हाफ', englishName: 'Jeera Rice Half', price: 60, category: 'special_veg', isVeg: true },

  // ========================
  // CATEGORY: ROTI / PAPAD
  // ========================
  { id: 'roti-1', name: 'तंदूर रोटी', hindiName: 'Tandoor Roti', marathiName: 'तंदूर रोटी', englishName: 'Tandoor Roti', price: 10, category: 'roti_papad', isVeg: true },
  { id: 'roti-2', name: 'चपाती रोटी', hindiName: 'Chapati Roti', marathiName: 'चपाती', englishName: 'Chapati Roti', price: 10, category: 'roti_papad', isVeg: true },
  { id: 'roti-3', name: 'बाजरी रोटी', hindiName: 'Bajri Roti', marathiName: 'बाजरीची भाकरी', englishName: 'Bajri Roti', price: 15, category: 'roti_papad', isVeg: true },
  { id: 'roti-4', name: 'मसाला पापड़', hindiName: 'Masala Papad', marathiName: 'मसाला पापड', englishName: 'Masala Papad', price: 25, category: 'roti_papad', isVeg: true },
  { id: 'roti-5', name: 'साधा पापड़', hindiName: 'Sadha Papad', marathiName: 'साधा पापड', englishName: 'Sadha Papad', price: 10, category: 'roti_papad', isVeg: true },
  { id: 'roti-6', name: 'गुलाब जामुन', hindiName: 'Gulab Jamun (प्रति पीस)', marathiName: 'गुलाब जामुन (प्रति पीस)', englishName: 'Gulab Jamun (1 Pc)', price: 20, category: 'roti_papad', isVeg: true },
  { id: 'roti-7', name: 'कोल्ड्रिंक्स', hindiName: 'Cold Drinks', marathiName: 'कोल्ड्रिंक्स', englishName: 'Cold Drinks', price: 40, category: 'roti_papad', isVeg: true },

  // ========================
  // CATEGORY: NON VEG
  // ========================
  { id: 'nonveg-1', name: 'बकरा मटन (Plate)', hindiName: 'Bakra Mutton Plate', marathiName: 'बकरा मटन (प्लेट)', englishName: 'Mutton Plate', price: 250, category: 'non_veg', isVeg: false },
  { id: 'nonveg-2', name: 'बकरा मटन (Half)', hindiName: 'Bakra Mutton Half', marathiName: 'बकरा मटन (हाफ)', englishName: 'Mutton Half', price: 550, category: 'non_veg', isVeg: false },
  { id: 'nonveg-3', name: 'बकरा मटन (Full)', hindiName: 'Bakra Mutton Full', marathiName: 'बकरा मटन (फुल)', englishName: 'Mutton Full', price: 1100, category: 'non_veg', isVeg: false },

  { id: 'nonveg-4', name: 'गावारण कोंबडा (Plate)', hindiName: 'Gavran Kombda Plate', marathiName: 'गावरान कोंबडा (प्लेट)', englishName: 'Desi Chicken Plate', price: 250, category: 'non_veg', isVeg: false },
  { id: 'nonveg-5', name: 'गावारण कोंबडा (Half)', hindiName: 'Gavran Kombda Half', marathiName: 'गावरान कोंबडा (हाफ)', englishName: 'Desi Chicken Half', price: 550, category: 'non_veg', isVeg: false },
  { id: 'nonveg-6', name: 'गावारण कोंबडा (Full)', hindiName: 'Gavran Kombda Full', marathiName: 'गावरान कोंबडा (फुल)', englishName: 'Desi Chicken Full', price: 1100, category: 'non_veg', isVeg: false },

  { id: 'nonveg-7', name: 'तितर ग्रेवी', hindiName: 'Teetar Gravy', marathiName: 'तितर ग्रेव्ही', englishName: 'Teetar Gravy', price: 200, category: 'non_veg', isVeg: false },
  { id: 'nonveg-8', name: 'मच्छी ग्रेवी', hindiName: 'Machhi Gravy', marathiName: 'मच्छी ग्रेव्ही', englishName: 'Fish Gravy', price: 200, category: 'non_veg', isVeg: false },

  { id: 'nonveg-9', name: 'मच्छी फ्राय (250 ग्राम)', hindiName: 'Fish Fry 250g', marathiName: 'मच्छी फ्राय (२५० ग्रॅम)', englishName: 'Fish Fry 250g', price: 90, category: 'non_veg', isVeg: false },
  { id: 'nonveg-10', name: 'मच्छी फ्राय (500 ग्राम)', hindiName: 'Fish Fry 500g', marathiName: 'मच्छी फ्राय (५०० ग्रॅम)', englishName: 'Fish Fry 500g', price: 180, category: 'non_veg', isVeg: false },
  { id: 'nonveg-11', name: 'मच्छी फ्राय (1 किलो)', hindiName: 'Fish Fry 1kg', marathiName: 'मच्छी फ्राय (१ किलो)', englishName: 'Fish Fry 1kg', price: 360, category: 'non_veg', isVeg: false },

  { id: 'nonveg-12', name: 'झिंगा ग्रेवी', hindiName: 'Jhinga Gravy', marathiName: 'झिंगा ग्रेव्ही', englishName: 'Prawns Gravy', price: 200, category: 'non_veg', isVeg: false },
  { id: 'nonveg-13', name: 'झिंगा फ्राय', hindiName: 'Jhinga Fry', marathiName: 'झिंगा फ्राय', englishName: 'Prawns Fry', price: 200, category: 'non_veg', isVeg: false },

  // ========================
  // CATEGORY: CHINESE
  // ========================
  { id: 'chinese-1', name: 'चिकन नूडल्स', hindiName: 'Chicken Noodles', marathiName: 'चिकन नूडल्स', englishName: 'Chicken Noodles', price: 80, category: 'chinese', isVeg: false },
  { id: 'chinese-2', name: 'चिकन राइस', hindiName: 'Chicken Rice', marathiName: 'चिकन राईस', englishName: 'Chicken Rice', price: 80, category: 'chinese', isVeg: false },

  { id: 'chinese-3', name: 'चिकन कटिंग (250 ग्राम)', hindiName: 'Chicken Cutting 250g', marathiName: 'चिकन कटिंग (२५० ग्रॅम)', englishName: 'Chicken Cutting 250g', price: 80, category: 'chinese', isVeg: false },
  { id: 'chinese-4', name: 'चिकन कटिंग (500 ग्राम)', hindiName: 'Chicken Cutting 500g', marathiName: 'चिकन कटिंग (५०० ग्रॅम)', englishName: 'Chicken Cutting 500g', price: 150, category: 'chinese', isVeg: false },
  { id: 'chinese-5', name: 'चिकन कटिंग (1 किलो)', hindiName: 'Chicken Cutting 1kg', marathiName: 'चिकन कटिंग (१ किलो)', englishName: 'Chicken Cutting 1kg', price: 300, category: 'chinese', isVeg: false },

  { id: 'chinese-6', name: 'चिकन रोल (1 पीस)', hindiName: 'Chicken Roll (1 Pc)', marathiName: 'चिकन रोल (१ नग)', englishName: 'Chicken Roll 1 Pc', price: 60, category: 'chinese', isVeg: false },
  { id: 'chinese-7', name: 'चिकन रोल (2 पीस)', hindiName: 'Chicken Roll (2 Pc)', marathiName: 'चिकन रोल (२ नग)', englishName: 'Chicken Roll 2 Pc', price: 100, category: 'chinese', isVeg: false },

  { id: 'chinese-8', name: 'चिकन शोरमा', hindiName: 'Chicken Shawarma (प्रति पीस)', marathiName: 'चिकन शावरमा', englishName: 'Chicken Shawarma', price: 60, category: 'chinese', isVeg: false },
  { id: 'chinese-9', name: 'चिकन सूप', hindiName: 'Chicken Soup', marathiName: 'चिकन सूप', englishName: 'Chicken Soup', price: 100, category: 'chinese', isVeg: false },
  { id: 'chinese-10', name: 'मंच्युरियन चिकन', hindiName: 'Manchurian Chicken (प्रति प्लेट)', marathiName: 'मंच्युरियन चिकन', englishName: 'Chicken Manchurian Plate', price: 180, category: 'chinese', isVeg: false },
  { id: 'chinese-11', name: 'चिकन लॉलीपॉप', hindiName: 'Chicken Lollipop (प्रति प्लेट)', marathiName: 'चिकन लॉलीपॉप', englishName: 'Chicken Lollipop Plate', price: 100, category: 'chinese', isVeg: false },

  // ========================
  // CATEGORY: CHICKEN NON VEG
  // ========================
  { id: 'chicken-1', name: 'स्पे. कोहिनूर चिकन', hindiName: 'Special Kohinoor Chicken', marathiName: 'स्पे. कोहिनूर चिकन', englishName: 'Special Kohinoor Chicken', price: 200, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-2', name: 'चिकन महाराजा', hindiName: 'Chicken Maharaja', marathiName: 'चिकन महाराजा', englishName: 'Chicken Maharaja', price: 180, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-3', name: 'चिकन तवा फुल', hindiName: 'Chicken Tawa Full', marathiName: 'चिकन तवा फुल', englishName: 'Chicken Tawa Full', price: 400, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-4', name: 'चिकन तवा हाफ', hindiName: 'Chicken Tawa Half', marathiName: 'चिकन तवा हाफ', englishName: 'Chicken Tawa Half', price: 280, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-5', name: 'चिकन मसाला', hindiName: 'Chicken Masala', marathiName: 'चिकन मसाला', englishName: 'Chicken Masala', price: 150, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-6', name: 'चिकन तंदूरी फुल', hindiName: 'Chicken Tandoori Full', marathiName: 'चिकन तंदूरी फुल', englishName: 'Chicken Tandoori Full', price: 440, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-7', name: 'चिकन तंदूरी हाफ', hindiName: 'Chicken Tandoori Half', marathiName: 'चिकन तंदूरी हाफ', englishName: 'Chicken Tandoori Half', price: 220, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-8', name: 'चिकन कोल्हापुरी', hindiName: 'Chicken Kolhapuri', marathiName: 'चिकन कोल्हापुरी', englishName: 'Chicken Kolhapuri', price: 180, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-9', name: 'चिकन चटपटा', hindiName: 'Chicken Chatpata', marathiName: 'चिकन चटपटा', englishName: 'Chicken Chatpata', price: 180, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-10', name: 'चिकन अंगारा', hindiName: 'Chicken Angara', marathiName: 'चिकन अंगारा', englishName: 'Chicken Angara', price: 180, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-11', name: 'चिकन कड़ाई', hindiName: 'Chicken Kadai', marathiName: 'चिकन कढाई', englishName: 'Chicken Kadai', price: 180, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-12', name: 'चिकन बिरयानी फुल', hindiName: 'Chicken Biryani Full', marathiName: 'चिकन बिर्याणी फुल', englishName: 'Chicken Biryani Full', price: 120, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-13', name: 'चिकन बिरयानी हाफ', hindiName: 'Chicken Biryani Half', marathiName: 'चिकन बिर्याणी हाफ', englishName: 'Chicken Biryani Half', price: 60, category: 'chicken_non_veg', isVeg: false },
  { id: 'chicken-14', name: 'अंडा करी', hindiName: 'Egg Curry', marathiName: 'अंडा करी / रस्सा', englishName: 'Egg Curry', price: 100, category: 'chicken_non_veg', isVeg: false },
];

/**
 * Compresses an image file (Logo or Menu Item photo) to a lightweight Base64 string
 * to prevent localStorage quotas overflow and ensure fast thermal bitmap rendering.
 */
export function compressImageFile(file: File, maxDim = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = e => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const STORAGE_KEYS = {
  SETTINGS: 'kohinoor_hotel_settings_v1',
  MENU: 'kohinoor_menu_items_v2', // Upgraded to v2 for Hotel Kohinoor official full menu
  BILLS: 'kohinoor_bills_history_v1',
  BILL_COUNTER: 'kohinoor_bill_counter_v1',
  THEME: 'kohinoor_theme_mode_v1',
};

// Safe localStorage access
export const storageService = {
  getSettings(): HotelSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_HOTEL_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading settings from localStorage', e);
    }
    return DEFAULT_HOTEL_SETTINGS;
  },

  saveSettings(settings: HotelSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage', e);
    }
  },

  getMenu(): MenuItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MENU);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if this has the new Hotel Kohinoor categories
          const hasKohinoorItems = parsed.some(
            (it: MenuItem) => it.category === 'special_veg' || it.category === 'chicken_non_veg'
          );
          if (hasKohinoorItems) {
            return parsed;
          }
        }
      }

      // Check if previous version had any customized photos to preserve
      const oldV1 = localStorage.getItem('kohinoor_menu_items_v1');
      if (oldV1) {
        try {
          const oldItems: MenuItem[] = JSON.parse(oldV1);
          if (Array.isArray(oldItems)) {
            const photoMap = new Map<string, string>();
            oldItems.forEach(it => {
              if (it.imageUrl) photoMap.set(it.name.trim(), it.imageUrl);
            });
            if (photoMap.size > 0) {
              const merged = DEFAULT_MENU_ITEMS.map(def => {
                const img = photoMap.get(def.name.trim());
                return img ? { ...def, imageUrl: img } : def;
              });
              this.saveMenu(merged);
              return merged;
            }
          }
        } catch {}
      }
    } catch (e) {
      console.error('Error reading menu from localStorage', e);
    }
    // Seed default official Hotel Kohinoor menu
    this.saveMenu(DEFAULT_MENU_ITEMS);
    return DEFAULT_MENU_ITEMS;
  },

  saveMenu(menu: MenuItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
      // Sync to cloud for QR ordering customers
      import('./tableOrderService').then(({ tableOrderService }) => {
        tableOrderService.syncMenuToCloud(menu);
      }).catch(e => console.error('Failed to sync menu dynamically', e));
    } catch (e) {
      console.error('Error saving menu to localStorage', e);
    }
  },

  resetMenu(): MenuItem[] {
    this.saveMenu(DEFAULT_MENU_ITEMS);
    return DEFAULT_MENU_ITEMS;
  },

  getBills(): Bill[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BILLS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => b.timestamp - a.timestamp);
        }
      }
    } catch (e) {
      console.error('Error reading bills from localStorage', e);
    }
    return [];
  },

  saveBills(bills: Bill[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
    } catch (e) {
      console.error('Error saving bills to localStorage', e);
    }
  },

  addBill(bill: Bill): void {
    const bills = this.getBills();
    bills.unshift(bill);
    this.saveBills(bills);
  },

  deleteBill(id: string): Bill[] {
    const bills = this.getBills().filter(b => b.id !== id);
    this.saveBills(bills);
    return bills;
  },

  // Auto Bill Number Generator: strictly plain sequential numbers 1, 2, 3, 4, 5... (no leading zeros)
  getNextBillNumber(): { billNumber: string; nextCounter: number } {
    const settings = this.getSettings();
    let currentCounter = settings.currentBillCounter || 1;

    // Check localStorage direct counter key as well
    const savedCounter = localStorage.getItem(STORAGE_KEYS.BILL_COUNTER);
    if (savedCounter) {
      const parsed = parseInt(savedCounter, 10);
      if (!isNaN(parsed) && parsed > currentCounter) {
        currentCounter = parsed;
      }
    }

    // Inspect existing bills in history to ensure no duplicate or backward counter:
    // Old bills keep whatever billNumber they have.
    const bills = this.getBills();
    let maxExistingNum = 0;
    for (const b of bills) {
      const digitsMatch = b.billNumber.match(/\d+/g);
      if (digitsMatch && digitsMatch.length > 0) {
        const val = parseInt(digitsMatch[digitsMatch.length - 1], 10);
        if (!isNaN(val) && val > maxExistingNum) {
          maxExistingNum = val;
        }
      }
    }

    if (maxExistingNum >= currentCounter) {
      currentCounter = maxExistingNum + 1;
    }

    // Bill Number is strictly a plain number without leading zeros: 1, 2, 3, 4, 5...
    const billNumber = String(currentCounter);

    return {
      billNumber,
      nextCounter: currentCounter + 1,
    };
  },

  commitBillCounter(nextCounter: number): void {
    const settings = this.getSettings();
    settings.currentBillCounter = nextCounter;
    this.saveSettings(settings);
    localStorage.setItem(STORAGE_KEYS.BILL_COUNTER, String(nextCounter));
  },

  exportAllData(): string {
    const data = {
      settings: this.getSettings(),
      menu: this.getMenu(),
      bills: this.getBills(),
      exportedAt: new Date().toISOString(),
      appName: 'HOTEL KOHINOOR POS',
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (data.menu && Array.isArray(data.menu)) this.saveMenu(data.menu);
      if (data.bills && Array.isArray(data.bills)) this.saveBills(data.bills);
      return true;
    } catch (e) {
      console.error('Failed to import data', e);
      return false;
    }
  },
};
