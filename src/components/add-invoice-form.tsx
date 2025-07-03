
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Printer, Loader2, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Invoice, Material, InvoiceItem, ProductBundle } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { InvoicePdf } from '@/components/invoice-pdf';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  price: z.coerce.number().min(0, 'Price must be a non-negative number.'),
  materialId: z.string().optional(),
  productBundleId: z.string().optional(),
});

const invoiceSchema = z.object({
  date: z.date({
    required_error: 'A date is required.',
  }),
  customer: z.string().min(1, 'Customer name is required.'),
  address: z.string().optional(),
  phone: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required.'),
  status: z.enum(['paid', 'unpaid', 'overdue']),
});

type AddInvoiceFormProps = {
  onAddInvoice: (newInvoice: Omit<Invoice, 'id'>) => string;
  materials: Material[];
  productBundles: ProductBundle[];
};

export function AddInvoiceForm({ onAddInvoice, materials, productBundles }: AddInvoiceFormProps) {
  const [open, setOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      date: new Date(),
      customer: '',
      address: '',
      phone: '',
      items: [{ description: '', quantity: 1, price: 0 }],
      status: 'unpaid',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchedItems = form.watch('items');
  const totalAmount = watchedItems.reduce((acc, current) => {
    const quantity = current.quantity || 0;
    const price = current.price || 0;
    return acc + (quantity * price);
  }, 0);


  const generatePdf = async () => {
    if (!invoiceToPrint || !pdfRef.current) return;
    setIsPrinting(true);
    
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 4,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [288, 432],
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`invoice-${invoiceToPrint.id}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setIsPrinting(false);
      setInvoiceToPrint(null);
      form.reset({
        date: new Date(),
        customer: '',
        address: '',
        phone: '',
        items: [{ description: '', quantity: 1, price: 0 }],
        status: 'unpaid',
      });
      setOpen(false);
    }
  };

  useEffect(() => {
    if (invoiceToPrint) {
      const timer = setTimeout(() => {
        generatePdf();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [invoiceToPrint]);


  function onSubmit(values: z.infer<typeof invoiceSchema>) {
    const amount = values.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const newId = onAddInvoice({
      ...values,
      date: values.date.toISOString(),
      amount,
    });

    const newInvoice: Invoice = {
      id: newId,
      ...values,
      date: values.date.toISOString(),
      amount,
    };
    
    setInvoiceToPrint(newInvoice);
  }

  const handleMaterialClick = (material: Material) => {
    append({ 
        description: material.name, 
        quantity: 1, 
        price: material.costPerUnit,
        materialId: material.id,
    });
  };

  const handleBundleClick = (bundle: ProductBundle) => {
    append({
      description: bundle.name,
      quantity: 1,
      price: bundle.price,
      productBundleId: bundle.id,
    });
  };
  
  const getItemCost = (item: InvoiceItem) => {
    // If it's a product bundle, calculate sum of its material costs
    if (item.productBundleId) {
      const bundle = productBundles.find(b => b.id === item.productBundleId);
      if (bundle) {
        // Find the cost of each material in the bundle and sum it up
        const totalCost = bundle.items.reduce((acc, bundleItem) => {
          const material = materials.find(m => m.id === bundleItem.materialId);
          // The cost for this part of the bundle is material cost * quantity in bundle
          const itemCost = material ? material.costPerUnit * bundleItem.quantity : 0;
          return acc + itemCost;
        }, 0);
        return totalCost;
      }
    } 
    
    // If it's a single material, find its cost per unit
    else if (item.materialId) {
      const material = materials.find(m => m.id === item.materialId);
      return material?.costPerUnit || 0;
    }

    // If it's a custom item with no ID, it has no cost
    return 0;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isPrinting && setOpen(isOpen)}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Invoice
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl bg-card">
          <DialogHeader>
            <DialogTitle>Add New Invoice</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new invoice.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="e.g. 555-123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. 123 Main St, Anytown USA"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                 <FormLabel>Items / Services</FormLabel>
                 {productBundles && productBundles.length > 0 && (
                      <div className="pt-1">
                        <p className="text-xs text-muted-foreground mb-2">
                          Click to add a Product:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {productBundles.map((bundle) => (
                            <Badge
                              key={bundle.id}
                              variant="default"
                              className="cursor-pointer"
                              onClick={() => handleBundleClick(bundle)}
                            >
                              {bundle.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                 {materials && materials.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">
                          Click to add a Material:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {materials.map((material) => (
                            <Badge
                              key={material.id}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => handleMaterialClick(material)}
                            >
                              {material.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
              </div>
              
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-x-2 gap-y-4 items-start p-3 border rounded-md relative">
                     <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="col-span-12 md:col-span-3">
                            <FormLabel className={cn(index !== 0 && "sr-only")}>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Item or service description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                           <FormItem className="col-span-6 md:col-span-2">
                            <FormLabel className={cn(index !== 0 && "sr-only")}>Qty</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <FormItem className="col-span-6 md:col-span-2">
                      <FormLabel className={cn(index !== 0 && "sr-only")}>Cost</FormLabel>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                        {`Rs. ${getItemCost(watchedItems[index] as InvoiceItem).toFixed(2)}`}
                      </div>
                    </FormItem>
                       <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                           <FormItem className="col-span-6 md:col-span-2">
                            <FormLabel className={cn(index !== 0 && "sr-only")}>Price</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <FormItem className="col-span-6 md:col-span-2">
                      <FormLabel className={cn(index !== 0 && "sr-only")}>Total</FormLabel>
                      <div className="flex h-10 w-full items-center justify-end rounded-md px-3 py-2 text-sm font-medium">
                         Rs.{((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.price || 0)).toFixed(2)}
                      </div>
                    </FormItem>
                    <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                       <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: "", quantity: 1, price: 0 })}>
                    Add Item
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Invoice Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4 sticky bottom-0 bg-card pb-2">
                <div className="flex items-center justify-between w-full">
                    <div className="text-xl font-bold">
                        Total: Rs.{totalAmount.toFixed(2)}
                    </div>
                    <Button type="submit" disabled={isPrinting}>
                      {isPrinting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Printer className="mr-2 h-4 w-4" />
                      )}
                      Save and Print
                    </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <div className="absolute -left-[9999px] top-0 opacity-0" aria-hidden="true">
        <div ref={pdfRef}>
          {invoiceToPrint && <InvoicePdf invoice={invoiceToPrint} />}
        </div>
      </div>
    </>
  );
}
