/**
 * Animation utility functions
 */

import { animate } from 'motion';

/**
 * Animate element with Motion One
 */
export function animateElement(
	element: Element,
	keyframes: any,
	options?: any
) {
	return animate(element, keyframes, options);
}

/**
 * Animate sequence of elements with stagger
 */
export function animateStagger(
	selector: string,
	keyframes: any,
	options?: any
) {
	const elements = document.querySelectorAll(selector);
	return animate(elements, keyframes, {
		...options,
		delay: options?.stagger || 0.1
	});
}

/**
 * Create scroll-triggered animation
 */
export function scrollAnimation(
	element: Element,
	keyframes: any,
	options?: any
) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					animate(entry.target, keyframes, options);
					if (options?.once) {
						observer.unobserve(entry.target);
					}
				}
			});
		},
		{ threshold: options?.threshold || 0.2 }
	);

	observer.observe(element);
	return observer;
}

/**
 * Parallax scroll effect
 */
export function parallaxScroll(element: HTMLElement, speed: number = 0.5) {
	const handleScroll = () => {
		const scrolled = window.scrollY;
		const rect = element.getBoundingClientRect();
		const elementTop = rect.top + scrolled;
		const elementVisible = scrolled + window.innerHeight > elementTop;

		if (elementVisible) {
			const yPos = -(scrolled - elementTop) * speed;
			element.style.transform = `translate3d(0, ${yPos}px, 0)`;
		}
	};

	window.addEventListener('scroll', handleScroll, { passive: true });
	return () => window.removeEventListener('scroll', handleScroll);
}

/**
 * Count up animation for numbers
 */
export function countUp(
	element: HTMLElement,
	target: number,
	duration: number = 1000
) {
	const start = 0;
	const startTime = performance.now();

	const updateCount = (currentTime: number) => {
		const elapsed = currentTime - startTime;
		const progress = Math.min(elapsed / duration, 1);

		// Easing function (ease-out)
		const easeOut = 1 - Math.pow(1 - progress, 3);
		const current = Math.floor(start + (target - start) * easeOut);

		element.textContent = current.toString();

		if (progress < 1) {
			requestAnimationFrame(updateCount);
		} else {
			element.textContent = target.toString();
		}
	};

	requestAnimationFrame(updateCount);
}

/**
 * Reduce motion detection
 */
export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Safe animation wrapper that respects user preferences
 */
export function safeAnimate(
	element: Element,
	keyframes: any,
	options?: any
) {
	if (prefersReducedMotion()) {
		// Apply final state immediately
		const finalState = Array.isArray(keyframes)
			? keyframes[keyframes.length - 1]
			: keyframes;
		Object.assign((element as HTMLElement).style, finalState);
		return;
	}

	return animate(element, keyframes, options);
}
