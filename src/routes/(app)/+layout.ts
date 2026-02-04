import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { isAuthenticated } from '$lib/stores';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	const authenticated = get(isAuthenticated);

	if (!authenticated) {
		throw redirect(307, '/login');
	}

	return {};
};
