<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';

	const settingsSections = [
		{
			title: 'Klinik Profili',
			description: 'Kurum kimliği, adres ve marka varlıklarını düzenleyin.',
			href: '/settings/clinic',
			action: 'Kliniği Düzenle'
		},
		{
			title: 'Görünüm',
			description: 'Tema ve arayüz tercihlerini MedFlow çalışma diline göre ayarlayın.',
			href: '/settings/appearance',
			action: 'Görünümü Aç'
		},
		{
			title: 'Bildirimler',
			description: 'Hatırlatmalar, sistem uyarıları ve temas tercihlerini yönetin.',
			href: '/settings/notifications',
			action: 'Bildirimleri Aç'
		}
	];
</script>

<div class="mf-page-shell space-y-6 p-4 md:p-6">
	<div class="mf-page-header space-y-2">
		<p class="mf-kicker text-[0.72rem] font-semibold">Yapılandırma</p>
		<h1 class="mf-page-title">Sistem Ayarları</h1>
		<p class="mf-page-description">
			Klinik profili, arayüz dili ve bildirim tercihlerini boş ekran görmeden tek yerden yönetin.
		</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		{#each settingsSections as section}
			<Card class="mf-glass">
				<CardHeader>
					<CardTitle class="text-xl">{section.title}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<p class="text-sm text-[color:var(--mf-ink)]">{section.description}</p>
					<Button variant="outline" class="w-full" onclick={() => goto(section.href)}>
						{section.action}
					</Button>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>
