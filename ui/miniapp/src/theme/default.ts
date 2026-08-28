import { defineMiniappTheme } from './define.ts';

export const defaultMiniappTheme = defineMiniappTheme({
	color: {
		border: '#d8dee9',
		canvas: '#ffffff',
		danger: '#dc2626',
		primary: '#2563eb',
		primaryActive: '#1d4ed8',
		surface: '#f8fafc',
		text: '#0f172a',
		textMuted: '#64748b'
	},
	fontSize: { large: '36rpx', medium: '28rpx', small: '24rpx', xlarge: '48rpx' },
	fontWeight: { bold: 700, medium: 500, normal: 400, semibold: 600 },
	opacity: { active: 0.72, disabled: 0.5, opaque: 1 },
	radius: { large: '24rpx', medium: '16rpx', none: 0, small: '8rpx' },
	safeArea: {
		bottom: 'env(safe-area-inset-bottom)',
		left: 'env(safe-area-inset-left)',
		right: 'env(safe-area-inset-right)',
		top: 'env(safe-area-inset-top)'
	},
	size: { large: '96rpx', medium: '72rpx', small: '56rpx' },
	space: {
		large: '32rpx',
		medium: '16rpx',
		none: 0,
		small: '8rpx',
		xlarge: '48rpx',
		xsmall: '4rpx'
	},
	touch: { activeOpacity: 0.72, gestureThreshold: '16rpx', minTarget: '88rpx' },
	zIndex: { fixed: 100, overlay: 1000, popup: 1100 }
});
