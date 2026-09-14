/// <reference types="web-bluetooth" />
import { Bill, HotelSettings } from '../types';
import { getTranslations, getItemDisplayName } from './i18n';

// Fallback interfaces for Bluetooth if ambient types are not globally resolved
interface BluetoothDeviceFallback {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
    connect: () => Promise<any>;
    disconnect: () => void;
  };
  addEventListener: (type: string, listener: () => void) => void;
}

interface BluetoothCharacteristicFallback {
  uuid: string;
  properties: {
    write?: boolean;
    writeWithoutResponse?: boolean;
  };
  writeValue: (value: BufferSource) => Promise<void>;
  writeValueWithoutResponse?: (value: BufferSource) => Promise<void>;
}

type AnyBluetoothDevice = BluetoothDevice | BluetoothDeviceFallback;
type AnyCharacteristic = BluetoothRemoteGATTCharacteristic | BluetoothCharacteristicFallback;

// Standard ESC/POS Command Byte Sequences
const ESC = 0x1b;
const GS = 0x1d;

export class EscPosEncoder {
  private buffer: number[] = [];

  initialize(): this {
    this.buffer.push(ESC, 0x40); // ESC @ - Reset printer
    return this;
  }

  alignCenter(): this {
    this.buffer.push(ESC, 0x61, 0x01);
    return this;
  }

  alignLeft(): this {
    this.buffer.push(ESC, 0x61, 0x00);
    return this;
  }

  alignRight(): this {
    this.buffer.push(ESC, 0x61, 0x02);
    return this;
  }

  bold(enable: boolean): this {
    this.buffer.push(ESC, 0x45, enable ? 0x01 : 0x00);
    return this;
  }

  doubleSize(enable: boolean): this {
    // GS ! n (0x11 = double width + double height, 0x00 = normal)
    this.buffer.push(GS, 0x21, enable ? 0x11 : 0x00);
    return this;
  }

  doubleHeight(enable: boolean): this {
    this.buffer.push(GS, 0x21, enable ? 0x01 : 0x00);
    return this;
  }

