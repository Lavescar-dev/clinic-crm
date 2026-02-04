import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { DEFAULT_THEME, DEFAULT_LANGUAGE } from '$lib/config/app';

interface AppConfig {
	clinicName: string;
	clinicAddress: string;
	clinicTaxNumber: string;
	clinicLogoUrl: string;
	theme: 'light' | 'dark' | 'system';
	primaryColor: string; // Tailwind color name or hex
	accentColor: string; // Tailwind color name or hex
	emailNotifications: boolean;
	smsNotifications: boolean;
	appointmentReminders: boolean;
	systemNotifications: boolean;
	language: 'tr' | 'en';
}

const defaultAppConfig: AppConfig = {
	clinicName: 'Klinik Adı',
	clinicAddress: 'Klinik Adresi',
	clinicTaxNumber: 'XXXXXXX',
	clinicLogoUrl: '',
	theme: DEFAULT_THEME,
	primaryColor: 'blue',
	accentColor: 'emerald',
	emailNotifications: true,
	smsNotifications: false,
	appointmentReminders: true,
	systemNotifications: true,
	language: DEFAULT_LANGUAGE
};

const storedConfig = browser ? localStorage.getItem('appConfig') : null;
const initialConfig = storedConfig ? JSON.parse(storedConfig) : defaultAppConfig;

export const appConfigStore = writable<AppConfig>(initialConfig);

appConfigStore.subscribe((value) => {
	if (browser) {
		localStorage.setItem('appConfig', JSON.stringify(value));
	}
});
