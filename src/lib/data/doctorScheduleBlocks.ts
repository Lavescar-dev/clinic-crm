import { nanoid } from 'nanoid';
import type { User } from '$types';

export type DoctorScheduleBlockKind =
	| 'operating-room'
	| 'day-duty'
	| 'night-duty'
	| 'ward-round'
	| 'multidisciplinary-board';

export type DoctorScheduleBlock = {
	id: string;
	doctorId: string;
	title: string;
	note: string;
	kind: DoctorScheduleBlockKind;
	start: Date;
	end: Date;
};

const SURGICAL_SPECIALTIES = new Set([
	'Genel Cerrahi',
	'Ortopedi',
	'Göz Hastalıkları',
	'Kulak Burun Boğaz'
]);

const ROUND_SPECIALTIES = new Set(['Dahiliye', 'Kardiyoloji', 'Pediatri', 'Nöroloji']);

function startOfDay(date: Date) {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	return result;
}

function addDays(date: Date, days: number) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function atTime(date: Date, hours: number, minutes = 0) {
	const result = startOfDay(date);
	result.setHours(hours, minutes, 0, 0);
	return result;
}

function doctorSignature(doctor: User) {
	return [...doctor.id].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0);
}

function specialtyLabel(doctor: User) {
	return doctor.specialization ?? doctor.department ?? 'Klinik';
}

export function generateDoctorScheduleBlocks(doctor: User, weekStart: Date): DoctorScheduleBlock[] {
	const signature = doctorSignature(doctor);
	const specialty = specialtyLabel(doctor);
	const blocks: DoctorScheduleBlock[] = [];
	const dutyDay = signature % 5;
	const secondDutyDay = (signature + 2) % 5;
	const nightDutyDay = (signature + 4) % 5;
	const boardDay = (signature + 1) % 5;

	blocks.push({
		id: nanoid(),
		doctorId: doctor.id,
		title: 'Gündüz klinik sorumluluğu',
		note: 'Poliklinik akışı, hızlı konsültasyon ve bekleyen dosyalar bu blokta doktora bağlı.',
		kind: 'day-duty',
		start: atTime(addDays(weekStart, dutyDay), 8, 0),
		end: atTime(addDays(weekStart, dutyDay), 17, 0)
	});

	if (SURGICAL_SPECIALTIES.has(specialty)) {
		blocks.push({
			id: nanoid(),
			doctorId: doctor.id,
			title: 'Ameliyathane bloğu',
			note: `${specialty} için ayrılmış ameliyathane ve hazırlık akışı.`,
			kind: 'operating-room',
			start: atTime(addDays(weekStart, secondDutyDay), 8, 0),
			end: atTime(addDays(weekStart, secondDutyDay), 17, 0)
		});
	} else if (ROUND_SPECIALTIES.has(specialty)) {
		blocks.push({
			id: nanoid(),
			doctorId: doctor.id,
			title: 'Servis viziti',
			note: 'Yatan hasta değerlendirmeleri ve sabah order kontrolü bu pencerede yürütülür.',
			kind: 'ward-round',
			start: atTime(addDays(weekStart, secondDutyDay), 7, 30),
			end: atTime(addDays(weekStart, secondDutyDay), 11, 0)
		});
	} else {
		blocks.push({
			id: nanoid(),
			doctorId: doctor.id,
			title: 'Multidisipliner kurul',
			note: 'Tetkik, tedavi planı ve sevk kararları için ayrılmış kurul bloğu.',
			kind: 'multidisciplinary-board',
			start: atTime(addDays(weekStart, boardDay), 13, 0),
			end: atTime(addDays(weekStart, boardDay), 16, 30)
		});
	}

	if (signature % 2 === 0) {
		blocks.push({
			id: nanoid(),
			doctorId: doctor.id,
			title: 'Gece nöbeti',
			note: 'Acil çağrı, telefon konsültasyonu ve gece gözlem desteği bu blokta doktora bağlı.',
			kind: 'night-duty',
			start: atTime(addDays(weekStart, nightDutyDay), 22, 0),
			end: atTime(addDays(weekStart, nightDutyDay + 1), 6, 0)
		});
	}

	return blocks.sort((left, right) => left.start.getTime() - right.start.getTime());
}
