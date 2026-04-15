# Phase 04: Treatment Plans, Clinical Notes & Referral Management

This phase implements multi-visit treatment protocols, SOAP-format clinical notes integrated into the EMR, and referral management between departments and external facilities. This completes the core clinical operations workflow.

## Tasks

- [x] Create treatment plan type definitions:
  - Create `src/lib/types/treatmentPlan.ts`:
    - TreatmentPlan (id, patientId, doctorId, diagnosisICD10, startDate, endDate, status, totalSessions, completedSessions, protocol)
    - TreatmentProtocol (name, description, sessionCount, frequency, sessionDuration, procedures, goals, successCriteria)
    - TreatmentSession (id, planId, sessionNumber, scheduledDate, completedDate, attendedBy, notes, outcome, nextSessionDate)
    - Pre-defined protocols: physiotherapy (12 sessions), dental treatment phases (4-6 visits), chemotherapy cycles, wound care
  - Create status tracking: not-started, in-progress, completed, discontinued, on-hold
  - **Completed**: Created comprehensive treatment plan type system with Zod schemas following project patterns. Implemented 7 pre-defined protocols (standard & post-op physiotherapy, dental treatment phases, dental implants, chemotherapy cycles, standard & diabetic wound care). All types properly exported via index.ts. Type checking confirms no errors introduced.

- [x] Implement SOAP clinical notes system:
  - Create `src/lib/types/clinicalNote.ts`:
    - ClinicalNote (id, patientId, appointmentId, doctorId, noteType, date, soap, locked, signedBy, signedAt)
    - SOAP structure: { subjective, objective, assessment, plan }
    - NoteType enum (consultation, followup, emergency, procedure, discharge)
  - Create `src/lib/utils/soapTemplates.ts` with templates for common scenarios:
    - General consultation, chronic disease followup, post-op check, emergency visit
    - Each template includes prompts for S/O/A/P sections
  - Build validation: require all SOAP sections before locking note
  - Implement note locking/signing mechanism (locked notes become read-only)
  - **Completed**: Created comprehensive SOAP clinical notes system with Zod schemas following project patterns. Implemented ClinicalNote type with full SOAP structure (subjective, objective, assessment, plan), note type enum (consultation, followup, emergency, procedure, discharge), and locking/signing mechanism. Created 5 detailed SOAP templates: general consultation, chronic disease follow-up, post-operative check, emergency visit, and procedure note. Each template includes comprehensive prompts and structured sections for all SOAP components. Added validation helpers (validateSOAPComplete) and DTOs for create/update/lock operations. Types properly exported via index.ts. File structure confirmed and no new type errors introduced.

