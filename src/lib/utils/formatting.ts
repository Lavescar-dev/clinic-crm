export function formatPhoneNumber(phone: string): string {
	const cleaned = phone.replace(/\D/g, '');
	if (cleaned.length === 11 && cleaned.startsWith('0')) {
		return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
	}
	if (cleaned.length === 10) {
		return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
	}
	return phone;
}

export function formatTcNo(tcNo: string): string {
	const cleaned = tcNo.replace(/\D/g, '');
	if (cleaned.length === 11) {
		return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
	}
	return tcNo;
}

export function capitalizeFirst(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeWords(str: string): string {
	return str
		.split(' ')
		.map((word) => capitalizeFirst(word))
		.join(' ');
}

export function truncate(str: string, length: number, suffix = '...'): string {
	if (str.length <= length) return str;
	return str.slice(0, length - suffix.length) + suffix;
}

export function getInitials(firstName: string, lastName: string): string {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function generateInvoiceNumber(prefix = 'INV', date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const timestamp = Date.now().toString().slice(-6);
	return `${prefix}-${year}${month}-${timestamp}`;
}

export function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-');
}
