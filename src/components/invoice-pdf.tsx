
'use client';

import type { Invoice } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';

type InvoicePdfProps = {
  invoice: Invoice;
};

// This component is designed to be rendered off-screen for PDF generation.
// It is styled for a 6x4 inch landscape format (432x288 points).
export function InvoicePdf({ invoice }: InvoicePdfProps) {
  return (
    <div
      className="bg-white text-black p-6 font-sans"
      style={{ width: '432px', height: '288px', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="relative h-full flex flex-col">
        {/* Invoice Header */}
        <header className="flex justify-between items-start pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Image
              src="https://placehold.co/48x48/e0502d/fcf2f2.png"
              width={48}
              height={48}
              alt="Company Logo"
              data-ai-hint="orange gray"
              className="rounded-md"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Your Company</h1>
              <p className="text-[10px] text-gray-500">123 Business Road</p>
              <p className="text-[10px] text-gray-500">Businesstown, ST 54321</p>
              <p className="text-[10px] text-gray-500">your.email@company.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-700 tracking-wider">INVOICE</h2>
            <p className="text-xs text-gray-600 mt-1"># {invoice.id}</p>
            <p className="text-xs text-gray-600">Date: {format(new Date(invoice.date), 'PPP')}</p>
          </div>
        </header>

        {/* Customer Information */}
        <section className="my-4">
          <h3 className="font-bold text-xs text-gray-500 mb-1">BILL TO</h3>
          <p className="font-semibold text-base text-gray-800">{invoice.customer}</p>
          {invoice.address && <p className="text-xs text-gray-600">{invoice.address}</p>}
          {invoice.phone && <p className="text-xs text-gray-600">{invoice.phone}</p>}
        </section>

        {/* Invoice Items Table */}
        <section className="flex-grow text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-2 font-bold">DESCRIPTION</th>
                <th className="p-2 font-bold text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-2 align-top whitespace-pre-line">{invoice.items}</td>
                <td className="p-2 align-top text-right">${invoice.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>
        
        {/* Paid Stamp Overlay */}
        {invoice.status === 'paid' && (
          <div className="absolute opacity-10" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-20deg)' }}>
             <Image
                src="https://placehold.co/150x75.png"
                width={150}
                height={75}
                alt="Paid Stamp"
                data-ai-hint="paid stamp"
              />
          </div>
        )}

        {/* Invoice Footer */}
        <footer className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex justify-end mb-2">
            <div className="w-2/5">
              <div className="flex justify-between text-base">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-gray-800">${invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="text-center text-[10px] text-gray-500">
            <p className="font-bold">Thank you for your business!</p>
            <p>Please make payment within 30 days of the invoice date.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
