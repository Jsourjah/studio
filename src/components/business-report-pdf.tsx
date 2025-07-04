'use client';

type BusinessReportPdfProps = {
  financialSummary: { metric: string; value: number; description: string }[];
  invoiceSummary: {
    paidCount: number;
    paidAmount: number;
    unpaidCount: number;
    unpaidAmount: number;
    totalCount: number;
    totalAmount: number;
  };
  purchaseSummary: { name: string; totalQuantity: number; totalAmount: number }[];
  materialUsage: { name: string; invoiceCount: number; totalQuantity: number }[];
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="bg-cyan-200 text-black font-bold text-center py-2 my-4 text-lg">
    {title.toUpperCase()}
  </div>
);

const ReportRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-center py-1 border-b border-gray-300">
    <p className="text-gray-700">{label}</p>
    <p className="font-semibold text-black">{value}</p>
  </div>
);

export function BusinessReportPdf({
  financialSummary,
  invoiceSummary,
  purchaseSummary,
  materialUsage,
}: BusinessReportPdfProps) {
  return (
    <div
      className="bg-white text-black p-8 font-sans"
      style={{
        width: '210mm',
        minHeight: '297mm',
      }}
    >
      <h1 className="text-2xl font-bold text-blue-600 text-center mb-8">
        MONTHLY BUSINESS REPORT
      </h1>

      <SectionHeader title="Financial Summary" />
      <div className="px-4 space-y-2">
        {financialSummary.map((item) => (
          <ReportRow
            key={item.metric}
            label={item.metric}
            value={`Rs. ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
        ))}
      </div>

      <SectionHeader title="Invoice Summary" />
      <div className="px-4 grid grid-cols-2 gap-x-8">
        <div className="space-y-2">
          <ReportRow
            label="Paid Invoices Count"
            value={invoiceSummary.paidCount}
          />
          <ReportRow
            label="Unpaid Invoices Count"
            value={invoiceSummary.unpaidCount}
          />
          <ReportRow
            label="Total Invoices Count"
            value={invoiceSummary.totalCount}
          />
        </div>
        <div className="space-y-2">
          <ReportRow
            label="Paid Amount"
            value={`Rs. ${invoiceSummary.paidAmount.toFixed(2)}`}
          />
          <ReportRow
            label="Unpaid Amount"
            value={`Rs. ${invoiceSummary.unpaidAmount.toFixed(2)}`}
          />
          <ReportRow
            label="Total Amount"
            value={`Rs. ${invoiceSummary.totalAmount.toFixed(2)}`}
          />
        </div>
      </div>

      <SectionHeader title="Material Purchase Summary" />
      <div className="px-4 space-y-2">
        {purchaseSummary.map((item) => (
          <div
            key={item.name}
            className="flex justify-between items-center py-1 border-b border-gray-300"
          >
            <p className="text-gray-700">{item.name}</p>
            <div className="font-semibold text-black text-right">
              <div>{`Qty: ${item.totalQuantity}`}</div>
              <div>{`Total: Rs. ${item.totalAmount.toFixed(2)}`}</div>
            </div>
          </div>
        ))}
      </div>

      <SectionHeader title="Material Usage In Invoices" />
      <div className="px-4 space-y-2">
        {materialUsage.map((item) => (
          <div
            key={item.name}
            className="flex justify-between items-center py-1 border-b border-gray-300"
          >
            <p className="text-gray-700">{item.name}</p>
            <div className="font-semibold text-black text-right">
              <div>{`Invoices: ${item.invoiceCount}`}</div>
              <div>{`Total Used: ${item.totalQuantity}`}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
