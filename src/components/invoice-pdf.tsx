
'use client';

import type { Invoice } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';

type InvoicePdfProps = {
  invoice: Invoice;
};

// This component is designed to be rendered off-screen for PDF generation.
// It is styled for a standard portrait letter size page.
export function InvoicePdf({ invoice }: InvoicePdfProps) {
  const safeItems = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = safeItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  // Assuming no tax for simplicity. Can be added later.
  const total = subtotal;

  return (
    <div
      className="bg-white text-black p-10 font-sans"
      style={{ width: '612px', minHeight: '792px', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="relative h-full flex flex-col">
        {/* Invoice Header */}
        <header className="flex justify-between items-start pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Image
              src="https://placehold.co/64x64/e0502d/fcf2f2.png"
              width={64}
              height={64}
              alt="Company Logo"
              data-ai-hint="orange gray"
              className="rounded-md"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Your Company</h1>
              <p className="text-xs text-gray-500 mt-1">123 Business Road, Businesstown, ST 54321</p>
              <p className="text-xs text-gray-500">your.email@company.com | (555) 555-5555</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-gray-700 tracking-wider">INVOICE</h2>
            <p className="text-sm text-gray-600 mt-2"># {invoice.id}</p>
          </div>
        </header>

        {/* Customer & Date Info */}
        <section className="my-8 grid grid-cols-2 gap-4">
            <div>
                <h3 className="font-bold text-sm text-gray-500 mb-1 uppercase tracking-wider">Bill To</h3>
                <p className="font-semibold text-base text-gray-800">{invoice.customer}</p>
                {invoice.address && <p className="text-sm text-gray-600">{invoice.address}</p>}
                {invoice.phone && <p className="text-sm text-gray-600">{invoice.phone}</p>}
            </div>
            <div className="text-right">
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
        <section className="flex-grow text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                <th className="p-3 font-bold w-1/2">Description</th>
                <th className="p-3 font-bold text-center">Qty</th>
                <th className="p-3 font-bold text-right">Unit Price</th>
                <th className="p-3 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {safeItems.map((item, index) => (
                 <tr key={index} className="border-b border-gray-100">
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
          <div className="absolute opacity-10" style={{ bottom: '6rem', left: '50%', transform: 'translateX(-50%) rotate(-15deg)' }}>
             <Image
                src="https://placehold.co/200x100/e0502d/ffffff.png"
                width={200}
                height={100}
                alt="Paid Stamp"
                data-ai-hint="paid stamp"
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
                    {/* Placeholder for Tax if needed in the future */}
                    {/* <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-600">Tax (0%)</span>
                        <span className="font-medium text-gray-800">$0.00</span>
                    </div> */}
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between text-lg">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="font-bold text-gray-800">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                <p className="font-bold">Thank you for your business!</p>
                <p>Please make payment within 30 days of the invoice date.</p>
            </div>
        </footer>
      </div>
    </div>
  );
}
