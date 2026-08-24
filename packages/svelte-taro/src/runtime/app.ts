import {
	Current,
	document,
	HOOKS_APP_ID,
	injectPageInstance,
	PAGE_INIT,
	perf,
	removePageInstance,
	safeExecute,
	type AppInstance,
	type Instance,
	type TaroElement
} from '@tarojs/runtime';
import { hooks } from '@tarojs/shared';
import { mount, tick, unmount as svelteUnmount, type Component } from 'svelte';

import taroRenderer from '../renderer/index.ts';
import { ResourceScope } from './scope.ts';
import { SVELTE_TARO_CONTEXT, type SvelteTaroRuntimeContext } from './context.ts';

type SvelteComponent = Component<Record<string, unknown>, Record<string, unknown>>;
type MountedComponent = Record<string, unknown>;

type MountedPage = {
	readonly component: MountedComponent;
	readonly root: TaroElement;
	readonly scope: ResourceScope;
};

export interface SvelteTaroApp {
	readonly config: Record<string, unknown>;
	dispose(): Promise<void>;
	mount(component: SvelteComponent, id: string, callback: () => void): void;
	render(callback: () => void): void;
	unmount(id: string, callback: () => void): void;
}

let reconcilerInstalled = false;

function installReconciler(): void {
	if (reconcilerInstalled) return;
	reconcilerInstalled = true;
	hooks.tap('batchedEventUpdates', (callback: () => void) => callback());
	hooks.tap('modifyMpEvent', (event: { type: string }) => {
		Object.defineProperty(event, 'type', {
			configurable: true,
			value: event.type.replaceAll('-', '')
		});
	});
}

function descriptor(value: unknown): PropertyDescriptor {
	return { configurable: true, enumerable: true, value, writable: true };
}

function setRouterParams(options: Record<string, unknown> | undefined): void {
	const query = options?.query;
	Current.router = {
		params: typeof query === 'object' && query !== null ? (query as Record<string, unknown>) : {},
		...options
	} as NonNullable<typeof Current.router>;
}

function contextMap(context: SvelteTaroRuntimeContext): Map<unknown, unknown> {
	return new Map([[SVELTE_TARO_CONTEXT, context]]);
}

function reportRuntimeError(error: unknown): void {
	const message = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error);
	Current.app?.onError?.(message);
}

export function createSvelteApp(
	App: SvelteComponent,
	config: Record<string, unknown> = {}
): SvelteTaroApp {
	installReconciler();
	const appId = typeof config.appId === 'string' ? config.appId : 'app';
	const target = document.getElementById<TaroElement>(appId);
	if (target === null) throw new Error(`Taro App root "${appId}" was not found.`);

	const appScope = new ResourceScope();
	const appContext: SvelteTaroRuntimeContext = { appScope, scope: appScope };
	const appComponent = mount(App, {
		context: contextMap(appContext),
		props: {},
		renderer: taroRenderer,
		target
	}) as MountedComponent;
	injectPageInstance(appComponent as unknown as Instance, HOOKS_APP_ID);

	const pages = new Map<string, MountedPage>();
	const methods = {
		render(callback: () => void) {
			void tick().then(callback, reportRuntimeError);
		},
		mount(Page: SvelteComponent, id: string, callback: () => void) {
			if (pages.has(id)) throw new Error(`Svelte Taro page "${id}" is already mounted.`);
			const root = document.createElement('root') as TaroElement;
			root.id = id;
			target.appendChild(root);
			const scope = appScope.child();
			const pageContext: SvelteTaroRuntimeContext = { appScope, pageId: id, scope };
			try {
				const component = mount(Page, {
					context: contextMap(pageContext),
					props: { tid: id },
					renderer: taroRenderer,
					target: root
				}) as MountedComponent;
				pages.set(id, { component, root, scope });
				injectPageInstance(component as unknown as Instance, id);
				perf.stop(PAGE_INIT);
				callback();
			} catch (error) {
				root.remove();
				void scope.dispose().catch(reportRuntimeError);
				throw error;
			}
		},
		unmount(id: string, callback: () => void) {
			const page = pages.get(id);
			if (page === undefined) {
				callback();
				return;
			}
			pages.delete(id);
			void svelteUnmount(page.component)
				.then(() => page.scope.dispose())
				.then(() => {
					page.root.remove();
					removePageInstance(id);
					callback();
				})
				.catch((error: unknown) => {
					reportRuntimeError(error);
					callback();
				});
		}
	};

	const lifecycle = hooks.call('getMiniLifecycleImpl')?.app ?? ['onLaunch', 'onShow', 'onHide'];
	const [onLaunch, onShow, onHide] = lifecycle;
	const app = Object.create(methods, {
		config: descriptor(config),
		[onLaunch]: descriptor(function (options: Record<string, unknown> = {}) {
			setRouterParams(options);
			safeExecute(HOOKS_APP_ID, 'onLaunch', options);
		}),
		[onShow]: descriptor(function (options: Record<string, unknown> = {}) {
			setRouterParams(options);
			safeExecute(HOOKS_APP_ID, 'onShow', options);
		}),
		[onHide]: descriptor(function () {
			safeExecute(HOOKS_APP_ID, 'onHide');
		}),
		onError: descriptor((error: string) => safeExecute(HOOKS_APP_ID, 'onError', error)),
		onPageNotFound: descriptor((result: unknown) =>
			safeExecute(HOOKS_APP_ID, 'onPageNotFound', result)
		),
		onUnhandledRejection: descriptor((result: unknown) =>
			safeExecute(HOOKS_APP_ID, 'onUnhandledRejection', result)
		)
	}) as SvelteTaroApp;

	Object.defineProperty(
		app,
		'dispose',
		descriptor(async () => {
			await Promise.all(
				[...pages.entries()].map(
					([id]) =>
						new Promise<void>((resolve) => {
							methods.unmount(id, resolve);
						})
				)
			);
			await svelteUnmount(appComponent);
			await appScope.dispose();
			removePageInstance(HOOKS_APP_ID);
			if (Current.app === (app as unknown as AppInstance)) Current.app = null;
		})
	);

	Current.app = app as unknown as AppInstance;
	return app;
}