  text(str: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  line(str = ''): this {
    this.text(str);
    this.buffer.push(0x0a); // LF
    return this;
  }

  newline(count = 1): this {
    for (let i = 0; i < count; i++) {
      this.buffer.push(0x0a);
    }
    return this;
  }

  divider(cols = 48, char = '-'): this {
    this.line(char.repeat(cols));
    return this;
  }

  cut(): this {
    this.newline(3);
    this.buffer.push(GS, 0x56, 0x41, 0x03); // GS V A 3 (feed and cut)
    return this;
  }

  rawBytes(bytes: number[] | Uint8Array): this {
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

// Global active Web Bluetooth connection state
let connectedBluetoothDevice: AnyBluetoothDevice | null = null;
let activeCharacteristic: AnyCharacteristic | null = null;

const COMMON_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Popular Chinese Mini Thermal Printer
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent UART
  '0000ff00-0000-1000-8000-00805f9b34fb', // Custom POS
  '0000fee7-0000-1000-8000-00805f9b34fb', // WeChat hardware
  '0000af30-0000-1000-8000-00805f9b34fb',
];

/**
 * Loads an image from a base64 or URL safely
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = e => reject(e);
    img.src = src;
  });
}

/**
 * Word wraps text for Canvas drawing
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Renders the entire receipt onto an HTML5 Canvas as high-resolution monochrome bitmap.
 * For 80mm printers (like KPC307-UEWB), width is 576 dots (standard 80mm printhead).
 * For 58mm printers, width is 384 dots.
 * This guarantees crystal-clear Devanagari Hindi & Marathi rendering without font ROM limitations!
 */
/**
 * Pure ASCII text mode generation for cheap thermal printers that fail with raster images.
 * Non-ASCII (Hindi/Marathi) will be converted to English names.
 */
export function generateTextReceiptBytes(bill: Bill, settings: HotelSettings): Uint8Array {
  const encoder = new EscPosEncoder();
  encoder.initialize();
  
  const is80mm = settings.printerWidth === '80mm';
  const cols = is80mm ? 48 : 32;

  // Header
  encoder.alignCenter();
  encoder.doubleHeight(true).doubleSize(true).bold(true);
  encoder.line(settings.hotelName.toUpperCase());
  encoder.doubleHeight(false).doubleSize(false).bold(false);
  
  if (settings.tagline) encoder.line(settings.tagline);
  if (settings.address) encoder.line(settings.address);
  if (settings.phone) encoder.line(`Mob: ${settings.phone}`);
  if (settings.gstin) encoder.line(`GSTIN: ${settings.gstin}`);
  
  encoder.alignLeft();
  encoder.divider(cols);
  
  // Bill Details
  encoder.bold(true);
  encoder.line(`Bill No: ${bill.billNumber}     Date: ${bill.date}`);
  encoder.line(`Time: ${bill.time}`);
  if (bill.tableNo) encoder.line(`Table: ${bill.tableNo}`);
  if (bill.waiterName) encoder.line(`Waiter: ${bill.waiterName}`);
  encoder.bold(false);
  encoder.line(`Payment: ${bill.paymentMethod}`);
  
  encoder.divider(cols);
  
  // Columns
  encoder.bold(true);
  if (is80mm) {
    encoder.line("Item                           Qty  Rate  Amount");
  } else {
    encoder.line("Item                 Qty  Amount");
  }
  encoder.divider(cols);
  encoder.bold(false);
  
  // Items
  for (const item of bill.items) {
    // English name fallback for pure ASCII text mode
    let name = item.englishName || item.name;
    // Strip non-ascii chars to prevent garbage printing
    name = name.replace(/[^\x00-\x7F]/g, "").trim() || "Item"; 
    
    const qty = item.quantity.toString();
    const rate = item.price.toString();
    const total = item.total.toString();
    
    if (is80mm) {
      const nameCol = name.substring(0, 30).padEnd(30, ' ');
      const qtyCol = qty.padStart(3, ' ');
      const rateCol = rate.padStart(5, ' ');
      const totalCol = total.padStart(7, ' ');
      encoder.line(`${nameCol} ${qtyCol} ${rateCol} ${totalCol}`);
    } else {
      const nameCol = name.substring(0, 20).padEnd(20, ' ');
      const qtyCol = qty.padStart(3, ' ');
      const totalCol = total.padStart(6, ' ');
      encoder.line(`${nameCol} ${qtyCol}  ${totalCol}`);
    }
  }
  
  encoder.divider(cols);
  
  // Totals
  encoder.alignRight();
  if (bill.discount > 0) {
    encoder.line(`Subtotal: Rs ${bill.subtotal}`);
    encoder.line(`Discount: -Rs ${bill.discount}`);
  }
  encoder.doubleHeight(true).bold(true);
  encoder.line(`GRAND TOTAL: Rs ${bill.grandTotal}`);
  encoder.doubleHeight(false).bold(false);
  
  encoder.alignCenter();
  encoder.divider(cols);
  const footer = settings.footerMessage.replace(/[^\x00-\x7F\n]/g, "").trim() || "Thank You! Visit Again";
  const footerLines = footer.split('\n');
  for (const line of footerLines) {
    encoder.line(line);
  }
  encoder.newline(1);
  
  encoder.cut();
  
  return encoder.getBytes();
}

export async function renderReceiptToCanvas(
  bill: Bill,
  settings: HotelSettings
): Promise<HTMLCanvasElement> {
  const is80mm = settings.printerWidth === '80mm';
  const width = is80mm ? 576 : 384;
  const lang = bill.language || settings.language || 'hi';
  const t = getTranslations(lang);

  // Measure and estimate height
  // Estimated base height: header (200) + items (40 each) + totals (140) + logo (150)
  const estimatedHeight = 1200 + bill.items.length * 50;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = estimatedHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  // Fill canvas with white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, estimatedHeight);
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'top';

  let currentY = 16;
  const fontDevanagari = '"Noto Sans Devanagari", "Plus Jakarta Sans", sans-serif';

  // 1. Restaurant Logo (if provided in settings)
  if (settings.logoUrl && settings.logoUrl.trim().length > 0) {
    try {
      const logoImg = await loadImage(settings.logoUrl);
      let logoWidth = 240; // Medium default for 80mm
      if (settings.logoSize === 'small') {
        logoWidth = is80mm ? 160 : 120;
      } else if (settings.logoSize === 'large') {
        logoWidth = is80mm ? 340 : 220;
      } else {
        logoWidth = is80mm ? 240 : 160;
      }

      const aspectRatio = logoImg.height / (logoImg.width || 1);
      const logoHeight = Math.round(logoWidth * aspectRatio);
      const logoX = Math.round((width - logoWidth) / 2);

      ctx.drawImage(logoImg, logoX, currentY, logoWidth, logoHeight);
      currentY += logoHeight + 14;
    } catch (err) {
      console.warn('Could not render logo to canvas:', err);
    }
  }

  // 2. Hotel Name (Header)
  ctx.textAlign = 'center';
  ctx.font = `bold ${is80mm ? 30 : 22}px ${fontDevanagari}`;
  ctx.fillText(settings.hotelName.toUpperCase(), width / 2, currentY);
  currentY += is80mm ? 38 : 28;

  // Tagline
  if (settings.tagline) {
    ctx.font = `500 ${is80mm ? 18 : 14}px ${fontDevanagari}`;
    ctx.fillText(settings.tagline, width / 2, currentY);
    currentY += is80mm ? 24 : 20;
  }

  // Address
  if (settings.address) {
    ctx.font = `400 ${is80mm ? 17 : 13}px ${fontDevanagari}`;
    const addressLines = wrapText(ctx, settings.address, width - 40);
    for (const line of addressLines) {
      ctx.fillText(line, width / 2, currentY);
      currentY += is80mm ? 22 : 18;
    }
  }

  // Phone
  if (settings.phone) {
    ctx.font = `bold ${is80mm ? 19 : 15}px ${fontDevanagari}`;
    ctx.fillText(`Mob: ${settings.phone}`, width / 2, currentY);
    currentY += is80mm ? 24 : 20;
  }

  // GSTIN
  if (settings.gstin) {
    ctx.font = `bold ${is80mm ? 17 : 13}px ${fontDevanagari}`;
    ctx.fillText(`GSTIN: ${settings.gstin}`, width / 2, currentY);
    currentY += is80mm ? 22 : 18;
  }

  // Divider line
  const drawDashedDivider = (y: number) => {
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.moveTo(10, y);
    ctx.lineTo(width - 10, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
  };

  currentY += 8;
  drawDashedDivider(currentY);
  currentY += 12;

  // 3. Bill Metadata (Bill Number, Date, Time, Table, Waiter, Customer, Payment)
  ctx.textAlign = 'left';
  const leftX = 14;
  const rightX = width - 14;

  // Row: Bill Number & Date/Time
  ctx.font = `bold ${is80mm ? 21 : 16}px ${fontDevanagari}`;
  ctx.fillText(`${t.billNo} ${bill.billNumber}`, leftX, currentY);

  ctx.textAlign = 'right';
  ctx.font = `500 ${is80mm ? 18 : 13}px ${fontDevanagari}`;
  ctx.fillText(`${bill.date}  ${bill.time}`, rightX, currentY);
  currentY += is80mm ? 26 : 22;

  // Row: Table Number & Waiter Name
  if (bill.tableNo || bill.waiterName) {
    ctx.textAlign = 'left';
    ctx.font = `bold ${is80mm ? 18 : 14}px ${fontDevanagari}`;
    if (bill.tableNo) {
      ctx.fillText(`${t.tableNo} ${bill.tableNo}`, leftX, currentY);
    }
    if (bill.waiterName) {
      ctx.textAlign = 'right';
      ctx.fillText(`${t.waiter}: ${bill.waiterName}`, rightX, currentY);
    }
    currentY += is80mm ? 24 : 20;
  }

  // Row: Customer Name & Payment Method
  ctx.textAlign = 'left';
  ctx.font = `500 ${is80mm ? 17 : 13}px ${fontDevanagari}`;
  if (bill.customerName) {
    ctx.fillText(`${t.customer}: ${bill.customerName}`, leftX, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`${t.payment}: ${bill.paymentMethod}`, rightX, currentY);
    currentY += is80mm ? 24 : 20;
  } else {
    ctx.fillText(`${t.payment}: ${bill.paymentMethod}`, leftX, currentY);
    currentY += is80mm ? 24 : 20;
  }

  currentY += 6;
  drawDashedDivider(currentY);
  currentY += 12;

  // 4. Items Table Header
  // Columns: Item | Qty | Rate | Amount
  const colItemX = leftX;
  const colQtyX = is80mm ? 330 : 210;
  const colRateX = is80mm ? 430 : 285;
  const colAmtX = rightX;

  ctx.font = `bold ${is80mm ? 18 : 14}px ${fontDevanagari}`;
  ctx.textAlign = 'left';
  ctx.fillText(t.item, colItemX, currentY);

  ctx.textAlign = 'center';
  ctx.fillText(t.qty, colQtyX, currentY);

  ctx.textAlign = 'right';
  ctx.fillText(t.rate, colRateX, currentY);
  ctx.fillText(t.amount, colAmtX, currentY);

  currentY += is80mm ? 24 : 20;
  drawDashedDivider(currentY);
  currentY += 12;

  // 5. Items List
  const maxItemWidth = is80mm ? 290 : 180;
  for (const item of bill.items) {
    const itemDisplayName = getItemDisplayName(item, lang);
    ctx.font = `bold ${is80mm ? 18 : 14}px ${fontDevanagari}`;
    ctx.textAlign = 'left';

    // Wrap item name cleanly
    const itemLines = wrapText(ctx, itemDisplayName, maxItemWidth);
    const startItemY = currentY;

    for (let i = 0; i < itemLines.length; i++) {
      ctx.fillText(itemLines[i], colItemX, currentY);
      currentY += is80mm ? 22 : 18;
    }

    // Print Qty, Rate, Amount aligned on the first line
    ctx.font = `bold ${is80mm ? 18 : 14}px ${fontDevanagari}`;
    ctx.textAlign = 'center';
    ctx.fillText(String(item.quantity), colQtyX, startItemY);

    ctx.textAlign = 'right';
    ctx.fillText(`₹${item.price}`, colRateX, startItemY);
    ctx.fillText(`₹${item.total}`, colAmtX, startItemY);

    currentY += 6;
  }

  currentY += 4;
  drawDashedDivider(currentY);
  currentY += 12;

  // 6. Subtotal, Discount, Tax
  ctx.textAlign = 'right';
  ctx.font = `500 ${is80mm ? 18 : 14}px ${fontDevanagari}`;

  if (bill.discount > 0) {
    ctx.textAlign = 'left';
    ctx.fillText(`${t.subtotal}:`, is80mm ? 280 : 160, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`₹${bill.subtotal}`, rightX, currentY);
    currentY += is80mm ? 24 : 20;

    ctx.textAlign = 'left';
    ctx.fillText(`${t.discount}:`, is80mm ? 280 : 160, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`-₹${bill.discount}`, rightX, currentY);
    currentY += is80mm ? 24 : 20;
  }

  if (bill.tax > 0) {
    ctx.textAlign = 'left';
    ctx.fillText(`${t.tax}:`, is80mm ? 280 : 160, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`+₹${bill.tax}`, rightX, currentY);
    currentY += is80mm ? 24 : 20;
  }

  // 7. Grand Total (Prominently styled)
  currentY += 6;
  ctx.beginPath();
  ctx.moveTo(10, currentY);
  ctx.lineTo(width - 10, currentY);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  currentY += 12;

  ctx.textAlign = 'left';
  ctx.font = `bold ${is80mm ? 26 : 20}px ${fontDevanagari}`;
  ctx.fillText(`${t.grandTotal}:`, is80mm ? 200 : 120, currentY);

  ctx.textAlign = 'right';
  ctx.fillText(`₹${bill.grandTotal}`, rightX, currentY);
  currentY += is80mm ? 36 : 28;

  ctx.beginPath();
  ctx.moveTo(10, currentY);
  ctx.lineTo(width - 10, currentY);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  currentY += 16;

  // 8. Footer Message & Thank You
  ctx.textAlign = 'center';
  ctx.font = `bold ${is80mm ? 19 : 15}px ${fontDevanagari}`;

  const footerText = settings.footerMessage || t.thankYouMessage;
  const footerLines = footerText.split('\n');
  for (const line of footerLines) {
    ctx.fillText(line.trim(), width / 2, currentY);
    currentY += is80mm ? 24 : 20;
  }

  if (settings.instagram) {
    ctx.font = `500 ${is80mm ? 16 : 12}px ${fontDevanagari}`;
    ctx.fillText(`Instagram: @${settings.instagram}`, width / 2, currentY);
    currentY += is80mm ? 22 : 18;
  }

  currentY += 24; // Bottom tear margin

  // Crop the canvas to exact calculated height
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = width;
  finalCanvas.height = currentY;
  const finalCtx = finalCanvas.getContext('2d');
  if (finalCtx) {
    finalCtx.drawImage(canvas, 0, 0, width, currentY, 0, 0, width, currentY);
    return finalCanvas;
  }

  return canvas;
}

/**
 * Converts a Canvas into 1-bit Monochrome ESC/POS Raster Bit Image bytes (`GS v 0`).
 * Slices the bitmap into vertical chunks to prevent printer buffer overload on BLE.
 */
export function canvasToEscPosRaster(canvas: HTMLCanvasElement): Uint8Array {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const widthBytes = Math.floor(width / 8);
  const buffer: number[] = [];

  // Reset printer
  buffer.push(ESC, 0x40);

  // Print in chunks of 24 rows to ensure safe BLE transmission without buffer overflow
  const CHUNK_HEIGHT = 24;

  for (let startY = 0; startY < height; startY += CHUNK_HEIGHT) {
    const chunkHeight = Math.min(CHUNK_HEIGHT, height - startY);

    const xL = widthBytes % 256;
    const xH = Math.floor(widthBytes / 256);
    const yL = chunkHeight % 256;
    const yH = Math.floor(chunkHeight / 256);

    // GS v 0 m xL xH yL yH
    buffer.push(GS, 0x76, 0x30, 0x00, xL, xH, yL, yH);

    for (let y = startY; y < startY + chunkHeight; y++) {
      for (let xByte = 0; xByte < widthBytes; xByte++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const x = xByte * 8 + bit;
          const pixelIndex = (y * width + x) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          // Standard luminance formula
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          // If darker than threshold, mark bit as 1 (black)
          if (lum < 185) {
            byte |= 0x80 >> bit;
          }
        }
        buffer.push(byte);
      }
    }
  }

  // Feed and cut paper
  buffer.push(0x0a, 0x0a, 0x0a);
  buffer.push(GS, 0x56, 0x41, 0x03); // GS V A 3 (feed & cut)

  return new Uint8Array(buffer);
}

export const bluetoothPrinterService = {
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in (navigator as any);
  },

  isInsideIframe(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  },

  isConnected(): boolean {
    return !!(connectedBluetoothDevice?.gatt?.connected && activeCharacteristic);
  },

  getConnectedDeviceName(): string | null {
    if (this.isConnected() && connectedBluetoothDevice) {
      return connectedBluetoothDevice.name || 'Bluetooth Thermal Printer';
    }
    return null;
  },

  async connect(): Promise<{
    success: boolean;
    deviceName?: string;
    error?: string;
    isIframeRestricted?: boolean;
    isCancelled?: boolean;
  }> {
    if (!this.isSupported()) {
      return {
        success: false,
        error: 'Web Bluetooth is not supported in this browser. Please use Chrome on Android or system printing.',
      };
    }

    try {
      const navBluetooth = (navigator as any).bluetooth;
      if (!navBluetooth || typeof navBluetooth.requestDevice !== 'function') {
        return {
          success: false,
          error: 'Web Bluetooth API is unavailable in this environment.',
        };
      }

      const device = await navBluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: COMMON_PRINTER_SERVICES,
      });

      if (!device.gatt) {
        throw new Error('Bluetooth GATT server is not available on this device');
      }

      device.addEventListener('gattserverdisconnected', () => {
        console.log('Bluetooth Printer disconnected');
        connectedBluetoothDevice = null;
        activeCharacteristic = null;
      });

      const server = await device.gatt.connect();

      let characteristic: AnyCharacteristic | null = null;

      for (const serviceUuid of COMMON_PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const chars = await service.getCharacteristics();
          for (const c of chars) {
            if (c.properties.write || c.properties.writeWithoutResponse) {
              characteristic = c;
              break;
            }
          }
          if (characteristic) break;
        } catch {}
      }

