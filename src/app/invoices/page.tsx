
'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, writeBatch, runTransaction, getDocs, query, orderBy } from 'firebase/firestore';
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
import { invoices as initialInvoices, initialMaterials, initialProductBundles } from '@/lib/data';
import type { Invoice, Material, ProductBundle } from '@/lib/types';
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

const statusStyles: { [key: string]: string } = {
  paid:
    'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
  unpaid:
    'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
  overdue:
    'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [productBundles, setProductBundles] = useState<ProductBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  const [invoiceToView, setInvoiceToView] = useState<Invoice | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const viewPdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'invoices'), orderBy('date', 'desc'));
    const unsubscribeInvoices = onSnapshot(q, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Invoice)));
      setLoading(false);
    });
    const unsubscribeMaterials = onSnapshot(collection(db, 'materials'), (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Material)));
    });
    const unsubscribeProductBundles = onSnapshot(collection(db, 'productBundles'), (snapshot) => {
      setProductBundles(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProductBundle)));
    });

    return () => {
      unsubscribeInvoices();
      unsubscribeMaterials();
      unsubscribeProductBundles();
    };
  }, []);

  const handleAddInvoice = async (newInvoiceData: Omit<Invoice, 'id'>) => {
    const counterRef = doc(db, 'counters', 'invoices');
    let newId = '';
    
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        await transaction.set(counterRef, { nextId: 101 });
      }
      const newNextId = (counterDoc.data()?.nextId || 101);
      newId = String(newNextId).padStart(4, '0');
      
      const newInvoiceRef = doc(db, 'invoices', newId);
      transaction.set(newInvoiceRef, newInvoiceData);
      transaction.update(counterRef, { nextId: newNextId + 1 });
    });

    const inventoryBatch = writeBatch(db);
    newInvoiceData.items.forEach(item => {
      if (item.productBundleId) {
        const bundle = productBundles.find(b => b.id === item.productBundleId);
        if (bundle) {
          bundle.items.forEach(bundleItem => {
            const material = materials.find(m => m.id === bundleItem.materialId);
            if (material) {
              const materialRef = doc(db, 'materials', bundleItem.materialId);
              const quantityToDeduct = bundleItem.quantity * item.quantity;
              inventoryBatch.update(materialRef, { quantity: Math.max(0, material.quantity - quantityToDeduct) });
            }
          });
        }
      } else if (item.materialId) {
        const material = materials.find(m => m.id === item.materialId);
        if (material) {
          const materialRef = doc(db, 'materials', item.materialId);
          inventoryBatch.update(materialRef, { quantity: Math.max(0, material.quantity - item.quantity) });
        }
      }
    });

    await inventoryBatch.commit();
    return newId;
  };

  const seedData = async () => {
    setIsSeeding(true);
    const invoicesCollection = collection(db, 'invoices');
    const snapshot = await getDocs(query(invoicesCollection));
    if (!snapshot.empty) {
      console.log('Invoices collection not empty, skipping seed.');
      setIsSeeding(false);
      return;
    }

    const batch = writeBatch(db);
    let nextId = 101;
    initialInvoices.forEach(invoice => {
      const newId = String(nextId).padStart(4, '0');
      const docRef = doc(db, 'invoices', newId);
      batch.set(docRef, invoice);
      nextId++;
    });

    const counterRef = doc(db, 'counters', 'invoices');
    batch.set(counterRef, { nextId });

    await batch.commit();
    setIsSeeding(false);
  };

  const handleDeleteInvoice = async (id: string) => {
    await deleteDoc(doc(db, 'invoices', id));
    setInvoiceToDelete(null);
  };

  const handleUpdateStatus = async (id: string, status: Invoice['status']) => {
    await updateDoc(doc(db, 'invoices', id), { status });
  };

  const generateAndSavePdf = async (element: HTMLElement, fileName: string) => {
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 4, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [288, 432] });
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
      await generateAndSavePdf(viewPdfRef.current, `invoice-${invoiceToView.id}.pdf`);
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

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <div className="flex items-center space-x-2">
            <AddInvoiceForm
              onAddInvoice={handleAddInvoice}
              materials={materials}
              productBundles={productBundles}
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
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.id}
                      </TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>
                        {invoice.date && !isNaN(new Date(invoice.date).getTime())
                          ? format(new Date(invoice.date), 'MM/dd/yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[invoice.status] || ''}
                        >
                          {(invoice.status || 'unknown').charAt(0).toUpperCase() +
                            (invoice.status || 'unknown').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        Rs.{(invoice.amount || 0).toFixed(2)}
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
              invoice {invoiceToDelete} and remove its data from the cloud.
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
        <DialogContent className="h-[90vh] w-[90vw] max-w-none flex flex-col">
          <DialogHeader>
            <DialogTitle>Invoice Preview: {invoiceToView?.id}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 p-4">
            <div className="mx-auto" style={{ width: '1152px' }}>
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
