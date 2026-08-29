export type NavigationDirection = 'ltr' | 'rtl';
export type NavigationIntent = 'first' | 'last' | 'next' | 'previous';
export type NavigationOrientation = 'both' | 'horizontal' | 'vertical';

export function navigationIntent(
	key: string,
	orientation: NavigationOrientation,
	direction: NavigationDirection = 'ltr'
): NavigationIntent | undefined {
	if (key === 'Home') return 'first';
	if (key === 'End') return 'last';
	if (orientation !== 'horizontal') {
		if (key === 'ArrowDown') return 'next';
		if (key === 'ArrowUp') return 'previous';
	}
	if (orientation !== 'vertical') {
		if (key === 'ArrowRight') return direction === 'rtl' ? 'previous' : 'next';
		if (key === 'ArrowLeft') return direction === 'rtl' ? 'next' : 'previous';
	}
	return undefined;
}

export function moveIndex(
	length: number,
	currentIndex: number,
	intent: NavigationIntent,
	loop = true
): number {
	if (!Number.isInteger(length) || length < 0) {
		throw new TypeError('Navigation length must be a non-negative integer.');
	}
	if (length === 0) return -1;
	if (intent === 'first') return 0;
	if (intent === 'last') return length - 1;
	if (currentIndex < 0 || currentIndex >= length) return intent === 'next' ? 0 : length - 1;
	const candidate = currentIndex + (intent === 'next' ? 1 : -1);
	if (candidate >= 0 && candidate < length) return candidate;
	if (!loop) return currentIndex;
	return intent === 'next' ? 0 : length - 1;
}
