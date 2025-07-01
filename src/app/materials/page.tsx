
'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
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
import { PlusCircle } from 'lucide-react';
import { materials as initialMaterials } from '@/lib/data';
import type { Material } from '@/lib/types';

export default function MaterialsPage() {
  const [materials] = useLocalStorage<Material[]>('materials', initialMaterials);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Materials</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Material
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Material Inventory</CardTitle>
          <CardDescription>
            Keep track of your material stock and costs.
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.id}</TableCell>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${material.costPerUnit.toFixed(2)}
                  </TableCell>
                   <TableCell className="text-right font-medium">
                    ${(material.quantity * material.costPerUnit).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
