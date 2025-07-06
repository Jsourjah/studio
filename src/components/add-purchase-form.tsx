
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import type { Purchase } from '@/lib/types';

const purchaseItemSchema = z.object({
  materialName: z.string().min(1, 'Material name is required.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  costPerUnit: z.coerce.number().positive('Cost must be a positive number.'),
});

const purchaseSchema = z.object({
  supplier: z.string().min(1, 'Supplier name is required.'),
  date: z.date({
    required_error: 'A date is required.',
  }),
  status: z.enum(['pending', 'completed', 'cancelled']),
  items: z.array(purchaseItemSchema).min(1, 'At least one material is required.'),
});

type AddPurchaseFormProps = {
  onAddPurchase: (newPurchase: Omit<Purchase, 'id' | 'totalAmount'>) => Promise<void>;
};

export function AddPurchaseForm({ onAddPurchase }: AddPurchaseFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplier: '',
      date: new Date(),
      status: 'pending',
      items: [{ materialName: '', quantity: 1, costPerUnit: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchedItems = form.watch('items');
  const totalAmount = watchedItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.costPerUnit || 0), 0);

  async function onSubmit(values: z.infer<typeof purchaseSchema>) {
    const purchaseData = {
      ...values,
      date: values.date.toISOString(),
    };
    await onAddPurchase(purchaseData);
    form.reset({
      supplier: '',
      date: new Date(),
      status: 'pending',
      items: [{ materialName: '', quantity: 1, costPerUnit: 0 }],
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Purchase
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Purchase</DialogTitle>
          <DialogDescription>
            Record a new material purchase. Completed purchases will automatically update your inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Steel Supply Co." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Purchase Date</FormLabel>
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
            </div>
            
            <div className="space-y-2">
              <FormLabel>Purchased Materials</FormLabel>
              <div className="space-y-2">
                {fields.map((field, index) => (
                   <div key={field.id} className="grid grid-cols-12 gap-x-2 gap-y-4 items-start p-3 border rounded-md relative">
                      <FormField
                          control={form.control}
                          name={`items.${index}.materialName`}
                          render={({ field }) => (
                            <FormItem className="col-span-12 md:col-span-5">
                              <FormLabel className={cn(index !== 0 && "sr-only")}>Material Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter material name..." {...field} />
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
                              <FormLabel className={cn(index !== 0 && "sr-only")}>Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Qty" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      <FormField
                          control={form.control}
                          name={`items.${index}.costPerUnit`}
                          render={({ field }) => (
                            <FormItem className="col-span-6 md:col-span-2">
                              <FormLabel className={cn(index !== 0 && "sr-only")}>Cost/Unit</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="Cost" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      <div className="col-span-10 md:col-span-2 flex items-end">
                        <p className="text-sm font-medium w-full text-right">
                          Rs.{((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.costPerUnit || 0)).toFixed(2)}
                        </p>
                      </div>
                       <div className="col-span-2 md:col-span-1 flex items-end justify-end">
                         <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ materialName: '', quantity: 1, costPerUnit: 0 })}>
                    Add Material
                </Button>
              </div>
            </div>

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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 sticky bottom-0 bg-card pb-2">
              <div className="flex items-center justify-between w-full">
                  <div className="text-xl font-bold">
                      Total: Rs.{totalAmount.toFixed(2)}
                  </div>
                  <Button type="submit">
                    Add Purchase
                  </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
