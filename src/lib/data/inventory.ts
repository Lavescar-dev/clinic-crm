import type { InventoryItem } from '$types';
import { nanoid } from 'nanoid';

function getRandomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

// Turkish medication and medical supplies
const medications = [
	{
		name: 'Paracetamol 500mg Tablet',
		manufacturer: 'Atabay',
		sku: 'MED-PAR-500',
		unit: 'Kutu',
		unitPrice: 12.5
	},
	{
		name: 'İbuprofen 400mg Tablet',
		manufacturer: 'Sanovel',
		sku: 'MED-IBU-400',
		unit: 'Kutu',
		unitPrice: 18.75
	},
	{
		name: 'Amoksisilin 1000mg Tablet',
		manufacturer: 'Bilim İlaç',
		sku: 'MED-AMO-1000',
		unit: 'Kutu',
		unitPrice: 45.0
	},
	{
		name: 'Omeprazol 20mg Kapsül',
		manufacturer: 'Abdi İbrahim',
		sku: 'MED-OME-20',
		unit: 'Kutu',
		unitPrice: 28.5
	},
	{
		name: 'Metformin 850mg Tablet',
		manufacturer: 'Eczacıbaşı',
		sku: 'MED-MET-850',
		unit: 'Kutu',
		unitPrice: 32.0
	},
	{
		name: 'Ramipril 5mg Tablet',
		manufacturer: 'Deva',
		sku: 'MED-RAM-5',
		unit: 'Kutu',
		unitPrice: 38.5
	},
	{
		name: 'Atorvastatin 20mg Tablet',
		manufacturer: 'Pfizer',
		sku: 'MED-ATO-20',
		unit: 'Kutu',
		unitPrice: 55.0
	},
	{
		name: 'Sertralin 50mg Tablet',
		manufacturer: 'Zentiva',
		sku: 'MED-SER-50',
		unit: 'Kutu',
		unitPrice: 42.0
	},
	{
		name: 'Levotiroksin 100mcg Tablet',
		manufacturer: 'Abdi İbrahim',
		sku: 'MED-LEV-100',
		unit: 'Kutu',
		unitPrice: 24.5
	},
	{
		name: 'Salbutamol İnhaler',
		manufacturer: 'GlaxoSmithKline',
		sku: 'MED-SAL-INH',
		unit: 'Adet',
		unitPrice: 85.0
	},
	{
		name: 'Pantoprazol 40mg Tablet',
		manufacturer: 'Sanovel',
		sku: 'MED-PAN-40',
		unit: 'Kutu',
		unitPrice: 35.5
	},
	{
		name: 'Cetirizin 10mg Tablet',
		manufacturer: 'Sandoz',
		sku: 'MED-CET-10',
		unit: 'Kutu',
		unitPrice: 22.0
	},
	{
		name: 'Losartan 50mg Tablet',
		manufacturer: 'İbrahim Ethem Ulagay',
		sku: 'MED-LOS-50',
		unit: 'Kutu',
		unitPrice: 41.0
	},
	{
		name: 'Vitamin D3 1000 IU',
		manufacturer: 'Novartis',
		sku: 'MED-VIT-D3',
		unit: 'Kutu',
		unitPrice: 28.0
	},
	{
		name: 'Vitamin B12 1000mcg',
		manufacturer: 'Deva',
		sku: 'MED-VIT-B12',
		unit: 'Ampul',
		unitPrice: 35.0
	},
	{
		name: 'Aspirin 100mg Tablet',
		manufacturer: 'Bayer',
		sku: 'MED-ASP-100',
		unit: 'Kutu',
		unitPrice: 15.5
	},
	{
		name: 'Diklofenak Sodyum 50mg',
		manufacturer: 'Koçak Farma',
		sku: 'MED-DIC-50',
		unit: 'Kutu',
		unitPrice: 26.5
	},
	{
		name: 'Flukonazol 150mg Kapsül',
		manufacturer: 'Pfizer',
		sku: 'MED-FLU-150',
		unit: 'Kutu',
		unitPrice: 48.0
	}
];

