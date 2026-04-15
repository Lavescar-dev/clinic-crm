<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import Card from '$components/ui/card/card.svelte';
	import CardContent from '$components/ui/card/card-content.svelte';
	import CardHeader from '$components/ui/card/card-header.svelte';
	import CardTitle from '$components/ui/card/card-title.svelte';
	import CardDescription from '$components/ui/card/card-description.svelte';
	import Button from '$components/ui/button/button.svelte';
	import Label from '$components/ui/label/label.svelte';
	import Select from '$components/ui/select/select.svelte';
	import SelectTrigger from '$components/ui/select/select-trigger.svelte';
	import SelectValue from '$components/ui/select/select-value.svelte';
	import SelectContent from '$components/ui/select/select-content.svelte';
	import SelectItem from '$components/ui/select/select-item.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';
	import Badge from '$components/ui/badge/badge.svelte';
	import Separator from '$components/ui/separator/separator.svelte';
	import Dialog from '$components/ui/dialog/dialog.svelte';
	import DialogContent from '$components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$components/ui/dialog/dialog-title.svelte';
	import DialogDescription from '$components/ui/dialog/dialog-description.svelte';
	import DialogFooter from '$components/ui/dialog/dialog-footer.svelte';
	import {
		FileText,
		Lock,
		Save,
		AlertTriangle,
		CheckCircle2,
		Clock,
		Lightbulb
	} from 'lucide-svelte';
	import type {
		SOAP,
		NoteType,
		CreateClinicalNoteDto,
		UpdateClinicalNoteDto
	} from '$lib/types/clinicalNote';
	import { validateSOAPComplete } from '$lib/types/clinicalNote';
	import {
		getAllSOAPTemplates,
		getSOAPTemplate,
		createEmptySOAP,
		type SOAPTemplate
	} from '$lib/utils/soapTemplates';

	interface Props {
		patientId: string;
		doctorId: string;
		appointmentId?: string;
		noteType?: NoteType;
		initialData?: SOAP;
		isLocked?: boolean;
		autoSaveInterval?: number; // milliseconds, default 30000 (30s)
		onSave?: (noteData: CreateClinicalNoteDto | UpdateClinicalNoteDto) => void;
		onLock?: () => void;
		onCancel?: () => void;
	}

	let {
		patientId,
		doctorId,
		appointmentId,
		noteType = 'consultation',
		initialData,
		isLocked = false,
		autoSaveInterval = 30000,
		onSave,
		onLock,
		onCancel
	}: Props = $props();

	const dispatch = createEventDispatcher();

	// Form state
	let selectedNoteType = $state<NoteType>('consultation');
	let soap = $state<SOAP>(createEmptySOAP());
	let diagnosisCodes: string[] = $state([]);
	let procedureCodes: string[] = $state([]);

	// ICD-10 and procedure code input
	let icd10Input = $state('');
	let procedureInput = $state('');

	// Template state
	let selectedTemplateKey = $state('');
	let showTemplateDialog = $state(false);
	let availableTemplates = $state(getAllSOAPTemplates());

	// Validation and UI state
	let lastSaved = $state<Date | null>(null);
	let hasUnsavedChanges = $state(false);
	let showLockConfirmation = $state(false);
	let validationErrors = $state<string[]>([]);

	// Auto-save timer
	let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

	// Derived state
	let isValid = $derived.by(() => {
		return validateSOAPComplete(soap);
	});

	let canLock = $derived.by(() => {
		return isValid && !isLocked;
	});

	$effect(() => {
		selectedNoteType = noteType;
	});

	$effect(() => {
		soap = initialData ? structuredClone(initialData) : createEmptySOAP();
	});

	onMount(() => {
		// Set up auto-save
		if (autoSaveInterval > 0 && !isLocked) {
			autoSaveTimer = setInterval(() => {
				if (hasUnsavedChanges) {
					handleAutoSave();
				}
			}, autoSaveInterval);
		}
	});

	onDestroy(() => {
		// Clean up auto-save timer
		if (autoSaveTimer) {
			clearInterval(autoSaveTimer);
		}
	});

	function applyTemplate(templateKey: string) {
		const template = getSOAPTemplate(templateKey as keyof typeof import('$lib/utils/soapTemplates').SOAP_TEMPLATES);
		if (template) {
			soap = { ...template.soap };
			selectedNoteType = template.noteType;
			hasUnsavedChanges = true;
			showTemplateDialog = false;
		}
	}

	function handleSOAPChange() {
		hasUnsavedChanges = true;
		validateForm();
	}

	function validateForm() {
		const errors: string[] = [];

		if (soap.subjective.length < 10) {
			errors.push('Subjective section needs at least 10 characters');
		}
		if (soap.objective.length < 10) {
			errors.push('Objective section needs at least 10 characters');
		}
		if (soap.assessment.length < 10) {
			errors.push('Assessment section needs at least 10 characters');
		}
		if (soap.plan.length < 10) {
			errors.push('Plan section needs at least 10 characters');
		}

		validationErrors = errors;
	}

	function addDiagnosisCode() {
		if (icd10Input.trim()) {
			diagnosisCodes = [...diagnosisCodes, icd10Input.trim().toUpperCase()];
			icd10Input = '';
			hasUnsavedChanges = true;
		}
	}

	function removeDiagnosisCode(index: number) {
		diagnosisCodes = diagnosisCodes.filter((_, i) => i !== index);
		hasUnsavedChanges = true;
	}

	function addProcedureCode() {
		if (procedureInput.trim()) {
			procedureCodes = [...procedureCodes, procedureInput.trim().toUpperCase()];
			procedureInput = '';
			hasUnsavedChanges = true;
		}
	}

	function removeProcedureCode(index: number) {
		procedureCodes = procedureCodes.filter((_, i) => i !== index);
		hasUnsavedChanges = true;
	}

	async function handleAutoSave() {
		if (isLocked) return;

		const noteData: UpdateClinicalNoteDto = {
			noteType: selectedNoteType,
			soap,
			diagnosisCodes,
			procedureCodes
		};

		if (onSave) {
			onSave(noteData);
		} else {
			dispatch('autosave', noteData);
		}

		lastSaved = new Date();
		hasUnsavedChanges = false;
	}

	async function handleManualSave() {
		if (isLocked) return;

		const noteData: CreateClinicalNoteDto = {
			patientId,
			doctorId,
			appointmentId,
			noteType: selectedNoteType,
			date: new Date(),
			soap,
			diagnosisCodes,
			procedureCodes
		};

		if (onSave) {
			onSave(noteData);
		} else {
			dispatch('save', noteData);
		}

		lastSaved = new Date();
		hasUnsavedChanges = false;
	}

	function handleLockClick() {
		if (!canLock) {
			alert('Please complete all SOAP sections before locking the note.');
			return;
		}
		showLockConfirmation = true;
	}

	function confirmLock() {
		if (onLock) {
			onLock();
		} else {
			dispatch('lock');
		}
		showLockConfirmation = false;
	}

	function handleCancel() {
		if (hasUnsavedChanges) {
			const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
			if (!confirmed) return;
		}

		if (onCancel) {
			onCancel();
		} else {
			dispatch('cancel');
		}
	}
