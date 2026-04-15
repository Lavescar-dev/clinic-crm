import { format, formatDistance, formatRelative, parseISO, isValid } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

const locales = {
	tr,
	en: enUS
};

export function formatDate(date: Date | string, formatStr = 'dd/MM/yyyy', locale = 'tr'): string {
	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : date;
		if (!isValid(dateObj)) return '';
		return format(dateObj, formatStr, { locale: locales[locale as keyof typeof locales] });
	} catch {
		return '';
	}
}

export function formatDateTime(
	date: Date | string,
	formatStr = 'dd/MM/yyyy HH:mm',
	locale = 'tr'
): string {
	return formatDate(date, formatStr, locale);
}

export function formatTime(date: Date | string, formatStr = 'HH:mm', locale = 'tr'): string {
	return formatDate(date, formatStr, locale);
}

export function formatRelativeDate(date: Date | string, locale = 'tr'): string {
	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : date;
		if (!isValid(dateObj)) return '';
		return formatRelative(dateObj, new Date(), {
			locale: locales[locale as keyof typeof locales]
		});
	} catch {
		return '';
	}
}

export function formatDistanceToNow(date: Date | string, locale = 'tr'): string {
	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : date;
		if (!isValid(dateObj)) return '';
		return formatDistance(dateObj, new Date(), {
			addSuffix: true,
			locale: locales[locale as keyof typeof locales]
		});
	} catch {
		return '';
	}
}

export function calculateAge(birthDate: Date | string): number {
	try {
		const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
		if (!isValid(birth)) return 0;
		const today = new Date();
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		return age;
	} catch {
		return 0;
	}
}

export function isDateInPast(date: Date | string): boolean {
	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : date;
		if (!isValid(dateObj)) return false;
		return dateObj < new Date();
	} catch {
		return false;
	}
}

export function isDateInFuture(date: Date | string): boolean {
	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : date;
		if (!isValid(dateObj)) return false;
		return dateObj > new Date();
	} catch {
		return false;
	}
}

export function formatDateDistance(date: Date | string, _baseDate?: Date, locale = 'tr'): string {
	return formatDistanceToNow(date, locale);
}

export function formatDateRelative(date: Date | string, locale = 'tr'): string {
	return formatRelativeDate(date, locale);
}

export function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

export function addMonths(date: Date, months: number): Date {
	const result = new Date(date);
	result.setMonth(result.getMonth() + months);
	return result;
}

export function startOfDay(date: Date): Date {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	return result;
}

export function endOfDay(date: Date): Date {
	const result = new Date(date);
	result.setHours(23, 59, 59, 999);
	return result;
}