const equipment = [
	{
		name: 'Dijital Tansiyon Aleti',
		manufacturer: 'Omron',
		sku: 'EQP-TAN-001',
		unit: 'Adet',
		unitPrice: 850.0
	},
	{
		name: 'Pulse Oksimetre',
		manufacturer: 'Beurer',
		sku: 'EQP-OKS-001',
		unit: 'Adet',
		unitPrice: 320.0
	},
	{
		name: 'Stetoskop',
		manufacturer: 'Littmann',
		sku: 'EQP-STE-001',
		unit: 'Adet',
		unitPrice: 1250.0
	},
	{
		name: 'Klinik Termometre Dijital',
		manufacturer: 'Braun',
		sku: 'EQP-TER-001',
		unit: 'Adet',
		unitPrice: 185.0
	},
	{
		name: 'Otoskop',
		manufacturer: 'Heine',
		sku: 'EQP-OTO-001',
		unit: 'Adet',
		unitPrice: 2400.0
	},
	{
		name: 'Glukoz Ölçüm Cihazı',
		manufacturer: 'Accu-Chek',
		sku: 'EQP-GLU-001',
		unit: 'Adet',
		unitPrice: 280.0
	},
	{
		name: 'Nebulizatör',
		manufacturer: 'Microlife',
		sku: 'EQP-NEB-001',
		unit: 'Adet',
		unitPrice: 450.0
	},
	{
		name: 'EKG Cihazı',
		manufacturer: 'Schiller',
		sku: 'EQP-EKG-001',
		unit: 'Adet',
		unitPrice: 18500.0
	},
	{
		name: 'Muayene Masası',
		manufacturer: 'Mespa',
		sku: 'EQP-MUA-001',
		unit: 'Adet',
		unitPrice: 3200.0
	},
	{
		name: 'Muayene Lambası',
		manufacturer: 'Derungs',
		sku: 'EQP-LAM-001',
		unit: 'Adet',
		unitPrice: 1850.0
	}
];

const consumables = [
	{
		name: 'Tek Kullanımlık Eldiven (M)',
		manufacturer: 'Medline',
		sku: 'CON-ELD-M',
		unit: 'Kutu (100 Adet)',
		unitPrice: 45.0
	},
	{
		name: 'Tek Kullanımlık Eldiven (L)',
		manufacturer: 'Medline',
		sku: 'CON-ELD-L',
		unit: 'Kutu (100 Adet)',
		unitPrice: 45.0
	},
	{
		name: 'Cerrahi Maske',
		manufacturer: 'Anadolu',
		sku: 'CON-MSK-001',
		unit: 'Kutu (50 Adet)',
		unitPrice: 25.0
	},
	{
		name: 'N95 Maske',
		manufacturer: '3M',
		sku: 'CON-N95-001',
		unit: 'Kutu (20 Adet)',
		unitPrice: 85.0
	},
	{
		name: 'Enjektör 5ml',
		manufacturer: 'BD',
		sku: 'CON-ENJ-5',
		unit: 'Kutu (100 Adet)',
		unitPrice: 65.0
	},
	{
		name: 'Enjektör 10ml',
		manufacturer: 'BD',
		sku: 'CON-ENJ-10',
		unit: 'Kutu (100 Adet)',
		unitPrice: 78.0
	},
	{
		name: 'İğne 21G',
		manufacturer: 'Nipro',
		sku: 'CON-IGN-21',
		unit: 'Kutu (100 Adet)',
		unitPrice: 32.0
	},
	{
		name: 'Alkol Swap',
		manufacturer: 'Bbraun',
		sku: 'CON-ALC-001',
		unit: 'Kutu (200 Adet)',
		unitPrice: 28.0
	},
	{
		name: 'Steril Gazlı Bez',
		manufacturer: 'Bbraun',
		sku: 'CON-GAZ-001',
		unit: 'Paket (10 Adet)',
		unitPrice: 12.5
	},
	{
		name: 'Micropore Bant',
		manufacturer: '3M',
		sku: 'CON-BAN-001',
		unit: 'Adet',
		unitPrice: 8.5
	},
	{
		name: 'Elastik Bandaj',
		manufacturer: 'Fabrikatek',
		sku: 'CON-ELA-001',
		unit: 'Adet',
		unitPrice: 15.0
	},
	{
		name: 'Damar Yolu Kateteri',
		manufacturer: 'BD',
		sku: 'CON-DVK-001',
		unit: 'Kutu (50 Adet)',
		unitPrice: 125.0
	},
	{
		name: 'Serum Seti',
		manufacturer: 'Bbraun',
		sku: 'CON-SER-001',
		unit: 'Kutu (50 Adet)',
		unitPrice: 95.0
	},
	{
		name: 'Oksijen Maskesi',
		manufacturer: 'Medline',
		sku: 'CON-OKS-001',
		unit: 'Kutu (50 Adet)',
		unitPrice: 75.0
	},
	{
		name: 'İdrar Torbası',
		manufacturer: 'Bbraun',
		sku: 'CON-IDR-001',
		unit: 'Kutu (20 Adet)',
		unitPrice: 85.0
	},
	{
		name: 'Steril Eldiven No: 7',
		manufacturer: 'Ansell',
		sku: 'CON-STR-7',
		unit: 'Kutu (50 Çift)',
		unitPrice: 185.0
	},
	{
		name: 'Sutura İpliği',
		manufacturer: 'Ethicon',
		sku: 'CON-SUT-001',
		unit: 'Kutu (12 Adet)',
		unitPrice: 240.0
	},
	{
		name: 'Bisturi No: 11',
		manufacturer: 'Swann-Morton',
		sku: 'CON-BIS-11',
		unit: 'Kutu (100 Adet)',
		unitPrice: 95.0
	}
];

