/**
 * Shared scroll-reveal variants for framer-motion. Use with `initial="hidden"
 * whileInView="show" viewport={revealViewport}` on a `motion.*` element.
 * Wrap a grid/list in `stagger` and give each child `variants={fadeUp}` to
 * have them enter one after another instead of all at once.
 */
import type { Variants } from 'framer-motion';

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 28 },
	show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/** Animate once, slightly before the element is fully in view. */
export const revealViewport = { once: true, margin: '-80px' } as const;
