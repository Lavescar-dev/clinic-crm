/**
 * Turkish Data Generator Utilities
 * Generates realistic Turkish demographic data using faker.js
 */

import { faker } from '@faker-js/faker';

// Turkish name pools for realistic name generation
const TURKISH_MALE_FIRST_NAMES = [
	'Ahmet',
	'Mehmet',
	'Mustafa',
	'Ali',
	'Hüseyin',
	'İbrahim',
	'Hasan',
	'Yusuf',
	'Ömer',
	'Murat',
	'Can',
	'Efe',
	'Emir',
	'Kaan',
	'Arda',
	'Barış',
	'Burak',
	'Cem',
	'Deniz',
	'Emre',
	'Onur',
	'Serkan',
	'Tolga',
	'Volkan',
	'Kemal',
	'Selim',
	'Taner',
	'Oğuz',
	'Eren',
	'Alp'
];

const TURKISH_FEMALE_FIRST_NAMES = [
	'Ayşe',
	'Fatma',
	'Emine',
	'Hatice',
	'Zeynep',
	'Elif',
	'Merve',
	'Büşra',
	'Selin',
	'Esra',
	'Gözde',
	'Deniz',
	'İrem',
	'Ebru',
	'Tuğba',
	'Aysun',
	'Burcu',
	'Ceren',
	'Defne',
	'Ece',
	'Aylin',
	'Nazlı',
	'Seda',
	'Yasemin',
	'Melike',
	'Pınar',
	'Sinem',
	'Nisa',
	'Asya',
	'Duru'
];

const TURKISH_LAST_NAMES = [
	'Yılmaz',
	'Kaya',
	'Demir',
	'Çelik',
	'Şahin',
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
	'Erdoğan',
	'Polat',
	'Aksoy',
	'Güneş',
	'Acar',
	'Çakır',
	'Bayram',
	'Karaca',
	'Aktaş',
	'Özer',
	'Türk',
	'Koçak',
	'Uçar',
	'Bozkurt',
	'Demirci',
	'Erdem',
	'Öz',
	'Tekin',
	'Tunç',
	'Keskin'
];

