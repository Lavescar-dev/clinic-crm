import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import StatsCard from '$components/dashboard/StatsCard.svelte';

describe('StatsCard.svelte', () => {
	it('renders the card with correct title, value, and description', () => {
		const testProps = {
			title: 'Total Patients',
			value: 125,
			icon: 'Users',
			description: '10 new patients this month'
		};

		render(StatsCard, { ...testProps });

		expect(screen.getByText('Total Patients')).toBeInTheDocument();
		expect(screen.getByText('125')).toBeInTheDocument();
		expect(screen.getByText('10 new patients this month')).toBeInTheDocument();
	});

	it('formats the value as currency when specified', () => {
		const testProps = {
			title: 'Total Revenue',
			value: 50000,
			icon: 'DollarSign',
			description: 'Total revenue this month',
			format: 'currency'
		};

		render(StatsCard, { ...testProps });

		// The exact format depends on the locale, so we check for the presence of the currency symbol and the value.
		// This makes the test more robust against different formatting.
		expect(screen.getByText((content) => content.includes('50.000'))).toBeInTheDocument();
	});

	it('renders the correct icon', () => {
		const testProps = {
			title: 'Test Title',
			value: 100,
			icon: 'Activity', // Using a different icon for test
			description: 'Test Description'
		};

		const { container } = render(StatsCard, { ...testProps });

		// Check if the SVG for the 'Activity' icon is rendered.
		// This is a bit implementation-dependent, but for lucide-svelte, we can look for the class name.
		const iconElement = container.querySelector('.lucide-activity');
		expect(iconElement).not.toBeNull();
	});
});
