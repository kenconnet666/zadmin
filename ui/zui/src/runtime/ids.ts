function assertIdPart(value: string, label: string): void {
	if (value.length === 0 || /\s/u.test(value)) {
		throw new TypeError(`${label} must be a non-empty identifier without whitespace.`);
	}
}

export function createZuiIdScope(prefix: string, localId: string): (suffix?: string) => string {
	assertIdPart(prefix, 'ZUI id prefix');
	assertIdPart(localId, 'ZUI local id');
	const base = `${prefix}-${localId}`;
	return (suffix) => {
		if (suffix === undefined) return base;
		assertIdPart(suffix, 'ZUI id suffix');
		return `${base}-${suffix}`;
	};
}

export function createZuiId(prefix: string, localId: string, suffix?: string): string {
	return createZuiIdScope(prefix, localId)(suffix);
}
