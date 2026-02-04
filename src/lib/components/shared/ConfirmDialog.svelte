<script lang="ts">
	import { Button } from '$components/ui/button';
	import { t } from '$lib/i18n';
	import { X } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		title: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		onConfirm: () => void;
		onCancel: () => void;
		variant?: 'default' | 'destructive';
	}

	let {
		open = $bindable(false),
		title,
		message,
		confirmText,
		cancelText,
		onConfirm,
		onCancel,
		variant = 'default'
	}: Props = $props();

	function handleConfirm() {
		onConfirm();
		open = false;
	}

	function handleCancel() {
		onCancel();
		open = false;
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 p-6 space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">{title}</h2>
				<button onclick={handleCancel} class="text-muted-foreground hover:text-foreground">
					<X class="h-5 w-5" />
				</button>
			</div>

			<p class="text-muted-foreground">{message}</p>

			<div class="flex gap-3 justify-end">
				<Button variant="outline" onclick={handleCancel}>
					{cancelText || $t('common.cancel')}
				</Button>
				<Button {variant} onclick={handleConfirm}>
					{confirmText || $t('common.confirm')}
				</Button>
			</div>
		</div>
	</div>
{/if}
