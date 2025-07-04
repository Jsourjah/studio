'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type ReportGeneratorProps = {
  children: React.ReactNode;
};

export function ReportGenerator({ children }: ReportGeneratorProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    const input = reportRef.current;
    if (!input) {
      return;
    }
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(input, {
        scale: 2, // Higher scale for better quality
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
      
      const margin = 40;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = pdfHeight - margin * 2;

      const imgProps = pdf.getImageProperties(imgData);
      const imgAspectRatio = imgProps.width / imgProps.height;

      let renderWidth = contentWidth;
      let renderHeight = contentWidth / imgAspectRatio;
      
      if (renderHeight > contentHeight) {
          renderHeight = contentHeight;
          renderWidth = contentHeight * imgAspectRatio;
      }
      
      const x = margin + (contentWidth - renderWidth) / 2;
      const y = margin + (contentHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight);
      
      // Add a border around the page content
      pdf.setDrawColor(0); // Black border
      pdf.rect(margin, margin, contentWidth, contentHeight);

      pdf.save('business-report.pdf');

    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
      {/* Adding padding to the content that will be captured for the PDF */}
      <div id="report-content" ref={reportRef} className="space-y-4 bg-background p-6">
        {children}
      </div>
    </div>
  );
}
