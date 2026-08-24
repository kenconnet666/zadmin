import type { UserConfigExport } from '@tarojs/cli';

export default {
	compiler: { type: 'vite' },
	date: '2026-08-25',
	designWidth: 750,
	framework: 'solid',
	mini: { enableSourceMap: false },
	outputRoot: 'dist',
	projectName: 'performance-solid',
	sourceRoot: 'src'
} satisfies UserConfigExport<'vite'>;
