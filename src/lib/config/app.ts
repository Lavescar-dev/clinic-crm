export const APP_NAME = 'Klinik CRM';
export const APP_DESCRIPTION = 'Demo amaçlı klinik yönetim sistemi';
export const APP_VERSION = '1.0.0';

export const ITEMS_PER_PAGE = 10;
export const MOCK_API_DELAY = 300; // milliseconds

// Theme constants
export const THEMES = ['light', 'dark', 'system'] as const;
export const DEFAULT_THEME = 'system';

// i18n constants
export const LANGUAGES = [
	{ code: 'tr', name: 'Türkçe' },
	{ code: 'en', name: 'English' }
];
export const DEFAULT_LANGUAGE = 'tr';

// Currency constants
export const DEFAULT_CURRENCY = 'TRY';
export const DEFAULT_LOCALE = 'tr-TR';
