const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function hash32(value: string, seed: number): number {
	let hash = FNV_OFFSET ^ seed;
	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, FNV_PRIME);
	}
	hash ^= hash >>> 16;
	hash = Math.imul(hash, 0x85ebca6b);
	hash ^= hash >>> 13;
	hash = Math.imul(hash, 0xc2b2ae35);
	hash ^= hash >>> 16;
	return hash >>> 0;
}

export function hashString(value: string): string {
	const first = hash32(value, 0x9e3779b9).toString(36);
	const second = hash32(value, 0x7f4a7c15).toString(36);
	return `${first}${second}`;
}
