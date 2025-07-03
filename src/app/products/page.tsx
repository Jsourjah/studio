
'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
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
import { Loader2, Database, Plus } from 'lucide-react';
import { initialProductBundles, initialMaterials } from '@/lib/data';
import type { ProductBundle, Material } from '@/lib/types';
import { AddProductForm } from '@/components/add-product-form';
import { Badge } from '@/components/ui/badge';

// Function to generate a simple unique ID
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export default function ProductsPage() {
  const [productBundles, setProductBundles] = useLocalStorage<ProductBundle[]>('productBundles', []);
  const [materials] = useLocalStorage<Material[]>('materials', []);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleAddProduct = (newProductData: Omit<ProductBundle, 'id'>) => {
    const newProduct: ProductBundle = {
      id: generateUniqueId(),
      ...newProductData,
    };
    setProductBundles(prev => [...prev, newProduct]);
  };
  
  const seedData = () => {
    setIsSeeding(true);
    setProductBundles(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newBundles = initialProductBundles.filter(ib => !existingIds.has(ib.id));
      return [...prev, ...newBundles];
    });
    setIsSeeding(false);
  };
  
  const getMaterialName = (id: string) => {
    return materials.find(m => m.id === id)?.name || 'Unknown Material';
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <AddProductForm onAddProduct={handleAddProduct} materials={materials} />
        </div>
      </div>

      {productBundles.length === 0 ? (
         <Card className="mt-6">
          <CardHeader>
            <CardTitle>No Products Found</CardTitle>
            <CardDescription>
              Your product list is empty. A product is a bundle of materials you can sell as a single item.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={seedData} disabled={isSeeding}>
              {isSeeding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
              )}
              Load Sample Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Product & Service List</CardTitle>
            <CardDescription>
              Manage your products, which are bundles of materials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productBundles.map((bundle) => (
                    <TableRow key={bundle.id}>
                        <TableCell className="font-medium">{bundle.name}</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {bundle.items.map((item, index) => (
                                    <Badge key={index} variant="outline">
                                        {item.quantity}x {getMaterialName(item.materialId)}
                                    </Badge>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                            Rs.{bundle.price.toFixed(2)}
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
