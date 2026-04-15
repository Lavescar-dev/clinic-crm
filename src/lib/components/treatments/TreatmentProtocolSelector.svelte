<script lang="ts">
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$components/ui/select';
	import { Label } from '$components/ui/label';
	import { Badge } from '$components/ui/badge';
	import { PREDEFINED_PROTOCOLS, type TreatmentProtocol } from '$types/treatmentPlan';
	import { t } from '$i18n';

	interface Props {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		onChange?: (protocol: TreatmentProtocol, key: string) => void;
		showDescription?: boolean;
	}

	let {
		value = $bindable(''),
		placeholder,
		disabled = false,
		class: className = '',
		onChange,
		showDescription = true
	}: Props = $props();

	// Get protocol entries as an array
	const protocolEntries = Object.entries(PREDEFINED_PROTOCOLS);

	// Find the selected protocol
	let selectedProtocol = $derived.by(() => {
		if (!value) return null;
		const entry = protocolEntries.find(([key]) => key === value);
		return entry ? entry[1] : null;
	});

	function handleValueChange(newValue: string | undefined) {
		if (newValue) {
			value = newValue;
			const protocol = PREDEFINED_PROTOCOLS[newValue as keyof typeof PREDEFINED_PROTOCOLS];
			if (protocol) {
				onChange?.(protocol, newValue);
			}
		}
	}

	// Helper to format protocol key for display
	function formatProtocolKey(key: string): string {
		// Convert snake_case to Title Case
		return key
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}
</script>

<div class="space-y-2 {className}">
	<Label for="protocol-selector">{$t('treatments.fields.protocol')}</Label>
	<Select bind:value onValueChange={handleValueChange} {disabled}>
		<SelectTrigger id="protocol-selector" class="w-full">
			<SelectValue placeholder={placeholder || $t('treatments.protocol.select')} />
		</SelectTrigger>
		<SelectContent>
			{#each protocolEntries as [key, protocol] (key)}
				<SelectItem value={key}>
					<div class="flex flex-col items-start gap-1 py-1">
						<div class="font-medium">{protocol.name}</div>
						<div class="flex gap-2 flex-wrap">
							<Badge variant="outline" class="text-xs">
								{protocol.sessionCount} {$t('treatments.fields.sessions')}
							</Badge>
							<Badge variant="outline" class="text-xs">
								{protocol.frequency}
							</Badge>
							<Badge variant="outline" class="text-xs">
								{protocol.sessionDuration} min
							</Badge>
						</div>
					</div>
				</SelectItem>
			{/each}
		</SelectContent>
	</Select>

	{#if showDescription && selectedProtocol}
		<div class="mt-4 space-y-3 rounded-lg border p-4 bg-muted/50">
			<div>
				<h4 class="text-sm font-semibold mb-1">{$t('treatments.protocol.description')}</h4>
				<p class="text-sm text-muted-foreground">{selectedProtocol.description}</p>
			</div>

			<div>
				<h4 class="text-sm font-semibold mb-1">{$t('treatments.fields.procedures')}</h4>
				<ul class="list-disc list-inside space-y-0.5 text-sm text-muted-foreground">
					{#each selectedProtocol.procedures as procedure}
						<li>{procedure}</li>
					{/each}
				</ul>
			</div>

			<div>
				<h4 class="text-sm font-semibold mb-1">{$t('treatments.fields.goals')}</h4>
				<ul class="list-disc list-inside space-y-0.5 text-sm text-muted-foreground">
					{#each selectedProtocol.goals as goal}
						<li>{goal}</li>
					{/each}
				</ul>
			</div>

			<div>
				<h4 class="text-sm font-semibold mb-1">{$t('treatments.fields.successCriteria')}</h4>
				<ul class="list-disc list-inside space-y-0.5 text-sm text-muted-foreground">
					{#each selectedProtocol.successCriteria as criteria}
						<li>{criteria}</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</div>
