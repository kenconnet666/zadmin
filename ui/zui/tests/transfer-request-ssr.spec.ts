import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZTransfer, {
	type TransferItem,
	type ZTransferProps
} from '../src/components/input/ZTransfer.svelte';

const items: readonly TransferItem[] = [
	{ key: 'source', label: 'Source' },
	{ key: 'target', label: 'Target' }
];
const idleRequestProps = {
	items,
	moveMode: 'request',
	onMoveRequest: (): boolean => true,
	value: ['target']
} satisfies ZTransferProps;

describe('ZTransfer request SSR contract', () => {
	it.each([false, true])(
		'renders an idle request owner with dragDrop=%s without eager browser resources',
		(dragDrop) => {
			const OriginalAbortController = globalThis.AbortController;
			let constructions = 0;
			class TrackingAbortController extends OriginalAbortController {
				constructor() {
					super();
					constructions += 1;
				}
			}
			Object.defineProperty(globalThis, 'AbortController', {
				configurable: true,
				value: TrackingAbortController
			});
			try {
				const props = { ...idleRequestProps, dragDrop } satisfies ZTransferProps;
				const body = render<typeof ZTransfer, typeof props>(ZTransfer, {
					props
				}).body;
				expect(constructions).toBe(0);
				expect(body).toContain('data-state="idle"');
				expect(body).not.toContain('aria-busy="true"');
				expect(body).not.toContain('正在请求将');
			} finally {
				Object.defineProperty(globalThis, 'AbortController', {
					configurable: true,
					value: OriginalAbortController
				});
			}
		}
	);

	it.each([
		[
			'invalid moveMode',
			{ items, moveMode: 'later', value: ['target'] },
			/moveMode must be immediate or request/u
		],
		[
			'request without handler',
			{ items, moveMode: 'request', value: ['target'] },
			/requires onMoveRequest/u
		],
		[
			'request with value callback',
			{
				items,
				moveMode: 'request',
				onMoveRequest: (): boolean => true,
				onValueChange: () => undefined,
				value: ['target']
			},
			/cannot use onValueChange/u
		],
		[
			'immediate with request handler',
			{ items, onMoveRequest: (): boolean => true, value: ['target'] },
			/cannot use onMoveRequest/u
		]
	] as const)('rejects %s during SSR props evaluation', (_label, props, message) => {
		expect(
			() =>
				render<typeof ZTransfer, typeof idleRequestProps>(ZTransfer, { props: props as never }).body
		).toThrow(message);
	});
});
