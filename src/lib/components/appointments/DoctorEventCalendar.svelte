<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Calendar,
		type CalendarOptions,
		type DatesSetArg,
		type EventClickArg,
		type EventContentArg,
		type EventInput
	} from '@fullcalendar/core';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import interactionPlugin from '@fullcalendar/interaction';
	import timeGridPlugin from '@fullcalendar/timegrid';
	import trLocale from '@fullcalendar/core/locales/tr';
	import { format } from 'date-fns';
	import type { Appointment, AppointmentStatus } from '$types';
	import type { DoctorScheduleBlock } from '$data/doctorScheduleBlocks';

	export let appointments: Appointment[] = [];
	export let scheduleBlocks: DoctorScheduleBlock[] = [];
	export let focusDate: Date = new Date();
	export let locale: 'tr' | 'en' = 'tr';
	export let compact = false;
	export let viewMode: 'week' | 'month' = 'week';
	export let onRangeChange: ((date: Date) => void) | undefined = undefined;
	export let onEventOpen: ((appointmentId: string) => void) | undefined = undefined;

	let hostElement: HTMLDivElement | null = null;
	let calendar: Calendar | null = null;

	function monthStart(date: Date) {
		return new Date(date.getFullYear(), date.getMonth(), 1);
	}

	function weekStart(date: Date) {
		const result = new Date(date);
		const shift = (result.getDay() + 6) % 7;
		result.setDate(result.getDate() - shift);
		result.setHours(0, 0, 0, 0);
		return result;
	}

	function sameMonth(left: Date, right: Date) {
		return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
	}

	function sameWeek(left: Date, right: Date) {
		return weekStart(left).getTime() === weekStart(right).getTime();
	}

	function normalizedFocusDate(date: Date) {
		return viewMode === 'week' ? weekStart(date) : monthStart(date);
	}

	function sameRange(left: Date, right: Date) {
		return viewMode === 'week' ? sameWeek(left, right) : sameMonth(left, right);
	}

	function calendarLocale() {
		return locale === 'tr' ? trLocale : 'en';
	}

	function eventTone(status: AppointmentStatus) {
		switch (status) {
			case 'confirmed':
				return 'mf-fc-status-confirmed';
			case 'in-progress':
				return 'mf-fc-status-progress';
			case 'completed':
				return 'mf-fc-status-completed';
			case 'cancelled':
			case 'no-show':
				return 'mf-fc-status-alert';
			default:
				return 'mf-fc-status-scheduled';
		}
	}

	function appointmentToEvent(appointment: Appointment): EventInput {
		const dateKey = format(new Date(appointment.date), 'yyyy-MM-dd');

		return {
			id: appointment.id,
			title: appointment.patientName,
			start: `${dateKey}T${appointment.startTime}:00`,
			end: `${dateKey}T${appointment.endTime}:00`,
			classNames: ['mf-fc-event', eventTone(appointment.status)],
			extendedProps: {
				appointmentId: appointment.id,
				patientName: appointment.patientName,
				startTime: appointment.startTime,
				endTime: appointment.endTime,
				reason: appointment.reason,
				status: appointment.status
			}
		};
	}

	function blockTone(kind: DoctorScheduleBlock['kind']) {
		switch (kind) {
			case 'operating-room':
				return 'mf-fc-duty-operating-room';
			case 'night-duty':
				return 'mf-fc-duty-night-duty';
			case 'ward-round':
				return 'mf-fc-duty-ward-round';
			case 'multidisciplinary-board':
				return 'mf-fc-duty-board';
			default:
				return 'mf-fc-duty-day-duty';
		}
	}

	function blockToEvent(block: DoctorScheduleBlock): EventInput {
		return {
			id: block.id,
			title: block.title,
			start: block.start,
			end: block.end,
			display: 'background',
			classNames: ['mf-fc-duty', blockTone(block.kind)],
			extendedProps: {
				kind: 'schedule-block',
				note: block.note
			}
		};
	}

	function handleDatesSet(arg: DatesSetArg) {
		const currentStart = normalizedFocusDate(new Date(arg.view.currentStart));
		if (!sameRange(currentStart, focusDate)) {
			onRangeChange?.(currentStart);
		}
	}

	function handleEventClick(arg: EventClickArg) {
		arg.jsEvent.preventDefault();
		onEventOpen?.(String(arg.event.id));
	}

	function eventDurationMinutes(arg: EventContentArg) {
		const start = arg.event.start?.getTime() ?? 0;
		const end = arg.event.end?.getTime() ?? start;
		return Math.max(0, Math.round((end - start) / 60000));
	}

	function compactPatientLabel(name: string, ultraCompact: boolean) {
		if (!ultraCompact) {
			return name;
		}

		const parts = name.trim().split(/\s+/);
		if (parts.length < 2) {
			return name;
		}

		const firstName = parts[0];
		const lastNameInitial = parts.at(-1)?.[0];
		return lastNameInitial ? `${firstName} ${lastNameInitial}.` : firstName;
	}

	function renderEventContent(arg: EventContentArg) {
		const startTime = String(arg.event.extendedProps.startTime ?? '');
		const endTime = String(arg.event.extendedProps.endTime ?? '');
		const reason = String(arg.event.extendedProps.reason ?? '');
		const patientName = String(arg.event.title ?? '');
		const isTimeGrid = arg.view.type.startsWith('timeGrid');
		const durationMinutes = eventDurationMinutes(arg);
		const isCompactEvent = isTimeGrid && durationMinutes <= 30;
		const isUltraCompactEvent = isTimeGrid && durationMinutes <= 20;
		const showReason = reason && (!isTimeGrid || durationMinutes >= 45);
		const shellClasses = [
			'mf-fc-event-shell',
			isTimeGrid ? 'mf-fc-event-shell-timegrid' : '',
			isCompactEvent ? 'mf-fc-event-shell-compact' : '',
			isUltraCompactEvent ? 'mf-fc-event-shell-ultra' : ''
		]
			.filter(Boolean)
			.join(' ');
		const timeLabel = `${startTime}${endTime ? ` · ${endTime}` : ''}`;
		const inlineTitle = compactPatientLabel(patientName, isUltraCompactEvent);
		const compactInline = isCompactEvent
			? `
				<div class="mf-fc-event-inline" title="${timeLabel} · ${patientName}">
					<span class="mf-fc-event-inline-title">${inlineTitle}</span>
				</div>
			`
			: '';

		return {
			html: `
				<div class="${shellClasses}">
					${isCompactEvent ? compactInline : `<span class="mf-fc-event-time">${timeLabel}</span><span class="mf-fc-event-title">${arg.event.title}</span>`}
					${showReason ? `<span class="mf-fc-event-reason">${reason}</span>` : ''}
				</div>
			`
		};
	}

	function buildOptions(): CalendarOptions {
		const isWeek = viewMode === 'week';

		return {
			plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
			initialView: isWeek ? 'timeGridWeek' : 'dayGridMonth',
			initialDate: normalizedFocusDate(focusDate),
			locale: calendarLocale(),
			firstDay: 1,
			headerToolbar: false,
			height: 'auto',
			expandRows: isWeek,
			fixedWeekCount: !isWeek,
			showNonCurrentDates: !isWeek,
			allDaySlot: false,
			nowIndicator: isWeek,
			slotMinTime: '07:00:00',
			slotMaxTime: compact ? '20:00:00' : '21:00:00',
			slotDuration: '00:30:00',
			slotLabelInterval: '01:00',
			scrollTime: '08:00:00',
			eventMinHeight: compact ? 56 : 60,
			eventShortHeight: compact ? 46 : 50,
			dayMaxEventRows: isWeek ? undefined : compact ? 2 : 3,
			moreLinkClick: 'popover',
			events: [...scheduleBlocks.map(blockToEvent), ...appointments.map(appointmentToEvent)],
			eventClick: handleEventClick,
			datesSet: handleDatesSet,
			eventContent: renderEventContent,
			dayHeaderFormat: isWeek
				? { weekday: 'short', day: 'numeric', month: compact ? undefined : 'short' }
				: { weekday: 'short' },
			eventTimeFormat: {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			}
		};
	}

	function syncCalendar() {
		if (!calendar) return;
		const instance = calendar;
		const targetDate = normalizedFocusDate(focusDate);
		const targetView = viewMode === 'week' ? 'timeGridWeek' : 'dayGridMonth';

		instance.batchRendering(() => {
			instance.setOption('locale', calendarLocale());
			instance.changeView(targetView, targetDate);
			instance.removeAllEvents();
			instance.addEventSource([...scheduleBlocks.map(blockToEvent), ...appointments.map(appointmentToEvent)]);
			instance.updateSize();
		});
	}

	onMount(() => {
		if (!hostElement) return;

		calendar = new Calendar(hostElement, buildOptions());
		calendar.render();

		return () => {
			calendar?.destroy();
			calendar = null;
		};
	});

	$: if (calendar) {
		appointments;
		scheduleBlocks;
		focusDate;
		locale;
		compact;
		viewMode;
		syncCalendar();
	}
