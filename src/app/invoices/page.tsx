
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Loader2,
  Database,
  Printer,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  Download,
} from 'lucide-react';
import { invoices as initialInvoices } from '@/lib/data';
import type { Invoice, Material } from '@/lib/types';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddInvoiceForm } from '@/components/add-invoice-form';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoicePdf } from '@/components/invoice-pdf';

const statusStyles = {
  paid:
    'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
  unpaid:
    'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
  overdue:
    'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [nextInvoiceId, setNextInvoiceId] = useLocalStorage<number>(
    'nextInvoiceId',
    101
  );
  const [materials] = useLocalStorage<Material[]>('materials', []);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  const [invoiceToView, setInvoiceToView] = useState<Invoice | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const viewPdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleAddInvoice = (newInvoiceData: Omit<Invoice, 'id'>) => {
    const newId = String(nextInvoiceId).padStart(4, '0');
    const newInvoice: Invoice = {
      id: newId,
      ...newInvoiceData,
    };
    setInvoices((prevInvoices) => [...prevInvoices, newInvoice]);
    setNextInvoiceId((prevId) => prevId + 1);
    return newId;
  };

  const seedData = () => {
    setIsSeeding(true);
    let currentId = nextInvoiceId;
    const seededInvoices = initialInvoices.map((invoice) => {
      const newInvoice = {
        ...invoice,
        id: String(currentId).padStart(4, '0'),
      };
      currentId++;
      return newInvoice;
    });
    setInvoices(seededInvoices);
    setNextInvoiceId(currentId);
    setIsSeeding(false);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
    setInvoiceToDelete(null);
  };

  const handleUpdateStatus = (id: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice
      )
    );
  };

  const generateAndSavePdf = async (element: HTMLElement, fileName: string) => {
    if (!element) return;
    try {
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
      });
      // Use JPEG format to significantly reduce file size
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [288, 432],
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(fileName);
    } catch (error) {
      console.error('Failed to generate PDF', error);
    }
  };

  const handlePrint = async (invoice: Invoice) => {
    setInvoiceToPrint(invoice);
    setIsPrinting(true);
    setTimeout(async () => {
      if (pdfRef.current) {
        await generateAndSavePdf(pdfRef.current, `invoice-${invoice.id}.pdf`);
      }
      setIsPrinting(false);
      setInvoiceToPrint(null);
    }, 100);
  };

  const handleDownloadFromView = async () => {
    if (invoiceToView && viewPdfRef.current) {
      setIsPrinting(true);
      await generateAndSavePdf(
        viewPdfRef.current,
        `invoice-${invoiceToView.id}.pdf`
      );
      setIsPrinting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <div className="flex items-center space-x-2">
            <AddInvoiceForm
              onAddInvoice={handleAddInvoice}
              materials={materials}
            />
          </div>
        </div>

        {invoices.length === 0 ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>No Invoices Found</CardTitle>
              <CardDescription>
                Your invoice list is empty. You can add a new invoice or load
                sample data to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={seedData} disabled={isSeeding}>
                {isSeeding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                Load Sample Invoices
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>
                View, track, and manage all your customer invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.id}
                      </TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        {Array.isArray(invoice.items) &&
                          invoice.items.map((item) => item.description).join(', ')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.date), 'MM/dd/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[invoice.status]}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setInvoiceToView(invoice)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePrint(invoice)}
                              disabled={isPrinting}
                            >
                              <Printer className="mr-2 h-4 w-4" />
                              {isPrinting && invoiceToPrint?.id === invoice.id
                                ? 'Downloading...'
                                : 'Download'}
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <span>Update Status</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(invoice.id, 'paid')
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    <span>Paid</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(invoice.id, 'unpaid')
                                    }
                                  >
                                    <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                    <span>Unpaid</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(invoice.id, 'overdue')
                                    }
                                  >
                                    <Clock className="mr-2 h-4 w-4 text-red-500" />
                                    <span>Overdue</span>
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => setInvoiceToDelete(invoice.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog
        open={!!invoiceToDelete}
        onOpenChange={(open) => !open && setInvoiceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice {invoiceToDelete} and remove its data from your browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDeleteInvoice(invoiceToDelete!)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!invoiceToView}
        onOpenChange={(open) => !open && setInvoiceToView(null)}
      >
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Invoice Preview: {invoiceToView?.id}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 p-4">
            <div className="mx-auto" style={{ width: '1152px', transform: 'scale(0.6)', transformOrigin: 'top center' }}>
              <div ref={viewPdfRef}>
                {invoiceToView && <InvoicePdf invoice={invoiceToView} />}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceToView(null)}>
              Close
            </Button>
            <Button onClick={handleDownloadFromView} disabled={isPrinting}>
              {isPrinting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div
        className="absolute -left-[9999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div ref={pdfRef}>
          {invoiceToPrint && <InvoicePdf invoice={invoiceToPrint} />}
        </div>
      </div>
    </>
  );
}
