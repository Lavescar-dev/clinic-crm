/**
 * Services index - Export all service-related modules
 */

export { MockApi } from './mockApi';
export { MockStore, clearAllMockData, getAllMockDataKeys } from './mockStore';
export { MockService } from './mockService';
export { StaffService, staffService } from './staffService';
export { ShiftService, shiftService } from './shiftService';
export {
	LabOrderService,
	LabSampleService,
	LabResultService,
	labOrderService,
	labSampleService,
	labResultService
} from './labService';
export { TreatmentPlanService, treatmentPlanService } from './treatmentPlanService';
export { ClinicalNoteService, clinicalNoteService } from './clinicalNoteService';
export {
	ReferralService,
	ExternalFacilityService,
	referralService,
	externalFacilityService
} from './referralService';
export type {
	MockStoreConfig,
	MockServiceConfig,
	OptimisticUpdate,
	MockServiceStats
} from './types';
