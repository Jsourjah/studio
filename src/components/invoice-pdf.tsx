
'use client';

import type { Invoice } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';

type InvoicePdfProps = {
  invoice: Invoice;
};

// This component is designed to be rendered off-screen for PDF generation.
// It is rendered at 4x the final size to ensure high resolution.
export function InvoicePdf({ invoice }: InvoicePdfProps) {
  const safeItems = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = safeItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const total = subtotal;

  return (
    <div
      className="text-black font-sans bg-cover bg-center"
      style={{
        width: '1152px', // 4in * 72dpi * 4
        height: '1728px', // 6in * 72dpi * 4
        fontFamily: 'Inter, sans-serif',
        backgroundImage: 'url(/images/invoice-background.png)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        fontSize: '32px'
      }}
    >
      {/* Customer Info */}
      <div className="absolute" style={{ top: '320px', left: '112px', width: '500px' }}>
        <p className="font-semibold" style={{ fontSize: '40px' }}>{invoice.customer}</p>
        {invoice.address && <p className="mt-2">{invoice.address}</p>}
        {invoice.phone && <p className="mt-2">{invoice.phone}</p>}
      </div>

      {/* Invoice Details */}
      <div className="absolute text-right" style={{ top: '320px', right: '112px', width: '400px' }}>
        <div className="mb-8">
            <p className="font-medium">{invoice.id}</p>
        </div>
        <div className="mb-8">
            <p className="font-medium">{format(new Date(invoice.date), 'PPP')}</p>
        </div>
        <div>
            <p className="font-medium">{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
        </div>
      </div>
      
      <div className="absolute" style={{ top: '680px', left: '112px', right: '112px' }}>
        <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '45%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-gray-500">
              <th className="p-4 pb-2 font-semibold text-left">Description</th>
              <th className="p-4 pb-2 font-semibold text-center">Qty</th>
              <th className="p-4 pb-2 font-semibold text-right">Price</th>
              <th className="p-4 pb-2 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {safeItems.map((item, index) => (
               <tr key={index} className="border-b border-gray-400/50">
                  <td className="p-4 align-top">{item.description}</td>
                  <td className="p-4 align-top text-center">{item.quantity}</td>
                  <td className="p-4 align-top text-right">${item.price.toFixed(2)}</td>
                  <td className="p-4 align-top text-right">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="absolute" style={{ bottom: '260px', right: '112px', width: '480px' }}>
          <div className="flex justify-between mb-4">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="border-t-2 border-gray-400 my-4"></div>
          <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
          </div>
      </div>

      {invoice.status === 'paid' && (
        <div className="absolute" style={{ bottom: '400px', left: '50%', transform: 'translateX(-50%)' }}>
           <Image
              src="/images/paid-stamp.png"
              width={400}
              height={200}
              alt="Paid Stamp"
              className="opacity-80"
            />
        </div>
      )}

    </div>
  );
}
