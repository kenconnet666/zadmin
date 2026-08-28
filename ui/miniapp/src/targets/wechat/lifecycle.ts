import type { Component } from 'svelte';

import { createWechatApp, createWechatPage } from './runtime.ts';

declare const App: (options: Record<string, unknown>) => void;
declare const Page: (options: Record<string, unknown>) => void;

export function registerWechatApp(component: Component<Record<string, unknown>>): void {
	if (typeof App !== 'function') throw new Error('WeChat global App() is unavailable.');
	App(createWechatApp(component));
}

export function registerWechatPage(component: Component<Record<string, unknown>>): void {
	if (typeof Page !== 'function') throw new Error('WeChat global Page() is unavailable.');
	Page(createWechatPage(component));
}
