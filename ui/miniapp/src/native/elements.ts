interface NativeBaseProps {
	class?: string;
	id?: string;
	style?: string;
}

export interface NativeElementPropsMap {
	camera: NativeBaseProps & {
		devicePosition?: 'back' | 'front';
		flash?: 'auto' | 'off' | 'on' | 'torch';
		mode?: 'normal' | 'scanCode';
	};
	canvas: NativeBaseProps & { canvasId?: string; type?: '2d' | 'webgl' };
	'live-player': NativeBaseProps & { autoplay?: boolean; src: string };
	'live-pusher': NativeBaseProps & { enableCamera?: boolean; url: string };
	map: NativeBaseProps & { latitude: number; longitude: number; scale?: number };
	'official-account': NativeBaseProps;
	'open-data': NativeBaseProps & { type: string };
	picker: NativeBaseProps & {
		disabled?: boolean;
		mode?: string;
		range?: readonly unknown[];
		value?: unknown;
	};
	'scroll-view': NativeBaseProps & { scrollX?: boolean; scrollY?: boolean };
	swiper: NativeBaseProps & { autoplay?: boolean; circular?: boolean; current?: number };
	'swiper-item': NativeBaseProps & { itemId?: string };
	text: NativeBaseProps & { decode?: boolean; selectable?: boolean; userSelect?: boolean };
	view: NativeBaseProps & { hidden?: boolean; hoverClass?: string };
	'voip-room': NativeBaseProps & { openId?: string; roomId?: number };
	'web-view': NativeBaseProps & { src: string };
}

export type NativeElementName = keyof NativeElementPropsMap;
export type NativeElementProps<TName extends NativeElementName> = NativeElementPropsMap[TName];
