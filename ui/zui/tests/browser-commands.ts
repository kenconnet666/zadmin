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
