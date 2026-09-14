export type AppLanguage = 'hi' | 'mr' | 'en';

export type CategoryId =
  | 'all'
  | 'special_veg'
  | 'roti_papad'
  | 'non_veg'
  | 'chinese'
  | 'chicken_non_veg'
  | string;

export interface Category {
  id: CategoryId;
  name: string;
  hindiName: string;
  marathiName?: string;
  englishName?: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  name: string; // Default display name (Hindi)
  hindiName?: string; // English / Alt name
  marathiName?: string; // Marathi name
  englishName?: string; // English name
  price: number;
  category: CategoryId | string;
  isVeg?: boolean;
  imageUrl?: string; // Base64 food photo for menu UI
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'DUE';

export interface BillItemRecord {
  id: string;
  name: string;
  hindiName?: string;
  marathiName?: string;
  englishName?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Bill {
  id: string;
  billNumber: string; // Plain integer without leading zeroes: "1", "2", "3"...
  date: string; // YYYY-MM-DD
  time: string; // hh:mm AM/PM
  timestamp: number;
  items: BillItemRecord[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  tableNo?: string;
  waiterName?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  language?: AppLanguage;
}

export interface HotelSettings {
  hotelName: string;
  tagline: string;
  address: string;
  phone: string;
  gstin: string;
  instagram: string;
  gmail: string;
  footerMessage: string;
  logoUrl?: string; // Base64 data URL
  logoSize?: 'small' | 'medium' | 'large'; // Default: 'medium'
  language: AppLanguage; // 'hi' | 'mr' | 'en'
  printerWidth: '58mm' | '80mm'; // Default: '80mm' (KPC307-UEWB)
  printMode?: 'image' | 'text'; // Default: 'image'
  billPrefix: string; // Blank by default for pure numbers
  currentBillCounter: number;
  soundEnabled: boolean;
  currencySymbol: string;
}

export interface BluetoothPrinterDevice {
  id: string;
  name: string;
  connected: boolean;
}

export interface BluetoothPrinterStatus {
  connected: boolean;
  deviceName: string | null;
  deviceId: string | null;
  connecting: boolean;
  error: string | null;
  paperWidth: '58mm' | '80mm';
}

export type ActiveTab =
  | 'billing'
  | 'cart'
  | 'history'
  | 'sales'
  | 'menu'
  | 'printer'
  | 'settings'
  | 'app'
  | 'ai_assistant'
  | 'table_qr'
  | 'table_orders';

export type TableOrderStatus = 'NEW' | 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface TableOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  isVeg?: boolean;
}

export interface TableOrder {
  id: string;
  orderNumber: number;
  tableNo: string;
  items: TableOrderItem[];
  subtotal: number;
  total: number;
  totalItems: number;
  status: TableOrderStatus;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  timestamp: number;
}

