
import type { Invoice, InvoiceItem, Material, ProductBundle } from './types';

/**
 * Calculates the total cost of goods for a single invoice.
 * @param invoice The invoice to calculate the cost for.
 * @param materials The complete list of available materials.
 *  @param productBundles The complete list of available product bundles.
 * @returns The total cost of all items in the invoice.
 */
export function getCostOfInvoice(invoice: Invoice, materials: Material[], productBundles: ProductBundle[]): number {
    if (!invoice || !Array.isArray(invoice.items)) return 0;
    
    return invoice.items.reduce((invoiceCost, item) => {
        return invoiceCost + getCostOfInvoiceItem(item, materials, productBundles) * item.quantity;
    }, 0);
};

/**
 * Calculates the cost basis for a single invoice item.
 * @param item The invoice item to calculate the cost for.
 * @param materials The complete list of available materials.
 * @param productBundles The complete list of available product bundles.
 * @returns The cost of the single item (not multiplied by quantity).
 */
export function getCostOfInvoiceItem(item: InvoiceItem, materials: Material[], productBundles: ProductBundle[]): number {
    // If it's a product bundle, calculate sum of its material costs
    if (item.productBundleId) {
      const bundle = productBundles.find(b => b.id === item.productBundleId);
      if (bundle) {
        // Find the cost of each material in the bundle and sum it up
        return bundle.items.reduce((acc, bundleItem) => {
          const material = materials.find(m => m.id === bundleItem.materialId);
          // The cost for this part of the bundle is material cost * quantity in bundle
          const itemCost = material ? material.costPerUnit * bundleItem.quantity : 0;
          return acc + itemCost;
        }, 0);
      }
    } 
    
    // If it's a single material, find its cost per unit
    else if (item.materialId) {
      const material = materials.find(m => m.id === item.materialId);
      return material?.costPerUnit || 0;
    }

    // If it's a custom item with no ID, it has no cost
    return 0;
}
