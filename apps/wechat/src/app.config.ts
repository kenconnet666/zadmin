import type { MiniappAppConfig } from '@zadmin/miniapp/compiler';

export default {
	lazyCodeLoading: 'requiredComponents',
	pages: ['pages/index/index', 'pages/capabilities/index'],
	workers: 'workers',
	window: {
		backgroundTextStyle: 'light',
		navigationBarBackgroundColor: '#ffffff',
		navigationBarTextStyle: 'black',
		navigationBarTitleText: 'ZAdmin'
	}
} satisfies MiniappAppConfig;