      if (!characteristic) {
        try {
          const services = await server.getPrimaryServices();
          for (const service of services) {
            try {
              const chars = await service.getCharacteristics();
              for (const c of chars) {
                if (c.properties.write || c.properties.writeWithoutResponse) {
                  characteristic = c;
                  break;
                }
              }
              if (characteristic) break;
            } catch {}
          }
        } catch (e) {
          console.warn('Could not enumerate all services:', e);
        }
      }

      if (!characteristic) {
        throw new Error('Connected to printer, but no writable serial characteristic was found. Ensure printer supports BLE ESC/POS.');
      }

      connectedBluetoothDevice = device;
      activeCharacteristic = characteristic;

      return {
        success: true,
        deviceName: device.name || 'Thermal POS Printer',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const isSecurityError =
        (err instanceof DOMException && (err.name === 'SecurityError' || err.name === 'NotAllowedError')) ||
        errorMsg.toLowerCase().includes('permissions policy') ||
        errorMsg.toLowerCase().includes('disallowed') ||
        errorMsg.toLowerCase().includes('not allowed');

      const isCancelled =
        (err instanceof DOMException && err.name === 'NotFoundError') ||
        errorMsg.toLowerCase().includes('cancelled') ||
        errorMsg.toLowerCase().includes('canceled') ||
        errorMsg.toLowerCase().includes('user cancelled');

      if (isSecurityError) {
        console.warn('Bluetooth restricted by iframe permissions policy:', errorMsg);
        return {
          success: false,
          isIframeRestricted: true,
          error:
            'आईफ्रेम प्रीव्यू में सुरक्षा कारणों से ब्लूटूथ की अनुमति नहीं है (Permissions Policy Disallowed)। ब्लूटूथ थर्मल प्रिंटर से कनेक्ट करने के लिए कृपया ऐप को "नई टैब (New Tab)" में खोलें या "सिस्टम प्रिंट" का उपयोग करें।',
        };
      }

      if (isCancelled) {
        console.info('Bluetooth device chooser cancelled');
        return {
          success: false,
          isCancelled: true,
          error: 'प्रिंटर चयन रद्द कर दिया गया। (Scan cancelled)',
        };
      }

      console.warn('Bluetooth connection error:', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }
  },

