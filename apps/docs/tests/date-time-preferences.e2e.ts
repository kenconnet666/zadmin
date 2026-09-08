import { expect, test } from '@playwright/test';

test('DateTimePicker family keeps logical RTL navigation, reduced popup exit, external clearing and reset drafts observable', async ({
	page
}) => {
	await page.goto('/#/components/date-time-picker');
	const demo = page.getByTestId('demo-date-time-picker-family');
	const owner = demo.getByTestId('date-time-family-owner');
	const state = demo.getByTestId('date-time-family-state');
	const trigger = owner.locator('button[aria-haspopup="dialog"]');
	const dialogForTrigger = async () => {
		const contentId = await trigger.getAttribute('aria-controls');
		if (!contentId) throw new Error('DateTimePicker trigger is missing aria-controls.');
		return page.locator(`#${contentId}`);
	};

	await demo.getByTestId('date-time-family-direction').click();
	await expect(state).toContainText('direction=rtl');
	await trigger.click();
	const rtlDialog = await dialogForTrigger();
	await expect(rtlDialog).toHaveAttribute('data-state', 'open');
	await expect(rtlDialog).toHaveCSS('direction', 'rtl');
	expect(
		await rtlDialog.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))
	).toBeGreaterThan(0);
	const focusedDay = rtlDialog.locator('[role="gridcell"] button[tabindex="0"]');
	await expect(focusedDay).toHaveAttribute('id', /2026-09-07$/u);
	await focusedDay.press('ArrowRight');
	await expect(rtlDialog.locator('[role="gridcell"] button[tabindex="0"]')).toHaveAttribute(
		'id',
		/2026-09-06$/u
	);
	await focusedDay.press('Escape');
	await expect(rtlDialog).toHaveCount(0);

	await demo.getByTestId('date-time-family-motion').click();
	await expect(state).toContainText('motion=reduced');
	await trigger.click();
	const reducedDialog = await dialogForTrigger();
	await expect(reducedDialog).toHaveAttribute('data-reduced-motion', 'true');
	await expect(reducedDialog).toHaveCSS('transition-duration', '0s');
	await expect(reducedDialog).toHaveCSS('animation-duration', '0s');
	await reducedDialog.locator('[role="gridcell"] button[tabindex="0"]').press('Escape');
	await expect(reducedDialog).toHaveCount(0);

	await demo.getByTestId('date-time-family-clear').click();
	await expect(state).toContainText('owner=null');
	await demo.getByTestId('date-time-family-reset').click();
	await expect(state).toContainText('owner=2026-09-07T10:30:00');

	await trigger.click();
	const draftDialog = await dialogForTrigger();
	await draftDialog.locator('button[id$="-2026-09-12"]').click();
	await expect(state).toContainText('owner=2026-09-07T10:30:00');
	await expect(state).toContainText('commit=0');
	await demo.getByTestId('date-time-family-reset').click();
	await expect(draftDialog).toHaveCount(0);
	await trigger.click();
	const resetDialog = await dialogForTrigger();
	await expect(resetDialog.locator('[role="gridcell"] button[tabindex="0"]')).toHaveAttribute(
		'id',
		/2026-09-07$/u
	);
	await resetDialog.locator('button[id$="-2026-09-12"]').click();
	await resetDialog.locator('[data-slot="date-time-footer"] button').last().click();
	await expect(state).toContainText('owner=2026-09-12T10:30:00');
	await expect(state).toContainText('commit=1');
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
