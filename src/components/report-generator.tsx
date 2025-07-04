'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { BusinessReportPdf } from './business-report-pdf';

type ReportGeneratorProps = {
  children: React.ReactNode;
  reportData: any;
};

export function ReportGenerator({ children, reportData }: ReportGeneratorProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    const input = pdfRef.current;
    if (!input) {
      return;
    }
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      pdf.save('business-report.pdf');
    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Business Report</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={handleDownloadPdf} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
        {/* The on-screen report remains the same */}
        <div className="space-y-4 bg-background p-6">{children}</div>
      </div>

      {/* The off-screen PDF layout */}
      <div
        className="absolute -left-[9999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div ref={pdfRef}>
          {reportData && <BusinessReportPdf {...reportData} />}
        </div>
      </div>
    </>
  );
}
