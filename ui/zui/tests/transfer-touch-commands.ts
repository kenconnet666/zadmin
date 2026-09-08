import type { BrowserCommand } from 'vitest/node';

export interface TransferTouchStep {
	readonly dx: number;
	readonly dy: number;
}

export type TransferTouchTerminal = 'cancel' | 'end';

export interface TransferTouchCheckpoint {
	readonly phase: 'start' | 'hold' | 'move' | TransferTouchTerminal;
	readonly point: { readonly x: number; readonly y: number };
	readonly dragging: readonly string[];
	readonly lists: readonly {
		readonly label: string | null;
		readonly scrollTop: number;
		readonly scrollHeight: number;
		readonly clientHeight: number;
		readonly touchAction: string;
	}[];
}

function touchPoint(x: number, y: number) {
	return { force: 1, id: 1, radiusX: 1, radiusY: 1, x, y };
}

/** Isolates browser-chrome back swipes only in inactive-control tests on the throwaway runner Page. */
export const isolateTouchBrowserHistory: BrowserCommand<[]> = async (context) => {
	if (context.provider.name !== 'playwright') throw new TypeError('Playwright provider required.');
	if (new URL(context.page.url()).pathname !== '/__vitest_test__/')
		throw new Error('Touch history isolation is restricted to the Vitest runner Page.');
	const session = await context.page.context().newCDPSession(context.page);
	try {
		await session.send('Page.resetNavigationHistory');
		const history = await session.send('Page.getNavigationHistory');
		if (history.currentIndex !== 0 || history.entries.length !== 1)
			throw new Error('Failed to isolate the Vitest runner navigation history.');
	} finally {
		await session.detach();
	}
};

/**
 * Chromium CDP touch emulation for Transfer probes. This sends protocol-level touch input,
 * not synthetic DOM PointerEvents, but it is still emulation rather than physical-device proof.
 */
export const touchSequence: BrowserCommand<
	[string, readonly TransferTouchStep[], TransferTouchTerminal, number?]
> = async (context, sourceSelector, steps, terminal, holdMilliseconds = 0) => {
	if (context.provider.name !== 'playwright') throw new TypeError('Playwright provider required.');
	if (!Number.isFinite(holdMilliseconds) || holdMilliseconds < 0 || holdMilliseconds > 1_000)
		throw new RangeError('Touch hold duration must be between 0 and 1000 milliseconds.');
	const frame = await context.frame();
	const source = await frame.locator(sourceSelector).boundingBox();
	if (!source) throw new Error('Touch source was not measurable.');
	const nextFrame = () =>
		context.page.evaluate(
			() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
		);
	const session = await context.page.context().newCDPSession(context.page);
	const checkpoints: TransferTouchCheckpoint[] = [];
	const checkpoint = async (
		phase: TransferTouchCheckpoint['phase'],
		point: TransferTouchCheckpoint['point']
	) => {
		await nextFrame();
		checkpoints.push(
			await frame.evaluate(
				({ phase, point }) => ({
					phase,
					point,
					dragging: [...document.querySelectorAll('[data-dragging="true"]')].map(
						(element) => element.textContent?.trim() ?? ''
					),
					lists: [...document.querySelectorAll<HTMLElement>('[role="listbox"]')].map((element) => ({
						label: element.getAttribute('aria-label'),
						scrollTop: element.scrollTop,
						scrollHeight: element.scrollHeight,
						clientHeight: element.clientHeight,
						touchAction: getComputedStyle(element).touchAction
					}))
				}),
				{ phase, point }
			)
		);
		if (process.env.ZUI_BROWSER_DIAGNOSTICS === '1')
			console.info(`[zui-touch-input] ${JSON.stringify(checkpoints.at(-1))}`);
	};
	let emulationEnabled = false;
	let active = false;
	try {
		await session.send('Emulation.setTouchEmulationEnabled', {
			enabled: true,
			maxTouchPoints: 1
		});
		emulationEnabled = true;
		let x = source.x + source.width / 2;
		let y = source.y + source.height / 2;
		await session.send('Input.dispatchTouchEvent', {
			touchPoints: [touchPoint(x, y)],
			type: 'touchStart'
		});
		active = true;
		await checkpoint('start', { x, y });
		if (holdMilliseconds > 0) {
			// This is the held-finger input duration, not a wait for a test result.
			await new Promise<void>((resolve) => setTimeout(resolve, holdMilliseconds));
			await checkpoint('hold', { x, y });
		}
		for (const step of steps) {
			x += step.dx;
			y += step.dy;
			await session.send('Input.dispatchTouchEvent', {
				touchPoints: [touchPoint(x, y)],
				type: 'touchMove'
			});
			await checkpoint('move', { x, y });
		}
		await session.send('Input.dispatchTouchEvent', {
			touchPoints: [],
			type: terminal === 'cancel' ? 'touchCancel' : 'touchEnd'
		});
		active = false;
		await checkpoint(terminal, { x, y });
		return checkpoints;
	} finally {
		try {
			if (active) {
				await session.send('Input.dispatchTouchEvent', { touchPoints: [], type: 'touchCancel' });
			}
		} finally {
			try {
				if (emulationEnabled) {
					await session.send('Emulation.setTouchEmulationEnabled', { enabled: false });
				}
			} finally {
				await session.detach();
			}
		}
	}
};