// Turkish city pools for addresses
const TURKISH_CITIES = [
	{ name: 'İstanbul', districts: ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Beyoğlu', 'Fatih', 'Bakırköy', 'Sarıyer', 'Maltepe', 'Ataşehir'] },
	{ name: 'Ankara', districts: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar', 'Gölbaşı', 'Polatlı'] },
	{ name: 'İzmir', districts: ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Çiğli', 'Gaziemir', 'Balçova', 'Narlıdere', 'Bayraklı', 'Güzelbahçe'] },
	{ name: 'Bursa', districts: ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya', 'Gemlik', 'İnegöl', 'Kestel', 'Gürsu', 'Karacabey', 'Mustafakemalpaşa'] },
	{ name: 'Antalya', districts: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Döşemealtı', 'Aksu', 'Serik', 'Alanya', 'Manavgat', 'Kemer', 'Kaş'] },
	{ name: 'Adana', districts: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Karaisalı', 'Ceyhan', 'Kozan', 'İmamoğlu', 'Karataş', 'Yumurtalık'] },
	{ name: 'Konya', districts: ['Meram', 'Selçuklu', 'Karatay', 'Ereğli', 'Akşehir', 'Beyşehir', 'Seydişehir', 'Karapınar', 'Kulu', 'Ilgın'] }
];

// Turkish street names and types
const TURKISH_STREET_TYPES = ['Sokak', 'Cadde', 'Bulvar'];
const TURKISH_STREET_NAMES = [
	'Atatürk',
	'Cumhuriyet',
	'İnönü',
	'Gazi',
	'Mehmet Akif',
	'Zafer',
	'Kültür',
	'Barış',
	'Çiçek',
	'Yeşil',
	'Mavi',
	'Güneş',
	'Ay',
	'Yıldız',
	'Bahçe',
	'Park',
	'Çam',
	'Lale',
	'Gül',
	'Orkide'
];

// Turkish neighborhood name parts
const TURKISH_NEIGHBORHOOD_PARTS = [
	'Yeni',
	'Eski',
	'Merkez',
	'Aşağı',
	'Yukarı',
	'Kuzey',
	'Güney',
	'Doğu',
	'Batı',
	'Çarşı',
	'Pazar',
	'Cumhuriyet',
	'Fatih',
	'Yıldırım',
	'Sultan',
	'Köşk',
	'Bağlar',
	'Çamlık',
	'Tepe',
	'Vadi'
];

/**
 * Generate a random Turkish first name
 */
export function generateTurkishFirstName(gender?: 'male' | 'female'): string {
	if (!gender) {
		gender = faker.helpers.arrayElement(['male', 'female'] as const);
	}
	return gender === 'male'
		? faker.helpers.arrayElement(TURKISH_MALE_FIRST_NAMES)
		: faker.helpers.arrayElement(TURKISH_FEMALE_FIRST_NAMES);
}

/**
 * Generate a random Turkish last name
 */
export function generateTurkishLastName(): string {
	return faker.helpers.arrayElement(TURKISH_LAST_NAMES);
}

/**
 * Generate a random Turkish full name
 */
export function generateTurkishFullName(gender?: 'male' | 'female'): { firstName: string; lastName: string; fullName: string } {
	const firstName = generateTurkishFirstName(gender);
	const lastName = generateTurkishLastName();
	return {
		firstName,
		lastName,
		fullName: `${firstName} ${lastName}`
	};
}

/**
 * Generate a valid TC Kimlik No (Turkish ID Number) with checksum validation
 * Algorithm: 11-digit number where:
 * - First digit cannot be 0
 * - 10th digit = (sum of odd positions * 7 - sum of even positions) % 10
 * - 11th digit = sum of first 10 digits % 10
 */
export function generateTCKimlikNo(): string {
	// Generate first 9 digits
	const digits: number[] = [];
	digits[0] = faker.number.int({ min: 1, max: 9 }); // First digit cannot be 0
	for (let i = 1; i < 9; i++) {
		digits[i] = faker.number.int({ min: 0, max: 9 });
	}

	// Calculate 10th digit
	const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
	const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
	digits[9] = (oddSum * 7 - evenSum) % 10;
	if (digits[9] < 0) digits[9] += 10;

	// Calculate 11th digit
	const totalSum = digits.reduce((sum, digit) => sum + digit, 0);
	digits[10] = totalSum % 10;

	return digits.join('');
}

/**
 * Validate TC Kimlik No checksum
 */
export function validateTCKimlikNo(tcNo: string): boolean {
	if (!/^\d{11}$/.test(tcNo)) return false;
	if (tcNo[0] === '0') return false;

	const digits = tcNo.split('').map(Number);

	// Check 10th digit
	const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
	const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
	let digit10 = (oddSum * 7 - evenSum) % 10;
	if (digit10 < 0) digit10 += 10;
	if (digits[9] !== digit10) return false;

	// Check 11th digit
	const totalSum = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0);
	if (digits[10] !== totalSum % 10) return false;

	return true;
}

/**
 * Generate a realistic Turkish address
 */
export function generateTurkishAddress(): {
	street: string;
	city: string;
	state: string;
	district: string;
	zipCode: string;
	country: string;
} {
	const cityData = faker.helpers.arrayElement(TURKISH_CITIES);
	const streetName = faker.helpers.arrayElement(TURKISH_STREET_NAMES);
	const streetType = faker.helpers.arrayElement(TURKISH_STREET_TYPES);
	const buildingNo = faker.number.int({ min: 1, max: 150 });
	const neighborhoodPart1 = faker.helpers.arrayElement(TURKISH_NEIGHBORHOOD_PARTS);
	const neighborhoodPart2 = faker.helpers.arrayElement(['Mahallesi', 'Mah.']);

	return {
		street: `${streetName} ${streetType} No:${buildingNo}`,
		city: cityData.name,
		state: faker.helpers.arrayElement(cityData.districts),
		district: `${neighborhoodPart1} ${neighborhoodPart2}`,
		zipCode: faker.string.numeric(5),
		country: 'Türkiye'
	};
}

/**
 * Generate a Turkish mobile phone number
 * Format: +90 5XX XXX XX XX
 */
export function generateTurkishPhoneNumber(includeCountryCode = true): string {
	const operators = ['50', '51', '53', '54', '55', '59']; // Turkish mobile operator prefixes
	const operator = faker.helpers.arrayElement(operators);
	const part1 = faker.string.numeric(1);
	const part2 = faker.string.numeric(3);
	const part3 = faker.string.numeric(2);
	const part4 = faker.string.numeric(2);

	if (includeCountryCode) {
		return `+90 ${operator}${part1} ${part2} ${part3} ${part4}`;
	} else {
		return `0${operator}${part1} ${part2} ${part3} ${part4}`;
	}
}

/**
 * Generate a Turkish email address based on Turkish name conventions
 */
export function generateTurkishEmail(firstName?: string, lastName?: string): string {
	if (!firstName || !lastName) {
		const name = generateTurkishFullName();
		firstName = name.firstName;
		lastName = name.lastName;
	}

	// Convert Turkish characters to ASCII equivalents for email
	const normalizeForEmail = (str: string): string => {
		return str
			.toLowerCase()
			.replace(/ı/g, 'i')
			.replace(/ğ/g, 'g')
			.replace(/ü/g, 'u')
			.replace(/ş/g, 's')
			.replace(/ö/g, 'o')
			.replace(/ç/g, 'c')
			.replace(/İ/g, 'i');
	};

	const normalizedFirst = normalizeForEmail(firstName);
	const normalizedLast = normalizeForEmail(lastName);

	const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yandex.com', 'mynet.com'];
	const domain = faker.helpers.arrayElement(domains);

	const formats = [
		`${normalizedFirst}.${normalizedLast}@${domain}`,
		`${normalizedFirst}${normalizedLast}@${domain}`,
		`${normalizedFirst}_${normalizedLast}@${domain}`,
		`${normalizedFirst}${faker.number.int({ min: 1, max: 999 })}@${domain}`,
		`${normalizedFirst}.${normalizedLast}${faker.number.int({ min: 1, max: 99 })}@${domain}`
	];

	return faker.helpers.arrayElement(formats);
}

/**
 * Generate random date within a range
 */
export function generateDateInRange(startDate: Date, endDate: Date): Date {
	return faker.date.between({ from: startDate, to: endDate });
}

/**
 * Generate a birthdate for a specific age range
 */
export function generateBirthDate(minAge = 18, maxAge = 80): Date {
	const now = new Date();
	const maxDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
	const minDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());
	return faker.date.between({ from: minDate, to: maxDate });
}

/**
 * Generate a random time string in HH:mm format
 */
export function generateTimeString(startHour = 8, endHour = 18): string {
	const hour = faker.number.int({ min: startHour, max: endHour });
	const minute = faker.helpers.arrayElement([0, 15, 30, 45]);
	return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Generate a full Turkish contact information
 */
export function generateTurkishContact(gender?: 'male' | 'female'): {
	firstName: string;
	lastName: string;
	fullName: string;
	email: string;
	phone: string;
	address: {
		street: string;
		city: string;
		state: string;
		district: string;
		zipCode: string;
		country: string;
	};
} {
	const name = generateTurkishFullName(gender);
	const email = generateTurkishEmail(name.firstName, name.lastName);
	const phone = generateTurkishPhoneNumber();
	const address = generateTurkishAddress();

	return {
		...name,
		email,
		phone,
		address
	};
}

/**
 * Generate emergency contact information
 */
export function generateEmergencyContact(): {
	name: string;
	relationship: string;
	phone: string;
} {
	const relationships = ['Eş', 'Anne', 'Baba', 'Kardeş', 'Çocuk', 'Arkadaş', 'Akraba'];
	const name = generateTurkishFullName();

	return {
		name: name.fullName,
		relationship: faker.helpers.arrayElement(relationships),
		phone: generateTurkishPhoneNumber()
	};
}
