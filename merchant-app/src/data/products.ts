export type Product = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  priceNgn: number;
  stock: number;
  distributorId: string;
  priceShiftedRecently?: boolean;
  manufacturerSubsidyNgn?: number;
  manufacturerName?: string;
};

export const products: Product[] = [
  {
    id: 'dg-sug-50',
    name: 'Dangote Sugar',
    sku: 'DG-SUG-50',
    unit: '50kg Bag',
    priceNgn: 85000,
    stock: 140,
    distributorId: 'emeka-foods',
    priceShiftedRecently: true,
  },
  {
    id: 'ml-20',
    name: 'Milo Refill',
    sku: 'ML-REF-20',
    unit: '20 sachets/case',
    priceNgn: 12400,
    stock: 86,
    distributorId: 'emeka-foods',
    manufacturerSubsidyNgn: 500,
    manufacturerName: 'Nestlé',
  },
  {
    id: 'dg-rice-25',
    name: 'Dangote Rice',
    sku: 'DG-RICE-25',
    unit: '25kg Bag',
    priceNgn: 42000,
    stock: 52,
    distributorId: 'balogun-wholesale',
  },
  {
    id: 'cn-oil-4',
    name: 'Devon King Vegetable Oil',
    sku: 'DK-OIL-4L',
    unit: '4L Jerrycan',
    priceNgn: 9800,
    stock: 210,
    distributorId: 'mushin-depot',
    priceShiftedRecently: true,
  },
  {
    id: 'ind-50',
    name: 'Indomie Chicken',
    sku: 'IND-CH-50',
    unit: 'Carton (50 packs)',
    priceNgn: 18500,
    stock: 34,
    distributorId: 'mushin-depot',
    manufacturerSubsidyNgn: 300,
    manufacturerName: 'Dufil',
  },
  {
    id: 'peak-48',
    name: 'Peak Evaporated Milk',
    sku: 'PK-EV-48',
    unit: '48 tins/case',
    priceNgn: 35600,
    stock: 18,
    distributorId: 'idumota-traders',
  },
  {
    id: 'golden-penny-50',
    name: 'Golden Penny Semolina',
    sku: 'GP-SEM-50',
    unit: '50kg Bag',
    priceNgn: 38000,
    stock: 45,
    distributorId: 'alaba-supply',
  },
];

export function productsForDistributor(distributorId: string): Product[] {
  return products.filter((p) => p.distributorId === distributorId);
}
