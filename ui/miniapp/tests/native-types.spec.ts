import { describe, expect, it } from 'vitest';

import type { NativeElementName, NativeElementProps } from '../src/native/index.ts';

type CameraHasDevicePosition = 'devicePosition' extends keyof NativeElementProps<'camera'>
	? true
	: false;
type WebViewHasSource = 'src' extends keyof NativeElementProps<'web-view'> ? true : false;

const cameraTyped: CameraHasDevicePosition = true;
const webViewTyped: WebViewHasSource = true;
const nativeName: NativeElementName = 'live-player';

describe('native element type map', () => {
	it('exposes fixed WeChat native element props without runtime wrappers', () => {
		expect(cameraTyped).toBe(true);
		expect(webViewTyped).toBe(true);
		expect(nativeName).toBe('live-player');
	});
});
