<script lang="ts">
	import { Card } from '$components/ui/card';
	import type { ComponentType, SvelteComponent } from 'svelte';

	interface Column {
		key: string;
		header: string;
		cell?: (value: any, row: any) => any;
		component?: ComponentType<SvelteComponent>;
		props?: (row: any) => Record<string, any>;
	}

	interface Props {
		columns: Column[];
		data: any[];
		keyField?: string;
		class?: string;
	}

	let { columns, data, keyField = 'id', class: className = '' }: Props = $props();
</script>

<Card class={`overflow-hidden ${className}`}>
	<div class="overflow-x-auto">
		<table class="w-full">
			<thead class="bg-muted/50">
				<tr>
					{#each columns as column}
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{column.header}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each data as row (row[keyField])}
					<tr class="hover:bg-muted/50 transition-colors">
						{#each columns as column}
							<td class="px-4 py-3 text-sm">
								{#if column.component}
									<svelte:component this={column.component} {...(column.props ? column.props(row) : {})} />
								{:else if column.cell}
									{@html column.cell(row[column.key], row)}
								{:else}
									{row[column.key]}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
		{#if data.length === 0}
			<div class="p-8 text-center text-muted-foreground">
				No data available
			</div>
		{/if}
	</div>
</Card>