// Location options
const locations = [
	'İlaç Dolabı 1',
	'İlaç Dolabı 2',
	'İlaç Dolabı 3',
	'Tıbbi Malzeme Deposu',
	'Muayene Odası 1',
	'Muayene Odası 2',
	'Acil Müdahale Odası',
	'Tedavi Odası',
	'Depo Ana Raf',
	'Soğuk Zincir Buzdolabı'
];

// Generate expiry dates
function generateExpiryDate(): Date | undefined {
	// 70% of medications have expiry dates
	if (Math.random() > 0.3) {
		const monthsAhead = Math.floor(Math.random() * 36) + 3; // 3 to 39 months
		const expiryDate = new Date();
		expiryDate.setMonth(expiryDate.getMonth() + monthsAhead);
		return expiryDate;
	}
	return undefined;
}

// Determine stock status
function determineStatus(
	currentStock: number,
	minStockLevel: number,
	expiryDate: Date | undefined
): 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' {
	// Check if expired
	if (expiryDate && expiryDate < new Date()) {
		return 'expired';
	}

	// Check stock level
	if (currentStock === 0) {
		return 'out-of-stock';
	} else if (currentStock <= minStockLevel) {
		return 'low-stock';
	}

	return 'in-stock';
}

// Create 45+ inventory items
export const mockInventoryItems: InventoryItem[] = [];

// Add medications (18 items)
medications.forEach((med) => {
	const minStock = Math.floor(Math.random() * 15) + 5; // 5-20
	const maxStock = minStock * 4; // 4x min stock

	// Some items are low stock or out of stock
	let currentStock: number;
	const stockRand = Math.random();
	if (stockRand < 0.1) {
		currentStock = 0; // Out of stock
	} else if (stockRand < 0.25) {
		currentStock = Math.floor(Math.random() * minStock); // Low stock
	} else {
		currentStock = Math.floor(Math.random() * (maxStock - minStock)) + minStock; // Normal stock
	}

	const expiryDate = generateExpiryDate();
	const status = determineStatus(currentStock, minStock, expiryDate);

	const item: InventoryItem = {
		id: nanoid(),
		name: med.name,
		category: 'medication',
		sku: med.sku,
		barcode: `${8690000000000 + Math.floor(Math.random() * 999999999)}`,
		description: `${med.manufacturer} tarafından üretilen ${med.name}`,
		manufacturer: med.manufacturer,
		currentStock,
		minStockLevel: minStock,
		maxStockLevel: maxStock,
		unit: med.unit,
		unitPrice: med.unitPrice,
		expiryDate,
		status,
		location: getRandomItem(locations.filter((l) => l.includes('İlaç') || l.includes('Soğuk'))),
		notes:
			status === 'low-stock'
				? 'Acil sipariş gerekiyor'
				: status === 'expired'
					? 'İmha edilmeli'
					: expiryDate && expiryDate < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
						? 'Son kullanma tarihi yaklaşıyor'
						: undefined,
		createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
		updatedAt: new Date()
	};

	mockInventoryItems.push(item);
});

