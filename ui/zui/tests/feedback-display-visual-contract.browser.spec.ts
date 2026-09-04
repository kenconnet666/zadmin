import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import FeedbackDisplayVisualContractFixture from './FeedbackDisplayVisualContractFixture.svelte';

describe('feedback and data-display visual contracts', () => {
	// @zui-visual ZAlert tone border geometry
	it('maps Alert tone to distinct computed border colors', () => {
		render(FeedbackDisplayVisualContractFixture);
		const info = document.querySelector<HTMLElement>('[data-testid="alert-info"]')!;
		const danger = document.querySelector<HTMLElement>('[data-testid="alert-danger"]')!;
		expect(info.dataset.tone).toBe('info');
		expect(danger.dataset.tone).toBe('danger');
		expect(getComputedStyle(info).borderTopColor).not.toBe(getComputedStyle(danger).borderTopColor);
		expect(info.getBoundingClientRect().height).toBeGreaterThan(0);
	});

	// @zui-visual ZProgress line and circle geometry
	it('maps Progress view to the line and circle geometry contracts', () => {
		render(FeedbackDisplayVisualContractFixture);
		const line = document.querySelector<HTMLElement>('[data-testid="progress-line"]')!;
		const circle = document.querySelector<HTMLElement>('[data-testid="progress-circle"]')!;
		expect(line.tagName).toBe('PROGRESS');
		const nativeLineHeight = line.getBoundingClientRect().height;
		// Native progress keeps the platform appearance, whose replaced-element box differs
		// slightly between Chromium, Firefox and WebKit while remaining intentionally compact.
		expect(nativeLineHeight).toBeGreaterThanOrEqual(6);
		expect(nativeLineHeight).toBeLessThanOrEqual(10);
		expect(getComputedStyle(line).accentColor).not.toBe('auto');
		expect(circle.dataset.indeterminate).toBeUndefined();
		expect(circle.getBoundingClientRect().width).toBe(96);
		expect(circle.getBoundingClientRect().width).toBe(circle.getBoundingClientRect().height);
		expect(circle.querySelector('[data-slot="indicator"]')).not.toBeNull();
	});

	// @zui-visual ZMeter threshold state geometry
	it('reflects Meter threshold state in the rendered native meter', () => {
		render(FeedbackDisplayVisualContractFixture);
		const critical = document.querySelector<HTMLElement>('[data-testid="meter-critical"]')!;
		const optimal = document.querySelector<HTMLElement>('[data-testid="meter-optimal"]')!;
		expect(critical.dataset.state).toBe('critical');
		expect(optimal.dataset.state).toBe('optimal');
		expect(critical.getBoundingClientRect().height).toBe(8);
		expect(critical.getBoundingClientRect().width).toBeGreaterThan(0);
		expect(critical.getBoundingClientRect().width).toBe(optimal.getBoundingClientRect().width);
	});

	// @zui-visual ZSkeleton explicit shape dimensions
	it('applies Skeleton shape and explicit dimensions to computed geometry', () => {
		render(FeedbackDisplayVisualContractFixture);
		const circle = document.querySelector<HTMLElement>('[data-testid="skeleton-circle"]')!;
		const rectangle = document.querySelector<HTMLElement>('[data-testid="skeleton-rectangle"]')!;
		expect(circle.getBoundingClientRect().width).toBe(40);
		expect(circle.getBoundingClientRect().height).toBe(40);
		expect(getComputedStyle(circle).borderRadius).toBe('50%');
		expect(rectangle.getBoundingClientRect().width).toBe(120);
		expect(rectangle.getBoundingClientRect().height).toBe(24);
		expect(rectangle.dataset.static).toBe('true');
	});

	// @zui-visual ZEmpty heading and padded layout geometry
	it('renders Empty with the requested heading level and bounded layout', () => {
		render(FeedbackDisplayVisualContractFixture);
		const empty = document.querySelector<HTMLElement>('[data-testid="empty"]')!;
		expect(empty.querySelector('h3')).not.toBeNull();
		const style = getComputedStyle(empty);
		expect(style.boxSizing).toBe('border-box');
		expect(style.display).toBe('flex');
		expect(style.paddingTop).toBe('24px');
		expect(style.textAlign).toBe('center');
		expect(empty.getBoundingClientRect().width).toBeGreaterThan(0);
		expect(empty.getBoundingClientRect().height).toBeGreaterThan(0);
	});

	// @zui-visual ZToggleButton pressed state geometry
	it('exposes ToggleButton pressed state with stable button geometry', () => {
		render(FeedbackDisplayVisualContractFixture);
		const toggle = document.querySelector<HTMLButtonElement>('[data-testid="toggle-pressed"]')!;
		const idle = document.querySelector<HTMLButtonElement>('[data-testid="toggle-idle"]')!;
		expect(toggle.dataset.state).toBe('on');
		expect(toggle.getAttribute('aria-pressed')).toBe('true');
		expect(toggle.getBoundingClientRect().height).toBe(32);
		expect(getComputedStyle(toggle).backgroundColor).not.toBe(
			getComputedStyle(idle).backgroundColor
		);
	});

	// @zui-visual ZSeparator orientation geometry
	it('maps Separator orientation to horizontal and vertical dimensions', () => {
		render(FeedbackDisplayVisualContractFixture);
		const horizontal = document.querySelector<HTMLElement>('[data-testid="separator-horizontal"]')!;
		const vertical = document.querySelector<HTMLElement>('[data-testid="separator-vertical"]')!;
		expect(horizontal.dataset.orientation).toBe('horizontal');
		expect(vertical.dataset.orientation).toBe('vertical');
		expect(horizontal.getBoundingClientRect().height).toBe(1);
		expect(vertical.getBoundingClientRect().width).toBe(1);
	});

	// @zui-visual ZKbd mono nowrap geometry
	it('keeps Kbd content on one line with the mono visual contract', () => {
		render(FeedbackDisplayVisualContractFixture);
		const kbd = document.querySelector<HTMLElement>('[data-testid="kbd"]')!;
		const style = getComputedStyle(kbd);
		expect(style.whiteSpace).toBe('nowrap');
		expect(style.fontFamily).toContain('ui-monospace');
		expect(kbd.getBoundingClientRect().width).toBeGreaterThan(0);
	});

	// @zui-visual ZCode highlighted block geometry
	it('keeps Code content visible with its highlighted block surface', async () => {
		render(FeedbackDisplayVisualContractFixture);
		const code = document.querySelector<HTMLElement>('[data-testid="code"]')!;
		await expect.poll(() => code.dataset.highlightStatus, { timeout: 10_000 }).toBe('highlighted');
		expect(code.textContent).toContain('const ready = true;');
		expect(getComputedStyle(code).display).toBe('block');
		expect(code.getBoundingClientRect().width).toBeGreaterThan(0);
	});
});
