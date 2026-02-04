import { writable, derived, get } from 'svelte/store';
import type { Language } from '$types';
import tr from './locales/tr.json';
import en from './locales/en.json';

const translations = {
	tr,
	en
};

function createI18n() {
	const { subscribe, set } = writable<Language>('tr');

	// Load from localStorage on client
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('language') as Language;
		if (stored && (stored === 'tr' || stored === 'en')) {
			set(stored);
		}
	}

	return {
		subscribe,
		set: (lang: Language) => {
			set(lang);
			if (typeof window !== 'undefined') {
				localStorage.setItem('language', lang);
			}
		},
		toggle: () => {
			const current = get(language);
			const next = current === 'tr' ? 'en' : 'tr';
			set(next);
			if (typeof window !== 'undefined') {
				localStorage.setItem('language', next);
			}
		}
	};
}

export const language = createI18n();

export const t = derived(language, ($language) => {
	const trans = translations[$language];

	return (key: string, params?: Record<string, string | number>): string => {
		const keys = key.split('.');
		let value: any = trans;

		for (const k of keys) {
			if (value && typeof value === 'object' && k in value) {
				value = value[k];
			} else {
				return key;
			}
		}

		if (typeof value !== 'string') return key;

		// Replace parameters
		if (params) {
			return Object.entries(params).reduce(
				(acc, [param, val]) => acc.replace(`{${param}}`, String(val)),
				value
			);
		}

		return value;
	};
});