// Add equipment (10 items)
equipment.forEach((equip) => {
	const minStock = Math.floor(Math.random() * 3) + 1; // 1-3
	const maxStock = minStock * 3; // 3x min stock

	let currentStock: number;
	const stockRand = Math.random();
	if (stockRand < 0.05) {
		currentStock = 0;
	} else if (stockRand < 0.15) {
		currentStock = Math.floor(Math.random() * minStock);
	} else {
		currentStock = Math.floor(Math.random() * (maxStock - minStock)) + minStock;
	}

	const status = determineStatus(currentStock, minStock, undefined);

	const item: InventoryItem = {
		id: nanoid(),
		name: equip.name,
		category: 'equipment',
		sku: equip.sku,
		barcode: `${8690000000000 + Math.floor(Math.random() * 999999999)}`,
		description: `${equip.manufacturer} marka ${equip.name}`,
		manufacturer: equip.manufacturer,
		currentStock,
		minStockLevel: minStock,
		maxStockLevel: maxStock,
		unit: equip.unit,
		unitPrice: equip.unitPrice,
		status,
		location: getRandomItem(
			locations.filter((l) => l.includes('Muayene') || l.includes('Tedavi') || l.includes('Depo'))
		),
		notes: status === 'low-stock' ? 'Sipariş verilmeli' : undefined,
		createdAt: new Date(Date.now() - Math.floor(Math.random() * 730) * 24 * 60 * 60 * 1000),
		updatedAt: new Date()
	};

	mockInventoryItems.push(item);
});

// Add consumables (18 items)
consumables.forEach((cons) => {
	const minStock = Math.floor(Math.random() * 20) + 10; // 10-30
	const maxStock = minStock * 5; // 5x min stock

	let currentStock: number;
	const stockRand = Math.random();
	if (stockRand < 0.08) {
		currentStock = 0;
	} else if (stockRand < 0.2) {
		currentStock = Math.floor(Math.random() * minStock);
	} else {
		currentStock = Math.floor(Math.random() * (maxStock - minStock)) + minStock;
	}

	// Some consumables have expiry dates
	const expiryDate = cons.name.includes('Eldiven') || cons.name.includes('Maske')
		? generateExpiryDate()
		: undefined;

	const status = determineStatus(currentStock, minStock, expiryDate);

	const item: InventoryItem = {
		id: nanoid(),
		name: cons.name,
		category: 'consumable',
		sku: cons.sku,
		barcode: `${8690000000000 + Math.floor(Math.random() * 999999999)}`,
		description: `${cons.manufacturer} marka ${cons.name}`,
		manufacturer: cons.manufacturer,
		currentStock,
		minStockLevel: minStock,
		maxStockLevel: maxStock,
		unit: cons.unit,
		unitPrice: cons.unitPrice,
		expiryDate,
		status,
		location: getRandomItem(locations),
		notes:
			status === 'low-stock'
				? 'Günlük kullanımda, acil temin edilmeli'
				: status === 'out-of-stock'
					? 'Stok tükendi, acil sipariş'
					: expiryDate && expiryDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
						? 'SKT yaklaşıyor, öncelikli kullanım'
						: undefined,
		createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
		updatedAt: new Date()
	};

	mockInventoryItems.push(item);
});

// Sort by status priority (out-of-stock, expired, low-stock, in-stock) then by name
mockInventoryItems.sort((a, b) => {
	const statusOrder = { 'out-of-stock': 0, expired: 1, 'low-stock': 2, 'in-stock': 3 };
	const statusCompare = statusOrder[a.status] - statusOrder[b.status];
	if (statusCompare !== 0) return statusCompare;
	return a.name.localeCompare(b.name, 'tr');
});

export default mockInventoryItems;
