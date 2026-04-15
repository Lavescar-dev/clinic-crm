import {
	mockClinicalNotes,
	mockLabOrders,
	mockLabResults,
	mockLabSamples,
	mockPrescriptions,
	mockReferrals,
	mockTreatmentPlans
} from '$lib/data/seed';
import { mockStaff } from '$lib/data/staff';
import { mockShifts } from '$lib/data/shifts';
import { clinicalNotes } from '$lib/stores/clinicalNotes';
import { lab } from '$lib/stores/lab';
import { prescriptions } from '$lib/stores/prescriptions';
import { referrals } from '$lib/stores/referrals';
import { staff } from '$lib/stores/staff';
import { shifts } from '$lib/stores/shifts';
import { treatmentPlans } from '$lib/stores/treatmentPlans';

let hasBootstrappedClinicData = false;

export function initializeClinicDemoData() {
	if (hasBootstrappedClinicData) {
		return;
	}

	staff.init(mockStaff);
	shifts.init(mockShifts);
	lab.init(mockLabOrders, mockLabSamples, mockLabResults);
	prescriptions.init(mockPrescriptions);
	treatmentPlans.init(mockTreatmentPlans);
	clinicalNotes.init(mockClinicalNotes);
	referrals.init(mockReferrals);

	hasBootstrappedClinicData = true;
}
