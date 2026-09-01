import type { ZuiDensity } from './context.js';

export type ZControlSize = 'large' | 'medium' | 'small';

const CONTROL_SIZE_BY_DENSITY = {
	compact: 'small',
	comfortable: 'medium',
	spacious: 'large'
} as const satisfies Readonly<Record<ZuiDensity, ZControlSize>>;

/** Resolve a control's explicit size before falling back to its Provider density. */
export function resolveControlSize(
	size: ZControlSize | undefined,
	density: ZuiDensity
): ZControlSize {
	return size ?? CONTROL_SIZE_BY_DENSITY[density];
}
