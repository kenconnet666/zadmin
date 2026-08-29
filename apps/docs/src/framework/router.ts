export type DocsRoute =
	| { readonly kind: 'component'; readonly componentId: string; readonly section?: string }
	| { readonly kind: 'guide'; readonly guideId: string }
	| { readonly kind: 'home' }
	| { readonly kind: 'not-found'; readonly path: string };

function decodeSegment(segment: string): string | undefined {
	try {
		const decoded = decodeURIComponent(segment);
		return decoded.length === 0 ? undefined : decoded;
	} catch {
		return undefined;
	}
}

export function parseDocsRoute(hash: string): DocsRoute {
	const raw = hash.startsWith('#') ? hash.slice(1) : hash;
	const path = raw.split('?')[0]?.replace(/\/+$/u, '') || '/';
	if (path === '/') return { kind: 'home' };
	const segments = path.split('/').filter(Boolean);
	if (segments[0] === 'guides' && segments.length === 2) {
		const guideId = decodeSegment(segments[1] ?? '');
		return guideId === undefined ? { kind: 'not-found', path } : { guideId, kind: 'guide' };
	}
	if (segments[0] !== 'components' || segments.length < 2 || segments.length > 3) {
		return { kind: 'not-found', path };
	}
	const componentId = decodeSegment(segments[1] ?? '');
	const section = segments[2] === undefined ? undefined : decodeSegment(segments[2]);
	if (componentId === undefined || (segments[2] !== undefined && section === undefined)) {
		return { kind: 'not-found', path };
	}
	return { componentId, kind: 'component', section };
}

export function componentRoute(componentId: string, section?: string): string {
	const base = `#/components/${encodeURIComponent(componentId)}`;
	return section === undefined ? base : `${base}/${encodeURIComponent(section)}`;
}

export function guideRoute(guideId: string): string {
	return `#/guides/${encodeURIComponent(guideId)}`;
}
