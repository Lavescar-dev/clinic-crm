/**
 * Animation Presets using Motion One
 * Reusable animation configurations for consistent UI motion
 */

import type { AnimationOptions } from 'motion';

/**
 * Spring physics presets
 */
export const springs = {
	gentle: { type: 'spring', stiffness: 120, damping: 14 },
	snappy: { type: 'spring', stiffness: 300, damping: 20 },
	bouncy: { type: 'spring', stiffness: 400, damping: 10 },
	smooth: { type: 'spring', stiffness: 100, damping: 20 }
} as const;

/**
 * Duration presets (in seconds)
 */
export const durations = {
	instant: 0.1,
	fast: 0.2,
	normal: 0.3,
	slow: 0.5,
	slower: 0.8
} as const;

/**
 * Easing presets
 */
export const easings = {
	smooth: [0.4, 0, 0.2, 1],
	snappy: [0.4, 0, 0.6, 1],
	bounce: [0.68, -0.55, 0.265, 1.55],
	linear: [0, 0, 1, 1]
} as const;

/**
 * Common animation presets
 */
export const animations = {
	// Fade animations
	fadeIn: {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 }
	},
	fadeInUp: {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: 20 }
	},
	fadeInDown: {
		initial: { opacity: 0, y: -20 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -20 }
	},
	fadeInLeft: {
		initial: { opacity: 0, x: -20 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: -20 }
	},
	fadeInRight: {
		initial: { opacity: 0, x: 20 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 20 }
	},

	// Scale animations
	scaleIn: {
		initial: { opacity: 0, scale: 0.8 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.8 }
	},
	scaleInBounce: {
		initial: { opacity: 0, scale: 0.5 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.5 }
	},

	// Slide animations
	slideInUp: {
		initial: { y: '100%', opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: { y: '100%', opacity: 0 }
	},
	slideInDown: {
		initial: { y: '-100%', opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: { y: '-100%', opacity: 0 }
	},
	slideInLeft: {
		initial: { x: '-100%', opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: '-100%', opacity: 0 }
	},
	slideInRight: {
		initial: { x: '100%', opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: '100%', opacity: 0 }
	},

	// Rotate animations
	rotateIn: {
		initial: { opacity: 0, rotate: -180 },
		animate: { opacity: 1, rotate: 0 },
		exit: { opacity: 0, rotate: 180 }
	},

	// Flip animations
	flipIn: {
		initial: { opacity: 0, rotateX: -90 },
		animate: { opacity: 1, rotateX: 0 },
		exit: { opacity: 0, rotateX: 90 }
	},

	// Zoom animations
	zoomIn: {
		initial: { opacity: 0, scale: 0 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0 }
	},
	zoomOut: {
		initial: { opacity: 1, scale: 1 },
		animate: { opacity: 0, scale: 1.5 },
		exit: { opacity: 0, scale: 0 }
	}
} as const;

/**
 * Stagger configuration for list animations
 */
export const stagger = {
	fast: 0.05,
	normal: 0.1,
	slow: 0.15
} as const;

/**
 * Page transition presets
 */
export const pageTransitions = {
	fade: {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: durations.normal }
	},
	slide: {
		initial: { x: 20, opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: -20, opacity: 0 },
		transition: { duration: durations.normal }
	},
	scale: {
		initial: { scale: 0.95, opacity: 0 },
		animate: { scale: 1, opacity: 1 },
		exit: { scale: 1.05, opacity: 0 },
		transition: { duration: durations.normal }
	}
} as const;

/**
 * Hover animation configs
 */
export const hoverAnimations = {
	lift: {
		rest: { y: 0, scale: 1 },
		hover: { y: -4, scale: 1.02 }
	},
	scale: {
		rest: { scale: 1 },
		hover: { scale: 1.05 }
	},
	glow: {
		rest: { boxShadow: '0 0 0 rgba(234, 88, 12, 0)' },
		hover: { boxShadow: '0 0 20px rgba(234, 88, 12, 0.5)' }
	}
} as const;

/**
 * Loading animation configs
 */
export const loadingAnimations = {
	pulse: {
		scale: [1, 1.05, 1],
		opacity: [1, 0.8, 1]
	},
	spin: {
		rotate: [0, 360]
	},
	bounce: {
		y: [0, -10, 0]
	}
} as const;
