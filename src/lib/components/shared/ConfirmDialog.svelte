<script lang="ts">
	import { Button } from '$components/ui/button';
	import { t } from '$lib/i18n';
	import { createEventDispatcher } from 'svelte';
	import type { Snippet } from 'svelte';
	import { X } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		title: string;
		message?: string;
		description?: string;
		confirmText?: string;
		cancelText?: string;
		onConfirm?: () => void | Promise<void>;
		onCancel?: () => void;
		variant?: 'default' | 'destructive';
		disabled?: boolean;
		children?: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		message,
		description,
		confirmText,
		cancelText,
		onConfirm,
		onCancel,
		variant = 'default',
		disabled = false,
		children
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		confirm: void;
		cancel: void;
	}>();

	async function handleConfirm() {
		if (disabled) return;
		dispatch('confirm');
		await onConfirm?.();
		open = false;
	}

	function handleCancel() {
		dispatch('cancel');
		onCancel?.();
		open = false;
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="mx-4 w-full max-w-md space-y-4 rounded-[30px] border border-[color:var(--mf-line-soft)] bg-[var(--mf-surface-strong)] p-6 shadow-[0_28px_64px_-28px_rgba(15,23,42,0.4)]">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold tracking-[-0.02em] text-[var(--mf-ink)]">{title}</h2>
				<button
					onclick={handleCancel}
					class="rounded-full p-2 text-[var(--mf-ink-soft)] transition hover:bg-[var(--mf-surface)] hover:text-[var(--mf-ink)]"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			{#if children}
				<div class="space-y-4 text-sm leading-6 text-[var(--mf-ink-soft)]">
					{@render children()}
				</div>
			{:else if message || description}
				<p class="text-sm leading-6 text-[var(--mf-ink-soft)]">{message || description}</p>
			{/if}

			<div class="flex gap-3 justify-end">
				<Button variant="outline" onclick={handleCancel}>
					{cancelText || $t('common.cancel')}
				</Button>
				<Button {variant} {disabled} onclick={handleConfirm}>
					{confirmText || $t('common.confirm')}
				</Button>
			</div>
		</div>
	</div>
{/if}
