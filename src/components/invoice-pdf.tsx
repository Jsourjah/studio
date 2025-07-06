
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
       <table
  className="absolute font-medium leading-relaxed"
  style={{ top: '180px', left: '50px', width: '1000px', fontFamily: 'Arial, sans-serif' }}
>
  <tbody>
    {/* Invoice Info */}
    <tr>
      <td className="font-semibold pr-4 w-[120px]">Invoice</td>
      <td className="pr-2">:</td>
      <td>{invoice.id}</td>
    </tr>
    <tr>
      <td className="font-semibold pr-4">Date</td>
      <td className="pr-2">:</td>
      <td>
        {invoice.date && !isNaN(new Date(invoice.date).getTime())
          ? format(new Date(invoice.date), 'PPP')
          : 'N/A'}
      </td>
    </tr>

    {/* Spacer */}
    <tr><td colSpan={3} className="py-2"></td></tr>

    {/* Customer Info */}
    <tr>
      <td className="font-semibold pr-4">Name</td>
      <td className="pr-2">:</td>
      <td>{invoice.customer}</td>
    </tr>
    <tr>
      <td className="font-semibold pr-4">Address</td>
      <td className="pr-2">:</td>
      <td>{invoice.address || 'N/A'}</td>
    </tr>
    <tr>
      <td className="font-semibold pr-4">Tel</td>
      <td className="pr-2">:</td>
      <td>{invoice.phone || 'N/A'}</td>
    </tr>
  </tbody>
</table>
      
      <div className="absolute" style={{ top: '550px', left: '112px', right: '112px' }}>
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
              style={{ transform: 'rotate(-20deg)' }}
            />
        </div>
      )}

    </div>
  );
}
