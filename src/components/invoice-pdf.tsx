'use client';

import type { Invoice } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';

type InvoicePdfProps = {
  invoice: Invoice;
};

// This component is designed to be rendered off-screen for PDF generation.
export function InvoicePdf({ invoice }: InvoicePdfProps) {
  const safeItems = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = safeItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const total = subtotal;

  return (
    <div
      className="text-black font-sans bg-cover bg-center"
      style={{
        width: '288px', // 4 inches at 72dpi
        height: '432px', // 6 inches at 72dpi
        fontFamily: 'Inter, sans-serif',
        backgroundImage: 'url(/images/invoice-background.png)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        fontSize: '10px'
      }}
    >
      <div className="absolute" style={{ top: '80px', left: '28px' }}>
        <p className="font-semibold text-sm">{invoice.customer}</p>
        {invoice.address && <p>{invoice.address}</p>}
        {invoice.phone && <p>{invoice.phone}</p>}
      </div>

      <div className="absolute text-left" style={{ top: '80px', right: '28px', width: '100px' }}>
        <div className="mb-2">
            <p className="font-medium">{invoice.id}</p>
        </div>
        <div className="mb-2">
            <p className="font-medium">{format(new Date(invoice.date), 'PPP')}</p>
        </div>
        <div>
            <p className="font-medium">{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
        </div>
      </div>
      
      <div className="absolute" style={{ top: '195px', left: '28px', right: '28px' }}>
        <table className="w-full text-left">
          <thead>
            {/* Headers are on background image, so we make them transparent to preserve layout */}
            <tr className="text-transparent">
              <th className="p-1 font-bold w-[45%]">Description</th>
              <th className="p-1 font-bold w-[15%] text-center">Qty</th>
              <th className="p-1 font-bold w-[20%] text-right">Unit Price</th>
              <th className="p-1 font-bold w-[20%] text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {safeItems.map((item, index) => (
               <tr key={index} className="border-b-0">
                  <td className="p-1 align-top">{item.description}</td>
                  <td className="p-1 align-top text-center">{item.quantity}</td>
                  <td className="p-1 align-top text-right">${item.price.toFixed(2)}</td>
                  <td className="p-1 align-top text-right">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="absolute" style={{ bottom: '65px', right: '28px', width: '120px' }}>
          <div className="flex justify-between mb-1">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-400 my-1"></div>
          <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
          </div>
      </div>

      {invoice.status === 'paid' && (
        <div className="absolute" style={{ bottom: '120px', left: '50%', transform: 'translateX(-50%)' }}>
           <Image
              src="/images/paid-stamp.png"
              width={100}
              height={50}
              alt="Paid Stamp"
              className="opacity-80"
            />
        </div>
      )}

    </div>
  );
}
