import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import ZTextarea from '../src/components/input/ZTextarea.svelte';
import { textareaAutosize } from '../src/runtime/textarea-autosize.js';
import TextareaProductionFixture from './TextareaProductionFixture.svelte';

async function nextFrame(view: Window = window): Promise<void> {
	await new Promise<void>((resolve) => view.requestAnimationFrame(() => resolve()));
}

describe('ZTextarea production contract', () => {
	it('rejects invalid autosize row bounds before allocating a measurement node', () => {
		const textarea = document.createElement('textarea');
		document.body.append(textarea);
		expect(() => textareaAutosize(textarea, { enabled: true, minRows: 0, value: '' })).toThrow(
			/minRows must be a positive integer/u
		);
		expect(() =>
			textareaAutosize(textarea, { enabled: true, maxRows: 2, minRows: 3, value: '' })
		).toThrow(/maxRows must be greater than or equal to minRows/u);
		expect(document.querySelector('[data-zui-textarea-measurement]')).toBeNull();
		textarea.remove();
	});

	it('synchronizes native input, IME, external clear, FormData and external form reset', async () => {
		render(TextareaProductionFixture);
		const textarea = document.querySelector<HTMLTextAreaElement>(
			'[data-testid="textarea-production-control"]'
		)!;
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="textarea-production-form"]'
		)!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="textarea-production-output"]'
		)!;

		expect(textarea.form).toBe(form);
		expect(textarea.required).toBe(true);
		expect(textarea.maxLength).toBe(40);
		expect(textarea.getAttribute('aria-describedby')).toContain('description');
		expect(new FormData(form).get('description')).toBe('Seed');

		textarea.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		textarea.value = '输入中';
		textarea.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
		textarea.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
		await tick();
		expect(output.textContent).toBe('输入中:1:false');
		expect(new FormData(form).get('description')).toBe('输入中');

		await userEvent.click(
			document.querySelector<HTMLButtonElement>('[data-testid="textarea-production-clear"]')!
		);
		await tick();
		expect(output.textContent).toBe(':1:false');

		form.reset();
		await tick();
		await tick();
		expect(textarea.value).toBe('Seed');
		expect(output.textContent).toBe('Seed:1:false');
	});

	it('bounds autosize, shares one measurement per document and recovers from hidden mount', async () => {
		render(TextareaProductionFixture);
		const textarea = document.querySelector<HTMLTextAreaElement>(
			'[data-testid="textarea-production-control"]'
		)!;
		const hidden = document.querySelector<HTMLTextAreaElement>(
			'[data-testid="textarea-production-hidden"]'
		)!;
		await nextFrame();
		expect(textarea.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(document.querySelectorAll('[data-zui-textarea-measurement]')).toHaveLength(1);
		expect(hidden.style.height).toBe('');

		await userEvent.click(
			document.querySelector<HTMLButtonElement>('[data-testid="textarea-production-toggle"]')!
		);
		await nextFrame();
		expect(Number.parseFloat(hidden.style.height)).toBeGreaterThan(0);

		textarea.value = Array.from({ length: 12 }, (_, index) => `Line ${index + 1}`).join('\n');
		textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		await nextFrame();
		expect(textarea.style.overflowY).toBe('auto');
	});

	it('isolates measurement ownership across ShadowRoot and iframe documents', async () => {
		const host = document.createElement('div');
		const frame = document.createElement('iframe');
		document.body.append(host, frame);
		const shadow = host.attachShadow({ mode: 'open' });
		const frameDocument = frame.contentDocument!;
		const shadowComponent = mount(ZTextarea, {
			props: { autosize: { minRows: 1, maxRows: 3 }, defaultValue: 'Shadow value' },
			target: shadow
		});
		const frameComponent = mount(ZTextarea, {
			props: { autosize: true, defaultValue: 'Iframe value' },
			target: frameDocument.body
		});
		await nextFrame();
		await nextFrame(frame.contentWindow!);

		expect(document.querySelectorAll('[data-zui-textarea-measurement]')).toHaveLength(1);
		expect(frameDocument.querySelectorAll('[data-zui-textarea-measurement]')).toHaveLength(1);
		expect(shadow.querySelector<HTMLTextAreaElement>('textarea')?.style.height).not.toBe('');
		expect(
			frameDocument.querySelector<HTMLTextAreaElement>(
				'textarea:not([data-zui-textarea-measurement])'
			)?.style.height
		).not.toBe('');

		await unmount(frameComponent);
		expect(frameDocument.querySelector('[data-zui-textarea-measurement]')).toBeNull();
		await unmount(shadowComponent);
		host.remove();
		frame.remove();
	});

	it('projects readonly, disabled and autosize state without replacing the native element', () => {
		render(TextareaProductionFixture);
		const readonly = document.querySelector<HTMLTextAreaElement>(
			'[data-testid="textarea-production-readonly"]'
		)!;
		const disabled = document.querySelector<HTMLTextAreaElement>(
			'[data-testid="textarea-production-disabled"]'
		)!;
		expect(readonly.readOnly).toBe(true);
		expect(readonly.dataset.readonly).toBe('true');
		expect(disabled.disabled).toBe(true);
		expect(disabled.dataset.disabled).toBe('true');
	});
});
