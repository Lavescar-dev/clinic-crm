import type { Patient } from '$types';
import { nanoid } from 'nanoid';

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
	const today = new Date();
	let age = today.getFullYear() - dateOfBirth.getFullYear();
	const monthDiff = today.getMonth() - dateOfBirth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
		age--;
	}
	return age;
}

// Turkish cities for realistic addresses
const cities = [
	{ name: 'İstanbul', districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Bakırköy', 'Beyoğlu'] },
	{ name: 'Ankara', districts: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut'] },
	{ name: 'İzmir', districts: ['Konak', 'Karşıyaka', 'Bornova', 'Alsancak', 'Buca'] },
	{ name: 'Bursa', districts: ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Gemlik'] },
	{ name: 'Antalya', districts: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya'] }
];

const streets = [
	'Atatürk Caddesi',
	'İstiklal Caddesi',
	'Cumhuriyet Caddesi',
	'Gazi Mustafa Kemal Bulvarı',
	'Fevzi Çakmak Sokak',
	'Mimar Sinan Caddesi',
	'Barbaros Bulvarı',
	'Fatih Sultan Mehmet Caddesi',
	'Hürriyet Caddesi',
	'İnönü Bulvarı'
];

// Turkish first names
const maleNames = [
	'Ahmet',
	'Mehmet',
	'Mustafa',
	'Ali',
	'Hasan',
	'Hüseyin',
	'İbrahim',
	'Yusuf',
	'Ömer',
	'Emre',
	'Can',
	'Burak',
	'Murat',
	'Serkan',
	'Kemal',
	'Oğuz',
	'Cem',
	'Onur',
	'Tolga',
	'Barış',
	'Deniz',
	'Eren',
	'Arda',
	'Kaan',
	'Volkan'
];

const femaleNames = [
	'Ayşe',
	'Fatma',
	'Zeynep',
	'Emine',
	'Hatice',
	'Elif',
	'Merve',
	'Selin',
	'Büşra',
	'Esra',
	'Neslihan',
	'Gizem',
	'Tuğçe',
	'Yasemin',
	'Burcu',
	'Deniz',
	'Seda',
	'Özlem',
	'Ebru',
	'Gamze',
	'Dilek',
	'Aslı',
	'Pınar',
	'Gül',
	'Melike'
];

const lastNames = [
	'Yılmaz',
	'Kaya',
	'Demir',
	'Şahin',
	'Çelik',
	'Yıldız',
	'Yıldırım',
	'Öztürk',
	'Aydın',
	'Özdemir',
	'Arslan',
	'Doğan',
	'Kılıç',
	'Aslan',
	'Çetin',
	'Kara',
	'Koç',
	'Kurt',
	'Özkan',
	'Şimşek',
	'Polat',
	'Erdoğan',
	'Aksoy',
	'Güneş',
	'Taş',
	'Karataş',
	'Güler',
	'Avcı',
	'Çakır',
	'Özer'
];

// Medical data in Turkish
const allergies = [
	'Penisilin',
	'Aspirin',
	'Polen',
	'Fıstık',
	'Süt ürünleri',
	'Yumurta',
	'Balık',
	'Arı sokması',
	'Lateks',
	'Kedi tüyü',
	'Toz akarı',
	'Gluten',
	'Soya',
	'İyot'
];

const chronicDiseases = [
	'Hipertansiyon',
	'Diyabet Tip 2',
	'Astım',
	'KOAH',
	'Koroner Arter Hastalığı',
	'Hiperlipidemi',
	'Hipotiroidi',
	'Migren',
	'Romatoid Artrit',
	'Osteoartrit',
	'Gastrit',
	'Reflü',
	'Depresyon',
	'Anksiyete Bozukluğu'
];

const medications = [
	'Ramipril 5mg',
	'Metformin 850mg',
	'Atorvastatin 20mg',
	'Aspirin 100mg',
	'Levotiroksin 100mcg',
	'Salbutamol inhaler',
	'Omeprazol 20mg',
	'Pantoprazol 40mg',
	'Sertralin 50mg',
	'Escitalopram 10mg',
	'Paracetamol 500mg',
	'İbuprofen 400mg'
];

const insuranceProviders = [
	'Axa Sigorta',
	'Allianz Sigorta',
	'Acıbadem Sigorta',
	'Başak Groupama Sigorta',
	'Anadolu Sigorta',
	'Sompo Japan Sigorta',
	'Türk Nippon Sigorta',
	'HDI Sigorta'
];

// Generate realistic TC Kimlik No (simplified - not actual validation algorithm)
function generateTCNo(): string {
	let tc = '';
	// First digit cannot be 0
	tc += Math.floor(Math.random() * 9) + 1;
	// Next 9 digits
	for (let i = 0; i < 9; i++) {
		tc += Math.floor(Math.random() * 10);
	}
	// Last digit (simplified checksum)
	tc += Math.floor(Math.random() * 10);
	return tc;
}

function getRandomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], max: number): T[] {
	const count = Math.floor(Math.random() * (max + 1));
	const shuffled = [...array].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

function getRandomDate(startYear: number, endYear: number): Date {
	const start = new Date(startYear, 0, 1);
	const end = new Date(endYear, 11, 31);
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomPhone(): string {
	const prefixes = ['532', '533', '534', '535', '536', '537', '538', '539', '505', '506'];
	const prefix = getRandomItem(prefixes);
	const rest = Math.floor(Math.random() * 10000000)
		.toString()
		.padStart(7, '0');
	return `0${prefix}${rest}`;
}

// Create 50+ diverse Turkish patients
export const mockPatients: Patient[] = [];

// Generate patients
for (let i = 0; i < 55; i++) {
	const gender = Math.random() > 0.5 ? 'male' : 'female';
	const firstName = gender === 'male' ? getRandomItem(maleNames) : getRandomItem(femaleNames);
	const lastName = getRandomItem(lastNames);
	const dateOfBirth = getRandomDate(1939, 2006); // Ages from 18 to 85
	const age = calculateAge(dateOfBirth);
	const city = getRandomItem(cities);
	const district = getRandomItem(city.districts);
	const street = getRandomItem(streets);

	// Determine insurance type
	let insuranceType: 'sgk' | 'private' | 'none';
	const insuranceRand = Math.random();
	if (insuranceRand < 0.7) {
		insuranceType = 'sgk';
	} else if (insuranceRand < 0.95) {
		insuranceType = 'private';
	} else {
		insuranceType = 'none';
	}

	// Older patients and some younger ones have more health issues
	const hasChronicDisease = age > 50 ? Math.random() > 0.4 : Math.random() > 0.8;
	const hasAllergies = Math.random() > 0.7;
	const takesMedications = hasChronicDisease ? Math.random() > 0.3 : Math.random() > 0.9;

	const registrationDate = getRandomDate(2020, 2024);
	const hasRecentVisit = Math.random() > 0.3;
	const lastVisit = hasRecentVisit
		? new Date(
				registrationDate.getTime() +
					Math.random() * (new Date().getTime() - registrationDate.getTime())
			)
		: undefined;

	const patient: Patient = {
		id: nanoid(),
		tcNo: generateTCNo(),
		firstName,
		lastName,
		fullName: `${firstName} ${lastName}`,
		dateOfBirth,
		age,
		gender,
		bloodType: Math.random() > 0.1 ? getRandomItem(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']) : undefined,
		status: Math.random() > 0.95 ? 'inactive' : 'active',
		contact: {
			phone: getRandomPhone(),
			email:
				Math.random() > 0.3
					? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`
					: undefined,
			address: {
				street: `${street} No: ${Math.floor(Math.random() * 200) + 1}`,
				city: city.name,
				district,
				postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
				country: 'Türkiye'
			}
		},
		emergencyContact: {
			name: `${gender === 'male' ? getRandomItem(femaleNames) : getRandomItem(maleNames)} ${lastName}`,
			relationship: getRandomItem(['Eş', 'Anne', 'Baba', 'Kardeş', 'Çocuk']),
			phone: getRandomPhone()
		},
		insurance: {
			type: insuranceType,
			provider: insuranceType === 'private' ? getRandomItem(insuranceProviders) : undefined,
			policyNumber:
				insuranceType === 'private'
					? `POL${Math.floor(Math.random() * 900000) + 100000}`
					: undefined,
			validUntil:
				insuranceType === 'private'
					? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
					: undefined
		},
		allergies: hasAllergies ? getRandomItems(allergies, 3) : [],
		chronicDiseases: hasChronicDisease ? getRandomItems(chronicDiseases, 2) : [],
		medications: takesMedications ? getRandomItems(medications, 3) : [],
		notes:
			Math.random() > 0.7
				? getRandomItem([
						'Düzenli kontrol gerekiyor',
						'İlaç alerjisi dikkat',
						'Aile öyküsünde kalp hastalığı var',
						'Sigara kullanıyor',
						'Alkol kullanmıyor',
						'Düzenli egzersiz yapıyor',
						'Özel diyet uyguluyor'
					])
				: undefined,
		registrationDate,
		lastVisit,
		createdAt: registrationDate,
		updatedAt: lastVisit || registrationDate
	};

	mockPatients.push(patient);
}

// Sort patients by last name for easier browsing
mockPatients.sort((a, b) => a.lastName.localeCompare(b.lastName, 'tr'));

export default mockPatients;
