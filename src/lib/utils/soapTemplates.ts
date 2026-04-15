import type { SOAP, NoteType } from '$lib/types/clinicalNote';

/**
 * SOAP Note Template
 * Provides pre-filled prompts and structure for common clinical scenarios
 */
export interface SOAPTemplate {
	name: string;
	noteType: NoteType;
	description: string;
	soap: SOAP;
}

/**
 * Pre-defined SOAP templates for common clinical scenarios
 */
export const SOAP_TEMPLATES: Record<string, SOAPTemplate> = {
	general_consultation: {
		name: 'General Consultation',
		noteType: 'consultation',
		description: 'Standard outpatient consultation template',
		soap: {
			subjective: `Chief Complaint: [Patient's main concern]

History of Present Illness:
- Onset: [When did symptoms start?]
- Location: [Where is the problem?]
- Duration: [How long has it lasted?]
- Characteristics: [Describe the symptoms]
- Aggravating factors: [What makes it worse?]
- Relieving factors: [What makes it better?]
- Previous treatments: [What has been tried?]

Past Medical History: [Relevant medical conditions]
Current Medications: [List medications]
Allergies: [List allergies]
Social History: [Smoking, alcohol, occupation]`,

			objective: `Vital Signs:
- BP: [blood pressure]
- HR: [heart rate]
- Temp: [temperature]
- RR: [respiratory rate]
- SpO2: [oxygen saturation]
- Weight: [kg]

General Appearance: [Alert, oriented, well-developed, well-nourished]

Physical Examination:
- Head/Eyes/Ears/Nose/Throat: [findings]
- Cardiovascular: [heart sounds, rhythm]
- Respiratory: [breath sounds, effort]
- Abdomen: [inspection, palpation, bowel sounds]
- Musculoskeletal: [range of motion, strength]
- Neurological: [mental status, cranial nerves, reflexes]
- Skin: [color, temperature, lesions]`,

			assessment: `Primary Diagnosis: [ICD-10 code and description]

Differential Diagnoses:
1. [Alternative diagnosis]
2. [Alternative diagnosis]

Clinical Reasoning:
[Explain diagnostic thinking and risk assessment]

Severity: [Mild / Moderate / Severe]
Prognosis: [Expected outcome]`,

			plan: `Diagnostic Tests:
- [Lab tests, imaging, other studies ordered]

Treatment:
- Medications: [Prescriptions with dosing]
- Procedures: [Any procedures performed or planned]
- Therapies: [Physical therapy, counseling, etc.]

Patient Education:
- [Key points discussed with patient]
- [Warning signs to watch for]

Follow-up:
- [When and with whom]
- [What to monitor]

Referrals:
- [Specialist referrals if needed]`
		}
	},

	chronic_disease_followup: {
		name: 'Chronic Disease Follow-up',
		noteType: 'followup',
		description: 'Follow-up visit for chronic condition management',
		soap: {
			subjective: `Chronic Condition: [Name of chronic disease]

Current Status:
- Overall feeling: [Better / Same / Worse]
- Symptom control: [Level of control]
- Adherence to treatment plan: [Compliant / Partial / Non-compliant]
- Medication side effects: [Any adverse effects]

Interval Changes:
- New symptoms: [Any new concerns]
- Lifestyle modifications: [Diet, exercise, habits]
- Home monitoring results: [Blood pressure, glucose, etc.]

Current Medications:
- [List with adherence status]

Barriers to Care:
- [Financial, transportation, understanding, etc.]`,

			objective: `Vital Signs & Key Metrics:
- BP: [blood pressure] (Target: [goal])
- HR: [heart rate]
- Weight: [kg] (Change from last visit: [±X kg])
- BMI: [value]
- [Disease-specific metrics: e.g., HbA1c, peak flow]

Physical Examination:
- General: [appearance, mood, energy]
- Systems review: [Focus on affected systems]
- Medication effects: [Signs of efficacy or side effects]

Recent Lab/Test Results:
- [List relevant results with dates]
- [Comparison to previous values]`,

			assessment: `Chronic Condition Status: [Controlled / Partially controlled / Uncontrolled]

Current Problems:
1. [Primary diagnosis with current status]
2. [Secondary diagnosis if applicable]
3. [Complications or comorbidities]

Progress Toward Goals:
- [Goal 1]: [Status]
- [Goal 2]: [Status]

Risk Assessment:
- [Cardiovascular risk, complications risk, etc.]

Treatment Response:
- [Effectiveness of current regimen]`,

			plan: `Continue Current Management:
- [Medications to continue]
- [Lifestyle interventions to maintain]

Adjust Treatment:
- [Medication changes with rationale]
- [Dose adjustments]

New Interventions:
- [Additional therapies or medications]

Monitoring:
- [Labs to order with frequency]
- [Home monitoring instructions]
- [Target values]

Patient Education Reinforced:
- [Disease management review]
- [Lifestyle modifications]
- [Symptom recognition]

Follow-up Schedule:
- Next visit: [timeframe]
- Contact earlier if: [warning signs]

Referrals/Consultations:
- [Specialist follow-up if needed]`
		}
	},

	post_operative_check: {
		name: 'Post-Operative Check',
		noteType: 'followup',
		description: 'Post-surgical follow-up assessment',
		soap: {
			subjective: `Procedure: [Name of surgery/procedure]
Date of Surgery: [Date]
Days Post-Op: [X days]

Current Symptoms:
- Pain level: [0-10 scale]
- Pain location: [Surgical site / Other]
- Pain character: [Sharp, dull, throbbing]
- Pain management: [What helps?]

Recovery Progress:
- Mobility: [Limited / Improving / Normal]
- Activity level: [Bed rest / Light activity / Full activity]
- Sleep quality: [Normal / Disrupted]
- Appetite: [Normal / Decreased / Increased]

Wound Status (Patient-reported):
- Drainage: [None / Minimal / Moderate / Heavy]
- Redness: [Yes / No]
- Swelling: [None / Mild / Moderate / Severe]
- Odor: [None / Present]

Complications:
- Fever: [Yes / No]
- Nausea/vomiting: [Yes / No]
- Difficulty breathing: [Yes / No]
- Other concerns: [List]

Medication Use:
- Pain medication: [Frequency and effectiveness]
- Antibiotics: [Compliance]
- Other post-op meds: [List]`,

			objective: `Vital Signs:
- BP: [value]
- HR: [value]
- Temp: [value] (Fever threshold: 38°C)
- RR: [value]
- SpO2: [value]

General Appearance:
- [Alert, comfortable, in distress]

Surgical Site Examination:
- Location: [Anatomical site]
- Incision: [Clean, healing well / Concerns]
- Wound edges: [Approximated / Separated]
- Drainage: [Type, amount, color]
- Redness: [None / Mild / Moderate / Severe]
- Swelling: [None / Mild / Moderate / Severe]
- Tenderness: [None / Mild / Moderate / Severe]
- Signs of infection: [Present / Absent]
- Sutures/staples: [Intact / Removed / Partially removed]

Range of Motion (if applicable):
- [Joint/limb function assessment]

Neurovascular Status (if applicable):
- Sensation: [Normal / Decreased / Absent]
- Motor function: [Normal / Decreased / Absent]
- Pulses: [Present / Diminished / Absent]`,

			assessment: `Post-operative Status: [Recovering well / Concerns present / Complications]

Surgical Recovery Stage: [Early / Mid / Late recovery]

Wound Healing: [Primary intention / Secondary intention / Delayed healing]

Complications:
- [None / Infection / Hematoma / Seroma / Dehiscence / Other]

Pain Management: [Adequate / Inadequate]

Functional Status: [Meeting expected milestones / Delayed recovery]

Readiness for next phase: [Yes / Not yet / Needs modification]`,

			plan: `Wound Care:
- [Dressing changes: frequency and type]
- [Cleaning instructions]
- [When to remove sutures/staples]
- [Activity restrictions]

Pain Management:
- [Continue current regimen / Adjust medications]
- [Taper plan if applicable]

Medications:
- [Antibiotics: continue or discontinue]
- [Other medications: adjustments]

Activity Progression:
- [Current restrictions]
- [When to advance activity]
- [Return to work/school timeline]

Monitoring:
- [Self-monitoring instructions]
- [Warning signs to report immediately]

Follow-up:
- Next post-op check: [timeframe]
- Imaging if needed: [Type and when]
- [When to call surgeon]

Physical Therapy:
- [Referral if indicated]
- [Home exercise program]

Return to Normal Function:
- Expected timeline: [weeks/months]
- Milestones to achieve: [List]`
		}
	},

	emergency_visit: {
		name: 'Emergency Visit',
		noteType: 'emergency',
		description: 'Emergency department or urgent care visit',
		soap: {
			subjective: `Chief Complaint: [Primary emergency concern]

Onset: [When did this start? Sudden vs gradual]
Severity: [Mild / Moderate / Severe / Life-threatening]

Associated Symptoms:
- [List all current symptoms]
- [Progression over time]

Events Leading to Visit:
- [What happened?]
- [Mechanism of injury if trauma]

Previous Episodes: [Has this happened before?]

Past Medical History: [Relevant conditions]
Current Medications: [List]
Allergies: [Medications, foods]

Last Meal: [Time and content]
Tetanus Status: [If injury - date of last tetanus]`,

			objective: `Triage Category: [ESI 1-5 or equivalent]

Vital Signs:
- BP: [value] (Orthostatic if indicated)
- HR: [value]
- Temp: [value]
- RR: [value]
- SpO2: [value] on [room air / O2]
- Pain Score: [0-10]

General Appearance:
- [Distress level, mental status, work of breathing]

HEENT: [Head, eyes, ears, nose, throat findings]
Neck: [Stiffness, masses, JVD]
Cardiovascular: [Heart sounds, rhythm, perfusion]
Respiratory: [Breath sounds, effort, accessory muscle use]
Abdomen: [Soft, rigid, tender, guarding, rebound]
Extremities: [Perfusion, edema, deformity, wounds]
Neurological: [GCS, pupils, motor/sensory, reflexes]
Skin: [Color, temperature, rashes, lesions]

If Trauma:
- [Injury location and description]
- [Neurovascular status]`,

			assessment: `Emergency Diagnosis: [Primary diagnosis with ICD-10]

Acuity: [Stable / Unstable / Critical]

Differential Diagnoses:
1. [Most likely alternative]
2. [Life-threatening alternative to rule out]
3. [Other considerations]

Risk Stratification:
- [Risk scoring if applicable: HEART, PERC, Wells, etc.]
- [Immediate life threats identified: Yes / No]

Need for Admission: [Yes / No / Observation]`,

			plan: `Immediate Interventions:
- [IV access, oxygen, monitoring]
- [Medications administered with times]
- [Procedures performed]

Diagnostic Workup:
- Labs: [CBC, BMP, troponin, etc.]
- Imaging: [X-ray, CT, ultrasound, MRI]
- ECG: [If cardiac concern]
- Other: [Consultations requested]

Treatment:
- [Medications prescribed or administered]
- [Wound care, splinting, procedures]

Response to Treatment:
- [Symptom improvement, vital signs stabilization]

Disposition:
- [Discharge / Admit / Observation / Transfer]
- [Admit to: Floor / ICU / Telemetry]

Discharge Instructions (if discharged):
- [Activity restrictions]
- [Medications with instructions]
- [Follow-up timing and with whom]
- [Return precautions - when to come back]
- [Work/school note if needed]

Consultations:
- [Specialists consulted]

Patient Understanding:
- [Diagnosis, treatment, follow-up explained and understood]`
		}
	},

	procedure_note: {
		name: 'Procedure Note',
		noteType: 'procedure',
		description: 'Documentation for procedures performed',
		soap: {
			subjective: `Indication for Procedure: [Why is this procedure needed?]

Informed Consent:
- Risks explained: [Yes / No]
- Benefits explained: [Yes / No]
- Alternatives discussed: [Yes / No]
- Questions answered: [Yes / No]
- Patient/family understanding: [Adequate / Needs reinforcement]
- Consent form signed: [Yes / No]

Pre-Procedure Status:
- Patient fasting: [Yes / No / N/A]
- Allergies reviewed: [Yes - None / Yes - Listed]
- Medications reviewed: [Anticoagulants held if needed]
- Previous similar procedures: [Yes / No / Complications]`,

			objective: `Pre-Procedure Assessment:
- Vital Signs: BP [value], HR [value], SpO2 [value]
- Airway assessment: [Normal / Concerns]
- Site verification: [Correct site marked and verified]
- Time-out performed: [Yes - All parties agreed]

Procedure Details:
- Procedure name: [Full name of procedure]
- Date and time: [Start - End times]
- Location: [Anatomical site with laterality]
- Approach: [Technique used]
- Operator: [Primary physician]
- Assistant(s): [Names and roles]
- Anesthesia: [Local / Sedation / General / None]
- Anesthesia provider: [Name if applicable]

Equipment Used:
- [List relevant equipment, sizes, lot numbers if applicable]

Technique:
[Step-by-step description of procedure performed]

Findings:
- [Anatomical findings]
- [Pathology observed]
- [Biopsies taken: Yes / No]

Specimens:
- [Specimens collected and sent to pathology]
- [Cultures sent if applicable]

Estimated Blood Loss: [Amount]

Complications:
- [None / List any complications]

Hemostasis: [Achieved / Ongoing bleeding managed]

Patient Tolerance:
- [Vital signs during procedure]
- [Sedation level if applicable]
- [Any adverse reactions]`,

			assessment: `Procedure Outcome: [Successful / Unsuccessful / Partially completed]

Technical Success: [Yes / No / With modifications]

Complications: [None / Intraoperative / Immediate post-procedure]

Post-Procedure Status: [Stable / Requires monitoring / Concerns]

Specimens Adequacy: [Adequate / Inadequate / N/A]

Patient Condition: [Improved / Unchanged / Declined]`,

			plan: `Immediate Post-Procedure Care:
- Monitoring: [Duration and parameters]
- Vital signs: [Frequency]
- Site checks: [Frequency and what to assess]

Post-Procedure Orders:
- Activity: [Bed rest / Ambulate / Restrictions]
- Diet: [NPO / Clear liquids / Regular]
- IV fluids: [Type and rate if applicable]
- Medications: [Pain control, antibiotics, etc.]

Wound/Site Care:
- Dressing: [Type and when to change]
- Drain management: [If applicable]
- Sutures/staples: [When to remove]

Monitoring:
- [What to watch for]
- [Frequency of assessments]

Discharge Criteria (if outpatient):
- Stable vital signs
- Adequate pain control
- No active bleeding
- Alert and oriented
- Able to ambulate/void if required
- Understands discharge instructions

Discharge Instructions:
- Activity restrictions: [Duration and type]
- Wound care: [Instructions]
- Pain management: [Medications]
- Signs of complications: [When to call/return]
- Medications: [New prescriptions or changes]

Follow-up:
- [When and with whom]
- [Results discussion if pending]
- [Suture/staple removal if needed]

Pathology:
- [Expected results timeframe]
- [Who will discuss results]`
		}
	}
};

/**
 * Get a SOAP template by key
 */
export function getSOAPTemplate(key: keyof typeof SOAP_TEMPLATES): SOAPTemplate {
	return SOAP_TEMPLATES[key];
}

/**
 * Get all template names and descriptions
 */
export function getAllSOAPTemplates(): Array<{
	key: string;
	name: string;
	noteType: NoteType;
	description: string;
}> {
	return Object.entries(SOAP_TEMPLATES).map(([key, template]) => ({
		key,
		name: template.name,
		noteType: template.noteType,
		description: template.description
	}));
}

/**
 * Get templates filtered by note type
 */
export function getTemplatesByNoteType(noteType: NoteType): Array<{
	key: string;
	template: SOAPTemplate;
}> {
	return Object.entries(SOAP_TEMPLATES)
		.filter(([_, template]) => template.noteType === noteType)
		.map(([key, template]) => ({ key, template }));
}

/**
 * Create an empty SOAP structure with prompts
 */
export function createEmptySOAP(): SOAP {
	return {
		subjective: 'Patient reports...',
		objective: 'On examination...',
		assessment: 'Clinical impression...',
		plan: 'Treatment plan...'
	};
}
