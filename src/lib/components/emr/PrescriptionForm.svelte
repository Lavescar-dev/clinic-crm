<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import Button from '$components/ui/button/button.svelte';
	import Input from '$components/ui/input/input.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Select from '$components/ui/select/select.svelte';
	import SelectTrigger from '$components/ui/select/select-trigger.svelte';
	import SelectValue from '$components/ui/select/select-value.svelte';
	import SelectContent from '$components/ui/select/select-content.svelte';
	import SelectItem from '$components/ui/select/select-item.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Separator from '$components/ui/separator/separator.svelte';
	import { PlusCircle, Trash2, AlertTriangle, Pill, X } from 'lucide-svelte';
	import type { PrescriptionMedication, MedicationForm, CreatePrescriptionDto } from '$lib/types/prescription';
	import { DRUG_DATABASE, findDrugInteractions, type DrugInfo } from '$lib/types/prescription';
	import { prescriptions } from '$stores/prescriptions';

	interface Props {
		patientId: string;
		patientAge?: number;
		patientWeight?: number;
		doctorId: string;
		appointmentId?: string;
		diagnosisICD10?: string;
		diagnosisName?: string;
		onSubmit?: (prescription: CreatePrescriptionDto) => void;
		onCancel?: () => void;
	}

	let {
		patientId,
		patientAge,
		patientWeight,
		doctorId,
		appointmentId,
		diagnosisICD10 = '',
		diagnosisName = '',
		onSubmit,
		onCancel
	}: Props = $props();

	const dispatch = createEventDispatcher();

	// Form state
	let medications: PrescriptionMedication[] = $state([]);
	let validUntilDays = $state(30);
	let notes = $state('');

	// Drug search state
	let drugSearchQuery = $state('');
	let showDrugDropdown = $state(false);
	let selectedDrugIndex = $state(-1);

	// Current medication being added
	let currentDrug: DrugInfo | null = $state(null);
	let currentMedication: Partial<PrescriptionMedication> = $state({
		drugName: '',
		genericName: '',
		dosage: '',
		form: 'tablet',
		frequency: '',
		duration: '',
		quantity: 1,
		instructions: '',
		warnings: [],
		refillsAllowed: 0
	});

	// Interactions
	let interactions = $derived.by(() => {
		if (medications.length < 2) return [];
		const drugNames = medications.map(m => m.drugName);
		return findDrugInteractions(drugNames);
	});

	// Filtered drug list
	let filteredDrugs = $derived.by(() => {
		if (!drugSearchQuery) return [];
		const query = drugSearchQuery.toLowerCase();
		return Object.values(DRUG_DATABASE).filter(drug =>
			drug.brandName.toLowerCase().includes(query) ||
			drug.genericName.toLowerCase().includes(query)
		).slice(0, 10);
	});

	// Common instruction templates
	const instructionTemplates = [
		'Take with food',
		'Take on empty stomach',
		'Take before bedtime',
		'Take in the morning',
		'Avoid alcohol',
		'Do not drive or operate machinery',
		'Drink plenty of water',
		'Complete full course',
		'Take with a full glass of water'
	];

	function selectDrug(drug: DrugInfo) {
		currentDrug = drug;
		drugSearchQuery = drug.brandName;
		currentMedication = {
			drugName: drug.brandName,
			genericName: drug.genericName,
			dosage: drug.commonDosages[0] || '',
			form: drug.forms[0] || 'tablet',
			frequency: drug.commonFrequencies[0] || '',
			duration: drug.standardDuration || '7 days',
			quantity: 1,
			instructions: '',
			warnings: [...drug.commonWarnings],
			refillsAllowed: 0
		};
		showDrugDropdown = false;

		// Calculate dosage if patient age/weight provided
		if (patientAge && patientWeight && drug.commonDosages[0]) {
			const dosageCalc = calculateDosageAdjustment(drug.commonDosages[0], patientAge, patientWeight);
			if (dosageCalc.notes.length > 0) {
				currentMedication.warnings = [...(currentMedication.warnings || []), ...dosageCalc.notes];
			}
		}
	}

	function calculateDosageAdjustment(dosage: string, age: number, weight: number) {
		const notes: string[] = [];

		if (age < 18) {
			notes.push('Pediatric dosage adjustment may be required');
		}
		if (age > 65) {
			notes.push('Consider dose reduction for elderly patient');
		}
		if (weight < 50) {
			notes.push('Consider lower dose for patient weight');
		} else if (weight > 100) {
			notes.push('Verify dose is appropriate for patient weight');
		}

		return { calculatedDosage: dosage, notes };
	}

	function addMedication() {
		if (!currentMedication.drugName || !currentMedication.dosage || !currentMedication.frequency || !currentMedication.duration) {
			alert('Please fill in all required medication fields');
			return;
		}

		const medication: PrescriptionMedication = {
			drugName: currentMedication.drugName!,
			genericName: currentMedication.genericName,
			dosage: currentMedication.dosage!,
			form: currentMedication.form!,
			frequency: currentMedication.frequency!,
			duration: currentMedication.duration!,
			quantity: currentMedication.quantity!,
			instructions: currentMedication.instructions,
			warnings: currentMedication.warnings || [],
			refillsAllowed: currentMedication.refillsAllowed || 0
		};

		medications = [...medications, medication];

		// Reset form
		currentDrug = null;
		drugSearchQuery = '';
		currentMedication = {
			drugName: '',
			genericName: '',
			dosage: '',
			form: 'tablet',
			frequency: '',
			duration: '',
			quantity: 1,
			instructions: '',
			warnings: [],
			refillsAllowed: 0
		};
	}

	function removeMedication(index: number) {
		medications = medications.filter((_, i) => i !== index);
	}

	function addInstructionTemplate(template: string) {
		if (!currentMedication.instructions) {
			currentMedication.instructions = template;
		} else {
			currentMedication.instructions += ', ' + template;
		}
	}

	async function handleSubmit() {
		if (medications.length === 0) {
			alert('Please add at least one medication');
			return;
		}

		// Check for contraindicated interactions
		const contraindicatedInteractions = interactions.filter(i => i.severity === 'contraindicated');
		if (contraindicatedInteractions.length > 0) {
			const confirmed = confirm(
				`WARNING: Contraindicated drug interactions detected:\n${contraindicatedInteractions.map(i => `${i.drug1} + ${i.drug2}`).join('\n')}\n\nAre you sure you want to proceed?`
			);
			if (!confirmed) return;
		}

		const validUntil = new Date();
		validUntil.setDate(validUntil.getDate() + validUntilDays);

		const prescriptionData: CreatePrescriptionDto = {
			patientId,
			doctorId,
			appointmentId,
			medications,
			diagnosisICD10: diagnosisICD10 || undefined,
			diagnosisName: diagnosisName || undefined,
			issuedAt: new Date(),
			validUntil,
			status: 'active',
			notes: notes || undefined
		};

		if (onSubmit) {
			onSubmit(prescriptionData);
		} else {
			const result = await prescriptions.createPrescription(prescriptionData);
			if (result.success) {
				dispatch('success', result.data);
				// Reset form
				medications = [];
				notes = '';
			} else {
				alert('Failed to create prescription: ' + result.error);
			}
		}
	}

	function handleCancel() {
		if (onCancel) {
			onCancel();
		} else {
			dispatch('cancel');
		}
	}
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<Pill class="h-5 w-5" />
			Write Prescription
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-6">
		<!-- Drug Search & Selection -->
		<div class="space-y-4">
			<div>
				<Label for="drug-search">Search Medication *</Label>
				<div class="relative">
					<Input
						id="drug-search"
						type="text"
						placeholder="Search by brand or generic name..."
						bind:value={drugSearchQuery}
						onfocus={() => showDrugDropdown = true}
						oninput={() => showDrugDropdown = true}
						class="pr-8"
					/>
					{#if drugSearchQuery}
						<button
							class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							onclick={() => {
								drugSearchQuery = '';
								currentDrug = null;
								showDrugDropdown = false;
							}}
						>
							<X class="h-4 w-4" />
						</button>
					{/if}

					<!-- Dropdown -->
					{#if showDrugDropdown && filteredDrugs.length > 0}
						<div class="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
							{#each filteredDrugs as drug (drug.id)}
								<button
									class="w-full px-4 py-2 text-left hover:bg-muted transition-colors border-b last:border-b-0"
									onclick={() => selectDrug(drug)}
								>
									<p class="font-medium">{drug.brandName}</p>
									<p class="text-sm text-muted-foreground">{drug.genericName} • {drug.category}</p>
									{#if !drug.requiresPrescription}
										<Badge variant="outline" class="text-xs mt-1">OTC</Badge>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Medication Details Form (shown when drug is selected) -->
			{#if currentDrug}
				<div class="border rounded-lg p-4 space-y-4 bg-muted/30">
					<div class="flex items-center justify-between">
						<div>
							<h4 class="font-semibold">{currentDrug.brandName}</h4>
							<p class="text-sm text-muted-foreground">{currentDrug.genericName}</p>
						</div>
						<Badge variant="outline">{currentDrug.category}</Badge>
					</div>

					<Separator />

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label for="dosage">Dosage *</Label>
							<Select bind:value={currentMedication.dosage}>
								<SelectTrigger>
									<SelectValue placeholder="Select dosage" />
								</SelectTrigger>
								<SelectContent>
									{#each currentDrug.commonDosages as dosage}
										<SelectItem value={dosage}>{dosage}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label for="form">Form *</Label>
							<Select bind:value={currentMedication.form}>
								<SelectTrigger>
									<SelectValue placeholder="Select form" />
								</SelectTrigger>
								<SelectContent>
									{#each currentDrug.forms as form}
										<SelectItem value={form}>{form}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label for="frequency">Frequency *</Label>
							<Select bind:value={currentMedication.frequency}>
								<SelectTrigger>
									<SelectValue placeholder="Select frequency" />
								</SelectTrigger>
								<SelectContent>
									{#each currentDrug.commonFrequencies as freq}
										<SelectItem value={freq}>{freq}</SelectItem>
									{/each}
									<SelectItem value="as needed">as needed</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label for="duration">Duration *</Label>
							<Input
								id="duration"
								type="text"
								bind:value={currentMedication.duration}
								placeholder="e.g., 7 days, 2 weeks"
							/>
						</div>

						<div>
							<Label for="quantity">Quantity *</Label>
							<Input
								id="quantity"
								type="number"
								bind:value={currentMedication.quantity}
								min="1"
							/>
						</div>

						<div>
							<Label for="refills">Refills Allowed</Label>
							<Input
								id="refills"
								type="number"
								bind:value={currentMedication.refillsAllowed}
								min="0"
								max="12"
							/>
						</div>
					</div>

					<div>
						<Label for="instructions">Instructions</Label>
						<Textarea
							id="instructions"
							bind:value={currentMedication.instructions}
							placeholder="Special instructions for the patient..."
							rows={2}
						/>
						<div class="flex flex-wrap gap-2 mt-2">
							{#each instructionTemplates as template}
								<Badge
									variant="outline"
									class="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
									onclick={() => addInstructionTemplate(template)}
								>
									{template}
								</Badge>
							{/each}
						</div>
					</div>

					<!-- Warnings -->
					{#if currentMedication.warnings && currentMedication.warnings.length > 0}
						<div class="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded">
							<p class="text-sm font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2 mb-2">
								<AlertTriangle class="h-4 w-4" />
								Warnings & Precautions
							</p>
							<ul class="text-sm text-amber-800 dark:text-amber-200 space-y-1">
								{#each currentMedication.warnings as warning}
									<li>• {warning}</li>
								{/each}
							</ul>
						</div>
					{/if}

					<Button onclick={addMedication} class="w-full">
						<PlusCircle class="mr-2 h-4 w-4" />
						Add Medication to Prescription
					</Button>
				</div>
			{/if}
		</div>

		<!-- Added Medications List -->
		{#if medications.length > 0}
			<div class="space-y-4">
				<Separator />
				<div>
					<h4 class="font-semibold mb-3">Medications Added ({medications.length})</h4>
					<div class="space-y-3">
						{#each medications as medication, index (index)}
							<div class="border rounded-lg p-3 bg-background">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<Pill class="h-4 w-4 text-muted-foreground" />
											<p class="font-medium">{medication.drugName}</p>
											<Badge variant="outline" class="text-xs">{medication.form}</Badge>
										</div>
										<p class="text-sm text-muted-foreground">
											{medication.dosage} • {medication.frequency} • {medication.duration} • Qty: {medication.quantity}
										</p>
										{#if medication.instructions}
											<p class="text-xs text-muted-foreground mt-1">Instructions: {medication.instructions}</p>
										{/if}
									</div>
									<Button
										variant="ghost"
										size="icon"
										onclick={() => removeMedication(index)}
										class="text-destructive hover:text-destructive"
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Drug Interactions Warning -->
		{#if interactions.length > 0}
			<div class="p-4 border-2 rounded-lg" class:border-red-500={interactions.some(i => i.severity === 'major' || i.severity === 'contraindicated')} class:border-amber-500={!interactions.some(i => i.severity === 'major' || i.severity === 'contraindicated')}>
				<div class="flex items-start gap-3">
					<AlertTriangle class="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
					<div class="flex-1">
						<p class="font-semibold text-amber-900 dark:text-amber-100 mb-2">
							Drug Interactions Detected ({interactions.length})
						</p>
						<div class="space-y-2">
							{#each interactions as interaction}
								<div class="text-sm">
									<p class="font-medium">
										{interaction.drug1} + {interaction.drug2}
										<Badge variant={interaction.severity === 'major' || interaction.severity === 'contraindicated' ? 'destructive' : interaction.severity === 'moderate' ? 'warning' : 'outline'} class="ml-2">
											{interaction.severity}
										</Badge>
									</p>
									<p class="text-muted-foreground">{interaction.description}</p>
									<p class="text-xs mt-1"><strong>Recommendation:</strong> {interaction.recommendation}</p>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Additional Fields -->
		<Separator />

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<Label for="valid-days">Valid For (days)</Label>
				<Input
					id="valid-days"
					type="number"
					bind:value={validUntilDays}
					min="1"
					max="365"
				/>
			</div>
		</div>

		<div>
			<Label for="notes">Additional Notes</Label>
			<Textarea
				id="notes"
				bind:value={notes}
				placeholder="Any additional notes or instructions..."
				rows={3}
			/>
		</div>

		<!-- Actions -->
		<div class="flex justify-end gap-2">
			<Button variant="outline" onclick={handleCancel}>
				Cancel
			</Button>
			<Button onclick={handleSubmit} disabled={medications.length === 0}>
				Create Prescription
			</Button>
		</div>
	</CardContent>
</Card>