</script>

<div class:mf-doctor-calendar-compact={compact} class="mf-doctor-calendar">
	<div bind:this={hostElement}></div>
</div>

<style>
	:global(.mf-doctor-calendar .fc) {
		--fc-border-color: var(--mf-line-soft);
		--fc-page-bg-color: transparent;
		--fc-neutral-bg-color: rgba(232, 240, 245, 0.8);
		--fc-small-font-size: 0.76rem;
		color: var(--mf-ink);
		font-family: inherit;
	}

	:global(.mf-doctor-calendar .fc-theme-standard .fc-scrollgrid) {
		border: 1px solid var(--mf-line-soft);
		border-radius: 1.35rem;
		overflow: hidden;
		background:
			radial-gradient(circle at top right, rgba(125, 211, 252, 0.16), transparent 34%),
			linear-gradient(180deg, rgba(236, 244, 248, 0.98), rgba(226, 237, 243, 0.96));
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.7),
			0 26px 54px -40px rgba(20, 40, 61, 0.26);
	}

	:global(.mf-doctor-calendar .fc-theme-standard td),
	:global(.mf-doctor-calendar .fc-theme-standard th) {
		border-color: var(--mf-line-soft);
	}

	:global(.mf-doctor-calendar .fc-col-header-cell) {
		background: linear-gradient(180deg, rgba(228, 238, 243, 0.98), rgba(220, 232, 238, 0.94));
	}

	:global(.mf-doctor-calendar .fc-col-header-cell-cushion) {
		padding: 0.85rem 0.35rem;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--mf-ink-faint) 82%, #15324a 18%);
	}

	:global(.mf-doctor-calendar .fc-timegrid-axis-cushion) {
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--mf-ink-faint) 80%, #16364d 20%);
	}

	:global(.mf-doctor-calendar .fc-timegrid-axis) {
		background: linear-gradient(180deg, rgba(230, 238, 242, 0.96), rgba(224, 234, 239, 0.94));
	}

	:global(.mf-doctor-calendar .fc-timegrid-slot-label-frame) {
		background: linear-gradient(180deg, rgba(232, 239, 243, 0.92), rgba(226, 236, 241, 0.9));
	}

	:global(.mf-doctor-calendar .fc-timegrid-slot-lane) {
		background: rgba(248, 251, 253, 0.5);
	}

	:global(.mf-doctor-calendar .fc-timegrid-col) {
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.26), rgba(250, 252, 254, 0.18));
	}

	:global(.mf-doctor-calendar .fc-timegrid-col:nth-child(odd)) {
		background:
			linear-gradient(180deg, rgba(232, 246, 250, 0.34), rgba(243, 249, 252, 0.24));
	}

	:global(.mf-doctor-calendar .fc-timegrid-col:nth-child(even)) {
		background:
			linear-gradient(180deg, rgba(239, 244, 248, 0.44), rgba(248, 251, 253, 0.28));
	}

	:global(.mf-doctor-calendar .fc-timegrid-body) {
		background:
			linear-gradient(180deg, rgba(239, 246, 249, 0.42), rgba(228, 238, 243, 0.16));
	}

	:global(.mf-doctor-calendar .fc-daygrid-body) {
		background:
			linear-gradient(180deg, rgba(240, 246, 249, 0.58), rgba(231, 239, 243, 0.36));
	}

	:global(.mf-doctor-calendar .fc-timegrid-slot-minor) {
		border-top-style: dotted;
	}

	:global(.mf-doctor-calendar .fc-day-today) {
		background:
			linear-gradient(180deg, rgba(211, 240, 247, 0.92), rgba(229, 244, 249, 0.72)) !important;
	}

	:global(.mf-doctor-calendar .fc-timegrid-now-indicator-line) {
		border-color: rgba(8, 145, 178, 0.7);
	}

	:global(.mf-doctor-calendar .fc-timegrid-now-indicator-arrow) {
		border-color: rgba(8, 145, 178, 0.7);
	}

	:global(.mf-doctor-calendar .fc-bg-event.mf-fc-duty) {
		opacity: 1;
		border-radius: 0.95rem;
		inset-inline: 0.18rem;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.34);
	}

	:global(.mf-doctor-calendar .fc-bg-event.mf-fc-duty-operating-room) {
		background: linear-gradient(180deg, rgba(251, 191, 36, 0.22), rgba(245, 158, 11, 0.14));
	}

	:global(.mf-doctor-calendar .fc-bg-event.mf-fc-duty-day-duty) {
		background: linear-gradient(180deg, rgba(45, 212, 191, 0.18), rgba(13, 148, 136, 0.12));
	}

	:global(.mf-doctor-calendar .fc-bg-event.mf-fc-duty-night-duty) {
		background: linear-gradient(180deg, rgba(79, 70, 229, 0.18), rgba(37, 99, 235, 0.12));
	}

	:global(.mf-doctor-calendar .fc-bg-event.mf-fc-duty-ward-round) {
		background: linear-gradient(180deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.12));
	}

	:global(.mf-doctor-calendar .fc-bg-event.mf-fc-duty-board) {
		background: linear-gradient(180deg, rgba(236, 72, 153, 0.16), rgba(217, 70, 239, 0.1));
	}

	:global(.mf-doctor-calendar .fc-daygrid-day-frame) {
		min-height: 7.5rem;
		padding: 0.3rem;
	}

	:global(.mf-doctor-calendar-compact .fc-daygrid-day-frame) {
		min-height: 6.6rem;
	}

	:global(.mf-doctor-calendar .fc-day-other) {
		background: rgba(233, 239, 243, 0.42);
	}

	:global(.mf-doctor-calendar .fc-daygrid-day-number) {
		padding: 0.5rem 0.55rem 0;
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--mf-ink-strong);
	}

	:global(.mf-doctor-calendar .fc-event) {
		border: 1px solid rgba(255, 255, 255, 0.78);
		border-radius: 1rem;
		margin: 0.18rem 0.25rem 0;
		padding: 0;
		box-shadow:
			0 18px 30px -24px rgba(20, 40, 61, 0.34),
			inset 0 1px 0 rgba(255, 255, 255, 0.46);
	}

	:global(.mf-doctor-calendar .fc-timegrid-event) {
		border-radius: 1.05rem;
	}

	:global(.mf-doctor-calendar .fc-timegrid-event-harness) {
		margin-right: 0.15rem;
	}

	:global(.mf-doctor-calendar .fc-event-main),
	:global(.mf-doctor-calendar .fc-event-main-frame) {
		padding: 0;
		height: 100%;
		overflow: hidden;
	}

	:global(.mf-doctor-calendar .fc-event-main),
	:global(.mf-doctor-calendar .fc-event-main-frame),
	:global(.mf-doctor-calendar .fc-event-title-container),
	:global(.mf-doctor-calendar .fc-event-title),
	:global(.mf-doctor-calendar .mf-fc-event-shell) {
		color: inherit !important;
	}

	:global(.mf-doctor-calendar .mf-fc-event-shell) {
		display: flex;
		flex-direction: column;
		gap: 0.22rem;
		padding: 0.5rem 0.62rem;
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	:global(.mf-doctor-calendar .mf-fc-event-shell-timegrid) {
		padding: 0.58rem 0.72rem;
	}

	:global(.mf-doctor-calendar .mf-fc-event-shell-compact) {
		gap: 0.12rem;
		padding: 0.3rem 0.46rem;
	}

	:global(.mf-doctor-calendar .mf-fc-event-shell-ultra) {
		gap: 0.08rem;
		padding: 0.26rem 0.42rem;
	}

	:global(.mf-doctor-calendar .mf-fc-event-inline) {
		display: flex;
		align-items: center;
		min-width: 0;
		height: 100%;
	}

	:global(.mf-doctor-calendar .mf-fc-event-inline-title) {
		min-width: 0;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.76rem;
		font-weight: 700;
		line-height: 1.1;
	}

	:global(.mf-doctor-calendar .mf-fc-event-time) {
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0.9;
		color: inherit;
	}

	:global(.mf-doctor-calendar .mf-fc-event-title) {
		font-size: 0.78rem;
		font-weight: 700;
		line-height: 1.3;
		color: inherit;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	:global(.mf-doctor-calendar .mf-fc-event-reason) {
		font-size: 0.68rem;
		line-height: 1.35;
		opacity: 0.82;
		color: inherit;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.mf-doctor-calendar .mf-fc-event-shell-compact .mf-fc-event-time) {
		font-size: 0.56rem;
	}

	:global(.mf-doctor-calendar .mf-fc-event-shell-compact .mf-fc-event-title) {
		font-size: 0.72rem;
		line-height: 1.15;
		line-clamp: 1;
		-webkit-line-clamp: 1;
	}

	:global(.mf-doctor-calendar .mf-fc-status-scheduled) {
		background: linear-gradient(180deg, rgba(255, 237, 214, 0.98), rgba(255, 246, 233, 0.94));
		color: #7c4b16 !important;
	}

	:global(.mf-doctor-calendar .mf-fc-status-confirmed) {
		background: linear-gradient(180deg, rgba(220, 247, 233, 0.98), rgba(236, 250, 243, 0.94));
		color: #0f5f58 !important;
	}

	:global(.mf-doctor-calendar .mf-fc-status-progress) {
		background: linear-gradient(180deg, rgba(204, 240, 247, 0.98), rgba(226, 247, 251, 0.94));
		color: #0b6070 !important;
	}

	:global(.mf-doctor-calendar .mf-fc-status-completed) {
		background: linear-gradient(180deg, rgba(228, 236, 242, 0.98), rgba(239, 245, 248, 0.94));
		color: #243244 !important;
	}

	:global(.mf-doctor-calendar .mf-fc-status-alert) {
		background: linear-gradient(180deg, rgba(255, 225, 231, 0.98), rgba(255, 241, 244, 0.94));
		color: #9f1239 !important;
	}

	:global(.mf-doctor-calendar .fc-more-link) {
		margin: 0.2rem 0.35rem 0;
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--mf-accent-strong);
	}

	:global(.mf-doctor-calendar .fc-popover) {
		border: 1px solid var(--mf-line-soft);
		border-radius: 1rem;
		overflow: hidden;
		background: linear-gradient(180deg, rgba(239, 246, 249, 0.98), rgba(230, 239, 243, 0.96));
		box-shadow: 0 30px 70px -42px rgba(20, 40, 61, 0.36);
	}

	:global(.mf-doctor-calendar .fc-popover-header) {
		padding: 0.8rem 0.95rem;
		background: linear-gradient(180deg, rgba(228, 238, 243, 0.98), rgba(220, 232, 238, 0.92));
	}

	:global(.mf-doctor-calendar .fc-popover-body) {
		padding-bottom: 0.55rem;
	}
</style>
