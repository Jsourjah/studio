
'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Loader2, Database, MoreHorizontal, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { initialMaterials } from '@/lib/data';
import type { Material } from '@/lib/types';
import { AddMaterialForm } from '@/components/add-material-form';

export default function MaterialsPage() {
  const [materials, setMaterials] = useLocalStorage<Material[]>('materials', []);
  const [loading, setLoading] = useState(true);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);

  useEffect(() => {
    if (materials === null) {
      setMaterials(initialMaterials);
    }
    setLoading(false);
  }, []);
  
  const safeMaterials = materials || [];

  const handleUpdateMaterial = (updatedMaterial: Material) => {
    setMaterials(prev => 
      (prev || []).map(m => m.id === updatedMaterial.id ? updatedMaterial : m)
    );
    setMaterialToEdit(null);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(prev => (prev || []).filter(m => m.id !== id));
    setMaterialToDelete(null);
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
          <h2 className="text-3xl font-bold tracking-tight">Materials Inventory</h2>
           <AddMaterialForm 
              onAddMaterial={() => {}} // This is unused now
              onUpdateMaterial={handleUpdateMaterial}
              materialToEdit={materialToEdit}
              setMaterialToEdit={setMaterialToEdit}
            />
        </div>

        {safeMaterials.length === 0 ? (
           <Card className="mt-6">
            <CardHeader>
              <CardTitle>No Materials Found</CardTitle>
              <CardDescription>
                Your materials inventory is empty. Add materials by creating a new purchase on the Purchases page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/purchases">
                <Button>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Go to Purchases
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Materials Inventory</CardTitle>
              <CardDescription>
                Manage your raw materials and stock levels. New materials are added via the Purchases page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity in Stock</TableHead>
                    <TableHead className="text-right">Cost per Unit</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeMaterials.filter(Boolean).map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium truncate max-w-[100px]">{material.id}</TableCell>
                      <TableCell>{material.name}</TableCell>
                      <TableCell>{material.quantity}</TableCell>
                      <TableCell className="text-right">
                        Rs.{(material.costPerUnit || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rs.{((material.quantity || 0) * (material.costPerUnit || 0)).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setMaterialToEdit(material)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => setMaterialToDelete(material.id)}
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
        open={!!materialToDelete}
        onOpenChange={(open) => !open && setMaterialToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this material.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDeleteMaterial(materialToDelete!)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
