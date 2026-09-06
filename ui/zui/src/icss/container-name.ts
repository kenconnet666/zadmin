const RESERVED_NAMES = new Set([
	'none',
	'and',
	'or',
	'not',
	'default',
	'inherit',
	'initial',
	'unset',
	'revert',
	'revert-layer'
]);

/** A portable, unescaped CSS custom-ident, shared by container declarations and queries. */
export function assertContainerName(name: string): void {
	if (
		typeof name !== 'string' ||
		!/^(?:[a-zA-Z_]|-[a-zA-Z_-])[a-zA-Z0-9_-]*$/u.test(name) ||
		RESERVED_NAMES.has(name.toLowerCase())
	) {
		throw new TypeError('Container name must be a non-reserved CSS identifier.');
	}
}
