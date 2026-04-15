/**
 * Clinical Notes Seed Data
 * Generates 150+ realistic SOAP clinical notes linked to historical appointments
 */

import type { ClinicalNote, NoteType, SOAP } from '$lib/types/clinicalNote';
import { mockPatients } from './patients';
import { mockUsers } from './users';
import { mockAppointments } from './appointments';

// Helper function to get random item
function getRandomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random date within range
function getRandomDate(start: Date, end: Date): Date {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Get doctors
const doctors = mockUsers.filter((u) => u.role === 'doctor');

// Get completed appointments (these will have clinical notes)
const completedAppointments = mockAppointments.filter((a) => a.status === 'completed');

/**
 * Generate SOAP notes for different clinical scenarios
 */
const soapTemplates: Record<NoteType, SOAP[]> = {
	consultation: [
		{
			subjective: `Chief Complaint: Patient presents with persistent headache for the past 3 days.

History of Present Illness:
- Onset: 3 days ago, gradual onset
- Location: Bilateral frontal and temporal regions
- Duration: Constant, worse in the evening
- Characteristics: Throbbing pain, rated 6/10
- Aggravating factors: Bright lights, noise, stress
- Relieving factors: Rest in dark room, paracetamol provides minimal relief
- Previous treatments: OTC paracetamol 500mg, limited effect

Past Medical History: Hypertension (controlled), migraine history
Current Medications: Amlodipine 5mg daily
Allergies: No known drug allergies
Social History: Non-smoker, occasional alcohol use, office worker`,

			objective: `Vital Signs:
- BP: 135/85 mmHg
- HR: 78 bpm
- Temp: 36.8°C
- RR: 16/min
- SpO2: 98% on room air
- Weight: 72 kg

General Appearance: Alert, oriented x3, appears mildly uncomfortable

Physical Examination:
- Head/Eyes/Ears/Nose/Throat: Pupils equal and reactive to light, no papilledema, no sinus tenderness
- Cardiovascular: Regular rate and rhythm, no murmurs
- Respiratory: Clear breath sounds bilaterally
- Neurological: Cranial nerves II-XII intact, no focal deficits, no neck stiffness, negative Kernig's sign`,

			assessment: `Primary Diagnosis: Tension-type headache (ICD-10: G44.2)

Differential Diagnoses:
1. Medication overuse headache
2. Migraine without aura
3. Hypertensive headache

Clinical Reasoning:
Bilateral location, constant quality, and absence of neurological symptoms favor tension-type headache. Blood pressure slightly elevated but not concerning for hypertensive emergency. No features suggestive of migraine (no aura, photophobia moderate, no nausea).

Severity: Moderate
Prognosis: Good with appropriate management`,

			plan: `Diagnostic Tests:
- None required at this time

Treatment:
- Medications: Ibuprofen 400mg TID with food for 5 days, then PRN
- Lifestyle: Stress management techniques, regular sleep schedule
- Therapies: Recommend relaxation exercises, adequate hydration

Patient Education:
- Discussed headache diary to identify triggers
- Warning signs: Sudden severe headache, neurological symptoms, fever

Follow-up:
- Return in 2 weeks if symptoms persist
- Sooner if worsening or new symptoms develop

Referrals:
- None at this time`
		},
		{
			subjective: `Chief Complaint: Patient reports persistent cough and chest congestion for 1 week.

History of Present Illness:
- Onset: 7 days ago, started with runny nose
- Location: Chest, productive cough
- Duration: Continuous, worse at night and morning
- Characteristics: Productive cough with yellow-green sputum
- Associated symptoms: Low-grade fever (37.8°C at home), mild fatigue
- Aggravating factors: Cold air, lying flat
- Previous treatments: OTC cough syrup, limited improvement

Past Medical History: Type 2 Diabetes (controlled)
Current Medications: Metformin 1000mg BID
Allergies: Penicillin (rash)
Social History: Non-smoker, works in air-conditioned office`,

			objective: `Vital Signs:
- BP: 128/82 mmHg
- HR: 84 bpm
- Temp: 37.6°C
- RR: 20/min
- SpO2: 96% on room air
- Weight: 85 kg

General Appearance: Alert and oriented, mildly ill-appearing

Physical Examination:
- HEENT: Nasal congestion, pharynx mildly erythematous, no exudates
- Cardiovascular: Regular rate and rhythm, S1 S2 normal
- Respiratory: Scattered rhonchi in bilateral lower lung fields, no wheezing, no crackles
- Abdomen: Soft, non-tender, normal bowel sounds`,

			assessment: `Primary Diagnosis: Acute bronchitis (ICD-10: J20.9)

Differential Diagnoses:
1. Bacterial pneumonia (less likely - no crackles)
2. Viral upper respiratory infection
3. Asthma exacerbation (no history of asthma)

Clinical Reasoning:
Productive cough with colored sputum lasting one week with low-grade fever and rhonchi on exam consistent with acute bronchitis. No focal consolidation to suggest pneumonia. Patient's diabetes well-controlled, not immunocompromised.

Severity: Mild to moderate
Prognosis: Expected resolution in 7-14 days`,

			plan: `Diagnostic Tests:
- Chest X-ray if no improvement in 5 days

Treatment:
- Medications: Azithromycin 500mg day 1, then 250mg days 2-5 (Z-pack due to penicillin allergy)
- Guaifenesin 400mg TID for cough suppression
- Acetaminophen 500mg Q6H PRN for fever
- Inhaler: Albuterol MDI 2 puffs Q4-6H PRN for cough

Patient Education:
- Increase fluid intake (8-10 glasses daily)
- Use humidifier at night
- Avoid irritants (smoke, strong odors)
- Complete antibiotic course even if feeling better
- Warning signs: High fever >38.5°C, difficulty breathing, chest pain

Follow-up:
- Return in 5-7 days if no improvement
- Call sooner if worsening symptoms

Referrals:
- None at this time`
		}
	],

	followup: [
		{
			subjective: `Chronic Condition: Type 2 Diabetes Mellitus

Current Status:
- Overall feeling: Improved compared to last visit
- Symptom control: Blood glucose levels stable
- Adherence to treatment plan: Compliant with medications and diet
- Medication side effects: No adverse effects reported

Interval Changes:
- New symptoms: None
- Lifestyle modifications: Following diabetic diet, walking 30 minutes daily
- Home monitoring results: Fasting glucose 95-125 mg/dL, post-prandial 140-180 mg/dL

Current Medications:
- Metformin 1000mg BID - taking as prescribed
- Atorvastatin 20mg daily - compliant

Barriers to Care:
- None currently`,

			objective: `Vital Signs & Key Metrics:
- BP: 128/78 mmHg (Target: <130/80)
- HR: 72 bpm
- Weight: 78 kg (Change from last visit: -2 kg)
- BMI: 28.4 (down from 29.1)
- Fasting glucose: 118 mg/dL

Physical Examination:
- General: Alert, well-appearing, good energy
- Cardiovascular: Regular rate and rhythm
- Extremities: No edema, pulses 2+ bilaterally, feet exam normal
- Skin: No diabetic dermopathy

Recent Lab Results:
- HbA1c: 6.8% (3 months ago: 7.4%) - improved
- Lipid panel: Total cholesterol 185, LDL 108, HDL 52, Triglycerides 125 - at goal
- Creatinine: 0.9 mg/dL - normal kidney function
- Urine microalbumin: Negative`,

			assessment: `Chronic Condition Status: Well-controlled

Current Problems:
1. Type 2 Diabetes Mellitus (E11.9) - improved control
2. Dyslipidemia (E78.5) - at treatment goals
3. Overweight (BMI 28.4) - improving with lifestyle modifications

Progress Toward Goals:
- HbA1c goal <7%: Achieved (6.8%)
- Weight reduction goal: On track (lost 2kg in 3 months)
- Blood pressure goal <130/80: Achieved

Risk Assessment:
- Low risk for cardiovascular complications with current control
- No evidence of diabetic complications

Treatment Response:
- Excellent response to current regimen
- Lifestyle modifications effective`,

			plan: `Continue Current Management:
- Metformin 1000mg BID
- Atorvastatin 20mg daily
- Continue diabetic diet and exercise program

Adjust Treatment:
- No medication changes needed at this time

New Interventions:
- None required

Monitoring:
- HbA1c every 3 months
- Comprehensive metabolic panel every 6 months
- Lipid panel annually
- Continue daily home glucose monitoring (fasting and post-prandial)
- Target fasting glucose 80-130 mg/dL, post-prandial <180 mg/dL

Patient Education Reinforced:
- Reviewed proper foot care
- Discussed importance of medication compliance
- Encouraged continuation of current lifestyle modifications
- Reviewed hypoglycemia symptoms and management

Follow-up Schedule:
- Next visit: 3 months
- Contact earlier if: Persistent hyperglycemia >250, symptoms of hypoglycemia, illness

Referrals/Consultations:
- Annual ophthalmology exam due in 2 months - referral provided`
		}
	],

	emergency: [
		{
			subjective: `Chief Complaint: Sudden onset severe abdominal pain

Onset: 3 hours ago, sudden onset while at home
Severity: 8/10, constant and worsening

Associated Symptoms:
- Nausea and vomiting (2 episodes, non-bloody)
- No fever at home
- No diarrhea or constipation
- No urinary symptoms

Events Leading to Visit:
- Was eating dinner when pain suddenly started in right lower abdomen
- Pain progressively worsening despite rest

Previous Episodes: No similar episodes in the past

Past Medical History: None significant
Current Medications: None
Allergies: No known drug allergies

Last Meal: Dinner 4 hours ago (chicken and rice)
Tetanus Status: Up to date (2 years ago)`,

			objective: `Triage Category: ESI 2 - High risk

Vital Signs:
- BP: 142/88 mmHg
- HR: 102 bpm
- Temp: 38.1°C
- RR: 22/min
- SpO2: 98% on room air
- Pain Score: 8/10

General Appearance: Moderate distress, lying still, guarding abdomen

HEENT: Normal, no jaundice
Neck: No stiffness, no masses
Cardiovascular: Tachycardic, regular rhythm, no murmurs
Respiratory: Clear breath sounds bilaterally, no respiratory distress
Abdomen: Significant tenderness right lower quadrant with guarding and rebound tenderness, positive McBurney's point tenderness, negative Murphy's sign, hypoactive bowel sounds
Extremities: Warm, well-perfused, no edema
Neurological: Alert and oriented x3`,

			assessment: `Emergency Diagnosis: Acute appendicitis (ICD-10: K35.80)

Acuity: Urgent - requires immediate surgical evaluation

Differential Diagnoses:
1. Acute appendicitis (most likely)
2. Ovarian torsion (if female patient)
3. Ruptured ovarian cyst
4. Mesenteric adenitis

Risk Stratification:
- High probability of appendicitis based on clinical presentation
- Alvarado score: 8/10 (high risk)
- Immediate life threats: Risk of perforation

Need for Admission: Yes - surgical admission likely`,

			plan: `Immediate Interventions:
- IV access established (18G in right AC)
- NPO status initiated
- Continuous cardiac monitoring
- IV fluids: Normal saline 1L bolus, then 125mL/hr

Diagnostic Workup:
- Labs: CBC (WBC 14,500 with left shift), CMP (normal), CRP (elevated 45 mg/L)
- Imaging: Abdominal CT with IV contrast ordered - shows enlarged appendix 12mm with periappendiceal inflammation
- Pregnancy test (if applicable): Negative
- Urinalysis: Normal

Treatment:
- Pain management: Morphine 4mg IV given with good effect
- Antibiotics: Ceftriaxone 1g IV + Metronidazole 500mg IV administered
- Anti-emetics: Ondansetron 4mg IV

Response to Treatment:
- Pain reduced to 5/10 after morphine
- Vital signs stable
- Patient comfortable

Disposition:
- Admit to General Surgery service
- Surgery consultation completed - plan for laparoscopic appendectomy tonight

Consultations:
- General Surgery - Dr. Johnson consulted, agrees with diagnosis, surgery scheduled

Patient Understanding:
- Diagnosis of acute appendicitis explained
- Surgical plan discussed with patient and family
- Risks and benefits of surgery reviewed
- Questions answered, consent obtained`
		}
	],

	procedure: [
		{
			subjective: `Indication for Procedure: Removal of sebaceous cyst on upper back causing discomfort and recurrent inflammation

Informed Consent:
- Risks explained: Bleeding, infection, scarring, recurrence
- Benefits explained: Removal of symptomatic cyst, prevent future infections
- Alternatives discussed: Observation, incision and drainage only
- Questions answered: Patient understanding verified
- Consent form signed: Yes

Pre-Procedure Status:
- Patient fasting: N/A (local procedure)
- Allergies reviewed: Yes - No known drug allergies
- Medications reviewed: No anticoagulants
- Previous similar procedures: No`,

			objective: `Pre-Procedure Assessment:
- Vital Signs: BP 125/75, HR 68, SpO2 98%
- Airway assessment: Normal
- Site verification: Upper back, right paraspinal region marked and verified
- Time-out performed: Yes - All parties agreed

Procedure Details:
- Procedure name: Excision of sebaceous cyst
- Date and time: Start 10:15, End 10:45
- Location: Upper back, right paraspinal, 5cm from midline at T6 level
- Approach: Elliptical excision with primary closure
- Operator: Dr. Smith
- Assistant(s): RN Johnson (circulating nurse)
- Anesthesia: Local infiltration with 1% lidocaine with epinephrine
- Anesthesia provider: N/A (local by operator)

Equipment Used:
- Sterile surgical tray
- 1% Lidocaine with epinephrine 1:100,000 - 8mL used
- 4-0 Vicryl suture for deep closure
- 4-0 Nylon suture for skin closure

Technique:
1. Patient positioned prone, sterile prep with chlorhexidine
2. Local anesthetic infiltrated around cyst
3. Elliptical incision made around cyst opening
4. Cyst dissected free from surrounding tissue intact
5. Cyst wall completely excised to prevent recurrence
6. Hemostasis achieved with electrocautery
7. Deep layer closed with interrupted 4-0 Vicryl
8. Skin closed with running 4-0 Nylon suture
9. Sterile dressing applied

Findings:
- Cyst measured 3 x 2.5 x 2 cm
- Intact cyst wall with thick sebaceous material
- No signs of malignancy grossly

Specimens:
- Cyst submitted to pathology for histological examination (container labeled with patient name and date)

Estimated Blood Loss: Minimal (<10mL)

Complications:
- None

Hemostasis: Excellent

Patient Tolerance:
- Vital signs stable throughout procedure
- Patient comfortable with local anesthesia
- No adverse reactions to medications`,

			assessment: `Procedure Outcome: Successful complete excision

Technical Success: Yes, cyst removed intact with entire cyst wall

Complications: None

Post-Procedure Status: Stable, tolerating procedure well

Specimens Adequacy: Adequate - entire cyst submitted for pathology

Patient Condition: Improved, symptomatic cyst removed`,

			plan: `Immediate Post-Procedure Care:
- Monitoring: 30 minutes post-procedure observation
- Vital signs: Q15 minutes x 4
- Site checks: Dressing dry and intact, no bleeding

Post-Procedure Orders:
- Activity: No restrictions, avoid heavy lifting for 48 hours
- Diet: Regular diet
- Medications: Acetaminophen 500mg Q6H PRN for pain

Wound/Site Care:
- Dressing: Keep clean and dry for 48 hours, then may shower
- Dressing changes: Remove in 48 hours, leave open to air
- Sutures: Non-dissolvable, remove in 10-14 days

Monitoring:
- Watch for signs of infection: Increased pain, redness, swelling, drainage, fever
- Call office if concerns

Discharge Criteria (outpatient):
- Stable vital signs ✓
- Adequate pain control ✓
- No active bleeding ✓
- Alert and oriented ✓
- Understands discharge instructions ✓

Discharge Instructions:
- Activity restrictions: No swimming or soaking for 2 weeks, avoid heavy lifting 48 hours
- Wound care: Keep clean and dry, apply antibiotic ointment after 48 hours
- Pain management: Acetaminophen as needed
- Signs of complications: Fever >38.5°C, increased redness, purulent drainage, wound opening
- Medications: Acetaminophen 500mg Q6H PRN

Follow-up:
- Suture removal in 10-14 days
- Pathology results discussion at follow-up
- Call office if any concerns before scheduled appointment

Pathology:
- Expected results in 7-10 days
- Will call patient with results`
		}
	],

	discharge: [
		{
			subjective: `Patient admitted 3 days ago for community-acquired pneumonia, now clinically improved and ready for discharge.

Hospital Course Summary:
- Admitted with fever, productive cough, and chest pain
- Chest X-ray showed right lower lobe infiltrate
- Treated with IV antibiotics (Ceftriaxone + Azithromycin)
- Supplemental oxygen required initially, now on room air
- Fever resolved on hospital day 2
- Respiratory symptoms improving

Current Status:
- No fever for 48 hours
- Cough improving, less productive
- Breathing comfortably on room air
- Tolerating oral intake well
- Ambulating without difficulty

Discharge Readiness Assessment:
- Vitals stable x 24 hours
- Afebrile x 48 hours
- SpO2 >92% on room air
- Tolerating oral medications and nutrition
- Safe discharge plan in place`,

			objective: `Discharge Physical Examination:
Vital Signs:
- BP: 118/72 mmHg
- HR: 78 bpm
- Temp: 36.9°C (afebrile x 48 hours)
- RR: 16/min
- SpO2: 96% on room air
- Weight: 70 kg

General: Alert, well-appearing, no acute distress
HEENT: Normal, moist mucous membranes
Cardiovascular: Regular rate and rhythm, no murmurs
Respiratory: Clear breath sounds with occasional rhonchi in right base, no wheezing, no rales, respiratory effort normal
Abdomen: Soft, non-tender, normal bowel sounds
Extremities: No edema, good perfusion

Discharge Labs:
- WBC: 9,200 (down from 16,500 on admission)
- Hemoglobin: 13.2 g/dL
- Platelets: 245,000
- Creatinine: 0.9 mg/dL
- CRP: 25 mg/L (down from 120 on admission)

Discharge Imaging:
- Chest X-ray (hospital day 3): Improving right lower lobe infiltrate, no effusion`,

			assessment: `Discharge Diagnosis:
1. Community-acquired pneumonia, right lower lobe (ICD-10: J18.1) - Improving
2. Resolved hypoxemia
3. Resolved fever

Hospital Course:
Patient responded well to IV antibiotic therapy. Fever resolved by hospital day 2. Oxygen requirement resolved by hospital day 3. Inflammatory markers trending down. Patient meets discharge criteria.

Functional Status at Discharge:
- Ambulating independently
- Self-care activities independent
- Returned to baseline functional status

Disposition:
Discharge to home with close outpatient follow-up`,

			plan: `Discharge Medications:
1. Amoxicillin-Clavulanate 875/125mg PO BID x 7 days (to complete 10-day antibiotic course)
2. Guaifenesin 400mg PO TID PRN for cough x 7 days
3. Acetaminophen 500mg PO Q6H PRN for pain or discomfort

Discharge Instructions:
Activity:
- Gradual return to normal activities as tolerated
- Rest when fatigued
- No heavy lifting or strenuous exercise for 1 week

Diet:
- Regular diet
- Maintain good hydration (8-10 glasses water daily)

Medications:
- MUST complete full 7-day course of antibiotics even if feeling better
- Take amoxicillin-clavulanate with food to reduce GI upset

Wound/Incision Care:
- N/A

Warning Signs - Seek immediate medical attention if:
- Fever >38.5°C
- Worsening shortness of breath
- Chest pain
- Coughing up blood
- Confusion or altered mental status
- Unable to keep down liquids or medications

Follow-up Care:
- Primary care physician appointment in 5-7 days (patient to schedule)
- Repeat chest X-ray in 4-6 weeks to confirm resolution
- Pulmonology referral if symptoms don't resolve

Patient Education Provided:
- Pneumonia pathophysiology and recovery timeline (2-4 weeks)
- Importance of completing antibiotic course
- Deep breathing exercises demonstrated
- Smoking cessation counseling provided (if applicable)
- When to seek emergency care

Equipment/Supplies Needed at Home:
- Thermometer for monitoring temperature
- Incentive spirometer (provided)

Home Health Services:
- None required

Prescriptions Given:
- Amoxicillin-Clavulanate 875/125mg #14
- Guaifenesin 400mg #21

Sick Leave/Work Note:
- Recommend 1 week off work, return to work note provided

Patient/Family Understanding:
- Discharge instructions reviewed verbally and in writing
- Patient verbalizes understanding
- Questions answered
- Patient given copy of discharge summary and prescriptions`
		}
	]
};

/**
 * Generate clinical notes for completed appointments
 */
export function seedClinicalNotes(
	appointments: typeof completedAppointments,
	patients: typeof mockPatients,
	doctorList: typeof doctors
): ClinicalNote[] {
	const notes: ClinicalNote[] = [];
	const now = new Date();

	// Use up to 150 completed appointments (or all if fewer)
	const appointmentsToUse = appointments.slice(0, Math.min(150, appointments.length));

	appointmentsToUse.forEach((appointment, index) => {
		const patient = patients.find((p) => p.id === appointment.patientId);
		const doctor = doctorList.find((doctorEntry) => doctorEntry.id === appointment.doctorId);

		if (!patient || !doctor) return;

		// Determine note type based on appointment type or randomly
		let noteType: NoteType;
		if (index % 10 === 0) {
			noteType = 'emergency';
		} else if (index % 8 === 0) {
			noteType = 'procedure';
		} else if (index % 6 === 0) {
			noteType = 'discharge';
		} else if (index % 3 === 0) {
			noteType = 'followup';
		} else {
			noteType = 'consultation';
		}

		// Get random SOAP template for this note type
		const templates = soapTemplates[noteType];
		const soap = getRandomItem(templates);

		// Determine if note should be locked (80% of notes should be locked)
		const locked = Math.random() < 0.8;

		// Generate ICD-10 codes based on note type
		const diagnosisCodes: string[] = [];
		if (noteType === 'consultation') {
			diagnosisCodes.push(
				getRandomItem(['J06.9', 'R50.9', 'M79.3', 'K59.0', 'G44.2', 'J20.9'])
			);
		} else if (noteType === 'followup') {
			diagnosisCodes.push(getRandomItem(['E11.9', 'I10', 'E78.5', 'J45.9']));
		} else if (noteType === 'emergency') {
			diagnosisCodes.push(getRandomItem(['K35.80', 'S06.0', 'I21.9', 'J18.1']));
		} else if (noteType === 'procedure') {
			diagnosisCodes.push(getRandomItem(['L72.3', 'L60.0', 'L98.9']));
		} else if (noteType === 'discharge') {
			diagnosisCodes.push(getRandomItem(['J18.1', 'I21.9', 'K80.0', 'N10']));
		}

		// Generate procedure codes for some notes
		const procedureCodes: string[] = [];
		if (noteType === 'procedure' || Math.random() < 0.3) {
			procedureCodes.push(
				getRandomItem(['99213', '99214', '36415', '71045', '80053', '10060', '12001'])
			);
		}

		// Create the clinical note
		const noteDate = new Date(appointment.date);
		const createdAt = noteDate;
		const updatedAt = locked
			? new Date(noteDate.getTime() + 1000 * 60 * 60 * 2) // 2 hours after appointment
			: new Date(noteDate.getTime() + 1000 * 60 * 30); // 30 minutes after if still draft

		const note: ClinicalNote = {
			id: `note-${index + 1}`,
			patientId: patient.id,
			patientName: `${patient.firstName} ${patient.lastName}`,
			appointmentId: appointment.id,
			doctorId: doctor.id,
			doctorName: doctor.fullName || `${doctor.firstName} ${doctor.lastName}`,
			noteType,
			date: noteDate,
			soap,
			locked,
			signedBy: locked ? doctor.id : undefined,
			signedByName: locked ? doctor.fullName || `${doctor.firstName} ${doctor.lastName}` : undefined,
			signedAt: locked ? new Date(noteDate.getTime() + 1000 * 60 * 60 * 2) : undefined,
			diagnosisCodes,
			procedureCodes,
			createdAt,
			updatedAt
		};

		notes.push(note);
	});

	// Add some additional draft notes (unlocked) for recent appointments
	const recentAppointments = appointments.filter((a) => {
		const daysDiff = Math.floor((now.getTime() - a.date.getTime()) / (1000 * 60 * 60 * 24));
		return daysDiff <= 2;
	});

	recentAppointments.slice(0, 10).forEach((appointment, index) => {
		const patient = patients.find((p) => p.id === appointment.patientId);
		const doctor = doctorList.find((doctorEntry) => doctorEntry.id === appointment.doctorId);

		if (!patient || !doctor) return;

		const noteType: NoteType = 'consultation';
		const templates = soapTemplates[noteType];
		const soap = getRandomItem(templates);

		const noteDate = new Date(appointment.date);
		const note: ClinicalNote = {
			id: `note-draft-${index + 1}`,
			patientId: patient.id,
			patientName: `${patient.firstName} ${patient.lastName}`,
			appointmentId: appointment.id,
			doctorId: doctor.id,
			doctorName: doctor.fullName || `${doctor.firstName} ${doctor.lastName}`,
			noteType,
			date: noteDate,
			soap,
			locked: false,
			diagnosisCodes: ['R50.9'],
			procedureCodes: [],
			createdAt: noteDate,
			updatedAt: new Date()
		};

		notes.push(note);
	});

	return notes;
}

// Generate and export seed data
export const mockClinicalNotes = seedClinicalNotes(completedAppointments, mockPatients, doctors);

console.log(`Generated ${mockClinicalNotes.length} clinical notes`);
