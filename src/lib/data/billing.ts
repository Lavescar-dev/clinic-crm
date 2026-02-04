import type { Invoice, InvoiceItem, Payment } from '$types';
import { nanoid } from 'nanoid';
import { mockUsers } from './users';
import { mockPatients } from './patients';
import { mockAppointments } from './appointments';

function getRandomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], min: number, max: number): T[] {
	const count = Math.floor(Math.random() * (max - min + 1)) + min;
	const shuffled = [...array].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

// Turkish medical services with codes and prices
const medicalServices = [
	{ code: 'MYN-001', description: 'Dahiliye Muayenesi', unitPrice: 350, taxRate: 1 },
	{ code: 'MYN-002', description: 'Ortopedi Muayenesi', unitPrice: 400, taxRate: 1 },
	{ code: 'MYN-003', description: 'Kardiyoloji Muayenesi', unitPrice: 450, taxRate: 1 },
	{ code: 'MYN-004', description: 'Göz Muayenesi', unitPrice: 300, taxRate: 1 },
	{ code: 'MYN-005', description: 'KBB Muayenesi', unitPrice: 350, taxRate: 1 },
	{ code: 'MYN-006', description: 'Acil Muayene', unitPrice: 500, taxRate: 1 },
	{ code: 'LAB-001', description: 'Tam Kan Sayımı', unitPrice: 75, taxRate: 1 },
	{ code: 'LAB-002', description: 'Biyokimya Paneli', unitPrice: 150, taxRate: 1 },
	{ code: 'LAB-003', description: 'Lipid Profili', unitPrice: 120, taxRate: 1 },
	{ code: 'LAB-004', description: 'Tiroid Hormon Paneli', unitPrice: 200, taxRate: 1 },
	{ code: 'LAB-005', description: 'HbA1c', unitPrice: 85, taxRate: 1 },
	{ code: 'LAB-006', description: 'Tam İdrar Tetkiki', unitPrice: 50, taxRate: 1 },
	{ code: 'LAB-007', description: 'Karaciğer Fonksiyon Testleri', unitPrice: 130, taxRate: 1 },
	{ code: 'RAD-001', description: 'PA Akciğer Grafisi', unitPrice: 180, taxRate: 1 },
	{ code: 'RAD-002', description: 'Lomber MR', unitPrice: 850, taxRate: 1 },
	{ code: 'RAD-003', description: 'Batın Ultrasonografisi', unitPrice: 300, taxRate: 1 },
	{ code: 'RAD-004', description: 'Doppler USG', unitPrice: 400, taxRate: 1 },
	{ code: 'RAD-005', description: 'Ekokardiyografi', unitPrice: 550, taxRate: 1 },
	{ code: 'ISL-001', description: 'EKG', unitPrice: 100, taxRate: 1 },
	{ code: 'ISL-002', description: 'Holter EKG', unitPrice: 350, taxRate: 1 },
	{ code: 'ISL-003', description: 'Efor Testi', unitPrice: 450, taxRate: 1 },
	{ code: 'ISL-004', description: 'Spirometri', unitPrice: 150, taxRate: 1 },
	{ code: 'TED-001', description: 'Pansuman', unitPrice: 120, taxRate: 1 },
	{ code: 'TED-002', description: 'İnjeksiyon', unitPrice: 80, taxRate: 1 },
	{ code: 'TED-003', description: 'Serum Tedavisi', unitPrice: 200, taxRate: 1 },
	{ code: 'TED-004', description: 'Nebül Tedavisi', unitPrice: 90, taxRate: 1 },
	{ code: 'TED-005', description: 'Fizik Tedavi Seansı', unitPrice: 180, taxRate: 1 },
	{ code: 'TED-006', description: 'Küçük Cerrahi Müdahale', unitPrice: 600, taxRate: 1 },
	{ code: 'ILC-001', description: 'İlaç (Antibiyotik)', unitPrice: 150, taxRate: 8 },
	{ code: 'ILC-002', description: 'İlaç (Ağrı Kesici)', unitPrice: 45, taxRate: 8 },
	{ code: 'ILC-003', description: 'İlaç (Kronik Hastalık)', unitPrice: 250, taxRate: 8 },
	{ code: 'ILC-004', description: 'İlaç (Vitamin)', unitPrice: 80, taxRate: 8 },
	{ code: 'RPR-001', description: 'Sağlık Raporu', unitPrice: 200, taxRate: 18 },
	{ code: 'RPR-002', description: 'İstirahat Raporu', unitPrice: 150, taxRate: 18 }
];

const receptionists = mockUsers.filter((u) => u.role === 'receptionist' || u.role === 'admin');

// Calculate invoice totals
function calculateInvoiceTotals(items: InvoiceItem[]): {
	subtotal: number;
	taxTotal: number;
	total: number;
} {
	let subtotal = 0;
	let taxTotal = 0;

	items.forEach((item) => {
		const itemSubtotal = item.quantity * item.unitPrice;
		const itemTax = (itemSubtotal * item.taxRate) / 100;
		subtotal += itemSubtotal;
		taxTotal += itemTax;
	});

	return {
		subtotal,
		taxTotal,
		total: subtotal + taxTotal
	};
}

// Generate invoice number
function generateInvoiceNumber(date: Date): string {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const random = Math.floor(Math.random() * 9999)
		.toString()
		.padStart(4, '0');
	return `FTR${year}${month}${random}`;
}

// Create invoices for completed appointments
export const mockInvoices: Invoice[] = [];
export const mockPayments: Payment[] = [];

const completedAppointments = mockAppointments.filter(
	(a) => a.status === 'completed' && Math.random() > 0.1 // 90% of completed appointments have invoices
);

completedAppointments.forEach((appointment) => {
	const patient = mockPatients.find((p) => p.id === appointment.patientId)!;
	const doctor = mockUsers.find((u) => u.id === appointment.doctorId)!;

	// Determine number of items (1-5 services)
	const numItems = Math.floor(Math.random() * 4) + 1;

	// Consultation is always first item
	const consultationServices = medicalServices.filter((s) => s.code.startsWith('MYN'));
	let consultationService = consultationServices[0]; // Default dahiliye

	if (doctor.specialization?.includes('Ortopedi')) {
		consultationService = medicalServices.find((s) => s.code === 'MYN-002')!;
	} else if (doctor.specialization?.includes('Kardiyoloji')) {
		consultationService = medicalServices.find((s) => s.code === 'MYN-003')!;
	}

	// Build invoice items
	const items: InvoiceItem[] = [
		{
			id: nanoid(),
			serviceCode: consultationService.code,
			description: consultationService.description,
			quantity: 1,
			unitPrice: consultationService.unitPrice,
			taxRate: consultationService.taxRate as 0 | 1 | 8 | 18,
			taxAmount:
				(consultationService.unitPrice * consultationService.taxRate) / 100,
			total:
				consultationService.unitPrice +
				(consultationService.unitPrice * consultationService.taxRate) / 100
		}
	];

	// Add additional services
	const additionalServices = getRandomItems(
		medicalServices.filter((s) => !s.code.startsWith('MYN')),
		0,
		numItems - 1
	);

	additionalServices.forEach((service) => {
		const quantity = service.code.startsWith('TED') ? Math.floor(Math.random() * 3) + 1 : 1;
		const itemSubtotal = service.unitPrice * quantity;
		const taxAmount = (itemSubtotal * service.taxRate) / 100;

		items.push({
			id: nanoid(),
			serviceCode: service.code,
			description: service.description,
			quantity,
			unitPrice: service.unitPrice,
			taxRate: service.taxRate as 0 | 1 | 8 | 18,
			taxAmount,
			total: itemSubtotal + taxAmount
		});
	});

	const totals = calculateInvoiceTotals(items);

	// Determine invoice status and payment
	const statusRand = Math.random();
	let status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
	let paidAmount = 0;

	// Past invoices
	const isOld = appointment.date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	if (statusRand < 0.75) {
		status = 'paid';
		paidAmount = totals.total;
	} else if (statusRand < 0.85) {
		status = 'pending';
		// Sometimes partially paid
		if (Math.random() > 0.7 && patient.insurance.type !== 'none') {
			paidAmount = totals.total * 0.5; // Insurance covers 50%
		}
	} else if (isOld && statusRand < 0.92) {
		status = 'overdue';
	} else {
		status = 'cancelled';
	}

	const issueDate = appointment.date;
	const dueDate = new Date(issueDate.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days

	const invoice: Invoice = {
		id: nanoid(),
		invoiceNumber: generateInvoiceNumber(issueDate),
		patientId: patient.id,
		appointmentId: appointment.id,
		issueDate,
		dueDate,
		status,
		items,
		subtotal: totals.subtotal,
		taxTotal: totals.taxTotal,
		total: totals.total,
		paidAmount,
		remainingAmount: totals.total - paidAmount,
		notes:
			patient.insurance.type === 'sgk'
				? 'SGK anlaşması kapsamında'
				: patient.insurance.type === 'private'
					? `${patient.insurance.provider} özel sigorta`
					: undefined,
		createdAt: issueDate,
		updatedAt: status === 'paid' ? issueDate : new Date()
	};

	mockInvoices.push(invoice);

	// Create payments for paid/partially paid invoices
	if (paidAmount > 0) {
		// Determine payment method based on insurance and amount
		let paymentMethod: 'cash' | 'credit-card' | 'debit-card' | 'bank-transfer' | 'insurance';

		if (patient.insurance.type === 'sgk' && Math.random() > 0.3) {
			paymentMethod = 'insurance';
		} else if (patient.insurance.type === 'private' && Math.random() > 0.4) {
			paymentMethod = 'insurance';
		} else {
			const methodRand = Math.random();
			if (methodRand < 0.3) {
				paymentMethod = 'cash';
			} else if (methodRand < 0.65) {
				paymentMethod = 'credit-card';
			} else if (methodRand < 0.85) {
				paymentMethod = 'debit-card';
			} else {
				paymentMethod = 'bank-transfer';
			}
		}

		// Payment date is same day or few days after invoice
		const paymentDate = new Date(
			issueDate.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000
		);

		const payment: Payment = {
			id: nanoid(),
			invoiceId: invoice.id,
			paymentDate,
			amount: paidAmount,
			method: paymentMethod,
			referenceNumber:
				paymentMethod === 'bank-transfer' || paymentMethod === 'insurance'
					? `REF${Math.floor(Math.random() * 900000000) + 100000000}`
					: paymentMethod === 'credit-card' || paymentMethod === 'debit-card'
						? `****${Math.floor(Math.random() * 9000) + 1000}`
						: undefined,
			notes:
				paymentMethod === 'insurance'
					? `${patient.insurance.provider || 'SGK'} tarafından ödendi`
					: status === 'pending'
						? 'Kısmi ödeme alındı'
						: undefined,
			receivedBy: getRandomItem(receptionists).id,
			createdAt: paymentDate,
			updatedAt: paymentDate
		};

		mockPayments.push(payment);

		// If partially paid, sometimes add a second payment
		if (status === 'pending' && Math.random() > 0.6) {
			const remainingAmount = totals.total - paidAmount;
			const secondPaymentDate = new Date(
				paymentDate.getTime() + Math.floor(Math.random() * 10 + 1) * 24 * 60 * 60 * 1000
			);

			const secondPayment: Payment = {
				id: nanoid(),
				invoiceId: invoice.id,
				paymentDate: secondPaymentDate,
				amount: remainingAmount,
				method: Math.random() > 0.5 ? 'cash' : 'credit-card',
				notes: 'Kalan ödeme alındı',
				receivedBy: getRandomItem(receptionists).id,
				createdAt: secondPaymentDate,
				updatedAt: secondPaymentDate
			};

			mockPayments.push(secondPayment);

			// Update invoice
			invoice.paidAmount = totals.total;
			invoice.remainingAmount = 0;
			invoice.status = 'paid';
			invoice.updatedAt = secondPaymentDate;
		}
	}
});

// Sort invoices by issue date (newest first)
mockInvoices.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());

// Sort payments by payment date (newest first)
mockPayments.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());

export default { mockInvoices, mockPayments };