</script>

<Card class="w-full">
	<CardHeader>
		<div class="flex items-start justify-between">
			<div>
				<CardTitle class="flex items-center gap-2">
					<FileText class="h-5 w-5" />
					SOAP Clinical Note
				</CardTitle>
				<CardDescription>
					{#if isLocked}
						<Badge variant="outline" class="mt-2">
							<Lock class="h-3 w-3 mr-1" />
							Locked & Signed - Read Only
						</Badge>
					{:else}
						Document patient encounter using SOAP format
					{/if}
				</CardDescription>
			</div>
			<div class="flex items-center gap-2">
				{#if lastSaved}
					<div class="text-xs text-muted-foreground flex items-center gap-1">
						<Clock class="h-3 w-3" />
						Last saved: {lastSaved.toLocaleTimeString()}
					</div>
				{/if}
				{#if isValid}
					<Badge variant="outline" class="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
						<CheckCircle2 class="h-3 w-3 mr-1" />
						Complete
					</Badge>
				{:else}
					<Badge variant="outline" class="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
						<AlertTriangle class="h-3 w-3 mr-1" />
						Incomplete
					</Badge>
				{/if}
			</div>
		</div>
	</CardHeader>
	<CardContent class="space-y-6">
		<!-- Note Type and Template Selection -->
		{#if !isLocked}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label for="note-type">Note Type</Label>
					<Select bind:value={selectedNoteType} disabled={isLocked}>
						<SelectTrigger>
							<SelectValue placeholder="Select note type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="consultation">Consultation</SelectItem>
							<SelectItem value="followup">Follow-up</SelectItem>
							<SelectItem value="emergency">Emergency</SelectItem>
							<SelectItem value="procedure">Procedure</SelectItem>
							<SelectItem value="discharge">Discharge</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div class="flex items-end">
					<Button
						variant="outline"
						onclick={() => showTemplateDialog = true}
						disabled={isLocked}
						class="w-full"
					>
						<Lightbulb class="h-4 w-4 mr-2" />
						Use Template
					</Button>
				</div>
			</div>
		{/if}

		<Separator />

		<!-- SOAP Sections -->
		<div class="space-y-6">
			<!-- Subjective -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label for="subjective" class="text-lg font-semibold">S - Subjective</Label>
					<span class="text-xs text-muted-foreground">
						{soap.subjective.length} characters
					</span>
				</div>
				<p class="text-xs text-muted-foreground">
					Patient-reported symptoms, history, and concerns
				</p>
				<Textarea
					id="subjective"
					bind:value={soap.subjective}
					oninput={handleSOAPChange}
					disabled={isLocked}
					placeholder="Chief Complaint: Patient's main concern&#10;&#10;History of Present Illness:&#10;- Onset: When did symptoms start?&#10;- Location: Where is the problem?&#10;- Duration: How long has it lasted?..."
					rows={8}
					class="font-mono text-sm"
				/>
			</div>

			<!-- Objective -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label for="objective" class="text-lg font-semibold">O - Objective</Label>
					<span class="text-xs text-muted-foreground">
						{soap.objective.length} characters
					</span>
				</div>
				<p class="text-xs text-muted-foreground">
					Physical examination findings, vital signs, and lab results
				</p>
				<Textarea
					id="objective"
					bind:value={soap.objective}
					oninput={handleSOAPChange}
					disabled={isLocked}
					placeholder="Vital Signs:&#10;- BP: [blood pressure]&#10;- HR: [heart rate]&#10;- Temp: [temperature]&#10;&#10;Physical Examination:&#10;- General appearance:&#10;- Systems review:..."
					rows={8}
					class="font-mono text-sm"
				/>
			</div>

			<!-- Assessment -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label for="assessment" class="text-lg font-semibold">A - Assessment</Label>
					<span class="text-xs text-muted-foreground">
						{soap.assessment.length} characters
					</span>
				</div>
				<p class="text-xs text-muted-foreground">
					Clinical diagnosis, differential diagnosis, and analysis
				</p>
				<Textarea
					id="assessment"
					bind:value={soap.assessment}
					oninput={handleSOAPChange}
					disabled={isLocked}
					placeholder="Primary Diagnosis: [ICD-10 code and description]&#10;&#10;Differential Diagnoses:&#10;1. [Alternative diagnosis]&#10;2. [Alternative diagnosis]&#10;&#10;Clinical Reasoning:&#10;[Explain diagnostic thinking]..."
					rows={8}
					class="font-mono text-sm"
				/>

				<!-- ICD-10 Diagnosis Codes -->
				{#if !isLocked}
					<div class="mt-4 space-y-2">
						<Label for="icd10">ICD-10 Diagnosis Codes</Label>
						<div class="flex gap-2">
							<input
								id="icd10"
								type="text"
								bind:value={icd10Input}
								onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addDiagnosisCode())}
								placeholder="e.g., J06.9, E11.9"
								class="flex-1 px-3 py-2 text-sm border rounded-md"
							/>
							<Button onclick={addDiagnosisCode} variant="outline" size="sm">
								Add
							</Button>
						</div>
						{#if diagnosisCodes.length > 0}
							<div class="flex flex-wrap gap-2 mt-2">
								{#each diagnosisCodes as code, index (code)}
									<Badge
										variant="secondary"
										class="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
										onclick={() => removeDiagnosisCode(index)}
									>
										{code} ×
									</Badge>
								{/each}
							</div>
						{/if}
					</div>
				{:else if diagnosisCodes.length > 0}
					<div class="mt-4">
						<Label>ICD-10 Diagnosis Codes</Label>
						<div class="flex flex-wrap gap-2 mt-2">
							{#each diagnosisCodes as code (code)}
								<Badge variant="secondary">{code}</Badge>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Plan -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label for="plan" class="text-lg font-semibold">P - Plan</Label>
					<span class="text-xs text-muted-foreground">
						{soap.plan.length} characters
					</span>
				</div>
				<p class="text-xs text-muted-foreground">
					Treatment plan, follow-up, and patient instructions
				</p>
				<Textarea
					id="plan"
					bind:value={soap.plan}
					oninput={handleSOAPChange}
					disabled={isLocked}
					placeholder="Diagnostic Tests:&#10;- [Lab tests, imaging ordered]&#10;&#10;Treatment:&#10;- Medications: [Prescriptions with dosing]&#10;- Procedures: [Planned procedures]&#10;&#10;Follow-up:&#10;- [When and with whom]..."
					rows={8}
					class="font-mono text-sm"
				/>

				<!-- Procedure Codes -->
				{#if !isLocked}
					<div class="mt-4 space-y-2">
						<Label for="procedure">Procedure Codes (CPT/Local)</Label>
						<div class="flex gap-2">
							<input
								id="procedure"
								type="text"
								bind:value={procedureInput}
								onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addProcedureCode())}
								placeholder="e.g., 99213, 36415"
								class="flex-1 px-3 py-2 text-sm border rounded-md"
							/>
							<Button onclick={addProcedureCode} variant="outline" size="sm">
								Add
							</Button>
						</div>
						{#if procedureCodes.length > 0}
							<div class="flex flex-wrap gap-2 mt-2">
								{#each procedureCodes as code, index (code)}
									<Badge
										variant="secondary"
										class="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
										onclick={() => removeProcedureCode(index)}
									>
										{code} ×
									</Badge>
								{/each}
							</div>
						{/if}
					</div>
				{:else if procedureCodes.length > 0}
					<div class="mt-4">
						<Label>Procedure Codes</Label>
						<div class="flex flex-wrap gap-2 mt-2">
							{#each procedureCodes as code (code)}
								<Badge variant="secondary">{code}</Badge>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Validation Errors -->
		{#if validationErrors.length > 0 && !isLocked}
			<div class="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
				<p class="text-sm font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2 mb-2">
					<AlertTriangle class="h-4 w-4" />
					Validation Errors
				</p>
				<ul class="text-sm text-amber-800 dark:text-amber-200 space-y-1">
					{#each validationErrors as error}
						<li>• {error}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Actions -->
		{#if !isLocked}
			<Separator />
			<div class="flex justify-between items-center">
				<Button variant="outline" onclick={handleCancel}>
					Cancel
				</Button>
				<div class="flex gap-2">
					<Button variant="outline" onclick={handleManualSave}>
						<Save class="h-4 w-4 mr-2" />
						Save Draft
					</Button>
					<Button
						onclick={handleLockClick}
						disabled={!canLock}
						class="bg-primary"
					>
						<Lock class="h-4 w-4 mr-2" />
						Lock & Sign Note
					</Button>
				</div>
			</div>
		{/if}
	</CardContent>
</Card>

<!-- Template Selection Dialog -->
<Dialog bind:open={showTemplateDialog}>
	<DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
		<DialogHeader>
			<DialogTitle>Select SOAP Template</DialogTitle>
			<DialogDescription>
				Choose a pre-configured template to quickly fill in common scenarios
			</DialogDescription>
		</DialogHeader>

		<div class="space-y-3">
			{#each availableTemplates as template (template.key)}
				<button
					class="w-full text-left p-4 border rounded-lg hover:bg-muted transition-colors"
					onclick={() => applyTemplate(template.key)}
				>
					<div class="flex items-start justify-between">
						<div>
							<h4 class="font-semibold">{template.name}</h4>
							<p class="text-sm text-muted-foreground mt-1">{template.description}</p>
						</div>
						<Badge variant="outline">{template.noteType}</Badge>
					</div>
				</button>
			{/each}
		</div>
	</DialogContent>
</Dialog>

<!-- Lock Confirmation Dialog -->
<Dialog bind:open={showLockConfirmation}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Lock and Sign Note?</DialogTitle>
			<DialogDescription>
				This action is irreversible. Once locked and signed, the note becomes read-only and cannot be edited.
			</DialogDescription>
		</DialogHeader>

		<div class="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
			<p class="text-sm text-amber-900 dark:text-amber-100 flex items-center gap-2">
				<AlertTriangle class="h-4 w-4 flex-shrink-0" />
				Are you sure all information is accurate and complete?
			</p>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={() => showLockConfirmation = false}>
				Cancel
			</Button>
			<Button onclick={confirmLock}>
				<Lock class="h-4 w-4 mr-2" />
				Confirm Lock & Sign
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
