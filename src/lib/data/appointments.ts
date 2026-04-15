import { browser } from '$app/environment';
import type { Appointment, AppointmentStatus, AppointmentType, User } from '$types';
import { nanoid } from 'nanoid';
import { mockPatients } from './patients';
import { mockUsers } from './users';
import { generateDoctorScheduleBlocks } from './doctorScheduleBlocks';

type WorkingDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

type DoctorScheduleProfile = {
	baseSlots: number;
	startOffsetMinutes: number;
	heavyDay: number;
	shortDay: number;
	daysOff: number[];
	typeCycle: AppointmentType[];
};

const WORKING_DAYS: WorkingDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const DAY_MS = 24 * 60 * 60 * 1000;

const doctors = browser
	? mockUsers
			.filter((user) => user.role === 'doctor')
			.sort((left, right) =>
				(left.fullName ?? `${left.firstName} ${left.lastName}`).localeCompare(
					right.fullName ?? `${right.firstName} ${right.lastName}`,
					'tr'
				)
			)
			.slice(0, 6)
	: [];

const consultationReasons = [
	'İlk muayene değerlendirmesi',
	'Semptom bazlı klinik görüşme',
	'Şikayet odaklı poliklinik kontrolü',
	'Yeni yakınma için klinik değerlendirme',
	'Muayene ve tedavi planı oluşturma'
];

const followUpReasons = [
	'Kontrol muayenesi',
	'Tedavi yanıtı değerlendirmesi',
	'Tetkik sonrası hekim kontrolü',
	'İlaç uyumu takibi',
	'Semptom gerileme kontrolü'
];

const routineReasons = [
	'Rutin sağlık kontrolü',
	'Planlı check-up görüşmesi',
	'Önleyici sağlık taraması',
	'Periyodik laboratuvar değerlendirmesi',
	'Genel durum kontrolü'
];

const emergencyReasons = [
	'Acil klinik değerlendirme',
	'Hızlı müdahale gerektiren yakınma',
	'Aynı gün sıkıştırılmış acil muayene',
	'Semptom artışı nedeniyle öncelikli slot'
];

const symptoms = [
	'Baş ağrısı',
	'Öksürük',
	'Halsizlik',
	'Baş dönmesi',
	'Kas ağrısı',
	'Nefes darlığı',
	'Karın ağrısı',
	'Bulantı',
	'Eklem sertliği',
	'Çarpıntı'
];

const diagnoses = [
	'Üst solunum yolu enfeksiyonu',
	'Hipertansiyon izlemi',
	'Migren atağı',
	'Kas-iskelet sistemi ağrısı',
	'Anemi değerlendirmesi',
	'Alerjik rinit',
	'Gastrit',
	'Tedaviye yanıt iyi',
	'Diyabet kontrolü',
	'Gerilim tipi baş ağrısı'
];

const prescriptions = [
	'1. Parasetamol 500mg 3x1 (5 gün)\n2. Bol sıvı ve istirahat önerildi',
	'1. İbuprofen 400mg 2x1 (5 gün)\n2. Mide koruyucu 1x1',
	'1. Antihistaminik 1x1 (7 gün)\n2. Burun spreyi gerektiğinde',
	'1. Vitamin D 1x1 (30 gün)\n2. Kontrol laboratuvarı planlandı',
	'1. Proton pompa inhibitörü 1x1 (14 gün)\n2. Diyet önerileri paylaşıldı'
];

