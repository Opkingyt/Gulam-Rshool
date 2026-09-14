import { AppLanguage, MenuItem } from '../types';

export interface Translations {
  // Navigation
  tabBilling: string;
  tabCart: string;
  tabHistory: string;
  tabSales: string;
  tabMenu: string;
  tabPrinter: string;
  tabSettings: string;
  tabApp: string;

  // Receipt Labels
  billNo: string;
  billNumberLabel: string;
  date: string;
  time: string;
  tableNo: string;
  tableNumber: string;
  waiter: string;
  waiterName: string;
  customer: string;
  customerName: string;
  customerPhone: string;
  payment: string;
  paymentMode: string;
  payCash: string;
  payUPI: string;
  payCard: string;
  payDue: string;
  item: string;
  qty: string;
  rate: string;
  amount: string;
  subtotal: string;
  discount: string;
  addDiscount: string;
  tax: string;
  grandTotal: string;
  thankYouMessage: string;

  // Cart Table Headers
  colItem: string;
  colRate: string;
  colQty: string;
  colAmount: string;

  // Actions
  printBill: string;
  previewReceipt: string;
  viewReceipt: string;
  newBill: string;
  bluetoothPrint: string;
  systemPrint: string;
  shareWhatsApp: string;
  shareNative: string;
  close: string;

  // Settings
  hotelSettingsTitle: string;
  hotelSettingsDesc: string;
  hotelName: string;
  tagline: string;
  address: string;
  phone: string;
  gstin: string;
  billCounter: string;
  nextBillWillBe: string;
  paperWidth: string;
  saveSettings: string;
  settingsSaved: string;
  resetDefault: string;

  // Logo & Language
  languageSelector: string;
  restaurantLogo: string;
  restaurantLogoDesc: string;
  chooseLogo: string;
  changeLogo: string;
  removeLogo: string;
  logoSize: string;
  sizeSmall: string;
  sizeMedium: string;
  sizeLarge: string;

  // Menu Management & Photos
  menuTitle: string;
  addItem: string;
  editItem: string;
  deleteItem: string;
  addPhoto: string;
  changePhoto: string;
  removePhoto: string;
  itemPhoto: string;
  itemName: string;
  itemPrice: string;
  itemCategory: string;
  searchPlaceholder: string;
  noItemsFound: string;
  cartEmpty: string;
  cartEmptyDesc: string;
}

