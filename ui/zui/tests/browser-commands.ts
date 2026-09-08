import type { BrowserCommand } from 'vitest/node';

export const dragSliderTrack: BrowserCommand<[string, number, number]> = async (
	context,
	selector,
	startRatio,
	endRatio
) => {
	if (context.provider.name !== 'playwright') throw new TypeError('Playwright provider required.');
	const box = await (await context.frame()).locator(selector).boundingBox();
	if (!box) throw new Error('Slider track was not measurable.');
	const y = box.y + box.height / 2;
	await context.page.mouse.move(box.x + box.width * startRatio, y);
	await context.page.mouse.down();
	try {
		await context.page.mouse.move(box.x + box.width * endRatio, y);
	} finally {
		await context.page.mouse.up();
	}
};

export const dragElements: BrowserCommand<[string, string, string?]> = async (
	context,
	sourceSelector,
	targetSelector,
	duringDragSelector
) => {
	if (context.provider.name !== 'playwright') throw new TypeError('Playwright provider required.');
	const frame = await context.frame();
	const source = await frame.locator(sourceSelector).boundingBox();
	const target = await frame.locator(targetSelector).boundingBox();
	if (!source || !target) throw new Error('Drag source and target must both be measurable.');
	const start = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
	const end = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
	const nextFrame = () =>
		context.page.evaluate(
			() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
		);
	await context.page.mouse.move(start.x, start.y);
	await context.page.mouse.down();
	try {
		// Use a distinct activation move, then a real target move. The pointer sensor may consume
		// the first constrained move only to initialize the operation.
		await context.page.mouse.move(start.x + (end.x - start.x) / 4, start.y + (end.y - start.y) / 4);
		await nextFrame();
		if (duringDragSelector !== undefined) {
			// Simulate an external owner update while the real pointer remains pressed.
			// This deliberately is not another mouse click, which would end the gesture.
			await frame.locator(duringDragSelector).evaluate((element) => {
				if (!(element instanceof HTMLElement))
					throw new TypeError('The during-drag owner control must be an HTML element.');
				element.click();
			});
			await nextFrame();
		}
		await context.page.mouse.move(end.x, end.y);
		await nextFrame();
	} finally {
		await context.page.mouse.up();
	}
};
