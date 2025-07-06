
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
       {/* Invoice Details */}
       <div className="absolute" style={{ top: '220px', left: '50px', width: '500px' }}>
          <p><span className="font-medium">Invoice #:</span> {invoice.id}</p>
          <p className="mt-2"><span className="font-medium">Date:</span> {invoice.date && !isNaN(new Date(invoice.date).getTime()) ? format(new Date(invoice.date), 'PPP') : 'N/A'}</p>
       </div>
       {/* Customer Info */}
       <div className="absolute" style={{ top: '320px', left: '50px', width: '500px' }}>
          <p><span className="font-medium">Name:</span> {invoice.customer}</p>
          <p><span className="font-medium">Address:</span> {invoice.address && invoice.address}</p>
          <p><span className="font-medium">Tel:</span> {invoice.phone && invoice.phone}</p>
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
                  <td className="p-4 align-top text-right">Rs.{item.price.toFixed(2)}</td>
                  <td className="p-4 align-top text-right">Rs.{(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-500 font-medium">
              <td colSpan={3} className="p-4 pt-4 text-right">Subtotal</td>
              <td className="p-4 pt-4 text-right">Rs.{subtotal.toFixed(2)}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan={3} className="p-4 text-right">Total</td>
              <td className="p-4 text-right">Rs.{total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {invoice.status === 'paid' && (
        <div className="absolute" style={{ bottom: '100px', right: '112px' }}>
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
