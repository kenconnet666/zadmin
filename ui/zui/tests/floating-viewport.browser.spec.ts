import { expect, it } from 'vitest';
import { FloatingPositioner } from '../src/runtime/layer/floating.js';

it('sizes and shifts an oversized popup within the same viewport padding', async () => {
	const frame = document.createElement('iframe');
	frame.style.cssText = 'width:390px;height:400px;border:0';
	frame.srcdoc = '<!doctype html><html><head></head><body></body></html>';
	const ready = new Promise<void>((resolve) =>
		frame.addEventListener('load', () => resolve(), { once: true })
	);
	document.body.append(frame);
	await ready;
	const owner = frame.contentDocument!;
	owner.body.style.cssText = 'margin:0;height:1000px';
	const trigger = owner.createElement('button');
	trigger.style.cssText = 'position:fixed;right:8px;top:180px;width:48px;height:32px';
	trigger.textContent = 'Open';
	const floating = owner.createElement('div');
	floating.style.cssText =
		'position:fixed;box-sizing:border-box;width:700px;height:700px;overflow:auto;max-width:var(--zui-floating-available-width);max-height:var(--zui-floating-available-height)';
	owner.body.append(trigger, floating);
	const positioner = new FloatingPositioner();
	const cleanup = positioner.start(trigger, floating, {
		placement: 'bottom-end',
		strategy: 'fixed'
	});
	try {
		await expect
			.poll(() => {
				const box = floating.getBoundingClientRect();
				return (
					box.left >= 7 &&
					box.top >= 7 &&
					box.right <= owner.documentElement.clientWidth - 7 &&
					box.bottom <= owner.documentElement.clientHeight - 7
				);
			})
			.toBe(true);
		expect(owner.documentElement.scrollWidth).toBe(owner.documentElement.clientWidth);
	} finally {
		cleanup();
		frame.remove();
	}
});
