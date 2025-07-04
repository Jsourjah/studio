
'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { Invoice, Material, Purchase } from '@/lib/types';
import { format } from 'date-fns';
import { ReportGenerator } from '@/components/report-generator';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Terminal, AlertCircle } from 'lucide-react';
import { checkReportAnomaly } from './actions';
import type { ReportAnomalyDetectionOutput } from '@/ai/flows/report-anomaly-detection';
import { monthlySummary } from '@/lib/data';


export default function ReportsPage() {
  const [invoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [materials] = useLocalStorage<Material[]>('materials', []);
  const [purchases] = useLocalStorage<Purchase[]>('purchases', []);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReportAnomalyDetectionOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const safeInvoices = invoices || [];
  const safeMaterials = materials || [];
  const safePurchases = purchases || [];

  const totalRevenue = safeInvoices
    .filter((invoice) => invoice && invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  const outstandingRevenue = safeInvoices
    .filter((invoice) => invoice && (invoice.status === 'unpaid' || invoice.status === 'overdue'))
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  const totalInventoryValue = safeMaterials.reduce(
    (sum, material) => sum + ((material?.quantity || 0) * (material?.costPerUnit || 0)),
    0
  );

  const totalPurchaseAmount = safePurchases
    .filter((purchase) => purchase && purchase.status === 'completed')
    .reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);
  
  const recentPurchases = [...safePurchases]
    .filter(Boolean)
    .sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    })
    .slice(0, 5);
  
  const statusStyles: { [key: string]: string } = {
    completed:
      'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
    pending:
      'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
    cancelled:
      'bg-gray-500/20 text-gray-700 hover:bg-gray-500/30 dark:bg-gray-500/10 dark:text-gray-400',
  };

  const handleAnalyzeReport = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    const currentReportData = JSON.stringify({
      totalRevenue,
      outstandingRevenue,
      totalInventoryValue,
      totalPurchaseAmount,
      recentPurchases: recentPurchases.length,
    });

    const pastReportData = JSON.stringify(monthlySummary);

    const result = await checkReportAnomaly({
      currentReportData,
      pastReportData,
    });

    if (result.success) {
      setAnalysisResult(result.data);
    } else {
      setAnalysisError(result.error);
    }

    setIsAnalyzing(false);
  };
  
  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ReportGenerator onAnalyze={handleAnalyzeReport} isAnalyzing={isAnalyzing}>
       {analysisResult && (
        <Alert variant={analysisResult.hasAnomaly ? 'destructive' : 'default'} className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{analysisResult.hasAnomaly ? 'Anomaly Detected!' : 'Report Looks Normal'}</AlertTitle>
          <AlertDescription>
            {analysisResult.anomalyExplanation}
          </AlertDescription>
        </Alert>
      )}

      {analysisError && (
          <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>
            {analysisError}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>From paid invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs.{totalRevenue.toLocaleString('en-US')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Revenue</CardTitle>
            <CardDescription>Unpaid & Overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs.{outstandingRevenue.toLocaleString('en-US')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Value</CardTitle>
            <CardDescription>Total cost of materials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs.{totalInventoryValue.toLocaleString('en-US')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Purchases</CardTitle>
            <CardDescription>Total spend</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs.{totalPurchaseAmount.toLocaleString('en-US')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
          <CardDescription>
            A list of the 5 most recent purchase orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPurchases.map((purchase, index) => (
                <TableRow key={purchase.id || index}>
                  <TableCell className="font-medium">{purchase.id}</TableCell>
                  <TableCell>{purchase.supplier}</TableCell>
                  <TableCell>
                    {purchase.date && !isNaN(new Date(purchase.date).getTime())
                      ? format(new Date(purchase.date), 'MM/dd/yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[purchase.status] || ''}>
                      {(purchase.status || 'unknown').charAt(0).toUpperCase() + (purchase.status || 'unknown').slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    Rs.{(purchase.totalAmount || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ReportGenerator>
  );
}
