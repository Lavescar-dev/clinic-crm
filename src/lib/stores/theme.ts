import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
	mode: Theme;
	effectiveTheme: 'light' | 'dark';
}

// Get initial theme from localStorage or default to 'system'
function getInitialTheme(): Theme {
	if (!browser) return 'system';
	const stored = localStorage.getItem('theme');
	return (stored as Theme) || 'system';
}

// Detect system preference
function getSystemPreference(): 'light' | 'dark' {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Calculate effective theme based on mode
function getEffectiveTheme(mode: Theme): 'light' | 'dark' {
	if (mode === 'system') {
		return getSystemPreference();
	}
	return mode;
}

// Create the store
function createThemeStore() {
	const initialMode = getInitialTheme();
	const { subscribe, set, update } = writable<ThemeStore>({
		mode: initialMode,
		effectiveTheme: getEffectiveTheme(initialMode)
	});

	// Apply theme to document
	function applyTheme(theme: 'light' | 'dark') {
		if (!browser) return;

		const root = document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(theme);

		// Also set data attribute for compatibility
		root.setAttribute('data-theme', theme);
	}

	// Listen for system preference changes
	if (browser) {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', (e) => {
			update(state => {
				if (state.mode === 'system') {
					const newEffectiveTheme = e.matches ? 'dark' : 'light';
					applyTheme(newEffectiveTheme);
					return {
						...state,
						effectiveTheme: newEffectiveTheme
					};
				}
				return state;
			});
		});
	}

	// Initialize theme on page load
	if (browser) {
		const effectiveTheme = getEffectiveTheme(initialMode);
		applyTheme(effectiveTheme);
	}

	return {
		subscribe,
		setTheme: (mode: Theme) => {
			if (!browser) return;

			// Save to localStorage
			localStorage.setItem('theme', mode);

			// Calculate effective theme
			const effectiveTheme = getEffectiveTheme(mode);

			// Apply theme
			applyTheme(effectiveTheme);

			// Update store
			set({ mode, effectiveTheme });
		},
		toggleTheme: () => {
			update(state => {
				const newMode: Theme = state.effectiveTheme === 'light' ? 'dark' : 'light';

				if (browser) {
					localStorage.setItem('theme', newMode);
					applyTheme(newMode);
				}

				return {
					mode: newMode,
					effectiveTheme: newMode
				};
			});
		}
	};
}

export const theme = createThemeStore();
