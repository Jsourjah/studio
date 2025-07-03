
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';

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
import type { Material } from '@/lib/types';

const materialSchema = z.object({
  name: z.string().min(1, 'Material name is required.'),
  quantity: z.coerce.number().min(0, 'Quantity must be zero or more.'),
  costPerUnit: z.coerce.number().positive('Cost must be a positive number.'),
});

type AddMaterialFormProps = {
  onAddMaterial: (newMaterial: Omit<Material, 'id'>) => void;
  onUpdateMaterial: (updatedMaterial: Material) => void;
  materialToEdit: Material | null;
  setMaterialToEdit: (material: Material | null) => void;
};

export function AddMaterialForm({ onAddMaterial, onUpdateMaterial, materialToEdit, setMaterialToEdit }: AddMaterialFormProps) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!materialToEdit;

  const form = useForm<z.infer<typeof materialSchema>>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      quantity: 0,
      costPerUnit: 0,
    },
  });

  useEffect(() => {
    if (materialToEdit) {
      form.reset(materialToEdit);
      setOpen(true);
    } else {
      form.reset({ name: '', quantity: 0, costPerUnit: 0 });
    }
  }, [materialToEdit, form.reset]);

  function onSubmit(values: z.infer<typeof materialSchema>) {
    if (isEditMode && materialToEdit) {
      onUpdateMaterial({ ...values, id: materialToEdit.id });
    } else {
      onAddMaterial(values);
    }
    setOpen(false);
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setMaterialToEdit(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Material
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Material' : 'Add New Material'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update the details for this material.' 
              : 'Fill in the details below to add a new raw material.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Steel Beams" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity in Stock</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost per Unit</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 50.00" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">
                {isEditMode ? 'Save Changes' : 'Add Material'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