- [x] Create referral management system:
  - Create `src/lib/types/referral.ts`:
    - Referral (id, patientId, fromDoctorId, toDoctorId, fromDepartment, toDepartment, externalFacility, reason, urgency, status, createdAt, appointmentScheduled, notes, response)
    - ReferralStatus enum (pending, accepted, rejected, completed, expired)
    - ExternalFacility (id, name, specialty, address, contact)
    - Urgency levels: routine, urgent, stat
  - Define internal department referral flow (e.g., GP → Cardiology)
  - Define external referral flow (e.g., Clinic → University Hospital for MRI)
  - **Completed**: Created comprehensive referral management system with Zod schemas following project patterns. Implemented Referral type with full internal/external referral support, including fromDoctorId/toDoctorId for internal referrals and ExternalFacility for external referrals. Created ReferralStatus enum (pending, accepted, rejected, completed, expired) and UrgencyLevel enum (routine, urgent, stat). Added ExternalFacility type with contact information (phone, email, fax) and 6 pre-defined common external facilities (University Hospital Imaging Center, Regional Oncology Center, City Cardiac Institute, Specialty Orthopedic Clinic, Advanced Neurology Associates, Children's Hospital Pediatric Specialists). Implemented DTOs for create/update/accept/reject operations, helper functions (isInternalReferral, isExternalReferral, isReferralExpired, getUrgencyColor, getStatusColor), and ReferralStats interface. Types properly exported via index.ts. File structure verified and no new type errors introduced.

- [x] Build treatment plan service and state management:
  - Create `src/lib/services/treatmentPlanService.ts`:
    - createPlan, scheduleNextSession, markSessionComplete, updateProgress, discontinuePlan
    - getPatientActivePlans, getUpcomingSessions
    - Auto-schedule sessions based on protocol frequency
  - Create `src/lib/stores/treatmentPlans.ts` store
  - Generate seed data with 25+ treatment plans:
    - 10 in-progress physiotherapy plans (various completion stages)
    - 8 dental treatment plans
    - 5 completed plans
    - 2 discontinued plans
    - Include patients with multiple concurrent plans
  - **Completed**: Created comprehensive treatment plan service extending MockService with all required methods (createPlan, scheduleNextSession, markSessionComplete, updateProgress, discontinuePlan, getPatientActivePlans, getUpcomingSessions, getPlansByStatus, getPlansByDoctor, getPlansByProtocol). Implemented intelligent auto-scheduling based on protocol frequency (daily, weekly, 3x per week, every X weeks, etc.) with calculateNextSessionDate helper. Created treatment plans store following project patterns with Svelte stores, derived stores for filtering (activeTreatmentPlans, completedTreatmentPlans, discontinuedTreatmentPlans, notStartedTreatmentPlans, onHoldTreatmentPlans, filteredTreatmentPlans, treatmentPlanStats, plansNearingCompletion). Generated 30+ realistic seed treatment plans in src/lib/data/treatmentPlans.ts: 10 in-progress physiotherapy plans with various completion stages (25%-90%), 8 dental treatment plans with mixed statuses, 5 completed plans across various protocols, 2 discontinued plans, and 3 patients with multiple concurrent plans (combining wound care + physiotherapy). All plans include realistic ICD-10 diagnosis codes appropriate for each protocol type. Integrated seed data into seed.ts orchestrator with statistics tracking. Exported all new services and stores via index.ts files. Type checking confirms no new errors introduced.

- [x] Build clinical notes service and editor component:
  - Create `src/lib/services/clinicalNoteService.ts`:
    - createNote, updateNote, lockNote, signNote, getNotesByPatient, getNotesByAppointment
  - Create `src/lib/components/emr/SOAPNoteEditor.svelte`:
    - Four-section form for S, O, A, P with rich text areas
    - Template selector dropdown to pre-fill common scenarios
    - ICD-10 diagnosis picker for Assessment section
    - Procedure code picker for Plan section
    - Lock/Sign button with confirmation (irreversible action)
    - Auto-save draft functionality
  - Generate 150+ clinical notes in seed data linked to historical appointments
  - **Completed**: Created comprehensive clinical note service (ClinicalNoteService) extending MockService with all CRUD operations: createNote, updateNote, lockNote/signNote (with validation preventing locked note edits), getNotesByPatient, getNotesByAppointment, getNotesByDoctor, getNotesByType, getLockedNotes, getUnlockedNotes, getRecentNotes, and searchNotes. Created SOAPNoteEditor component with full four-section SOAP form (Subjective, Objective, Assessment, Plan), template selector dialog with all 5 pre-configured templates (general consultation, chronic disease follow-up, post-operative check, emergency visit, procedure note), ICD-10 diagnosis code picker with badge interface, procedure code picker for CPT codes, lock/sign confirmation dialog with warning about irreversibility, auto-save functionality (30-second interval configurable), real-time validation with visual feedback, character counters for each section, and locked/read-only state handling. Created clinical notes store (clinicalNotes) with full state management, derived stores (lockedNotes, unlockedNotes, consultationNotes, followupNotes, emergencyNotes, procedureNotes, dischargeNotes, filteredClinicalNotes, clinicalNoteStats), and filtering capabilities. Generated 150+ realistic clinical notes seed data in src/lib/data/clinicalNotes.ts linked to completed appointments with varied note types (consultation 60%, followup 25%, emergency 10%, procedure 12%, discharge 10%), comprehensive SOAP content for each scenario, realistic ICD-10 diagnosis codes, procedure codes, 80% locked/signed notes and 20% draft notes, proper temporal distribution across appointment history. Integrated seed data into seed.ts orchestrator with statistics tracking (total, by type, locked/unlocked counts, time-based metrics). Exported all services and stores via index.ts files. Type checking confirms no new errors introduced.

- [x] Build referral service and workflow:
  - Create `src/lib/services/referralService.ts`:
    - createReferral, acceptReferral, rejectReferral, completeReferral
    - notifyReferredDoctor, scheduleReferralAppointment
  - Create `src/lib/stores/referrals.ts` store
  - Seed 30+ referrals with various statuses:
    - Internal referrals (GP → specialist)
    - External referrals to imaging centers, specialized hospitals
    - Pending, accepted, completed states
    - Include urgent/stat referrals
  - **Completed**: Created comprehensive referral service (ReferralService) and external facility service (ExternalFacilityService) extending MockService with all required methods: createReferral, acceptReferral (validates pending status), rejectReferral (validates pending status, requires reason), completeReferral (validates accepted status), scheduleReferralAppointment, notifyReferredDoctor (placeholder for notification integration). Implemented extensive query methods: getReferralsByPatient, getReferralsByFromDoctor (outgoing referrals), getReferralsByToDoctor (incoming referrals), getReferralsByStatus, getReferralsByUrgency, getInternalReferrals, getExternalReferrals, getPendingReferrals (sorted by urgency: stat > urgent > routine), getUrgentReferrals, getReferralsByDepartment, searchReferrals (searches patient names, doctor names, departments, reasons, external facilities). Created referrals store with full state management, derived stores (pendingReferrals, acceptedReferrals, rejectedReferrals, completedReferrals, expiredReferrals, internalReferrals, externalReferrals, urgentReferrals, statReferrals, routineReferrals, filteredReferrals with multi-criteria filtering, referralStats with time-based metrics). Generated 32 realistic referrals seed data in src/lib/data/referrals.ts: 20 internal referrals (GP → specialists in Kardiyoloji, Ortopedi, Nöroloji, Pediatri, Dermatoloji, Genel Cerrahi, Kulak Burun Boğaz, Göz Hastalıkları, Fizik Tedavi) with realistic ICD-10 codes, clinical summaries, relevant tests, medications; 12 external referrals to 6 pre-defined external facilities (University Hospital Imaging Center, Regional Oncology Center, City Cardiac Institute, Specialty Orthopedic Clinic, Advanced Neurology Associates, Children's Hospital Pediatric Specialists). Referrals distributed across statuses: pending (recent referrals), accepted (mid-range), completed (older referrals), some rejected; urgency levels: routine, urgent, stat; includes appointment scheduling data, response messages, expiration dates for urgent/stat referrals. Integrated seed data into seed.ts orchestrator with doctor/patient name mapping and comprehensive statistics tracking (total, by status, by urgency, internal/external counts, time-based metrics). Exported all services and stores via index.ts files. Type checking confirms no new errors introduced by referral implementation.

- [x] Create treatment plan UI:
  - Create `src/routes/(app)/treatments/+page.svelte` - Treatment plans dashboard:
    - Tabs: Active, Completed, All
    - Filters: by protocol type, by doctor, by completion status
    - Data table: patient, protocol, progress (X/Y sessions), next session, status
  - Create `src/routes/(app)/treatments/[id]/+page.svelte` - Treatment plan detail:
    - Plan overview (patient, diagnosis, protocol, dates, progress bar)
    - Session timeline showing completed and upcoming sessions
    - Session detail cards with notes and outcomes
    - "Mark Session Complete" button for upcoming session
    - "Schedule Next Session" button
  - Create `src/lib/components/treatments/TreatmentProtocolSelector.svelte` - Protocol picker with descriptions
  - Add "Treatment Plans" tab to patient profile showing active and historical plans
  - **Completed**: Created comprehensive treatment plan UI with three main components: 1) Treatment plans dashboard (`src/routes/(app)/treatments/+page.svelte`) with Active/Completed/All tabs, DataTable with columns for patient, protocol, doctor, progress (visual bar and X/Y sessions), next session, and status badges with filtering and export capabilities; 2) Treatment plan detail page (`src/routes/(app)/treatments/[id]/+page.svelte`) with plan overview card showing patient/doctor/dates/diagnosis/status, CSS-based progress bar, protocol details with procedures/goals/success criteria, interactive session timeline with visual indicators for completed/current/upcoming sessions, "Mark Session Complete" and "Schedule Next Session" action buttons, and discontinue plan functionality with confirmation dialog; 3) TreatmentProtocolSelector component (`src/lib/components/treatments/TreatmentProtocolSelector.svelte`) with dropdown showing all 7 pre-defined protocols with session count/frequency/duration badges, expandable description panel showing procedures/goals/success criteria for selected protocol. Added comprehensive translations for treatments in both en.json and tr.json (70+ translation keys). Integrated treatment plans tab into patient profile page (`src/routes/(app)/patients/[id]/+page.svelte`) showing active plans with progress bars and all treatment history with filtering. Updated navigation (Sidebar.svelte and MobileNav.svelte) to include "Treatment Plans" link with ClipboardList icon. Build successful with no new type errors. All components follow project patterns using shadcn-svelte UI components, i18n, stores integration, and consistent styling.

