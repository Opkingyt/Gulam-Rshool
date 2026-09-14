import React from 'react';
import { Bill, HotelSettings } from '../types';
import { getTranslations, getItemDisplayName } from '../services/i18n';

interface PrintableReceiptProps {
  bill: Bill | null;
  settings: HotelSettings;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({ bill, settings }) => {
  if (!bill) return null;

  const is80mm = settings.printerWidth === '80mm';
  const widthMm = is80mm ? '78mm' : '56mm';
  const lang = bill.language || settings.language || 'hi';
  const t = getTranslations(lang);

  // Logo width based on setting
  let logoMaxWidth = '120px';
  if (settings.logoSize === 'small') {
    logoMaxWidth = is80mm ? '100px' : '75px';
  } else if (settings.logoSize === 'large') {
    logoMaxWidth = is80mm ? '180px' : '130px';
  } else {
    logoMaxWidth = is80mm ? '140px' : '95px';
  }

  return (
    <div
      id="printable-receipt"
      className="receipt-print-area"
      style={{
        width: widthMm,
        maxWidth: widthMm,
        margin: '0 auto',
        padding: '3mm 2mm',
        backgroundColor: '#fff',
        color: '#000',
        fontFamily: '"Noto Sans Devanagari", "Courier New", Courier, monospace',
        fontSize: is80mm ? '12px' : '10.5px',
        lineHeight: 1.35,
      }}
    >
      {/* 1. Restaurant Logo (Top Center) */}
      {settings.logoUrl && settings.logoUrl.trim().length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <img
            src={settings.logoUrl}
            alt="Restaurant Logo"
            referrerPolicy="no-referrer"
            style={{
              maxWidth: logoMaxWidth,
              maxHeight: '80px',
              objectFit: 'contain',
              margin: '0 auto',
              display: 'block',
              filter: 'grayscale(100%) contrast(140%)',
            }}
          />
        </div>
      )}

      {/* 2. Restaurant Name & Header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: is80mm ? '17px' : '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {settings.hotelName}
        </div>
        {settings.tagline && (
          <div style={{ fontSize: is80mm ? '11px' : '9.5px', fontWeight: 500 }}>{settings.tagline}</div>
        )}
        <div style={{ fontSize: is80mm ? '11px' : '9.5px', marginTop: '1px' }}>{settings.address}</div>
        <div style={{ fontSize: is80mm ? '12px' : '10.5px', fontWeight: 700, marginTop: '1px' }}>
          Mob: {settings.phone}
        </div>
        {settings.gstin && (
          <div style={{ fontSize: is80mm ? '10.5px' : '9px', fontWeight: 600 }}>GSTIN: {settings.gstin}</div>
        )}
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }} />

      {/* 3. Bill Meta (Bill No, Date, Time, Table, Waiter, Customer, Payment) */}
      <div style={{ fontSize: is80mm ? '11.5px' : '10px', marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>{t.billNo}: {bill.billNumber}</span>
          <span>{bill.date} {bill.time}</span>
        </div>

        {(bill.tableNo || bill.waiterName) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', fontWeight: 600 }}>
            {bill.tableNo ? <span>{t.tableNo}: {bill.tableNo}</span> : <span />}
            {bill.waiterName ? <span>{t.waiter}: {bill.waiterName}</span> : <span />}
          </div>
        )}

        {bill.customerName && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1px' }}>
            <span>{t.customer}:</span>
            <span style={{ fontWeight: 600 }}>{bill.customerName}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1px' }}>
          <span>{t.payment}:</span>
          <span style={{ fontWeight: 600 }}>{bill.paymentMethod}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }} />

      {/* 4. Item Table Header: Item | Quantity | Rate | Amount */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: is80mm ? '11.5px' : '10px' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000', textAlign: 'left', fontWeight: 700 }}>
            <th style={{ width: '45%', padding: '3px 0' }}>{t.item}</th>
            <th style={{ width: '15%', textAlign: 'center', padding: '3px 0' }}>{t.qty}</th>
            <th style={{ width: '20%', textAlign: 'right', padding: '3px 0' }}>{t.rate}</th>
            <th style={{ width: '20%', textAlign: 'right', padding: '3px 0' }}>{t.amount}</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => {
            const displayName = getItemDisplayName(item, lang);
            return (
              <tr key={index} style={{ verticalAlign: 'top', borderBottom: '1px dotted #ccc' }}>
                <td style={{ padding: '3px 0', wordBreak: 'break-word', fontWeight: 600 }}>
                  {displayName}
                </td>
                <td style={{ textAlign: 'center', padding: '3px 0', fontWeight: 700 }}>
                  {item.quantity}
                </td>
                <td style={{ textAlign: 'right', padding: '3px 0' }}>
                  ₹{item.price}
                </td>
                <td style={{ textAlign: 'right', padding: '3px 0', fontWeight: 700 }}>
                  ₹{item.total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }} />

      {/* 5. Totals: Subtotal, Discount, GST/Tax, Grand Total */}
      <div style={{ fontSize: is80mm ? '12px' : '10.5px' }}>
        {bill.discount > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
              <span>{t.subtotal}:</span>
              <span>₹{bill.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', color: '#000' }}>
              <span>{t.discount}:</span>
              <span>-₹{bill.discount}</span>
            </div>
          </>
        )}

        {bill.tax > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
            <span>{t.tax}:</span>
            <span>+₹{bill.tax}</span>
          </div>
        )}

        {/* Grand Total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: is80mm ? '15px' : '13px',
            fontWeight: 800,
            marginTop: '3px',
            borderTop: '2px solid #000',
            borderBottom: '2px solid #000',
            padding: '3px 0',
          }}
        >
          <span>{t.grandTotal}:</span>
          <span>₹{bill.grandTotal}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

      {/* 6. Thank You message & Footer */}
      <div style={{ textAlign: 'center', marginTop: '4px', fontSize: is80mm ? '11px' : '9.5px', whiteSpace: 'pre-line', fontWeight: 600 }}>
        {settings.footerMessage || t.thankYouMessage}
      </div>

      {settings.instagram && (
        <div style={{ textAlign: 'center', fontSize: is80mm ? '10px' : '8.5px', marginTop: '3px' }}>
          Instagram: @{settings.instagram}
        </div>
      )}
    </div>
  );
};
