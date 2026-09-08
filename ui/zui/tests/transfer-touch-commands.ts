import type { BrowserCommand } from 'vitest/node';

export interface TransferTouchStep {
	readonly dx: number;
	readonly dy: number;
}

export type TransferTouchTerminal = 'cancel' | 'end';

function touchPoint(x: number, y: number) {
	return { force: 1, id: 1, radiusX: 1, radiusY: 1, x, y };
}

/**
 * Chromium CDP touch emulation for Transfer probes. This sends protocol-level touch input,
 * not synthetic DOM PointerEvents, but it is still emulation rather than physical-device proof.
 */
export const touchSequence: BrowserCommand<
	[string, readonly TransferTouchStep[], TransferTouchTerminal]
> = async (context, sourceSelector, steps, terminal) => {
	if (context.provider.name !== 'playwright') throw new TypeError('Playwright provider required.');
	const frame = await context.frame();
	const source = await frame.locator(sourceSelector).boundingBox();
	if (!source) throw new Error('Touch source was not measurable.');
	const nextFrame = () =>
		context.page.evaluate(
			() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
		);
	const session = await context.page.context().newCDPSession(context.page);
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
		await nextFrame();
		for (const step of steps) {
			x += step.dx;
			y += step.dy;
			await session.send('Input.dispatchTouchEvent', {
				touchPoints: [touchPoint(x, y)],
				type: 'touchMove'
			});
			await nextFrame();
		}
		await session.send('Input.dispatchTouchEvent', {
			touchPoints: [],
			type: terminal === 'cancel' ? 'touchCancel' : 'touchEnd'
		});
		active = false;
		await nextFrame();
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
