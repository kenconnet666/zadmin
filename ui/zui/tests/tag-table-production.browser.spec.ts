import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TagTableProductionFixture from './TagTableProductionFixture.svelte';

describe('ZTag and ZTable production browser contracts', () => {
	it('localizes Tag removal, resolves finite size/tone and isolates remove propagation', async () => {
		render(TagTableProductionFixture);
		const tag = document.querySelector<HTMLElement>('[data-testid="tag-localized"]')!;
		const remove = tag.querySelector<HTMLButtonElement>('[data-slot="remove"]')!;
		expect(tag.dataset.size).toBe('small');
		expect(tag.dataset.tone).toBe('success');
		expect(getComputedStyle(tag).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		expect(remove.getAttribute('aria-label')).toBe('移除标签 production');
		expect(remove.tabIndex).toBe(0);
		expect(
			document.querySelector<HTMLButtonElement>('[data-testid="tag-compound"] [data-slot="remove"]')
				?.tabIndex
		).toBe(-1);
		expect(
			document.querySelector<HTMLButtonElement>('[data-testid="tag-disabled"] [data-slot="remove"]')
				?.disabled
		).toBe(true);
		expect(document.querySelector<HTMLElement>('[data-testid="tag-medium"]')?.dataset.size).toBe(
			'medium'
		);
		expect(
			getComputedStyle(document.querySelector<HTMLElement>('[data-testid="tag-medium"]')!)
				.borderColor
		).not.toBe(getComputedStyle(tag).borderColor);
		expect(
			getComputedStyle(document.querySelector<HTMLElement>('[data-testid="tag-long"]')!)
				.overflowWrap
		).toBe('anywhere');

		remove.click();
		await tick();
		expect(document.querySelector('[data-testid="tag-localized"]')).toBeNull();
		expect(document.querySelector('[data-testid="tag-output"]')?.textContent).toBe('false:0');
	});

	it('keeps the real table ref and only promotes a measured overflow wrapper to a region', async () => {
		render(TagTableProductionFixture);
		const simple = document.querySelector<HTMLTableElement>('[data-testid="table-simple"]')!;
		const simpleWrapper = simple.parentElement!;
		expect(simple.tagName).toBe('TABLE');
		expect(simple.dataset.nativeTable).toBe('true');
		expect(simpleWrapper.dataset.slot).toBe('wrapper');
		expect(simpleWrapper.hasAttribute('tabindex')).toBe(false);
		expect(simpleWrapper.getAttribute('role')).toBeNull();

		const wide = document.querySelector<HTMLTableElement>('[data-testid="table-wide"]')!;
		const wideWrapper = wide.parentElement!;
		await expect.poll(() => wideWrapper.dataset.overflowing).toBe('true');
		expect(wideWrapper.getAttribute('role')).toBe('region');
		expect(wideWrapper.getAttribute('aria-label')).toBe('Wide deployments scroll area');
		expect(wideWrapper.tabIndex).toBe(0);
		expect(document.querySelector('[data-testid="table-ref-output"]')?.textContent).toBe(
			'TABLE:DIV'
		);
		const hiddenCaption = wide.querySelector('caption')!;
		expect(hiddenCaption.textContent).toBe('Wide deployments');
		expect(getComputedStyle(hiddenCaption.querySelector<HTMLElement>('span')!).position).toBe(
			'absolute'
		);

		const noScroll = document.querySelector<HTMLTableElement>('[data-testid="table-no-scroll"]')!;
		expect(noScroll.parentElement?.dataset.scroll).toBe('none');
		expect(noScroll.parentElement?.hasAttribute('tabindex')).toBe(false);
	});

	it('inherits spacious RTL density and leaves interactive cell ownership intact', async () => {
		render(TagTableProductionFixture);
		const rtl = document.querySelector<HTMLTableElement>('[data-testid="table-rtl"]')!;
		expect(rtl.dataset.density).toBe('spacious');
		expect(rtl.closest('[dir="rtl"]')).not.toBeNull();
		document.querySelector<HTMLButtonElement>('[data-testid="table-action"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="table-action-output"]')?.textContent).toBe(
			'inspect'
		);
	});
});
