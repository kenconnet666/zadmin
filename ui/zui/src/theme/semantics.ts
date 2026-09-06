/** Status meaning shared by feedback, text, tags and actions; brand color remains a separate axis. */
export type ZSemanticTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const semanticTones = Object.freeze([
	'neutral',
	'info',
	'success',
	'warning',
	'danger'
] as const satisfies readonly ZSemanticTone[]);
