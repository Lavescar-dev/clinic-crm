<script lang="ts">
	import { Badge } from '$components/ui/badge';

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
</script>

<Badge {variant} class={className}>
	{status}
</Badge>