  async disconnect(): Promise<void> {
    try {
      if (connectedBluetoothDevice?.gatt?.connected) {
        connectedBluetoothDevice.gatt.disconnect();
      }
    } finally {
      connectedBluetoothDevice = null;
      activeCharacteristic = null;
    }
  },

  // Send raw bytes in small chunks to prevent buffer overflow on thermal printers
  async sendData(bytes: Uint8Array): Promise<boolean> {
    if (!activeCharacteristic) {
      throw new Error('Printer connected but communication failed (No characteristic). Please reconnect.');
    }

    // Some printers need very small chunks, others are fine with 512. 
    // 100 bytes with 40ms delay is very safe for cheap BLE thermal printers.
    const CHUNK_SIZE = 100; // Safe chunk size for BLE MTU
    for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
      const slice = bytes.slice(offset, offset + CHUNK_SIZE);
      try {
        if (activeCharacteristic.properties.writeWithoutResponse) {
          await activeCharacteristic.writeValueWithoutResponse(slice);
        } else {
          await activeCharacteristic.writeValue(slice);
        }
      } catch (err) {
        console.error('Failed to write chunk:', err);
        throw new Error('Bluetooth connection lost during printing. Please reconnect the printer.');
      }
      // Give the printer buffer time to process the raster image
      await new Promise(res => setTimeout(res, 40));
    }
    return true;
  },

  // Print current bill to Bluetooth thermal printer
  // Automatically uses Bitmap Raster printing for Hindi/Marathi or Logo to guarantee clean printing!
  async printBill(bill: Bill, settings: HotelSettings): Promise<{ success: boolean; error?: string }> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'Bluetooth printer is not connected. Please connect your printer or use System Print.',
      };
    }

    try {
      if (settings.printMode === 'text') {
        const bytes = generateTextReceiptBytes(bill, settings);
        await this.sendData(bytes);
        return { success: true };
      }

      // Use high-resolution canvas bitmap raster printing for Hindi, Marathi, or when Logo is present
      // This is the universal solution for KPC307-UEWB 80mm printer!
      const canvas = await renderReceiptToCanvas(bill, settings);
      const bytes = canvasToEscPosRaster(canvas);
      await this.sendData(bytes);
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error printing to Bluetooth device';
      console.warn('Bluetooth print failed:', e);
      return { success: false, error: msg };
    }
  },

  // Test receipt for Bluetooth printer verification
  async printTestReceipt(settings: HotelSettings): Promise<{ success: boolean; error?: string }> {
    if (!this.isConnected()) {
      return { success: false, error: 'Bluetooth printer is not connected.' };
    }

    const dummyBill: Bill = {
      id: 'test-bill',
      billNumber: '1',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      timestamp: Date.now(),
      items: [
        { id: '1', name: 'दाल तड़का', hindiName: 'Dal Tadka', marathiName: 'डाळ तडका', price: 140, quantity: 1, total: 140 },
        { id: '2', name: 'तंदूरी रोटी', hindiName: 'Tandoori Roti', marathiName: 'तंदूर रोटी', price: 15, quantity: 4, total: 60 },
      ],
      subtotal: 200,
      discount: 0,
      tax: 0,
      grandTotal: 200,
      paymentMethod: 'CASH',
      tableNo: 'T-1',
      waiterName: 'Rahul',
    };

    return this.printBill(dummyBill, settings);
  },

  // Trigger Android native print dialog
  triggerSystemPrint(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  },

  // Format receipt text for WhatsApp or SMS sharing
  generateShareText(bill: Bill, settings: HotelSettings): string {
    const lang = bill.language || settings.language || 'hi';
    const t = getTranslations(lang);

    const lines = [
      `*${settings.hotelName}*`,
      settings.tagline || 'Restaurant Billing / POS',
      settings.address,
      `Mob: ${settings.phone}`,
      '--------------------------------',
      `*${t.billNo}* ${bill.billNumber}`,
      `*${t.date}:* ${bill.date} ${bill.time}`,
    ];

    if (bill.tableNo) {
      lines.push(`*${t.tableNo}* ${bill.tableNo}`);
    }
    if (bill.waiterName) {
      lines.push(`*${t.waiter}:* ${bill.waiterName}`);
    }
    lines.push(`*${t.payment}:* ${bill.paymentMethod}`);
    lines.push('--------------------------------');
    lines.push(`*${t.item}          ${t.qty}     ${t.amount}*`);
    lines.push('--------------------------------');

    bill.items.forEach(item => {
      const displayName = getItemDisplayName(item, lang);
      lines.push(`${displayName} x ${item.quantity} = ₹${item.total}`);
    });

    lines.push('--------------------------------');
    if (bill.discount > 0) {
      lines.push(`${t.subtotal}: ₹${bill.subtotal}`);
      lines.push(`${t.discount}: -₹${bill.discount}`);
    }
    lines.push(`*${t.grandTotal}: ₹${bill.grandTotal}*`);
    lines.push('--------------------------------');
    lines.push(settings.footerMessage || t.thankYouMessage);

    return lines.join('\n');
  },

  // Open WhatsApp with pre-filled receipt
  shareViaWhatsApp(bill: Bill, settings: HotelSettings, customerPhone?: string): void {
    const text = encodeURIComponent(this.generateShareText(bill, settings));
    let url = `https://api.whatsapp.com/send?text=${text}`;
    if (customerPhone) {
      const cleanPhone = customerPhone.replace(/\D/g, '');
      const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      url = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${text}`;
    }
    window.open(url, '_blank');
  },

  // Web Share API (Android native share sheet)
  async shareNative(bill: Bill, settings: HotelSettings): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${settings.hotelName} Bill - ${bill.billNumber}`,
          text: this.generateShareText(bill, settings),
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },
};
