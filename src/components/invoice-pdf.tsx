
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
      className="text-black font-sans relative"
      style={{ width: '612px', minHeight: '792px', fontFamily: 'Inter, sans-serif' }}
    >
      <Image
        src="/images/invoice-background.png"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        alt="Invoice Background"
        className="-z-10"
      />
      <div className="h-full flex flex-col pt-40 px-10 pb-10">
        {/* Customer & Date Info */}
        <section className="grid grid-cols-2 gap-4">
            <div>
                <h3 className="font-bold text-sm text-gray-500 mb-1 uppercase tracking-wider">Bill To</h3>
                <p className="font-semibold text-base text-gray-800">{invoice.customer}</p>
                {invoice.address && <p className="text-sm text-gray-600">{invoice.address}</p>}
                {invoice.phone && <p className="text-sm text-gray-600">{invoice.phone}</p>}
            </div>
            <div className="text-right">
                <div className="mb-2">
                    <p className="font-bold text-sm text-gray-500 uppercase tracking-wider">Invoice #</p>
                    <p className="font-medium text-gray-800">{invoice.id}</p>
                </div>
                <div className="mb-2">
                    <p className="font-bold text-sm text-gray-500 uppercase tracking-wider">Invoice Date</p>
                    <p className="font-medium text-gray-800">{format(new Date(invoice.date), 'PPP')}</p>
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-500 uppercase tracking-wider">Status</p>
                    <p className="font-medium text-gray-800">{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
                </div>
            </div>
        </section>

        {/* Invoice Items Table */}
        <section className="flex-grow text-sm pt-8">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-transparent text-gray-600 uppercase text-xs">
                <th className="p-3 font-bold w-1/2">Description</th>
                <th className="p-3 font-bold text-center">Qty</th>
                <th className="p-3 font-bold text-right">Unit Price</th>
                <th className="p-3 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {safeItems.map((item, index) => (
                 <tr key={index} className="border-b border-gray-200">
                    <td className="p-3 align-top">{item.description}</td>
                    <td className="p-3 align-top text-center">{item.quantity}</td>
                    <td className="p-3 align-top text-right">${item.price.toFixed(2)}</td>
                    <td className="p-3 align-top text-right">${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        
        {/* Paid Stamp Overlay */}
        {invoice.status === 'paid' && (
          <div className="absolute opacity-80" style={{ bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
             <Image
                src="/images/paid-stamp.png"
                width={200}
                height={100}
                alt="Paid Stamp"
              />
          </div>
        )}

        {/* Invoice Footer */}
        <footer className="mt-auto pt-8">
            <div className="flex justify-end mb-4">
                <div className="w-2/5">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between text-lg">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="font-bold text-gray-800">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}
