
'use client';

import type { Invoice } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';

type InvoicePdfProps = {
  invoice: Invoice;
};

// This component is designed to be rendered off-screen for PDF generation.
// It is styled to a standard A4 paper size (595.28 x 841.89 points).
export function InvoicePdf({ invoice }: InvoicePdfProps) {
  return (
    <div
      className="bg-white text-black p-10 font-sans"
      style={{ width: '595px', height: '842px', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="relative h-full flex flex-col">
        {/* Invoice Header */}
        <header className="flex justify-between items-start pb-8 border-b-2 border-gray-200">
          <div className="flex items-center gap-4">
            <Image
              src="https://placehold.co/64x64/e0502d/fcf2f2.png"
              width={64}
              height={64}
              alt="Company Logo"
              data-ai-hint="orange gray"
              className="rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Your Company</h1>
              <p className="text-xs text-gray-500">123 Business Road</p>
              <p className="text-xs text-gray-500">Businesstown, ST 54321</p>
              <p className="text-xs text-gray-500">your.email@company.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-gray-700 tracking-wider">INVOICE</h2>
            <p className="text-sm text-gray-600 mt-1"># {invoice.id}</p>
            <p className="text-sm text-gray-600">Date: {format(new Date(invoice.date), 'PPP')}</p>
          </div>
        </header>

        {/* Customer Information */}
        <section className="my-10">
          <h3 className="font-bold text-gray-500 text-sm mb-2">BILL TO</h3>
          <p className="font-semibold text-lg text-gray-800">{invoice.customer}</p>
          {invoice.address && <p className="text-gray-600">{invoice.address}</p>}
          {invoice.phone && <p className="text-gray-600">{invoice.phone}</p>}
        </section>

        {/* Invoice Items Table */}
        <section className="flex-grow">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3 font-bold">DESCRIPTION</th>
                <th className="p-3 font-bold text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-3 align-top whitespace-pre-line">{invoice.items}</td>
                <td className="p-3 align-top text-right">${invoice.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>
        
        {/* Paid Stamp Overlay */}
        {invoice.status === 'paid' && (
          <div className="absolute opacity-10" style={{ top: '45%', left: '50%', transform: 'translate(-50%, -50%) rotate(-20deg)' }}>
             <Image
                src="https://placehold.co/300x150.png"
                width={300}
                height={150}
                alt="Paid Stamp"
                data-ai-hint="paid stamp"
              />
          </div>
        )}

        {/* Invoice Footer */}
        <footer className="mt-auto pt-8 border-t-2 border-gray-200">
          <div className="flex justify-end mb-4">
            <div className="w-2/5">
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-gray-800">${invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500">
            <p className="font-bold">Thank you for your business!</p>
            <p>Please make payment within 30 days of the invoice date.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