const specialtyReasonCatalog: Record<string, Partial<Record<AppointmentType, string[]>>> = {
	Dahiliye: {
		consultation: ['Metabolik denge değerlendirmesi', 'Tansiyon regülasyon görüşmesi', 'Genel dahili muayene'],
		'follow-up': ['Kan şekeri kontrolü', 'İlaç titrasyonu kontrolü', 'Dahiliye kontrol ziyareti'],
		'routine-checkup': ['Kronik hastalık izlemi', 'Laboratuvar paneli değerlendirmesi']
	},
	Kardiyoloji: {
		consultation: ['Çarpıntı değerlendirmesi', 'Göğüs ağrısı danışmanlığı', 'Efor kapasitesi görüşmesi'],
		'follow-up': ['Tansiyon ve ritim takibi', 'EKO sonrası kontrol', 'Kardiyak ilaç uyumu kontrolü'],
		'routine-checkup': ['Kardiyak risk taraması', 'Kontrol EKG değerlendirmesi']
	},
	Ortopedi: {
		consultation: ['Diz ağrısı değerlendirmesi', 'Omuz hareket açıklığı muayenesi', 'Bel-boyun ağrısı görüşmesi'],
		'follow-up': ['Ortez ve fizik tedavi kontrolü', 'Travma sonrası kontrol', 'Ağrı yönetimi takibi'],
		'routine-checkup': ['Cerrahi sonrası iyileşme kontrolü', 'Hareket kapasitesi takibi']
	},
	Nöroloji: {
		consultation: ['Migren değerlendirmesi', 'Uyuşma ve denge bozukluğu görüşmesi', 'Nörolojik semptom muayenesi'],
		'follow-up': ['İlaç yanıtı takibi', 'Nörolojik kontrol', 'Tetkik sonuç değerlendirmesi']
	},
	Pediatri: {
		consultation: ['Çocuk ateş değerlendirmesi', 'Büyüme-gelişim görüşmesi', 'Çocuk polikliniği muayenesi'],
		'follow-up': ['Aşı sonrası takip', 'Çocuk kontrol muayenesi', 'Beslenme ve büyüme takibi'],
		'routine-checkup': ['Sağlam çocuk izlemi', 'Gelişim değerlendirme randevusu']
	},
	'Genel Cerrahi': {
		consultation: ['Cerrahi değerlendirme', 'Abdominal yakınma muayenesi', 'Operasyon öncesi görüşme'],
		'follow-up': ['Yara yeri kontrolü', 'Cerrahi sonrası kontrol', 'Pansuman ve iyileşme takibi']
	},
	'Göz Hastalıkları': {
		consultation: ['Görme şikayeti değerlendirmesi', 'Göz kuruluğu muayenesi', 'Kontrol refraksiyon görüşmesi'],
		'follow-up': ['Kontakt lens uyum takibi', 'Tedavi yanıtı kontrolü', 'Göz tansiyonu değerlendirmesi']
	},
	'Kulak Burun Boğaz': {
		consultation: ['Boğaz ağrısı değerlendirmesi', 'Sinüzit muayenesi', 'Kulak basıncı görüşmesi'],
		'follow-up': ['KBB kontrol muayenesi', 'Tedavi sonrası semptom takibi', 'İşitme değerlendirme kontrolü']
	},
	Dermatoloji: {
		consultation: ['Deri döküntüsü değerlendirmesi', 'Akne ve leke danışmanlığı', 'Dermatolojik muayene'],
		'follow-up': ['Topikal tedavi kontrolü', 'Dermatoloji takip görüşmesi', 'Cilt yanıtı değerlendirmesi']
	},
	'Fizik Tedavi ve Rehabilitasyon': {
		consultation: ['Kas-iskelet fonksiyon değerlendirmesi', 'Postür ve hareket muayenesi', 'Rehabilitasyon planlama görüşmesi'],
		'follow-up': ['Egzersiz uyumu kontrolü', 'Ağrı skor takibi', 'FTR seans değerlendirmesi']
	}
};

function modulo(value: number, base: number) {
	return ((value % base) + base) % base;
}

function pickBySeed<T>(items: T[], seed: number): T {
	return items[modulo(seed, items.length)];
}

function pickSubset<T>(items: T[], seed: number, count: number): T[] {
	if (items.length === 0 || count <= 0) return [];

	const result: T[] = [];
	for (let index = 0; index < count; index += 1) {
		const item = items[modulo(seed + index * 3, items.length)];
		if (!result.includes(item)) {
			result.push(item);
		}
	}

	return result;
}

function startOfDay(date: Date) {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	return result;
}

function startOfWeekMonday(date: Date) {
	const result = startOfDay(date);
	const shift = (result.getDay() + 6) % 7;
	result.setDate(result.getDate() - shift);
	return result;
}

function addDays(date: Date, days: number) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function diffInDays(left: Date, right: Date) {
	return Math.round((startOfDay(left).getTime() - startOfDay(right).getTime()) / DAY_MS);
}

function parseTimeToMinutes(time: string) {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
	const hours = Math.floor(minutes / 60)
		.toString()
		.padStart(2, '0');
	const mins = (minutes % 60).toString().padStart(2, '0');
	return `${hours}:${mins}`;
}

