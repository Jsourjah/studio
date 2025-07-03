
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
import { Loader2, Database } from 'lucide-react';
import { initialMaterials } from '@/lib/data';
import type { Material } from '@/lib/types';
import { AddMaterialForm } from '@/components/add-material-form';

// Function to generate a simple unique ID
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useLocalStorage<Material[]>('materials', []);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleAddMaterial = (newMaterialData: Omit<Material, 'id'>) => {
    const newMaterial: Material = {
      id: generateUniqueId(),
      ...newMaterialData,
    };
    setMaterials(prevMaterials => [...prevMaterials, newMaterial]);
  };
  
  const seedData = () => {
    setIsSeeding(true);
    // Add only materials that are not already present
    setMaterials(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMaterials = initialMaterials.filter(im => !existingIds.has(im.id));
        return [...prev, ...newMaterials];
    });
    setIsSeeding(false);
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
        <h2 className="text-3xl font-bold tracking-tight">Materials</h2>
        <div className="flex items-center space-x-2">
          <AddMaterialForm onAddMaterial={handleAddMaterial} />
        </div>
      </div>

      {materials.length === 0 ? (
         <Card className="mt-6">
          <CardHeader>
            <CardTitle>No Materials Found</CardTitle>
            <CardDescription>
              Your materials list is empty. You can add a new one or load
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
              Load Sample Materials
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Materials Inventory</CardTitle>
            <CardDescription>
              Manage your raw materials and stock levels.
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
                    <TableCell className="font-medium truncate max-w-[100px]">{material.id.substring(0, 8).toUpperCase()}</TableCell>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.quantity}</TableCell>
                    <TableCell className="text-right">
                      Rs.{material.costPerUnit.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rs.{(material.quantity * material.costPerUnit).toFixed(2)}
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
