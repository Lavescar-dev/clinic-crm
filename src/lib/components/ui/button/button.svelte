<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "focus-visible:border-ring focus-visible:ring-ring/40 aria-invalid:ring-destructive/20 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-[0.82rem] font-semibold tracking-[0.005em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		variants: {
			variant: {
				default:
					"bg-[linear-gradient(135deg,#0f8c95_0%,#15aab8_46%,#1b7f99_100%)] text-primary-foreground shadow-[0_18px_38px_-20px_rgba(15,118,110,0.58)] hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-24px_rgba(15,118,110,0.7)]",
				destructive:
					"bg-destructive text-white shadow-[0_16px_34px_-22px_rgba(220,38,38,0.6)] hover:-translate-y-0.5 hover:bg-destructive/90",
				outline:
					"border border-[color:var(--mf-line-soft)] bg-[var(--mf-surface-strong)] text-[var(--mf-ink)] shadow-[0_10px_25px_-22px_rgba(15,23,42,0.28)] hover:border-primary/20 hover:bg-white",
				secondary:
					"bg-[var(--mf-surface-muted)] text-[var(--mf-ink)] shadow-[0_10px_25px_-22px_rgba(15,23,42,0.22)] hover:bg-white/95",
				ghost: "text-[var(--mf-ink-soft)] hover:bg-[var(--mf-surface)] hover:text-[var(--mf-ink)]",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2 has-[>svg]:px-3.5",
				sm: "h-9 gap-1.5 rounded-xl px-3.5 has-[>svg]:px-3",
				lg: "h-11 rounded-2xl px-6 has-[>svg]:px-4.5",
				icon: "size-10",
				"icon-sm": "size-9",
				"icon-lg": "size-11",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	interface $$Events {
		click: MouseEvent;
	}

	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