function minutesFromDate(dayDate: Date, source: Date) {
	return Math.round((source.getTime() - startOfDay(dayDate).getTime()) / 60000);
}

function resolveDoctorName(doctor: User) {
	return doctor.fullName ?? `${doctor.firstName} ${doctor.lastName}`;
}

function resolvePatientName(patient: (typeof mockPatients)[number]) {
	return patient.fullName ?? `${patient.firstName} ${patient.lastName}`;
}

function resolveWorkingWindow(doctor: User, dayKey: WorkingDay) {
	const workingDay = doctor.workingHours?.[dayKey]?.[0];

	if (!workingDay) {
		return {
			start: 9 * 60,
			end: dayKey === 'friday' ? 16 * 60 : 17 * 60 + 30
		};
	}

	return {
		start: parseTimeToMinutes(workingDay.start),
		end: parseTimeToMinutes(workingDay.end)
	};
}

function resolveDoctorProfile(doctor: User, index: number): DoctorScheduleProfile {
	const specialization = doctor.specialization ?? doctor.department ?? 'Genel Klinik';
	const normalizedSpecialization =
		specialization in specialtyReasonCatalog ? specialization : 'Genel Klinik';

	const typeCycle: AppointmentType[] =
		normalizedSpecialization === 'Kardiyoloji'
			? ['consultation', 'follow-up', 'routine-checkup', 'follow-up']
			: normalizedSpecialization === 'Pediatri'
				? ['consultation', 'routine-checkup', 'follow-up', 'consultation']
				: normalizedSpecialization === 'Genel Cerrahi'
					? ['consultation', 'follow-up', 'consultation', 'routine-checkup']
					: normalizedSpecialization === 'Dermatoloji'
						? ['consultation', 'follow-up', 'routine-checkup', 'consultation']
						: ['consultation', 'follow-up', 'consultation', 'routine-checkup'];

	const daysOff =
		normalizedSpecialization === 'Genel Cerrahi'
			? [2]
			: normalizedSpecialization === 'Göz Hastalıkları'
				? [4]
				: index % 5 === 0
					? [3]
					: [];

	return {
		baseSlots: 3 + (index % 2),
		startOffsetMinutes: (index % 3) * 15,
		heavyDay: index % 4,
		shortDay: 4,
		daysOff,
		typeCycle
	};
}

function resolveAppointmentType(
	doctor: User,
	profile: DoctorScheduleProfile,
	dayIndex: number,
	slotIndex: number,
	dayDifference: number,
	doctorIndex: number
): AppointmentType {
	if (dayDifference === 0 && slotIndex === 0 && doctorIndex % 3 === 0) {
		return 'emergency';
	}

	if (dayDifference === 1 && slotIndex === profile.baseSlots - 1 && doctorIndex % 4 === 1) {
		return 'routine-checkup';
	}

	return pickBySeed(profile.typeCycle, dayIndex + slotIndex + doctorIndex);
}

function resolveAppointmentDuration(type: AppointmentType, doctorIndex: number, slotIndex: number) {
	if (type === 'emergency') {
		return 45;
	}

	if (type === 'follow-up') {
		return doctorIndex % 2 === 0 && slotIndex % 2 === 0 ? 20 : 30;
	}

	if (type === 'routine-checkup') {
		return 30;
	}

	return slotIndex % 3 === 0 ? 45 : 30;
}

function resolveGapMinutes(type: AppointmentType, slotIndex: number) {
	if (type === 'emergency') return 20;
	if (type === 'follow-up') return slotIndex % 2 === 0 ? 10 : 15;
	return 15;
}

function resolveDailySlotCount(
	profile: DoctorScheduleProfile,
	dayIndex: number,
	weekOffset: number,
	doctorIndex: number
) {
	let count = profile.baseSlots;

	if (dayIndex === profile.heavyDay) count += 1;
	if (dayIndex === profile.shortDay) count -= 1;
	if (weekOffset < 0) count += doctorIndex % 2 === 0 ? 0 : 1;
	if (weekOffset > 1) count -= 1;

	return Math.max(2, Math.min(count, 5));
}

