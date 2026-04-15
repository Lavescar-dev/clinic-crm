<script lang="ts">
	import { Badge } from '$components/ui/badge';
	import { t } from '$lib/i18n';

	interface Props {
		status: string;
		type?: 'patient' | 'appointment' | 'invoice' | 'inventory';
		class?: string;
	}

	let { status, type = 'patient', class: className = '' }: Props = $props();

	const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
		// Patient statuses
		active: 'default',
		inactive: 'secondary',
		deceased: 'destructive',

		// Appointment statuses
		scheduled: 'secondary',
		confirmed: 'default',
		'in-progress': 'outline',
		completed: 'default',
		cancelled: 'destructive',
		'no-show': 'destructive',

		// Invoice statuses
		draft: 'secondary',
		pending: 'outline',
		paid: 'default',
		overdue: 'destructive',

		// Inventory statuses
		'in-stock': 'default',
		'low-stock': 'outline',
		'out-of-stock': 'destructive',
		expired: 'destructive'
	};

	const variant = $derived(variantMap[status] || 'secondary');

	function labelFor(statusValue: string, translate: (key: string) => string): string {
		const directMap: Record<string, string> = {
			active: 'Aktif',
			inactive: 'Pasif',
			deceased: 'Vefat',
			draft: 'Taslak',
			pending: 'Beklemede',
			paid: 'Ödendi',
			overdue: 'Gecikmiş',
			cancelled: 'İptal',
			scheduled: 'Planlandı',
			confirmed: 'Onaylandı',
			'in-progress': 'İşlemde',
			completed: 'Tamamlandı',
			'no-show': 'Gelmedi',
			'in-stock': 'Stokta',
			'low-stock': 'Düşük stok',
			'out-of-stock': 'Tükendi',
			expired: 'Süresi dolmuş',
			suspended: 'Askıya alındı',
			Active: 'Aktif',
			OnLeave: 'İzinde',
			Inactive: 'Pasif'
		};

		const candidates = [
			`patients.status.${statusValue}`,
			`appointments.status.${statusValue}`,
			`billing.status.${statusValue}`,
			`inventory.status.${statusValue}`,
			`users.status.${statusValue}`,
			`user.status.${statusValue}`
		];

		for (const key of candidates) {
			const translated = translate(key);
			if (translated !== key) return translated;
		}

		return directMap[statusValue] ?? statusValue;
	}

	const label = $derived(labelFor(status, $t));
</script>

<Badge {variant} class={className}>
	{label}
</Badge>