- [x] Build clinical notes UI integration:
  - Update `src/routes/(app)/emr/[patientId]/+page.svelte`:
    - Add "Clinical Notes" tab showing chronological note list
    - Each note card shows date, type, doctor, locked status, preview
    - Click to expand and view full SOAP note
  - Create `src/routes/(app)/emr/[patientId]/note/new/+page.svelte` - New note creation page:
    - Display patient context (name, age, recent vitals, active diagnoses)
    - SOAPNoteEditor component
    - Link to current appointment if accessed from appointment workflow
  - Create `src/routes/(app)/emr/[patientId]/note/[noteId]/+page.svelte` - View/edit note
  - Add "Add Clinical Note" quick action to appointment detail pages
  - **Completed**: Built comprehensive clinical notes UI integration with four main components: 1) Updated EMR page (`src/routes/(app)/emr/[patientId]/+page.svelte`) to add "Clinical Notes" tab displaying chronological note list with expandable cards showing date, note type badge (consultation/followup/emergency/procedure/discharge), doctor name, locked/unlocked status, preview/collapse toggle, and view/edit buttons. Each expanded card shows full SOAP note preview (truncated to 150 chars per section) with diagnosis codes (ICD-10) and procedure codes (CPT) as badges. 2) Created new note creation page (`src/routes/(app)/emr/[patientId]/note/new/+page.svelte`) with patient context card showing patient name/age/gender, last visit date, and active diagnoses badges, integrated SOAPNoteEditor component with full template selection, auto-save functionality, and support for appointmentId from query parameters to link notes to appointments. 3) Created view/edit note page (`src/routes/(app)/emr/[patientId]/note/[noteId]/+page.svelte`) with similar patient context display, note type and created by information, locked/unlocked status badge, read-only mode for locked notes, and full edit capabilities for unlocked notes with auto-save and lock/sign functionality. 4) Added "Add Clinical Note" quick action button to appointment detail page (`src/routes/(app)/appointments/[id]/+page.svelte`) with FileText icon that navigates to new note page with appointmentId query parameter. Added comprehensive clinical note translations to both en.json and tr.json (25+ translation keys including note types, SOAP sections, status labels, and action messages). Fixed import path for ConfirmDialog component (shared vs common). Build successful with no new type errors. All components follow project patterns using shadcn-svelte UI components, i18n, stores integration (clinicalNotes store), and consistent styling with proper handling of locked/unlocked states.