function resolveStatus(
	dayDate: Date,
	slotIndex: number,
	slotCount: number,
	doctorIndex: number
): AppointmentStatus {
	const today = startOfDay(new Date());
	const dayDifference = diffInDays(dayDate, today);

	if (dayDifference < 0) {
		if ((slotIndex + doctorIndex + Math.abs(dayDifference)) % 11 === 0) return 'cancelled';
		if ((slotIndex + doctorIndex + Math.abs(dayDifference)) % 7 === 0) return 'no-show';
		return 'completed';
	}

	if (dayDifference === 0) {
		if (slotIndex < Math.min(2, slotCount - 1)) return 'completed';
		if ((slotIndex + doctorIndex) % 4 === 0) return 'in-progress';
		return slotIndex % 2 === 0 ? 'confirmed' : 'scheduled';
	}

	if (dayDifference <= 2) {
		return slotIndex < 2 ? 'confirmed' : 'scheduled';
	}

	return (slotIndex + doctorIndex + dayDifference) % 3 === 0 ? 'confirmed' : 'scheduled';
}

function resolveReason(doctor: User, type: AppointmentType, seed: number) {
	const specialty = doctor.specialization ?? doctor.department ?? '';
	const specialtyCatalog = specialtyReasonCatalog[specialty]?.[type];

	if (specialtyCatalog && specialtyCatalog.length > 0) {
		return pickBySeed(specialtyCatalog, seed);
	}

	if (type === 'follow-up') return pickBySeed(followUpReasons, seed);
	if (type === 'routine-checkup') return pickBySeed(routineReasons, seed);
	if (type === 'emergency') return pickBySeed(emergencyReasons, seed);
	return pickBySeed(consultationReasons, seed);
}

function resolveNotes(status: AppointmentStatus, type: AppointmentType, seed: number) {
	if (status === 'confirmed') {
		return pickBySeed(
			[
				'Hasta SMS ile teyit verdi',
				'Ön büro telefon onayı tamamladı',
				'Dosya ve laboratuvar geçmişi hazırlandı'
			],
			seed
		);
	}

	if (status === 'in-progress') {
		return pickBySeed(
			[
				'Muayene odasında klinik değerlendirme sürüyor',
				'Hemşire triyajı tamamlandı, hekim görüşmesi başladı',
				'Laboratuvar yönlendirmesi sonrası tekrar değerlendirme planlanıyor'
			],
			seed
		);
	}

	if (status === 'completed') {
		return type === 'follow-up'
			? 'Kontrol planı güncellendi ve bir sonraki adım hasta ile paylaşıldı'
			: 'Muayene notları işlendi, öneriler hasta dosyasına kaydedildi';
	}

	if (status === 'cancelled') {
		return 'Hasta tarafından ileri tarihe alınmak üzere iptal edildi';
	}

	if (status === 'no-show') {
		return 'Planlı slotta hasta kliniğe giriş yapmadı';
	}

	return undefined;
}

function resolveFollowUpDate(
	baseDate: Date,
	status: AppointmentStatus,
	type: AppointmentType,
	seed: number
) {
	if (status !== 'completed' || type === 'routine-checkup') {
		return undefined;
	}

	return addDays(baseDate, 7 + modulo(seed, 18));
}

function resolveCreatedAt(baseDate: Date, seed: number) {
	return addDays(baseDate, -(5 + modulo(seed, 12)));
}

function resolveUpdatedAt(baseDate: Date, status: AppointmentStatus, createdAt: Date) {
	if (status === 'in-progress') {
		return new Date();
	}

	if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
		return new Date(baseDate);
	}

	return createdAt;
}

function resolveBlockingWindows(doctor: User, weekStart: Date, dayDate: Date) {
	const dayStart = startOfDay(dayDate);
	const dayEnd = addDays(dayStart, 1);

	return generateDoctorScheduleBlocks(doctor, weekStart)
		.filter((block) => block.kind !== 'day-duty')
		.filter((block) => block.end.getTime() > dayStart.getTime() && block.start.getTime() < dayEnd.getTime())
		.map((block) => ({
			start: Math.max(0, minutesFromDate(dayDate, block.start)),
			end: Math.min(24 * 60, minutesFromDate(dayDate, block.end))
		}))
		.filter((block) => block.end > block.start)
		.sort((left, right) => left.start - right.start);
}

