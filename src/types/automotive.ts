// Automotive-specific types for the inventory system

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  vehicleType: 'two_wheeler' | 'four_wheeler';
  totalParts: number;
  totalVehicles: number;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleModel {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  vehicleType: 'two_wheeler' | 'four_wheeler';
  yearFrom: number;
  yearTo: number;
  variants: string[]; // e.g., ['STD', 'Disc', 'BS6', 'FI']
  image?: string;
  totalParts: number;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutoPart {
  id: string;
  name: string;
  sku: string;
  brandPartNumber?: string;
  category: 'local' | 'original';
  vehicleType: 'two_wheeler' | 'four_wheeler';
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  modelYear?: number;
  variant?: string;
  price: number;
  mrp: number;
  stock: number;
  supplierId?: string;
  supplierName?: string;
  image?: string;
  description?: string;
  inStock: boolean;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  workspaceId?: string;
  createdAt: string;
}

export type VehicleTypeFilter = 'two_wheeler' | 'four_wheeler' | 'all';
export type CategoryFilter = 'local' | 'original' | 'all';

export interface PartFilters {
  category: CategoryFilter;
  vehicleType: VehicleTypeFilter;
  modelYear?: number;
  variant?: string;
  supplier?: string;
  priceMin?: number;
  priceMax?: number;
  inStockOnly: boolean;
  searchQuery: string;
}
