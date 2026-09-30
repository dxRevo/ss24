import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';

/**
 * Animates the leading digits of a stat string (e.g. "24/7", "100 %", "05")
 * counting up from 0 once it scrolls into view; any non-digit prefix/suffix
 * (units, slashes, %) stays put. Falls back to the plain string when it has
 * no digits at all (e.g. "QHSE").
 *
 * The initial (and no-JS) render shows the final `value` as-is — never a
 * placeholder like "00" — so prerendered HTML and crawlers always see the
 * real number; only a visitor whose browser runs the animation sees it count
 * up from zero first.
 */
export function Counter({ value, duration = 1.4 }: { value: string; duration?: number }) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: '-80px' });
	const match = value.match(/^(\d+)/);
	const [display, setDisplay] = useState(value);

	useEffect(() => {
		if (!inView || !match) {
			return;
		}

		const digits = match[1];
		const target = Number.parseInt(digits, 10);
		const suffix = value.slice(digits.length);
		const controls = animate(0, target, {
			duration,
			ease: 'easeOut',
			onUpdate: latest => setDisplay(`${String(Math.round(latest)).padStart(digits.length, '0')}${suffix}`),
		});

		return () => controls.stop();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inView]);

	return <span ref={ref}>{display}</span>;
}
