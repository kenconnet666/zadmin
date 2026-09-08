import { expect, test } from '@playwright/test';

test('TimeField modes and form participation remain directly operable', async ({ page }) => {
	await page.goto('/#/components/time-field');
	const modes = page.getByTestId('demo-time-field-modes');
	const modesState = modes.getByTestId('time-field-modes-state');
	const interactive = modes.getByTestId('time-field-modes-interactive');

	await expect(modesState).toContainText('value=14:30:20');
	await expect(interactive.locator('input').first()).toHaveValue('02');
	await expect(interactive.locator('[data-slot="day-period"]')).toHaveCount(1);
	const minute = interactive.locator('input').nth(1);
	await minute.press('ArrowUp');
	await expect(modesState).toContainText('value=14:45:20');
	await modes.getByTestId('time-field-hour-cycle').click();
	await modes.getByTestId('time-field-granularity').click();
	await expect(interactive.locator('input')).toHaveCount(3);
	await expect(interactive.locator('input').first()).toHaveValue('14');
	await expect(interactive.locator('input').nth(2)).toHaveValue('20');
	await expect(interactive.locator('[data-slot="day-period"]')).toHaveCount(0);
	await modes.getByTestId('time-field-readonly').click();
	await interactive.locator('input').nth(2).press('ArrowUp');
	await expect(modesState).toContainText('value=14:45:20');
	await expect(interactive).toHaveAttribute('data-readonly', 'true');
	await modes.getByTestId('time-field-disabled').click();
	await expect(interactive).toHaveAttribute('data-disabled', 'true');
	await expect(interactive.locator('input').first()).toBeDisabled();
	await modes.getByTestId('time-field-disabled').click();
	await modes.getByTestId('time-field-readonly').click();
	await interactive.locator('input').nth(2).press('ArrowUp');
	await expect(modesState).toContainText('value=14:45:30');

	const formDemo = page.getByTestId('demo-time-field-segments-form');
	const form = formDemo.getByTestId('time-field-form');
	await expect
		.poll(() => form.evaluate((element) => [...new FormData(element as HTMLFormElement).entries()]))
		.toEqual([
			['time', '09:30:15'],
			['readonly-time', '10:00:00']
		]);
	await formDemo.getByTestId('time-field-enabled').locator('input').nth(1).press('ArrowUp');
	await expect
		.poll(() => form.evaluate((element) => new FormData(element as HTMLFormElement).get('time')))
		.toBe('09:31:15');
	await expect(formDemo.getByText('value = 09:31:15')).toBeVisible();
	await form.getByRole('button', { name: '重置', exact: true }).click();
	await expect
		.poll(() => form.evaluate((element) => new FormData(element as HTMLFormElement).get('time')))
		.toBe('09:30:15');
	await expect(formDemo.getByText('value = 09:30:15')).toBeVisible();
});
