import type { CameraProps } from '@tarojs/components/types/Camera.js';
import type { CanvasProps } from '@tarojs/components/types/Canvas.js';
import type { LivePlayerProps } from '@tarojs/components/types/LivePlayer.js';
import type { LivePusherProps } from '@tarojs/components/types/LivePusher.js';
import type { MapProps } from '@tarojs/components/types/Map.js';
import type { OfficialAccountProps } from '@tarojs/components/types/OfficialAccount.js';
import type { OpenDataProps } from '@tarojs/components/types/OpenData.js';
import type {
	PickerDateProps,
	PickerMultiSelectorProps,
	PickerRegionProps,
	PickerSelectorProps,
	PickerTimeProps
} from '@tarojs/components/types/Picker.js';
import type { ScrollViewProps } from '@tarojs/components/types/ScrollView.js';
import type { SwiperProps } from '@tarojs/components/types/Swiper.js';
import type { SwiperItemProps } from '@tarojs/components/types/SwiperItem.js';
import type { TextProps } from '@tarojs/components/types/Text.js';
import type { ViewProps } from '@tarojs/components/types/View.js';
import type { VoipRoomProps } from '@tarojs/components/types/VoipRoom.js';
import type { WebViewProps } from '@tarojs/components/types/WebView.js';

export interface NativeElementPropsMap {
	camera: CameraProps;
	canvas: CanvasProps;
	'live-player': LivePlayerProps;
	'live-pusher': LivePusherProps;
	map: MapProps;
	'official-account': OfficialAccountProps;
	'open-data': OpenDataProps;
	picker:
		| PickerDateProps
		| PickerMultiSelectorProps
		| PickerRegionProps
		| PickerSelectorProps
		| PickerTimeProps;
	'scroll-view': ScrollViewProps;
	swiper: SwiperProps;
	'swiper-item': SwiperItemProps;
	text: TextProps;
	view: ViewProps;
	'voip-room': VoipRoomProps;
	'web-view': WebViewProps;
}

export type NativeElementName = keyof NativeElementPropsMap;
export type NativeElementProps<TName extends NativeElementName> = NativeElementPropsMap[TName];