function resolveNextAvailableCursor(
	cursor: number,
	duration: number,
	gap: number,
	blockingWindows: Array<{ start: number; end: number }>,
	workingEnd: number
) {
	let candidate = cursor;

	for (let guard = 0; guard < 12; guard += 1) {
		const overlap = blockingWindows.find(
			(window) => candidate < window.end && candidate + duration > window.start
		);

		if (!overlap) {
			return candidate + duration <= workingEnd ? candidate : null;
		}

		candidate = overlap.end + gap;
		if (candidate + duration > workingEnd) {
			return null;
		}
	}

	return null;
}

function buildDoctorDayAppointments(
	doctor: User,
	doctorIndex: number,
	weekOffset: number,
	dayIndex: number,
	weekStart: Date
) {
	const profile = resolveDoctorProfile(doctor, doctorIndex);
	if (profile.daysOff.includes(dayIndex)) return [];

	const dayKey = WORKING_DAYS[dayIndex];
	const dayDate = addDays(weekStart, weekOffset * 7 + dayIndex);
	const weekReference = addDays(weekStart, weekOffset * 7);
	const workingWindow = resolveWorkingWindow(doctor, dayKey);
	const blockingWindows = resolveBlockingWindows(doctor, weekReference, dayDate);
	const slotTarget = resolveDailySlotCount(profile, dayIndex, weekOffset, doctorIndex);
	const appointments: Appointment[] = [];
	let cursor = workingWindow.start + profile.startOffsetMinutes;

	for (let slotIndex = 0; slotIndex < slotTarget; slotIndex += 1) {
		const seed = doctorIndex * 1000 + (weekOffset + 3) * 100 + dayIndex * 10 + slotIndex;
		const type = resolveAppointmentType(
			doctor,
			profile,
			dayIndex,
			slotIndex,
			diffInDays(dayDate, new Date()),
			doctorIndex
		);
		const duration = resolveAppointmentDuration(type, doctorIndex, slotIndex);
		const gapMinutes = resolveGapMinutes(type, slotIndex);
		const nextAvailableCursor = resolveNextAvailableCursor(
			cursor,
			duration,
			gapMinutes,
			blockingWindows,
			workingWindow.end
		);
		if (nextAvailableCursor === null) break;
		cursor = nextAvailableCursor;

		const patient = mockPatients[modulo(seed * 7 + doctorIndex * 13, mockPatients.length)];
		const status = resolveStatus(dayDate, slotIndex, slotTarget, doctorIndex);
		const reason = resolveReason(doctor, type, seed);
		const startTime = minutesToTime(cursor);
		const endTime = minutesToTime(cursor + duration);
		const createdAt = resolveCreatedAt(dayDate, seed);

		appointments.push({
			id: nanoid(),
			patientId: patient.id,
			patientName: resolvePatientName(patient),
			doctorId: doctor.id,
			doctorName: resolveDoctorName(doctor),
			date: startOfDay(dayDate),
			startTime,
			endTime,
			duration,
			type,
			status,
			reason,
			notes: resolveNotes(status, type, seed),
			symptoms:
				status === 'completed' || status === 'in-progress'
					? pickSubset(symptoms, seed, type === 'emergency' ? 3 : 2)
					: undefined,
			diagnosis: status === 'completed' ? pickBySeed(diagnoses, seed) : undefined,
			prescription:
				status === 'completed' && type !== 'routine-checkup' && seed % 2 === 0
					? pickBySeed(prescriptions, seed)
					: undefined,
				followUpDate: resolveFollowUpDate(dayDate, status, type, seed),
				createdAt,
				updatedAt: resolveUpdatedAt(dayDate, status, createdAt)
			});

		cursor += duration + gapMinutes;
	}

	return appointments;
}

export const mockAppointments: Appointment[] = [];

if (browser && doctors.length > 0 && mockPatients.length > 0) {
	const today = new Date();
	const currentWeekStart = startOfWeekMonday(today);

	for (const [doctorIndex, doctor] of doctors.entries()) {
		for (const weekOffset of [-2, -1, 0, 1]) {
			for (let dayIndex = 0; dayIndex < WORKING_DAYS.length; dayIndex += 1) {
				mockAppointments.push(
					...buildDoctorDayAppointments(doctor, doctorIndex, weekOffset, dayIndex, currentWeekStart)
				);
			}
		}
	}

	mockAppointments.sort((left, right) => {
		const dateCompare = left.date.getTime() - right.date.getTime();
		return dateCompare !== 0 ? dateCompare : left.startTime.localeCompare(right.startTime);
	});
}

export default mockAppointments;
