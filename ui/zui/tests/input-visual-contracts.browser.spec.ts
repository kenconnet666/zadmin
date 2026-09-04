import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import InputVisualContractsFixture from './input-visual-contracts-fixture.svelte';

describe('input component visual contracts', () => {
	// @zui-visual ZRadioGroup orientation and selection geometry
	it('keeps RadioGroup orientation and item geometry observable', async () => {
		render(InputVisualContractsFixture);
		const group = document.querySelector<HTMLElement>('[data-testid="radio-horizontal"]')!;
		expect(group.dataset.orientation).toBe('horizontal');
		expect(group.getAttribute('aria-orientation')).toBe('horizontal');
		expect(getComputedStyle(group).display).toBe('flex');
		expect(getComputedStyle(group).flexDirection).toBe('row');
		expect(getComputedStyle(group).gap).not.toBe('0px');
		const items = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
		expect(items).toHaveLength(2);
		expect(items.every((item) => item.getBoundingClientRect().width > 0)).toBe(true);
		expect(items[0].checked).toBe(true);
	});

	// @zui-visual ZCalendar size and invalid state geometry
	it('keeps Calendar size and invalid state in the rendered geometry', async () => {
		render(InputVisualContractsFixture);
		const small = document.querySelector<HTMLElement>('[data-testid="calendar-small"]')!;
		const large = document.querySelector<HTMLElement>('[data-testid="calendar-large"]')!;
		expect(small.dataset.size).toBe('small');
		expect(large.dataset.size).toBe('large');
		expect(small.dataset.invalid).toBe('true');
		expect(large.getBoundingClientRect().width).toBeGreaterThan(
			small.getBoundingClientRect().width
		);
	});

	// @zui-visual ZTagsInput size and invalid state geometry
	it('keeps TagsInput size and invalid state geometry distinct', async () => {
		render(InputVisualContractsFixture);
		const small = document.querySelector<HTMLElement>('[data-testid="tags-small"]')!;
		const large = document.querySelector<HTMLElement>('[data-testid="tags-large"]')!;
		expect(small.dataset.size).toBe('small');
		expect(large.dataset.size).toBe('large');
		expect(small.dataset.invalid).toBe('true');
		expect(large.getBoundingClientRect().height).toBeGreaterThan(
			small.getBoundingClientRect().height
		);
	});

	// @zui-visual ZFileUpload invalid state geometry
	it('exposes FileUpload invalid state on a measurable root', async () => {
		render(InputVisualContractsFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="file-upload-invalid"]')!;
		const valid = document.querySelector<HTMLElement>('[data-testid="file-upload-valid"]')!;
		const dropzone = root.querySelector<HTMLButtonElement>('[data-slot="dropzone"]')!;
		const validDropzone = valid.querySelector<HTMLButtonElement>('[data-slot="dropzone"]')!;
		expect(root.dataset.invalid).toBe('true');
		expect(getComputedStyle(dropzone).borderStyle).toBe('dashed');
		expect(getComputedStyle(dropzone).borderColor).not.toBe(
			getComputedStyle(validDropzone).borderColor
		);
		expect(root.querySelector('input[type="file"]')).not.toBeNull();
	});

	// @zui-visual ZTransfer two-pane layout geometry
	it('exposes Transfer invalid state and pane geometry', async () => {
		render(InputVisualContractsFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="transfer-invalid"]')!;
		const panels = [...root.querySelectorAll<HTMLElement>('[data-slot="panel"]')];
		expect(root.dataset.invalid).toBe('true');
		expect(getComputedStyle(root).display).toBe('flex');
		expect(getComputedStyle(root).gap).not.toBe('0px');
		expect(panels).toHaveLength(2);
		expect(panels.every((panel) => panel.getBoundingClientRect().width > 0)).toBe(true);
		expect(root.querySelectorAll('[role="listbox"]')).toHaveLength(2);
	});
});
