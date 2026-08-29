type AstNode = {
	readonly [key: string]: unknown;
	readonly name?: unknown;
	readonly type?: unknown;
};

const NATIVE_ELEMENTS = new Set([
	'ad',
	'ad-custom',
	'animation-video',
	'ar-camera',
	'audio',
	'block',
	'button',
	'camera',
	'canvas',
	'channel-live',
	'channel-video',
	'checkbox',
	'checkbox-group',
	'cover-image',
	'cover-view',
	'custom-wrapper',
	'editor',
	'form',
	'grid-builder',
	'grid-view',
	'icon',
	'image',
	'input',
	'keyboard-accessory',
	'label',
	'list',
	'list-builder',
	'list-item',
	'live-player',
	'live-pusher',
	'map',
	'match-media',
	'movable-area',
	'movable-view',
	'native-slot',
	'navigation-bar',
	'navigator',
	'nested-scroll-body',
	'nested-scroll-header',
	'official-account',
	'open-container',
	'open-data',
	'page-container',
	'page-meta',
	'picker',
	'picker-view',
	'picker-view-column',
	'progress',
	'pull-to-refresh',
	'radio',
	'radio-group',
	'rich-text',
	'root-portal',
	'scroll-view',
	'share-element',
	'slider',
	'slot',
	'snapshot',
	'span',
	'sticky-header',
	'sticky-section',
	'swiper',
	'swiper-item',
	'switch',
	'text',
	'textarea',
	'video',
	'view',
	'voip-room',
	'web-view'
]);

function visit(value: unknown, elements: Set<string>, seen: WeakSet<object>): void {
	if (typeof value !== 'object' || value === null || seen.has(value)) return;
	seen.add(value);
	const node = value as AstNode;
	if (
		node.type === 'RegularElement' &&
		typeof node.name === 'string' &&
		/^[a-z][a-z0-9-]*$/u.test(node.name)
	) {
		if (!NATIVE_ELEMENTS.has(node.name)) {
			throw new TypeError(
				`Unsupported Mini Program native element "${node.name}". Use a typed Miniapp element or a Svelte component.`
			);
		}
		elements.add(node.name);
	}
	for (const child of Object.values(node)) visit(child, elements, seen);
}

export function collectNativeElements(ast: unknown): readonly string[] {
	const elements = new Set<string>();
	visit(ast, elements, new WeakSet());
	return [...elements].sort();
}

export function createComponentMarkerCode(elements: readonly string[]): string {
	const calls = elements
		.map(
			(element) => `  __zadmin_miniapp_marker__.createElement(${JSON.stringify(element)}, null);`
		)
		.join('\n');
	return `const __zadmin_miniapp_marker__ = null;\nexport function __zadmin_collect_components__() {\n${calls}\n}\n`;
}
