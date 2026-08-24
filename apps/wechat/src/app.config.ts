import type { AppConfig } from '@tarojs/taro';

export default {
	pages: ['pages/index/index'],
	window: {
		backgroundTextStyle: 'light',
		navigationBarBackgroundColor: '#ffffff',
		navigationBarTextStyle: 'black',
		navigationBarTitleText: 'ZAdmin'
	}
} satisfies AppConfig;