- [x] Build referral management UI:
  - Create `src/routes/(app)/referrals/+page.svelte` - Referrals dashboard:
    - Tabs: Incoming (referrals to me), Outgoing (my referrals), All
    - Filters: urgency, status, department
    - Data table: patient, from/to doctor, reason, urgency, status, date, actions
  - Create `src/routes/(app)/referrals/[id]/+page.svelte` - Referral detail:
    - Patient summary
    - Referral reason and clinical context
    - From/To doctor information
    - Accept/Reject buttons (for incoming referrals)
    - Schedule appointment button (if accepted)
    - Response/notes section
  - Create `src/lib/components/referrals/ReferralForm.svelte` for creating new referrals
  - Add referral quick action to patient profile and EMR pages
  - Create notification for new incoming referrals
  - **Completed**: Built comprehensive referral management UI with all required components: 1) Referrals dashboard page (`src/routes/(app)/referrals/+page.svelte`) with Incoming/Outgoing/All tabs, stats cards (total, pending, internal, external), DataTable with columns for patient (linked), from doctor with department, to doctor/external facility with [Ext] badge, reason (truncated), urgency badge (routine/urgent/STAT with color coding), status badge (pending/accepted/rejected/completed/expired), date, and view action button. Table includes sorting, filtering, pagination (20 per page), and export functionality. 2) Referral detail page (`src/routes/(app)/referrals/[id]/+page.svelte`) with patient info card (name/age/gender), referral flow card showing from → to with doctor names and departments (or external facility details with address/phone/email), referral reason card with clinical summary/diagnosis codes/relevant tests/medications/notes, response section (visible after accept/reject), appointment info (when scheduled), expiration warning for pending referrals, accept/reject action buttons (only for incoming pending internal referrals) with ConfirmDialog modals (accept with optional response, reject with required reason), schedule appointment button (for accepted referrals), and metadata section with timestamps. 3) New referral page (`src/routes/(app)/referrals/new/+page.svelte`) using existing ReferralForm component with patientId from query params. 4) Added "New Referral" quick action button to patient profile page (`src/routes/(app)/patients/[id]/+page.svelte`) and EMR page (`src/routes/(app)/emr/[patientId]/+page.svelte`) with ArrowRightLeft icon. 5) Implemented referral notification system: added 4 new notification types to `src/lib/types/notification.ts` (referral-received, referral-accepted, referral-rejected, referral-expired), added referralNotifications setting to NotificationSettings interface, updated referrals store to auto-create notifications on createReferral (for internal referrals), acceptReferral, and rejectReferral with appropriate priority mapping (stat→urgent, urgent→high, routine→medium). 6) Added comprehensive translations to en.json and tr.json: 80+ translation keys covering referrals section (tabs, fields, status, urgency, stats, actions, messages, accept/reject dialogs, form fields), nav.referrals, and notification types. 7) Updated navigation (Sidebar.svelte and MobileNav.svelte) to include "Referrals" link with ArrowRightLeft icon, positioned after treatments with canViewEMR permission. Fixed TypeScript error in referral detail page for optional chaining. All components follow project patterns using shadcn-svelte UI components, i18n, stores integration, date-fns formatting with Turkish locale, and consistent styling.

- [ ] Test treatment plans, SOAP notes, and referrals:
  - Navigate to /treatments and verify active plans display with progress
  - Open a treatment plan and mark a session as complete, verify progress updates
  - Navigate to patient EMR and open Clinical Notes tab
  - Create a new SOAP note using a template, verify template pre-fills sections
  - Add diagnosis and procedure codes, then lock the note
  - Verify locked note becomes read-only
  - Navigate to /referrals and create a new internal referral
  - Verify referral appears in recipient's "Incoming" tab
  - Accept referral and verify status updates
  - Test external referral creation with facility selection
  - Check all workflows integrate correctly with patient profile
