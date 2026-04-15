import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { isAuthenticated } from '$lib/stores';
import type { LayoutLoad } from './$types';

// Disable SSR for the app routes since they depend on browser-only data
export const ssr = false;

export const load: LayoutLoad = async () => {
	const authenticated = get(isAuthenticated);

	if (!authenticated) {
		throw redirect(307, '/login');
	}

	return {};
};
