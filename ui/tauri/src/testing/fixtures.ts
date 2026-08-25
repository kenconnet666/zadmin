import type { DesktopAppSnapshot } from '../api/app.js';
import type { DesktopOsSnapshot } from '../api/os.js';
import type { DesktopWindowSnapshot } from '../api/window.js';

export const fakeAppSnapshot: DesktopAppSnapshot = {
	identifier: 'dev.zadmin.desktop',
	name: 'ZAdmin Desktop',
	tauriVersion: '2.11.5',
	version: '0.1.0'
};

export const fakeOsSnapshot: DesktopOsSnapshot = {
	arch: 'x86_64',
	locale: 'zh-CN',
	platform: 'windows',
	version: 'Windows 11'
};

export const fakeWindowSnapshot: DesktopWindowSnapshot = {
	focused: true,
	maximized: false,
	monitor: {
		name: 'Fake Monitor',
		position: { x: 0, y: 0 },
		scaleFactor: 1.25,
		size: { height: 1440, width: 2560 },
		workArea: {
			position: { x: 0, y: 0 },
			size: { height: 1392, width: 2560 }
		}
	},
	scaleFactor: 1.25,
	theme: 'dark'
};
