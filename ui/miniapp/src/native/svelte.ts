import type { SvelteHTMLElements } from 'svelte/elements';

import type { NativeElementPropsMap } from './elements.ts';

type NativeAttributes<TProps> = Partial<TProps> & {
	class?: string;
	id?: string;
	style?: string;
};

declare module 'svelte/elements' {
	interface SvelteHTMLElements {
		camera: NativeAttributes<NativeElementPropsMap['camera']> & {
			deviceposition?: NativeElementPropsMap['camera']['devicePosition'];
		};
		'live-player': NativeAttributes<NativeElementPropsMap['live-player']>;
		'live-pusher': NativeAttributes<NativeElementPropsMap['live-pusher']>;
		'official-account': NativeAttributes<NativeElementPropsMap['official-account']>;
		'open-data': NativeAttributes<NativeElementPropsMap['open-data']>;
		picker: NativeAttributes<NativeElementPropsMap['picker']>;
		'scroll-view': NativeAttributes<NativeElementPropsMap['scroll-view']> & {
			scrolly?: NativeElementPropsMap['scroll-view']['scrollY'];
		};
		swiper: NativeAttributes<NativeElementPropsMap['swiper']>;
		'swiper-item': NativeAttributes<NativeElementPropsMap['swiper-item']>;
		'voip-room': NativeAttributes<NativeElementPropsMap['voip-room']>;
		'web-view': NativeAttributes<NativeElementPropsMap['web-view']>;
	}
}

export type SvelteNativeElements = SvelteHTMLElements;
