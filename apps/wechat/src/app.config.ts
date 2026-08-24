import type { AppConfig } from '@tarojs/taro';

export default {
	lazyCodeLoading: 'requiredComponents',
	pages: ['pages/index/index', 'pages/capabilities/index'],
	window: {
		backgroundTextStyle: 'light',
		navigationBarBackgroundColor: '#ffffff',
		navigationBarTextStyle: 'black',
		navigationBarTitleText: 'ZAdmin'
	}
} satisfies AppConfig;
