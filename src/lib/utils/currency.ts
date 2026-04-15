export function formatCurrency(
	amount: number,
	currency = 'TRY',
	locale = 'tr-TR',
	decimals = 2
): string {
	try {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		}).format(amount);
	} catch {
		return `${amount.toFixed(decimals)} ${currency}`;
	}
}

export function formatNumber(number: number, locale = 'tr-TR', decimals = 0): string {
	try {
		return new Intl.NumberFormat(locale, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		}).format(number);
	} catch {
		return number.toFixed(decimals);
	}
}

export function calculateTax(amount: number, taxRate: number): number {
	return (amount * taxRate) / 100;
}

export function calculateTotal(subtotal: number, taxRate: number): number {
	return subtotal + calculateTax(subtotal, taxRate);
}

export function calculatePercentage(value: number, total: number): number {
	if (total === 0) return 0;
	return (value / total) * 100;
}

export function formatPercentage(value: number, decimals = 1): string {
	return `%${value.toFixed(decimals)}`;
}
