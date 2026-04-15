import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			strategies: 'generateSW',
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png', 'fonts/*.woff2'],
			workbox: {
				globDirectory: 'build',
				globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}'],
				globIgnores: ['**/node_modules/**/*'],
				navigateFallback: '/offline',
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/api\./,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 // 1 hour
							}
						}
					},
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'image-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
							}
						}
					}
				]
			},
			manifest: {
				name: 'Clinic CRM',
				short_name: 'ClinicCRM',
				description: 'Clinic CRM - Manage your clinic operations, patients, and appointments',
				theme_color: '#ea580c',
				background_color: '#ffffff',
				display: 'standalone',
				start_url: '/',
				icons: [
					{
						src: '/icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: '/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			devOptions: {
				enabled: false,
				type: 'module'
			}
		})
	],
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
