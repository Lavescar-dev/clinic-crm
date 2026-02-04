import type { Appointment } from '$types';
import { nanoid } from 'nanoid';
import { mockUsers } from './users';
import { mockPatients } from './patients';

// Get doctors from users
const doctors = mockUsers.filter((u) => u.role === 'doctor');

function getRandomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], max: number): T[] {
	const count = Math.floor(Math.random() * (max + 1));
	const shuffled = [...array].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

// Generate appointment date and time
function generateAppointmentSlot(daysOffset: number): {
	date: Date;
	startTime: string;
	endTime: string;
} {
	const date = new Date();
	date.setDate(date.getDate() + daysOffset);
	date.setHours(0, 0, 0, 0);

	// Working hours: 9:00 - 18:00, 30-minute slots
	const hour = Math.floor(Math.random() * 9) + 9; // 9-17
	const minute = Math.random() > 0.5 ? 0 : 30;

	const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

	const endHour = minute === 30 ? hour + 1 : hour;
	const endMinute = minute === 30 ? 0 : 30;
	const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

	return { date, startTime, endTime };
}

// Turkish appointment reasons and symptoms
const consultationReasons = [
	'Baş ağrısı',
	'Boğaz ağrısı',
	'Ateş ve grip',
	'Karın ağrısı',
	'Sırt ağrısı',
	'Öksürük',
	'Nefes darlığı',
	'Göğüs ağrısı',
	'Baş dönmesi',
	'Halsizlik',
	'Bulantı ve kusma',
	'İshal',
	'Eklem ağrısı',
	'Deri döküntüsü',
	'Yorgunluk'
];

const followUpReasons = [
	'Kontrol muayenesi',
	'Tahlil sonuçları',
	'Kan şekeri takibi',
	'Tansiyon kontrolü',
	'İlaç ayarlaması',
	'Ameliyat sonrası kontrol',
	'Fizik tedavi takibi',
	'Yara kontrolü'
];

const routineReasons = [
	'Yıllık check-up',
	'Genel sağlık kontrolü',
	'Kan tahlili',
	'Tansiyon ölçümü',
	'Rutin kontrol',
	'Aşı randevusu',
	'Laboratuvar testleri',
	'Görüntüleme sonuçları'
];

const symptoms = [
	'Ateş',
	'Öksürük',
	'Hapşırma',
	'Burun akıntısı',
	'Baş ağrısı',
	'Kas ağrısı',
	'Halsizlik',
	'İştahsızlık',
	'Terleme',
	'Üşüme titreme'
];

const diagnoses = [
	'Üst solunum yolu enfeksiyonu',
	'Akut tonsillit',
	'Gastroenterit',
	'Migren',
	'Hipertansiyon',
	'Diyabet Tip 2',
	'Lomber disk hernisi',
	'Astım alevlenmesi',
	'Akut bronşit',
	'Gastrit',
	'Alerjik rinit',
	'Anksiyete bozukluğu'
];

const prescriptions = [
	'1. Paracetamol 500mg 3x1 (5 gün)\n2. C Vitamini 1000mg 1x1 (10 gün)',
	'1. Amoksisilin 1000mg 2x1 (7 gün)\n2. İbuprofen 400mg 3x1 (5 gün)',
	'1. Omeprazol 20mg 1x1 aç karnına (30 gün)\n2. Gaviscon şurup 3x1 (15 gün)',
	'1. Ramipril 5mg 1x1 sabah (30 gün)\n2. Aspirin 100mg 1x1 (30 gün)',
	'1. Metformin 850mg 2x1 (30 gün)\n2. Atorvastatin 20mg 1x1 akşam (30 gün)',
	'1. Salbutamol inhaler 2 puf gerektiğinde\n2. Budesonid inhaler 2x2 puf',
	'1. Sertralin 50mg 1x1 sabah (30 gün)',
	'1. Levotiroksin 100mcg 1x1 sabah aç karnına (30 gün)'
];

// Create 35 appointments with varied dates and statuses
export const mockAppointments: Appointment[] = [];

// Past appointments (15) - mostly completed or cancelled
for (let i = 0; i < 15; i++) {
	const daysAgo = -Math.floor(Math.random() * 60) - 1; // 1 to 60 days ago
	const slot = generateAppointmentSlot(daysAgo);
	const doctor = getRandomItem(doctors);
	const patient = getRandomItem(mockPatients);

	const isCompleted = Math.random() > 0.15; // 85% completed
	const status = isCompleted
		? 'completed'
		: Math.random() > 0.5
			? 'cancelled'
			: 'no-show';

	const appointmentType = getRandomItem<'consultation' | 'follow-up' | 'routine-checkup'>([
		'consultation',
		'follow-up',
		'routine-checkup'
	]);

	let reason: string;
	if (appointmentType === 'consultation') {
		reason = getRandomItem(consultationReasons);
	} else if (appointmentType === 'follow-up') {
		reason = getRandomItem(followUpReasons);
	} else {
		reason = getRandomItem(routineReasons);
	}

	const appointment: Appointment = {
		id: nanoid(),
		patientId: patient.id,
		doctorId: doctor.id,
		date: slot.date,
		startTime: slot.startTime,
		endTime: slot.endTime,
		duration: 30,
		type: appointmentType,
		status,
		reason,
		notes:
			Math.random() > 0.7
				? getRandomItem([
						'Hasta zamanında geldi',
						'Geç geldi',
						'Telefon ile hatırlatma yapıldı',
						'Acil durum'
					])
				: undefined,
		symptoms: isCompleted && appointmentType === 'consultation' ? getRandomItems(symptoms, 4) : undefined,
		diagnosis: isCompleted ? getRandomItem(diagnoses) : undefined,
		prescription: isCompleted && Math.random() > 0.3 ? getRandomItem(prescriptions) : undefined,
		followUpDate:
			isCompleted && Math.random() > 0.6
				? new Date(slot.date.getTime() + (Math.floor(Math.random() * 30) + 7) * 24 * 60 * 60 * 1000)
				: undefined,
		createdAt: new Date(slot.date.getTime() - 7 * 24 * 60 * 60 * 1000),
		updatedAt: slot.date
	};

	mockAppointments.push(appointment);
}

// Today's appointments (8)
for (let i = 0; i < 8; i++) {
	const slot = generateAppointmentSlot(0);
	const doctor = getRandomItem(doctors);
	const patient = getRandomItem(mockPatients);

	const statusRand = Math.random();
	let status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed';
	if (statusRand < 0.3) {
		status = 'scheduled';
	} else if (statusRand < 0.6) {
		status = 'confirmed';
	} else if (statusRand < 0.8) {
		status = 'in-progress';
	} else {
		status = 'completed';
	}

	const appointmentType = getRandomItem<'consultation' | 'follow-up' | 'routine-checkup' | 'emergency'>([
		'consultation',
		'follow-up',
		'routine-checkup',
		'emergency'
	]);

	let reason: string;
	if (appointmentType === 'consultation') {
		reason = getRandomItem(consultationReasons);
	} else if (appointmentType === 'follow-up') {
		reason = getRandomItem(followUpReasons);
	} else if (appointmentType === 'emergency') {
		reason = 'Acil durum - ' + getRandomItem(consultationReasons);
	} else {
		reason = getRandomItem(routineReasons);
	}

	const appointment: Appointment = {
		id: nanoid(),
		patientId: patient.id,
		doctorId: doctor.id,
		date: slot.date,
		startTime: slot.startTime,
		endTime: slot.endTime,
		duration: appointmentType === 'emergency' ? 45 : 30,
		type: appointmentType,
		status,
		reason,
		notes:
			status === 'confirmed'
				? 'Hasta telefon ile onayladı'
				: status === 'in-progress'
					? 'Muayene devam ediyor'
					: undefined,
		symptoms: status === 'in-progress' || status === 'completed' ? getRandomItems(symptoms, 3) : undefined,
		diagnosis: status === 'completed' ? getRandomItem(diagnoses) : undefined,
		prescription: status === 'completed' && Math.random() > 0.4 ? getRandomItem(prescriptions) : undefined,
		createdAt: new Date(slot.date.getTime() - 3 * 24 * 60 * 60 * 1000),
		updatedAt: new Date()
	};

	mockAppointments.push(appointment);
}

// Future appointments (12) - all scheduled or confirmed
for (let i = 0; i < 12; i++) {
	const daysAhead = Math.floor(Math.random() * 30) + 1; // 1 to 30 days ahead
	const slot = generateAppointmentSlot(daysAhead);
	const doctor = getRandomItem(doctors);
	const patient = getRandomItem(mockPatients);

	const status = Math.random() > 0.4 ? 'confirmed' : 'scheduled';

	const appointmentType = getRandomItem<'consultation' | 'follow-up' | 'routine-checkup'>([
		'consultation',
		'follow-up',
		'routine-checkup'
	]);

	let reason: string;
	if (appointmentType === 'consultation') {
		reason = getRandomItem(consultationReasons);
	} else if (appointmentType === 'follow-up') {
		reason = getRandomItem(followUpReasons);
	} else {
		reason = getRandomItem(routineReasons);
	}

	const appointment: Appointment = {
		id: nanoid(),
		patientId: patient.id,
		doctorId: doctor.id,
		date: slot.date,
		startTime: slot.startTime,
		endTime: slot.endTime,
		duration: 30,
		type: appointmentType,
		status,
		reason,
		notes: status === 'confirmed' ? 'SMS onayı alındı' : undefined,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	mockAppointments.push(appointment);
}

// Sort by appointment date
mockAppointments.sort((a, b) => {
	const dateCompare = a.date.getTime() - b.date.getTime();
	if (dateCompare !== 0) return dateCompare;
	return a.startTime.localeCompare(b.startTime);
});

export default mockAppointments;
