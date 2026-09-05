import { expect, test } from '@playwright/test';

test('Field feedback updates and a label help link keeps its native navigation', async ({
	page
}, testInfo) => {
	await page.goto('/#/components/field');
	const demo = page.getByTestId('demo-field-validation');
	const account = demo.getByRole('textbox');
	await account.fill('ab');
	await expect(demo.locator('[data-slot="error"]')).toHaveCount(2);
	await expect(account).toHaveAttribute('aria-invalid', 'true');
	await page.screenshot({ path: testInfo.outputPath('field-feedback-layout.png') });
	expect(
		await account.evaluate((el) =>
			el
				.getAttribute('aria-describedby')!
				.split(' ')
				.every((id) => document.getElementById(id))
		)
	).toBe(true);
	await account.fill('alice');
	await expect(demo.locator('[data-slot="error"]')).toHaveCount(0);
	await expect(demo.locator('[data-slot="success"]')).toHaveText('格式检查通过。');
	await demo.getByRole('button', { name: '清空并重置反馈', exact: true }).click();
	await expect(account).toHaveValue('');
	await expect(demo.locator('[data-slot="messages"]')).toHaveCount(0);
	await page
		.getByTestId('demo-field-focus-owner')
		.getByRole('link', { name: '标签与焦点说明', exact: true })
		.click();
	await expect(page).toHaveURL(/#\/guides\/accessibility$/u);
});

test('NumberField demo blocks incomplete drafts and submits only a valid normalized number', async ({
	page
}) => {
	await page.goto('/#/components/number-field');
	const demo = page.getByTestId('demo-number-field-locale-form');
	const control = demo.getByRole('spinbutton');
	await control.fill('-');
	await control.press('Enter');
	await expect(control).toHaveValue('-');
	expect(await control.evaluate((el) => (el as HTMLInputElement).checkValidity())).toBe(false);
	await expect(demo.getByTestId('number-form-submitted')).toHaveText('尚未提交');
	await control.fill('12.5');
	await control.press('Enter');
	await expect(demo.getByTestId('number-form-submitted')).toHaveText('已提交 concurrency = 12.5');
	await demo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(demo.getByTestId('number-form-submitted')).toHaveText('尚未提交');
});

test('PinInput readonly demo prevents deletion and switches to editable logical deletion', async ({
	page
}) => {
	await page.goto('/#/components/pin-input');
	const demo = page.getByTestId('demo-pin-input-rtl-states');
	const group = demo.locator('[data-readonly="true"]');
	const slots = group.locator('[data-slot="input"]');
	await expect(slots).toHaveCount(4);
	await slots.nth(1).press('Backspace');
	await expect(slots.nth(1)).toHaveValue('2');
	await demo.getByRole('button', { name: '开启编辑', exact: true }).click();
	const editable = demo.locator('[data-slot="input"]').first();
	await editable.press('Delete');
	await expect(editable).toHaveValue('2');
	await demo.getByRole('button', { name: '外部清空', exact: true }).click();
	for (const input of await demo.locator('[data-slot="input"]').all())
		await expect(input).toHaveValue('');
});
