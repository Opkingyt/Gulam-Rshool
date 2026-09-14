import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer, QrCode } from 'lucide-react';
import { HotelSettings } from '../types';

interface TableQRProps {
  settings: HotelSettings;
  onOpenCustomerView?: (tableNo: string) => void;
}

export const TableQR: React.FC<TableQRProps> = ({ settings, onOpenCustomerView }) => {
  const [tablesCount, setTablesCount] = useState(20);
  const [qrCodes, setQrCodes] = useState<{tableNo: string, dataUrl: string, url: string}[]>([]);

  const generateQRCodes = async (count: number) => {
    const codes = [];
    const baseUrl = window.location.origin;
    for (let i = 1; i <= count; i++) {
      const tableNo = i.toString();
      const url = `${baseUrl}?table=${tableNo}`;
      try {
        const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
        codes.push({ tableNo, dataUrl, url });
      } catch (e) {
        console.error(e);
      }
    }
    setQrCodes(codes);
  };

  useEffect(() => {
    generateQRCodes(tablesCount);
  }, [tablesCount]);

  const handlePrint = (qr: {tableNo: string, dataUrl: string, url: string}) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Table ${qr.tableNo} QR</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            img { width: 250px; height: 250px; }
            p { font-size: 14px; color: #666; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${settings.hotelName}</h1>
          <h2>Table ${qr.tableNo}</h2>
          <img src="${qr.dataUrl}" />
          <p>Scan to order</p>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 sm:p-6 pb-24">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black mb-1">Table QR Codes</h2>
          <p className="text-stone-500">Live ordering QR codes for customers</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold">Total Tables:</label>
          <input
            type="number"
            value={tablesCount}
            onChange={(e) => setTablesCount(Number(e.target.value) || 1)}
            className="w-20 px-3 py-2 border rounded-xl"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {qrCodes.map((qr) => (
          <div key={qr.tableNo} className="bg-white dark:bg-stone-800 rounded-2xl p-4 shadow-sm border text-center flex flex-col items-center">
            <h3 className="font-black text-lg mb-2">Table {qr.tableNo}</h3>
            <img src={qr.dataUrl} alt={`Table ${qr.tableNo} QR`} className="w-full max-w-[150px] aspect-square rounded-xl mb-3 shadow-sm" />
            
            <div className="flex gap-2 w-full">
              <button
                onClick={() => handlePrint(qr)}
                className="flex-1 flex items-center justify-center gap-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 py-2 rounded-xl text-sm transition"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => onOpenCustomerView?.(qr.tableNo)}
                className="flex-1 flex items-center justify-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 py-2 rounded-xl text-sm transition"
              >
                <QrCode className="w-4 h-4" /> Test
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
