import { defineConfig, mergeConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import viteConfig from './vite.config'; // Import the main Vite config

export default mergeConfig(
	viteConfig,
	defineConfig({
		plugins: [svelte({ hot: !process.env.VITEST })],
		test: {
			environment: 'jsdom',
			globals: true,
			setupFiles: ['./tests/setup.ts'],
			include: ['tests/**/*.{test,spec}.{js,ts}']
		}
	})
);
