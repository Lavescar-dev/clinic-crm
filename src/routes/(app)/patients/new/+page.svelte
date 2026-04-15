<script lang="ts">
	import { goto } from '$app/navigation';
	import { patients as patientStore } from '$stores/patients';
	import { appointments as appointmentStore } from '$stores/appointments';
	import { mockUsers } from '$data/users';
	import { patientSchema, appointmentSchema, type Appointment, type InsuranceType, type Patient } from '$types';
	import { validateTcNo } from '$utils/validation';
	import { Check, UserPlus } from 'lucide-svelte';
	import { nanoid } from 'nanoid';

	type SimplePatientForm = {
		ad: string;
		tc: string;
		telefon: string;
		dogumTarihi: string;
		randevuTarihi: string;
		randevuSaati: string;
		doktor: string;
		odemeTipi: 'SGK' | 'Özel' | 'Nakit' | 'Kredi Kartı';
		not: string;
	};

	const doctors = mockUsers
		.filter((user) => user.role === 'doctor')
		.sort(
			(left, right) =>
				(left.fullName ?? `${left.firstName} ${left.lastName}`).localeCompare(
					right.fullName ?? `${right.firstName} ${right.lastName}`,
					'tr'
				)
		);

	function createInitialForm(): SimplePatientForm {
		return {
			ad: '',
			tc: '',
			telefon: '',
			dogumTarihi: '',
			randevuTarihi: '',
			randevuSaati: '',
			doktor: '',
			odemeTipi: 'SGK',
			not: ''
		};
	}

	let form = $state<SimplePatientForm>(createInitialForm());
	let basariGoster = $state(false);
	let formError = $state('');
	let savedPatientName = $state('');

	function generateTcNo() {
		const digits = Array.from({ length: 9 }, (_, index) =>
			index === 0 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 10)
		);
		const odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
		const even = digits[1] + digits[3] + digits[5] + digits[7];
		const tenth = ((odd * 7 - even) % 10 + 10) % 10;
		const eleventh = [...digits, tenth].reduce((total, digit) => total + digit, 0) % 10;
		return [...digits, tenth, eleventh].join('');
	}

	function normalizePhone(phone: string) {
		const digits = phone.replace(/\D/g, '');
		if (digits.length >= 10) return digits;
		return '05000000000';
	}

	function splitFullName(fullName: string) {
		const parts = fullName.trim().split(/\s+/).filter(Boolean);
		if (parts.length === 0) {
			return { firstName: '', lastName: '' };
		}
		if (parts.length === 1) {
			return { firstName: parts[0], lastName: 'Hasta' };
		}

		return {
			firstName: parts.slice(0, -1).join(' '),
			lastName: parts.at(-1) ?? 'Hasta'
		};
	}

	function insuranceTypeValue(value: SimplePatientForm['odemeTipi']): InsuranceType {
		if (value === 'SGK') return 'sgk';
		if (value === 'Özel') return 'private';
		return 'none';
	}

	function addMinutes(time: string, amount: number) {
		const [hours, minutes] = time.split(':').map(Number);
		const total = hours * 60 + minutes + amount;
		const resultHours = Math.floor(total / 60)
			.toString()
			.padStart(2, '0');
		const resultMinutes = (total % 60).toString().padStart(2, '0');
		return `${resultHours}:${resultMinutes}`;
	}

	async function kaydet() {
		formError = '';

		if (!form.ad.trim()) {
			formError = 'Hasta adı soyadı zorunludur.';
			return;
		}

		const normalizedTc = form.tc.trim() ? form.tc.replace(/\D/g, '') : generateTcNo();
		if (form.tc.trim() && !validateTcNo(normalizedTc)) {
			formError = 'Geçerli bir T.C. Kimlik No girin.';
			return;
		}

		const { firstName, lastName } = splitFullName(form.ad);
		const insuranceType = insuranceTypeValue(form.odemeTipi);
		const patientId = nanoid();
		const birthDate = form.dogumTarihi ? new Date(form.dogumTarihi) : new Date('1990-01-01');
		const phone = normalizePhone(form.telefon);

		const patientCandidate: Patient = {
			id: patientId,
			tcNo: normalizedTc,
			firstName,
			lastName,
			fullName: form.ad.trim(),
			birthDate,
			gender: 'other',
			status: 'active',
			contact: {
				email: '',
				phone,
				address: {
					street: 'Yerel Demo Klinik Adresi',
					city: 'İstanbul',
					state: 'Kadıköy',
					zipCode: '34710',
					country: 'Türkiye'
				}
			},
			emergencyContact: {
				name: form.ad.trim(),
				relationship: 'Yakın',
				phone
			},
			insurance: {
				type: insuranceType,
				company: insuranceType === 'private' ? 'Özel Sigorta' : '',
				provider: insuranceType === 'private' ? 'Özel Sigorta' : '',
				policyNumber: insuranceType === 'private' ? `POL-${normalizedTc.slice(-5)}` : ''
			},
			medicalHistory: {
				allergies: [],
				pastIllnesses: [],
				surgeries: [],
				medications: []
			},
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const patientResult = patientSchema.safeParse(patientCandidate);
		if (!patientResult.success) {
			formError = patientResult.error.issues[0]?.message ?? 'Hasta kaydı oluşturulamadı.';
			return;
		}

		const createPatientResponse = await patientStore.createPatient(patientResult.data);
		if (!createPatientResponse.success) {
			formError = createPatientResponse.error ?? 'Hasta kaydı oluşturulamadı.';
			return;
		}

		if (form.randevuTarihi && form.randevuSaati && form.doktor) {
			const selectedDoctor = doctors.find((doctor) => doctor.id === form.doktor);
			if (selectedDoctor) {
				const appointmentCandidate: Appointment = {
					id: nanoid(),
					patientId,
					patientName: form.ad.trim(),
					doctorId: selectedDoctor.id,
					doctorName:
						selectedDoctor.fullName ||
						`${selectedDoctor.firstName} ${selectedDoctor.lastName}`.trim(),
					date: new Date(form.randevuTarihi),
					startTime: form.randevuSaati,
					endTime: addMinutes(form.randevuSaati, 30),
					duration: 30,
					type: 'consultation',
					status: 'scheduled',
					reason: form.not.trim() || 'İlk hasta kaydı randevusu',
					notes: form.not.trim() || undefined,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				const appointmentResult = appointmentSchema.safeParse(appointmentCandidate);
				if (appointmentResult.success) {
					await appointmentStore.createAppointment(appointmentResult.data);
				}
			}
		}

		savedPatientName = form.ad.trim();
		basariGoster = true;
	}

	function iptalEt() {
		if (confirm('Formu iptal etmek istediğinize emin misiniz?')) {
			goto('/patients');
		}
	}

	function yenidenBasla() {
		form = createInitialForm();
		formError = '';
		basariGoster = false;
		savedPatientName = '';
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 py-12 font-sans">
	<div class="mx-auto w-full max-w-2xl">
		<div class="mb-10 text-center">
			<div class="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-2 shadow-sm">
				<UserPlus class="h-6 w-6 text-blue-600" />
				<h1 class="text-3xl font-semibold text-slate-900">Yeni Hasta Ekle</h1>
			</div>
			<p class="mt-3 text-lg text-slate-500">Operasyon Masası • Hasta Kayıt Formu</p>
		</div>

		{#if !basariGoster}
			<div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
				<form
					class="space-y-8"
					onsubmit={(event) => {
						event.preventDefault();
						kaydet();
					}}
				>
						<div>
							<label for="patient-full-name" class="mb-2 block text-xs font-medium tracking-wider text-slate-500">
								HASTA ADI SOYADI <span class="text-red-500">*</span>
							</label>
							<input
								id="patient-full-name"
								bind:value={form.ad}
								type="text"
								required
							class="w-full rounded-2xl border border-slate-300 px-6 py-4 text-lg outline-none transition focus:border-blue-600"
							placeholder="Örnek: Ahmet Yılmaz"
						/>
					</div>

						<div class="grid gap-6 sm:grid-cols-2">
							<div>
								<label for="patient-tc" class="mb-2 block text-xs font-medium tracking-wider text-slate-500">TC KİMLİK NO</label>
								<input
									id="patient-tc"
									bind:value={form.tc}
									type="text"
									maxlength="11"
								class="w-full rounded-2xl border border-slate-300 px-6 py-4 outline-none transition focus:border-blue-600"
								placeholder="11 hane"
							/>
							</div>
							<div>
								<label for="patient-phone" class="mb-2 block text-xs font-medium tracking-wider text-slate-500">TELEFON</label>
								<input
									id="patient-phone"
									bind:value={form.telefon}
									type="tel"
									class="w-full rounded-2xl border border-slate-300 px-6 py-4 outline-none transition focus:border-blue-600"
								placeholder="0555 123 45 67"
							/>
						</div>
					</div>

						<div class="grid gap-6 sm:grid-cols-2">
							<div>
								<label for="patient-birth-date" class="mb-2 block text-xs font-medium tracking-wider text-slate-500">DOĞUM TARİHİ</label>
								<input
									id="patient-birth-date"
									bind:value={form.dogumTarihi}
									type="date"
									class="w-full rounded-2xl border border-slate-300 px-6 py-4 outline-none transition focus:border-blue-600"
							/>
							</div>
							<div>
								<label for="patient-appointment-date" class="mb-2 block text-xs font-medium tracking-wider text-slate-500">
									RANDEVU TARİHİ
								</label>
								<input
									id="patient-appointment-date"
									bind:value={form.randevuTarihi}
									type="date"
									class="w-full rounded-2xl border border-slate-300 px-6 py-4 outline-none transition focus:border-blue-600"
							/>
						</div>
					</div>

						<div class="grid gap-6 sm:grid-cols-2">
							<div>
								<label for="patient-appointment-time" class="mb-2 block text-xs font-medium tracking-wider text-slate-500">RANDEVU SAATİ</label>
								<input
									id="patient-appointment-time"
									bind:value={form.randevuSaati}
									type="time"
									class="w-full rounded-2xl border border-slate-300 px-6 py-4 outline-none transition focus:border-blue-600"
							/>
							</div>
							<div>
								<label for="patient-doctor" class="mb-2 block text-xs font-medium tracking-wider text-slate-500">DOKTOR</label>
								<select
									id="patient-doctor"
									bind:value={form.doktor}
									class="w-full rounded-2xl border border-slate-300 px-6 py-4 outline-none transition focus:border-blue-600"
								>
								<option value="">Seçiniz...</option>
								{#each doctors as doctor}
									<option value={doctor.id}>
										{doctor.fullName || `${doctor.firstName} ${doctor.lastName}`}
									</option>
								{/each}
							</select>
						</div>
					</div>

					<div>
						<label for="patient-payment-type" class="mb-2 block text-xs font-medium tracking-wider text-slate-500">ÖDEME TİPİ</label>
						<select
							id="patient-payment-type"
							bind:value={form.odemeTipi}
							class="w-full rounded-2xl border border-slate-300 px-6 py-4 outline-none transition focus:border-blue-600"
						>
							<option value="SGK">SGK</option>
							<option value="Özel">Özel Sigorta</option>
							<option value="Nakit">Nakit</option>
							<option value="Kredi Kartı">Kredi Kartı</option>
						</select>
					</div>

					<div>
						<label for="patient-note" class="mb-2 block text-xs font-medium tracking-wider text-slate-500">EK NOT / AÇIKLAMA</label>
						<textarea
							id="patient-note"
							bind:value={form.not}
							rows="4"
							class="w-full resize-none rounded-3xl border border-slate-300 px-6 py-4 outline-none transition focus:border-blue-600"
							placeholder="Özel durum, alerji, tercih edilen tedavi vb..."
						></textarea>
					</div>

					{#if formError}
						<div class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
							{formError}
						</div>
					{/if}

					<div class="flex gap-4 pt-4">
						<button
							type="button"
							onclick={iptalEt}
							class="flex-1 rounded-2xl border border-slate-300 py-5 font-medium text-slate-600 transition hover:bg-slate-100"
						>
							İptal
						</button>
						<button
							type="submit"
							class="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 font-medium text-white transition hover:bg-blue-700"
						>
							<Check class="h-4 w-4" />
							<span>KAYDET VE EKLE</span>
						</button>
					</div>
				</form>
			</div>
		{:else}
			<div class="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-12 text-center shadow-xl">
				<div class="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
					<Check class="h-8 w-8" />
				</div>
				<h3 class="text-3xl font-semibold text-emerald-700">Hasta başarıyla eklendi!</h3>
				<p class="mt-3 text-lg text-emerald-600">{savedPatientName} operasyon masasına kaydedildi.</p>

				<div class="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<button
						type="button"
						onclick={yenidenBasla}
						class="rounded-2xl bg-emerald-600 px-10 py-4 text-lg font-medium text-white transition hover:bg-emerald-700"
					>
						Yeni Hasta Ekle
					</button>
					<button
						type="button"
						onclick={() => goto('/patients')}
						class="rounded-2xl border border-emerald-300 px-10 py-4 text-lg font-medium text-emerald-700 transition hover:bg-emerald-100"
					>
						Listeye Dön
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
