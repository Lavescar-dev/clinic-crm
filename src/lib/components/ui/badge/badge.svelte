<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLAttributes } from 'svelte/elements';

	interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
		variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
		class?: string;
		children?: any;
	}

	let { variant = 'default', class: className = '', children, ...restProps }: BadgeProps = $props();

	const variants = {
		default: 'border border-cyan-200/70 bg-[var(--mf-accent-soft)] text-[var(--mf-accent-strong)]',
		secondary: 'border border-[color:var(--mf-line-soft)] bg-[var(--mf-surface-muted)] text-[var(--mf-ink)]',
		destructive: 'border border-rose-200/70 bg-[var(--mf-danger-soft)] text-rose-700',
		outline: 'border border-[color:var(--mf-line-soft)] bg-[var(--mf-surface)] text-[var(--mf-ink)]',
		success: 'border border-emerald-200/70 bg-[var(--mf-success-soft)] text-emerald-700',
		warning: 'border border-amber-200/70 bg-[var(--mf-warning-soft)] text-amber-700'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.08em] uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variants[variant],
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>
