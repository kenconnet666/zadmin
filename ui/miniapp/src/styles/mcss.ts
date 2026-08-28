import { hashMiniStyle } from './hash.ts';
import { serializeMiniStyle } from './serialize.ts';
import type { MiniStyleObject, MiniStyleProgram } from './types.ts';

export function mcss(style: MiniStyleObject): MiniStyleProgram {
	const declaration = serializeMiniStyle(style);
	const className = `m-${hashMiniStyle(declaration)}` as const;
	return Object.freeze({
		className,
		style: undefined,
		wxss: declaration.length === 0 ? '' : `.${className}{${declaration}}`
	});
}

export function rpx(value: number): `${number}rpx` {
	if (!Number.isFinite(value)) throw new TypeError('rpx() requires a finite number.');
	return `${value}rpx`;
}
