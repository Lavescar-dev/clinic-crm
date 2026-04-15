import { z } from 'zod';
import type { AuditFields } from './common';

export const itemCategorySchema = z.enum(['medication', 'equipment', 'consumable', 'other']);
export type ItemCategory = z.infer<typeof itemCategorySchema>;

export const itemStatusSchema = z.enum(['in-stock', 'low-stock', 'out-of-stock', 'expired']);
export type ItemStatus = z.infer<typeof itemStatusSchema>;

export const stockMovementTypeSchema = z.enum(['purchase', 'usage', 'adjustment', 'return', 'disposal']);
export type StockMovementType = z.infer<typeof stockMovementTypeSchema>;

export const inventoryItemSchema = z.object({
	id: z.string(),
	name: z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır.'),
	category: itemCategorySchema,
	sku: z.string().optional(),
	barcode: z.string().optional(),
	description: z.string().optional(),
	manufacturer: z.string().optional(),
	currentStock: z.number().int().min(0, 'Stok miktarı sıfırdan küçük olamaz.'),
	minStockLevel: z.number().int().min(0, 'Minimum stok seviyesi sıfırdan küçük olamaz.'),
	maxStockLevel: z.number().int().min(0, 'Maksimum stok seviyesi sıfırdan küçük olamaz.'),
	unit: z.string().min(1, 'Birim gereklidir.'),
	unitPrice: z.number().positive('Birim fiyat pozitif bir sayı olmalıdır.'),
	expiryDate: z.date().optional(),
	status: itemStatusSchema.default('in-stock'),
	location: z.string().optional(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});
export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const stockMovementSchema = z.object({
	id: z.string(),
	itemId: z.string(),
	itemName: z.string().optional(), // Derived
	type: stockMovementTypeSchema,
	quantity: z.number().int().positive('Miktar pozitif bir tam sayı olmalıdır.'),
	previousStock: z.number().int(),
	newStock: z.number().int(),
	reason: z.string().optional(),
	referenceNumber: z.string().optional(),
	performedBy: z.string(), // User ID or Name
	createdAt: z.date(),
	updatedAt: z.date()
});
export type StockMovement = z.infer<typeof stockMovementSchema>;

export const createInventoryItemDtoSchema = inventoryItemSchema.omit({
	id: true,
	status: true,
	createdAt: true,
	updatedAt: true
});
export type CreateInventoryItemDto = z.infer<typeof createInventoryItemDtoSchema>;

export const updateInventoryItemDtoSchema = inventoryItemSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateInventoryItemDto = z.infer<typeof updateInventoryItemDtoSchema>;

export const createStockMovementDtoSchema = stockMovementSchema.omit({
	id: true,
	itemName: true,
	previousStock: true,
	newStock: true,
	performedBy: true,
	createdAt: true,
	updatedAt: true
});
export type CreateStockMovementDto = z.infer<typeof createStockMovementDtoSchema>;

export interface InventoryAlert {
	id: string;
	itemId: string;
	itemName: string;
	type: 'low-stock' | 'out-of-stock' | 'expiring-soon' | 'expired';
	message: string;
	severity: 'low' | 'medium' | 'high';
	createdAt: Date;
}

export interface InventoryStats {
	totalItems: number;
	lowStockItems: number;
	outOfStockItems: number;
	expiringItems: number;
	totalValue: number;
}
