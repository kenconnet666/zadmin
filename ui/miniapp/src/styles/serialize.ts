import type { MiniStyle, MiniStyleObject } from './types.ts';

const WECHAT_STYLE_PROPERTIES = new Set([
	'alignItems',
	'backgroundColor',
	'borderColor',
	'borderRadius',
	'borderStyle',
	'borderWidth',
	'boxSizing',
	'color',
	'display',
	'flexDirection',
	'flexWrap',
	'fontSize',
	'fontWeight',
	'gap',
	'height',
	'justifyContent',
	'lineHeight',
	'margin',
	'minHeight',
	'opacity',
	'overflow',
	'padding',
	'paddingBottom',
	'paddingLeft',
	'paddingRight',
	'paddingTop',
	'textAlign',
	'width'
]);

export function hyphenateMiniProperty(property: string): string {
	return property.replace(/[A-Z]/gu, (character) => `-${character.toLowerCase()}`);
}

export function serializeMiniStyle(style: MiniStyleObject): string {
	return Object.entries(style)
		.flatMap(([property, value]) => {
			if (!WECHAT_STYLE_PROPERTIES.has(property)) {
				throw new TypeError(`Miniapp style property "${property}" is not supported by WeChat.`);
			}
			if (value === null || value === undefined) return [];
			if (typeof value === 'number' && !Number.isFinite(value)) {
				throw new TypeError(`Miniapp style "${property}" must be finite.`);
			}
			return [`${hyphenateMiniProperty(property)}:${String(value)}`];
		})
		.join(';');
}

export function mergeMiniStyles(...styles: readonly MiniStyle[]): string | undefined {
	const output = styles
		.flatMap((style) => {
			if (style === null || style === undefined || style === '') return [];
			return [typeof style === 'string' ? style.replace(/;+$/u, '') : serializeMiniStyle(style)];
		})
		.filter(Boolean)
		.join(';');
	return output || undefined;
}
