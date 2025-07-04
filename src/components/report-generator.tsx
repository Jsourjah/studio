'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, WandSparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type ReportGeneratorProps = {
  children: React.ReactNode;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
};

export function ReportGenerator({ children, onAnalyze, isAnalyzing = false }: ReportGeneratorProps) {
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
        backgroundColor: null, // Use transparent background
      });

      // Create a new canvas to add a white background
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const ctx = finalCanvas.getContext('2d');
      if (ctx) {
        // Check if we are in dark mode to set the correct background
        const isDarkMode = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDarkMode ? '#0a0e17' : '#f4f6fa'; // dark background or light background
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(canvas, 0, 0);
      }
      
      const imgData = finalCanvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [finalCanvas.width, finalCanvas.height],
      });

      // Add padding to the PDF
      const padding = 20;
      pdf.addImage(imgData, 'PNG', padding, padding, finalCanvas.width - (padding * 2), finalCanvas.height - (padding * 2));
      pdf.save('business-report.pdf');

    } catch (error) {
      console.error('Failed to generate PDF', error);
      // Optionally, show a toast notification for the error
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Business Report</h2>
        <div className="flex items-center space-x-2">
          {onAnalyze && (
            <Button variant="outline" onClick={onAnalyze} disabled={isAnalyzing || isGenerating}>
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <WandSparkles className="mr-2 h-4 w-4" />
              )}
              Analyze Report
            </Button>
          )}
          <Button onClick={handleDownloadPdf} disabled={isGenerating || isAnalyzing}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>
      <div id="report-content" ref={reportRef} className="space-y-4 bg-background p-4 rounded-lg">
        {children}
      </div>
    </div>
  );
}
