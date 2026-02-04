import type { MedicalRecord, Diagnosis, Prescription, Medication, LabResult } from '$types';
import { nanoid } from 'nanoid';
import { mockUsers } from './users';
import { mockPatients } from './patients';
import { mockAppointments } from './appointments';

const doctors = mockUsers.filter((u) => u.role === 'doctor');

function getRandomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], min: number, max: number): T[] {
	const count = Math.floor(Math.random() * (max - min + 1)) + min;
	const shuffled = [...array].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

// Turkish medical data
const chiefComplaints = [
	'Baş ağrısı ve bulantı şikayeti ile başvurdu',
	'3 gündür devam eden ateş ve boğaz ağrısı',
	'Karın ağrısı ve hazımsızlık yakınması',
	'Sırt ve bel ağrısı şikayeti',
	'Öksürük ve nefes darlığı',
	'Göğüs ağrısı ve çarpıntı hissi',
	'Baş dönmesi ve dengesizlik',
	'Halsizlik ve yorgunluk',
	'Eklem ağrıları ve şişlik',
	'Deri döküntüsü ve kaşıntı',
	'Uyku problemi ve konsantrasyon güçlüğü',
	'Karın şişkinliği ve gaz sıkıntısı',
	'Göz ağrısı ve bulanık görme',
	'Kulak ağrısı ve işitme azalması',
	'Burun tıkanıklığı ve akıntı'
];

const presentIllnesses = [
	'Hasta 3 gün önce başlayan ateş, baş ağrısı ve boğaz ağrısı şikayetleri ile başvurdu. Ateşi 38-39°C arasında seyrediyor. İştahsızlık ve halsizlik var.',
	'Son 1 haftadır artan bel ağrısı mevcut. Ağrı sabahları daha şiddetli, hareketle artıyor. Bacaklara yayılım yok.',
	'2 gün önce başlayan karın ağrısı ve ishal. Günde 5-6 kez sulu dışkılama. Bulantı ve kusma eşlik ediyor.',
	'Kronik hastalık takibinde olan hasta. Son kontrol tarihinden bu yana ilaçlarını düzenli kullanıyor. Şikayeti yok.',
	'Göğüs ağrısı ve nefes darlığı ile başvurdu. Ağrı eforla artıyor, istirahatle azalıyor. Terleme eşlik ediyor.',
	'Birkaç gündür devam eden baş ağrısı. Zonklayıcı tarzda, temporal bölgede lokalize. Işık ve sesten rahatsız oluyor.'
];

const physicalExaminations = [
	'Genel durum orta, bilinç açık, koopere ve oryante. Farinks hiperemik, tonsiller büyümüş. Servikal lenfadenopati mevcut.',
	'Vital bulgular stabil. Kardiyovasküler ve solunum sistemi doğal. Batın muayenesi yumuşak, hassasiyet yok.',
	'Lomber bölgede paravertebral kas spazmı mevcut. Düz bacak kaldırma testi negatif. Nörolojik muayene normal.',
	'Akciğer oskültasyonda bilateral bazallerde ronküs duyuluyor. Ekspiryum uzamış. Wheeze mevcut.',
	'Deri muayenesinde eritematöz makülopapüler döküntü izlendi. Kaşıntı mevcut, ateş yok.',
	'Kalp tetkikinde ritim düzenli, üfürüm yok. Periferik nabızlar alınıyor. Ödem yok.'
];

const assessments = [
	'Akut üst solunum yolu enfeksiyonu tablosu ile uyumlu bulgular mevcut.',
	'Lomber disk patolojisi düşünüldü. MR görüntüleme planlandı.',
	'Akut gastroenterit tanısı konuldu. Hidratasyon durumu takip edilecek.',
	'Kronik hastalık kontrolü yapıldı. Tedavi devam edilecek.',
	'Stabil angina pektoris tanısı konuldu. Kardiyoloji konsültasyonu istendi.',
	'Migren atağı olarak değerlendirildi. Abortif tedavi verildi.'
];

const plans = [
	'Semptomatik tedavi başlandı. Bol sıvı alımı önerildi. 3 gün sonra kontrol.',
	'Analjezik ve kas gevşetici reçete edildi. Fizik tedavi önerildi. 1 hafta sonra kontrol.',
	'Oral rehidratasyon solüsyonu ve probiyotik başlandı. Diyet önerileri verildi.',
	'Mevcut tedavi devam edilecek. 1 ay sonra kontrol randevusu verildi.',
	'EKG çekildi. Kardiyoloji konsültasyonu planlandı. Aspirin başlandı.',
	'Migren profilaksisi için ilaç ayarlaması yapıldı. Tetikleyici faktörlerden kaçınma önerildi.'
];

const followUpInstructions = [
	'İlaçları düzenli kullanmalı. Ateş 38°C üzerine çıkarsa tekrar başvurmalı.',
	'Ağır kaldırmaktan kaçınmalı. Sıcak uygulama yapabilir. Egzersizlere dikkat etmeli.',
	'Bol su içmeli. Baharatlı ve yağlı yiyeceklerden kaçınmalı.',
	'Kan şekeri düzenli takip etmeli. Diyet ve egzersiz programına uymalı.',
	'Göğüs ağrısı artar veya yeni semptom olursa acil başvurmalı.',
	'Stresli durumlardan kaçınmalı. Düzenli uyku ve beslenme düzenine dikkat etmeli.'
];

// ICD-10 codes and diagnoses
const diagnosisList = [
	{ code: 'J06.9', name: 'Akut Üst Solunum Yolu Enfeksiyonu', severity: 'mild' },
	{ code: 'J03.9', name: 'Akut Tonsillit', severity: 'mild' },
	{ code: 'A09', name: 'Gastroenterit', severity: 'mild' },
	{ code: 'M54.5', name: 'Lomber Ağrı', severity: 'moderate' },
	{ code: 'M51.2', name: 'Lomber Disk Hernisi', severity: 'moderate' },
	{ code: 'I10', name: 'Esansiyel Hipertansiyon', severity: 'moderate' },
	{ code: 'E11.9', name: 'Diyabet Mellitus Tip 2', severity: 'moderate' },
	{ code: 'J45.9', name: 'Astım', severity: 'moderate' },
	{ code: 'K29.7', name: 'Gastrit', severity: 'mild' },
	{ code: 'G43.9', name: 'Migren', severity: 'moderate' },
	{ code: 'J20.9', name: 'Akut Bronşit', severity: 'mild' },
	{ code: 'L50.9', name: 'Ürtiker', severity: 'mild' }
];

// Medications for prescriptions
const medicationList = [
	{
		name: 'Paracetamol',
		dosage: '500 mg',
		frequency: 'Günde 3 kez',
		duration: '5 gün',
		instructions: 'Ağrı veya ateşte kullanınız'
	},
	{
		name: 'Amoksisilin-Klavulanat',
		dosage: '1000 mg',
		frequency: 'Günde 2 kez',
		duration: '7 gün',
		instructions: 'Tok karnına alınız'
	},
	{
		name: 'İbuprofen',
		dosage: '400 mg',
		frequency: 'Günde 3 kez',
		duration: '5 gün',
		instructions: 'Yemeklerden sonra alınız'
	},
	{
		name: 'Omeprazol',
		dosage: '20 mg',
		frequency: 'Günde 1 kez',
		duration: '30 gün',
		instructions: 'Sabah aç karnına alınız'
	},
	{
		name: 'Ramipril',
		dosage: '5 mg',
		frequency: 'Günde 1 kez',
		duration: '30 gün',
		instructions: 'Sabah alınız'
	},
	{
		name: 'Metformin',
		dosage: '850 mg',
		frequency: 'Günde 2 kez',
		duration: '30 gün',
		instructions: 'Yemeklerle birlikte alınız'
	},
	{
		name: 'Salbutamol İnhaler',
		dosage: '100 mcg',
		frequency: 'Gerektiğinde',
		duration: '30 gün',
		instructions: '2 puf, günde en fazla 4 kez'
	},
	{
		name: 'Sertralin',
		dosage: '50 mg',
		frequency: 'Günde 1 kez',
		duration: '30 gün',
		instructions: 'Sabah alınız'
	}
];

// Lab tests
const labTests = [
	{
		testName: 'Hemoglobin',
		testType: 'Tam Kan Sayımı',
		unit: 'g/dL',
		referenceRange: '12-16 (K), 13-17 (E)'
	},
	{
		testName: 'Lökosit',
		testType: 'Tam Kan Sayımı',
		unit: '10^3/µL',
		referenceRange: '4.5-11'
	},
	{
		testName: 'Açlık Kan Şekeri',
		testType: 'Biyokimya',
		unit: 'mg/dL',
		referenceRange: '70-100'
	},
	{
		testName: 'HbA1c',
		testType: 'Biyokimya',
		unit: '%',
		referenceRange: '<5.7'
	},
	{
		testName: 'TSH',
		testType: 'Hormon',
		unit: 'mIU/L',
		referenceRange: '0.4-4.0'
	},
	{
		testName: 'Kreatinin',
		testType: 'Biyokimya',
		unit: 'mg/dL',
		referenceRange: '0.6-1.2'
	},
	{
		testName: 'ALT',
		testType: 'Karaciğer Fonksiyon',
		unit: 'U/L',
		referenceRange: '<40'
	},
	{
		testName: 'CRP',
		testType: 'Enflamasyon',
		unit: 'mg/L',
		referenceRange: '<5'
	}
];

// Create 25 medical records
export const mockMedicalRecords: MedicalRecord[] = [];

// Get completed appointments for EMR
const completedAppointments = mockAppointments.filter((a) => a.status === 'completed');

for (let i = 0; i < Math.min(25, completedAppointments.length); i++) {
	const appointment = completedAppointments[i];
	const patient = mockPatients.find((p) => p.id === appointment.patientId)!;
	const doctor = doctors.find((d) => d.id === appointment.doctorId)!;

	// Generate vital signs
	const weight = 50 + Math.random() * 50; // 50-100 kg
	const height = 150 + Math.random() * 40; // 150-190 cm
	const bmi = weight / Math.pow(height / 100, 2);

	const vitalSigns = {
		temperature: 36 + Math.random() * 2.5, // 36-38.5
		bloodPressureSystolic: 100 + Math.floor(Math.random() * 40), // 100-140
		bloodPressureDiastolic: 60 + Math.floor(Math.random() * 30), // 60-90
		heartRate: 60 + Math.floor(Math.random() * 40), // 60-100
		respiratoryRate: 12 + Math.floor(Math.random() * 8), // 12-20
		oxygenSaturation: 95 + Math.floor(Math.random() * 6), // 95-100
		weight,
		height,
		bmi
	};

	// Generate diagnoses
	const numDiagnoses = Math.floor(Math.random() * 2) + 1; // 1-2 diagnoses
	const selectedDiagnoses = getRandomItems(diagnosisList, numDiagnoses, numDiagnoses);
	const diagnoses: Diagnosis[] = selectedDiagnoses.map((d) => ({
		id: nanoid(),
		code: d.code,
		name: d.name,
		severity: d.severity as 'mild' | 'moderate' | 'severe',
		status: Math.random() > 0.3 ? 'active' : 'resolved',
		diagnosedDate: appointment.date
	}));

	// Generate prescription
	const hasPresciption = Math.random() > 0.2;
	const prescriptions: Prescription[] = [];

	if (hasPresciption) {
		const numMeds = Math.floor(Math.random() * 3) + 1; // 1-3 medications
		const selectedMeds = getRandomItems(medicationList, numMeds, numMeds);
		const medications: Medication[] = selectedMeds.map((m) => ({
			id: nanoid(),
			name: m.name,
			dosage: m.dosage,
			frequency: m.frequency,
			duration: m.duration,
			instructions: m.instructions,
			startDate: appointment.date,
						endDate: new Date(appointment.date.getTime() + parseInt(m.duration) * 24 * 60 * 60 * 1000)
		}));

		prescriptions.push({
			id: nanoid(),
			medications,
			notes: 'İlaçları düzenli kullanınız. Yan etki durumunda doktora başvurunuz.',
			prescribedDate: appointment.date,
			prescribedBy: doctor.id
		});
	}

	// Generate lab results (30% chance)
	const hasLabResults = Math.random() > 0.7;
	let labResults: LabResult[] | undefined;

	if (hasLabResults) {
		const numTests = Math.floor(Math.random() * 4) + 2; // 2-5 tests
		const selectedTests = getRandomItems(labTests, numTests, numTests);
		labResults = selectedTests.map((test) => {
			const range = test.referenceRange.replace(/[<>]/g, '').split(/[-,()]/);
			let minVal = parseFloat(range[0]);
			let maxVal = range.length > 1 ? parseFloat(range[1]) : minVal * 2;

			// Sometimes generate abnormal results
			const isAbnormal = Math.random() > 0.7;
			let result: number;
			if (isAbnormal) {
				result = Math.random() > 0.5 ? maxVal * 1.2 : minVal * 0.8;
			} else {
				result = minVal + Math.random() * (maxVal - minVal);
			}

			return {
				id: nanoid(),
				testName: test.testName,
				testType: test.testType,
				result: result.toFixed(1),
				unit: test.unit,
				referenceRange: test.referenceRange,
				status: isAbnormal ? 'abnormal' : 'normal',
				testDate: appointment.date
			};
		});
	}

	const record: MedicalRecord = {
		id: nanoid(),
		patientId: patient.id,
		appointmentId: appointment.id,
		doctorId: doctor.id,
		visitDate: appointment.date,
		chiefComplaint: getRandomItem(chiefComplaints),
		presentIllness: getRandomItem(presentIllnesses),
		physicalExamination: getRandomItem(physicalExaminations),
		vitalSigns,
		diagnoses,
		prescriptions,
		labResults,
		procedures:
			Math.random() > 0.8
				? getRandomItems(
						['EKG', 'Röntgen', 'Ultrason', 'Pansuman', 'İnjeksiyon', 'Nebül tedavisi'],
						1,
						2
					)
				: undefined,
		assessment: getRandomItem(assessments),
		plan: getRandomItem(plans),
		followUpInstructions: Math.random() > 0.3 ? getRandomItem(followUpInstructions) : undefined,
		notes:
			Math.random() > 0.7
				? getRandomItem([
						'Hasta bilgilendirildi ve onayı alındı',
						'İlaç yan etkileri anlatıldı',
						'Kontrol randevusu verildi',
						'Hasta koopere ve uyumlu'
					])
				: undefined,
		createdAt: appointment.date,
		updatedAt: appointment.date,
		createdBy: doctor.id
	};

	mockMedicalRecords.push(record);
}

// Sort by visit date (newest first)
mockMedicalRecords.sort((a, b) => b.visitDate.getTime() - a.visitDate.getTime());

export default mockMedicalRecords;