const TRANSLATIONS: Record<AppLanguage, Translations> = {
  hi: {
    tabBilling: 'बिलिंग',
    tabCart: 'कार्ट',
    tabHistory: 'इतिहास',
    tabSales: 'बिक्री',
    tabMenu: 'मेनू',
    tabPrinter: 'प्रिंटर',
    tabSettings: 'सेटिंग्स',
    tabApp: 'ऐप',

    billNo: 'बिल नं.',
    billNumberLabel: 'बिल नंबर (Bill No)',
    date: 'दिनांक',
    time: 'समय',
    tableNo: 'टेबल नं.',
    tableNumber: 'टेबल नंबर (Table)',
    waiter: 'वेटर',
    waiterName: 'वेटर का नाम (Waiter)',
    customer: 'ग्राहक',
    customerName: 'ग्राहक का नाम (Customer)',
    customerPhone: 'मोबाइल नंबर (Phone)',
    payment: 'भुगतान',
    paymentMode: 'भुगतान माध्यम (Payment)',
    payCash: 'नकद (Cash)',
    payUPI: 'UPI / ऑनलाइन',
    payCard: 'कार्ड (Card)',
    payDue: 'बाकी (Due)',
    item: 'आइटम',
    qty: 'मात्रा',
    rate: 'दर',
    amount: 'रकम',
    subtotal: 'उपकुल',
    discount: 'छूट (Discount)',
    addDiscount: 'छूट जोड़ें',
    tax: 'जीएसटी/टैक्स',
    grandTotal: 'कुल योग',
    thankYouMessage: 'धन्यवाद! फिर आइए।',

    colItem: 'आइटम',
    colRate: 'दर',
    colQty: 'मात्रा',
    colAmount: 'कुल',

    printBill: 'बिल प्रिंट करें (Print Bill)',
    previewReceipt: 'रसीद पूर्वावलोकन',
    viewReceipt: 'रसीद देखें',
    newBill: 'नया बिल',
    bluetoothPrint: 'ब्लूटूथ प्रिंट',
    systemPrint: 'सिस्टम प्रिंट',
    shareWhatsApp: 'व्हाट्सएप भेजें',
    shareNative: 'शेयर करें',
    close: 'बंद करें',

    hotelSettingsTitle: 'होटल सेटिंग्स',
    hotelSettingsDesc: 'रसीद पर छपने वाली दुकान का नाम, लोगो, पता, भाषा और बिल नंबर बदलें।',
    hotelName: 'होटल / रेस्टोरेंट का नाम',
    tagline: 'टैगलाइन / उपशीर्षक',
    address: 'होटल का पूरा पता',
    phone: 'मोबाइल नंबर',
    gstin: 'GSTIN नंबर',
    billCounter: 'वर्तमान बिल काउंटर (अगला बिल नंबर)',
    nextBillWillBe: 'अगला बिल नंबर बनेगा',
    paperWidth: 'प्रिंटर पेपर साइज़',
    saveSettings: 'सेटिंग्स सेव करें',
    settingsSaved: 'सेटिंग्स सफलतापूर्वक सेव हो गई!',
    resetDefault: 'डिफ़ॉल्ट सेटिंग्स रीसेट करें',

    languageSelector: 'ऐप और रसीद की भाषा (Language)',
    restaurantLogo: 'रेस्टोरेंट लोगो (Restaurant Logo)',
    restaurantLogoDesc: 'गैलरी से लोगो फोटो चुनें। यह रसीद पर सबसे ऊपर सेंटर में प्रिंट होगा।',
    chooseLogo: 'गैलरी से लोगो चुनें',
    changeLogo: 'लोगो बदलें',
    removeLogo: 'लोगो हटाएं',
    logoSize: 'लोगो साइज़ (Logo Size)',
    sizeSmall: 'छोटा (Small)',
    sizeMedium: 'मध्यम (Medium)',
    sizeLarge: 'बड़ा (Large)',

    menuTitle: 'मेनू प्रबंधन',
    addItem: '+ नया आइटम जोड़ें',
    editItem: 'आइटम एडिट करें',
    deleteItem: 'हटाएं',
    addPhoto: 'फोटो जोड़ें',
    changePhoto: 'फोटो बदलें',
    removePhoto: 'फोटो हटाएं',
    itemPhoto: 'आइटम फोटो (Food Photo)',
    itemName: 'आइटम का नाम',
    itemPrice: 'कीमत (₹)',
    itemCategory: 'कैटेगरी',
    searchPlaceholder: 'आइटम खोजें...',
    noItemsFound: 'कोई आइटम नहीं मिला',
    cartEmpty: 'कार्ट खाली है',
    cartEmptyDesc: 'बिल बनाने के लिए मेनू से आइटम चुनें',
  },

  mr: {
    tabBilling: 'बिलिंग',
    tabCart: 'कार्ट',
    tabHistory: 'बिल इतिहास',
    tabSales: 'विक्री अहवाल',
    tabMenu: 'मेनू',
    tabPrinter: 'प्रिंटर',
    tabSettings: 'सेटिंग्ज',
    tabApp: 'ॲप',

    billNo: 'बिल क्र.',
    billNumberLabel: 'बिल नंबर (Bill No)',
    date: 'दिनांक',
    time: 'वेळ',
    tableNo: 'टेबल क्र.',
    tableNumber: 'टेबल नंबर (Table)',
    waiter: 'वेटर',
    waiterName: 'वेटरचे नाव (Waiter)',
    customer: 'ग्राहक',
    customerName: 'ग्राहकाचे नाव (Customer)',
    customerPhone: 'मोबाईल नंबर (Phone)',
    payment: 'पेमेंट पद्धत',
    paymentMode: 'पेमेंट मोड (Payment)',
    payCash: 'रोख (Cash)',
    payUPI: 'UPI / ऑनलाइन',
    payCard: 'कार्ड (Card)',
    payDue: 'उधारी (Due)',
    item: 'आयटम',
    qty: 'प्रमाण',
    rate: 'दर',
    amount: 'रक्कम',
    subtotal: 'उपएकूण',
    discount: 'सूट (Discount)',
    addDiscount: 'सूट जोडा',
    tax: 'जीएसटी/कर',
    grandTotal: 'अंतिम एकूण',
    thankYouMessage: 'धन्यवाद! पुन्हा भेट द्या.',

    colItem: 'आयटम',
    colRate: 'दर',
    colQty: 'प्रमाण',
    colAmount: 'एकूण',

    printBill: 'बिल प्रिंट करा (Print Bill)',
    previewReceipt: 'पावती पूर्वावलोकन',
    viewReceipt: 'पावती पहा',
    newBill: 'नवीन बिल',
    bluetoothPrint: 'ब्लूटूथ प्रिंट',
    systemPrint: 'सिस्टीम प्रिंट',
    shareWhatsApp: 'व्हॉट्सॲपवर पाठवा',
    shareNative: 'शेअर करा',
    close: 'बंद करा',

    hotelSettingsTitle: 'हॉटेल सेटिंग्ज',
    hotelSettingsDesc: 'पावतीवर छापणारी माहिती, लोगो, पत्ता, भाषा आणि बिल नंबर बदला.',
    hotelName: 'हॉटेल / रेस्टॉरंटचे नाव',
    tagline: 'टॅगलाइन / उपशीर्षक',
    address: 'हॉटेलचा संपूर्ण पत्ता',
    phone: 'मोबाईल नंबर',
    gstin: 'जीएसटी नंबर (GSTIN)',
    billCounter: 'सध्याचा बिल काउंटर (पुढील बिल नंबर)',
    nextBillWillBe: 'पुढील बिल नंबर तयार होईल',
    paperWidth: 'प्रिंटर पेपर आकार',
    saveSettings: 'सेटिंग्ज सेव्ह करा',
    settingsSaved: 'सेटिंग्ज यशस्वीरित्या सेव्ह झाल्या!',
    resetDefault: 'डीफॉल्ट सेटिंग्ज रीसेट करा',

    languageSelector: 'ॲप आणि पावतीची भाषा (Language)',
    restaurantLogo: 'रेस्टॉरंट लोगो (Restaurant Logo)',
    restaurantLogoDesc: 'गॅलरीतून लोगो फोटो निवडा. हा पावतीच्या सर्वात वर मध्यभागी प्रिंट होईल.',
    chooseLogo: 'गॅलरीतून लोगो निवडा',
    changeLogo: 'लोगो बदला',
    removeLogo: 'लोगो काढा',
    logoSize: 'लोगो आकार (Logo Size)',
    sizeSmall: 'लहान (Small)',
    sizeMedium: 'मध्यम (Medium)',
    sizeLarge: 'मोठा (Large)',

    menuTitle: 'मेनू व्यवस्थापन',
    addItem: '+ नवीन आयटम जोडा',
    editItem: 'आयटम एडिट करा',
    deleteItem: 'काढा',
    addPhoto: 'फोटो जोडा',
    changePhoto: 'फोटो बदला',
    removePhoto: 'फोटो काढा',
    itemPhoto: 'आयटम फोटो (Food Photo)',
    itemName: 'आयटमचे नाव',
    itemPrice: 'किंमत (₹)',
    itemCategory: 'वर्ग / कॅटेगरी',
    searchPlaceholder: 'आयटम शोधा...',
    noItemsFound: 'कोणताही आयटम सापडला नाही',
    cartEmpty: 'कार्ट रिकामी आहे',
    cartEmptyDesc: 'बिल करण्यासाठी मेनूमधून आयटम निवडा',
  },

  en: {
    tabBilling: 'Billing',
    tabCart: 'Cart',
    tabHistory: 'History',
    tabSales: 'Sales',
    tabMenu: 'Menu',
    tabPrinter: 'Printer',
    tabSettings: 'Settings',
    tabApp: 'App',

    billNo: 'Bill No.',
    billNumberLabel: 'Bill Number',
    date: 'Date',
    time: 'Time',
    tableNo: 'Table No.',
    tableNumber: 'Table Number',
    waiter: 'Waiter',
    waiterName: 'Waiter Name',
    customer: 'Customer',
    customerName: 'Customer Name',
    customerPhone: 'Phone Number',
    payment: 'Payment',
    paymentMode: 'Payment Mode',
    payCash: 'Cash',
    payUPI: 'UPI / Online',
    payCard: 'Card',
    payDue: 'Due / Credit',
    item: 'Item',
    qty: 'Qty',
    rate: 'Rate',
    amount: 'Amount',
    subtotal: 'Subtotal',
    discount: 'Discount',
    addDiscount: 'Add Discount',
    tax: 'GST / Tax',
    grandTotal: 'GRAND TOTAL',
    thankYouMessage: 'Thank You! Visit Again.',

    colItem: 'Item',
    colRate: 'Rate',
    colQty: 'Qty',
    colAmount: 'Total',

    printBill: 'Print Bill',
    previewReceipt: 'Receipt Preview',
    viewReceipt: 'View Receipt',
    newBill: 'New Bill',
    bluetoothPrint: 'Bluetooth Print',
    systemPrint: 'System Print',
    shareWhatsApp: 'Send WhatsApp',
    shareNative: 'Share',
    close: 'Close',

    hotelSettingsTitle: 'Hotel Settings',
    hotelSettingsDesc: 'Configure restaurant name, logo, address, language, and bill numbers.',
    hotelName: 'Hotel / Restaurant Name',
    tagline: 'Tagline / Subtitle',
    address: 'Hotel Address',
    phone: 'Mobile Number',
    gstin: 'GSTIN Number',
    billCounter: 'Current Bill Counter (Next Bill No.)',
    nextBillWillBe: 'Next bill number will be',
    paperWidth: 'Printer Paper Width',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved successfully!',
    resetDefault: 'Reset to Default',

    languageSelector: 'App & Receipt Language',
    restaurantLogo: 'Restaurant Logo',
    restaurantLogoDesc: 'Select logo photo from gallery. It will print at the top center of receipts.',
    chooseLogo: 'Choose Logo from Gallery',
    changeLogo: 'Change Logo',
    removeLogo: 'Remove Logo',
    logoSize: 'Logo Size',
    sizeSmall: 'Small',
    sizeMedium: 'Medium',
    sizeLarge: 'Large',

    menuTitle: 'Menu Items',
    addItem: '+ Add Item',
    editItem: 'Edit Item',
    deleteItem: 'Delete',
    addPhoto: 'Add Photo',
    changePhoto: 'Change Photo',
    removePhoto: 'Remove Photo',
    itemPhoto: 'Food Photo',
    itemName: 'Item Name',
    itemPrice: 'Price (₹)',
    itemCategory: 'Category',
    searchPlaceholder: 'Search items...',
    noItemsFound: 'No items found',
    cartEmpty: 'Cart is empty',
    cartEmptyDesc: 'Select items from menu to generate bill',
  },
};

export function getTranslations(lang: AppLanguage = 'hi'): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.hi;
}

export function getItemDisplayName(
  item: { name: string; hindiName?: string; marathiName?: string; englishName?: string },
  lang: AppLanguage = 'hi'
): string {
  if (lang === 'mr') {
    return item.marathiName || item.name;
  }
  if (lang === 'en') {
    return item.englishName || item.hindiName || item.name;
  }
  return item.name;
}
