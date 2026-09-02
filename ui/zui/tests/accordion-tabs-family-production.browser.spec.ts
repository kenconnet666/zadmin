import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import AccordionTabsProductionFixture from './AccordionTabsProductionFixture.svelte';

describe('production Accordion and Tabs compound family', () => {
	it('ZAccordion / ZAccordionItem / ZAccordionTrigger / ZAccordionContent preserve typed identity, collection focus and Presence recovery', async () => {
		render(AccordionTabsProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="production-accordion"]')!;
		const triggers = [...root.querySelectorAll<HTMLButtonElement>('button[aria-expanded]')];
		const numeric = triggers.find((trigger) => trigger.textContent?.includes('Numeric one'))!;
		const string = triggers.find((trigger) => trigger.textContent?.includes('String one'))!;
		const disabled = triggers.find((trigger) => trigger.textContent?.includes('Disabled'))!;
		const last = triggers.find((trigger) => trigger.textContent?.includes('Last'))!;
		const output = root.querySelector<HTMLOutputElement>(
			'[data-testid="production-accordion-output"]'
		)!;

		expect(numeric.getAttribute('aria-expanded')).toBe('true');
		expect(numeric.getAttribute('aria-controls')).toBeTruthy();
		expect(
			root.querySelector(`#${numeric.getAttribute('aria-controls')}`)?.getAttribute('role')
		).toBe('region');
		expect(string.getAttribute('aria-expanded')).toBe('false');
		expect(disabled).toBeDisabled();
		expect(disabled.getAttribute('tabindex')).toBe('-1');

		string.focus();
		string.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await tick();
		expect(document.activeElement).toBe(last);
		last.click();
		await tick();
		expect(output.textContent?.trim()).toBe('string:last|string:last|1');

		const panel = root.querySelector<HTMLElement>(`#${last.getAttribute('aria-controls')}`)!;
		expect(panel.getAttribute('data-presence')).toBe('entered');
		panel.querySelector('input')?.focus();
		root.querySelector<HTMLButtonElement>('[data-testid="clear-accordion-value"]')!.click();
		await tick();
		expect(document.activeElement).toBe(last);
		expect(panel.getAttribute('data-presence')).toBe('exiting');
		expect(panel.hasAttribute('inert')).toBe(true);
		await new Promise<void>((resolve) => setTimeout(resolve, 260));
		await tick();
		expect(root.querySelector(`#${last.getAttribute('aria-controls')}`)).toBeNull();
	});

	it('ZTabs / ZTabsList / ZTabsTrigger / ZTabsPanel preserve ARIA, typed selection, disabled skipping and nearest recovery', async () => {
		render(AccordionTabsProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="production-tabs"]')!;
		const triggers = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
		const numeric = triggers.find((trigger) => trigger.textContent?.includes('Numeric one'))!;
		const string = triggers.find((trigger) => trigger.textContent?.includes('String one'))!;
		const disabled = triggers.find((trigger) => trigger.textContent?.includes('Disabled'))!;
		const last = triggers.find((trigger) => trigger.textContent?.includes('Last'))!;
		const output = root.querySelector<HTMLOutputElement>('[data-testid="production-tabs-output"]')!;

		expect(numeric.getAttribute('aria-selected')).toBe('true');
		expect(numeric.getAttribute('aria-controls')).toBeTruthy();
		expect(
			root
				.querySelector(`#${numeric.getAttribute('aria-controls')}`)
				?.getAttribute('aria-labelledby')
		).toBe(numeric.id);
		expect(disabled).toBeDisabled();
		expect(disabled.getAttribute('tabindex')).toBe('-1');

		string.focus();
		string.click();
		await tick();
		expect(document.activeElement).toBe(string);
		expect(output.textContent?.trim()).toBe('string:1|string:1|1');

		root.querySelector<HTMLButtonElement>('[data-testid="remove-tabs-selected"]')!.click();
		await tick();
		await Promise.resolve();
		expect(output.textContent?.trim()).toBe('string:last|string:last|1');
		expect(document.activeElement).toBe(last);
	});

	it('ZTabs activationMode, RTL logical navigation and lazy/active-only panel presence remain distinct', async () => {
		render(AccordionTabsProductionFixture);
		const rtl = document.querySelector<HTMLElement>('[data-testid="rtl-tabs"]')!;
		const left = rtl.querySelector<HTMLButtonElement>('[data-testid="rtl-tab-left"]')!;
		const right = rtl.querySelector<HTMLButtonElement>('[data-testid="rtl-tab-right"]')!;
		const output = rtl.querySelector<HTMLOutputElement>('[data-testid="rtl-tabs-output"]')!;
		left.focus();
		left.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, isComposing: true, key: 'ArrowRight' })
		);
		await tick();
		expect(output.textContent?.trim()).toBe('string:left|string:left');
		left.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(document.activeElement).toBe(right);
		expect(output.textContent?.trim()).toBe('string:left|string:right');
		right.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(output.textContent?.trim()).toBe('string:right|string:right');

		const root = document.querySelector<HTMLElement>('[data-testid="active-only-tabs"]')!;
		const activeA = root.querySelector<HTMLButtonElement>('[data-testid="active-trigger-a"]')!;
		const activeB = root.querySelector<HTMLButtonElement>('[data-testid="active-trigger-b"]')!;
		expect(root.querySelector('[data-testid="active-panel-a"]')).not.toBeNull();
		expect(root.querySelector('[data-testid="active-panel-b"]')).toBeNull();
		root.querySelector<HTMLInputElement>('[data-testid="active-panel-a"] input')!.focus();
		root.querySelector<HTMLButtonElement>('[data-testid="active-select-b"]')!.click();
		await tick();
		expect(root.querySelector('[data-testid="active-panel-a"]')).toBeNull();
		expect(root.querySelector('[data-testid="active-panel-b"]')).not.toBeNull();
		expect(activeA.hasAttribute('aria-controls')).toBe(false);
		expect(activeB.getAttribute('aria-controls')).toBeTruthy();
		expect(document.activeElement).toBe(activeB);

		const lazy = document.querySelector<HTMLElement>('[data-testid="lazy-tabs"]')!;
		expect(lazy.querySelector('[data-testid="lazy-panel-b"]')).toBeNull();
		lazy.querySelector<HTMLButtonElement>('[data-testid="lazy-select-b"]')!.click();
		await tick();
		expect(lazy.querySelector('[data-testid="lazy-panel-a"]')).toHaveAttribute('hidden', '');
		expect(lazy.querySelector('[data-testid="lazy-panel-b"]')).not.toBeNull();
	});
});
