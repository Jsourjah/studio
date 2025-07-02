
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Printer } from 'lucide-react';

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
import type { Invoice, Material } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const invoiceSchema = z.object({
  date: z.date({
    required_error: 'A date is required.',
  }),
  customer: z.string().min(1, 'Customer name is required.'),
  address: z.string().optional(),
  phone: z.string().optional(),
  items: z.string().min(1, 'Please describe the items or services sold.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  status: z.enum(['paid', 'unpaid', 'overdue']),
});

type AddInvoiceFormProps = {
  onAddInvoice: (newInvoice: Omit<Invoice, 'id'>) => void;
  materials: Material[];
};

export function AddInvoiceForm({ onAddInvoice, materials }: AddInvoiceFormProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      date: new Date(),
      customer: '',
      address: '',
      phone: '',
      items: '',
      amount: 0,
      status: 'unpaid',
    },
  });

  function onSubmit(values: z.infer<typeof invoiceSchema>) {
    onAddInvoice({
      ...values,
      date: values.date.toISOString(),
    });
    form.reset({
      date: new Date(),
      customer: '',
      address: '',
      phone: '',
      items: '',
      amount: 0,
      status: 'unpaid',
    });
    setOpen(false);
  }

  const handleMaterialClick = (materialName: string) => {
    const currentItems = form.getValues('items');
    const newItems = currentItems
      ? `${currentItems}, ${materialName}`
      : materialName;
    form.setValue('items', newItems, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Invoice</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new invoice.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="items"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Items / Services</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. 1x Website Design, 2x Logo Concept"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  {materials && materials.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-2">
                        Click to add from your item list:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {materials.map((material) => (
                          <Badge
                            key={material.id}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleMaterialClick(material.name)}
                          >
                            {material.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 150.00" {...field} />
                    </FormControl>
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
            <DialogFooter>
              <Button type="submit">
                <Printer className="mr-2 h-4 w-4" />
                Save and Print
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
