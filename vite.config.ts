import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			$components: path.resolve('./src/lib/components'),
			$stores: path.resolve('./src/lib/stores'),
			$types: path.resolve('./src/lib/types'),
			$services: path.resolve('./src/lib/services'),
			$utils: path.resolve('./src/lib/utils'),
			$data: path.resolve('./src/lib/data'),
			$i18n: path.resolve('./src/lib/i18n')
		}
	}
});
