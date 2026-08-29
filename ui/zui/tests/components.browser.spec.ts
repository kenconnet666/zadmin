import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import DynamicBox from './DynamicBox.svelte';
import ComponentGallery from './ComponentGallery.svelte';
import ComboboxFixture from './ComboboxFixture.svelte';
import ContextMenuFixture from './ContextMenuFixture.svelte';
import AccordionFixture from './AccordionFixture.svelte';
import AlertDialogFixture from './AlertDialogFixture.svelte';
import CheckboxFixture from './CheckboxFixture.svelte';
import FieldFixture from './FieldFixture.svelte';
import DialogFixture from './DialogFixture.svelte';
import DrawerFixture from './DrawerFixture.svelte';
import DropdownMenuFixture from './DropdownMenuFixture.svelte';
import MenuFixture from './MenuFixture.svelte';
import MultiSelectFixture from './MultiSelectFixture.svelte';
import ProviderRuntimeFixture from './ProviderRuntimeFixture.svelte';
import PaginationFixture from './PaginationFixture.svelte';
import PopoverFixture from './PopoverFixture.svelte';
import PopconfirmFixture from './PopconfirmFixture.svelte';
import RadioGroupFixture from './RadioGroupFixture.svelte';
import SelectFixture from './SelectFixture.svelte';
import SegmentedFixture from './SegmentedFixture.svelte';
import SliderFixture from './SliderFixture.svelte';
import ToggleButtonFixture from './ToggleButtonFixture.svelte';
import SwitchFixture from './SwitchFixture.svelte';
import TabsFixture from './TabsFixture.svelte';
import TreeFixture from './TreeFixture.svelte';
import TreeSelectFixture from './TreeSelectFixture.svelte';
import TooltipFixture from './TooltipFixture.svelte';
import TagsInputFixture from './TagsInputFixture.svelte';
import { createBrowserIcssRuntime } from '../src/icss/runtime.js';
import { defaultTheme } from '../src/theme/default.js';
import { extendTheme } from '../src/theme/define.js';
import { ZCode } from '../src/entrypoints/code.js';
import {
	ZAspectRatio,
	ZContainer,
	ZKbd,
	ZLink,
	ZSeparator,
	ZVisuallyHidden
} from '../src/entrypoints/index.js';

function insertedRuleCount(): number {
	return [...document.querySelectorAll<HTMLStyleElement>('style[data-icss]')].reduce(
		(total, style) => total + (style.sheet?.cssRules.length ?? 0),
		0
	);
}

describe('compiled ICSS browser updates', () => {
	it('coordinates Menu roving focus, disabled skipping, typeahead and cancellable action', async () => {
		render(MenuFixture);
		await tick();
		const alpha = document.querySelector<HTMLElement>('[data-testid="menu-alpha"]');
		const beta = document.querySelector<HTMLElement>('[data-testid="menu-beta"]');
		const charlie = document.querySelector<HTMLElement>('[data-testid="menu-charlie"]');
		const delta = document.querySelector<HTMLElement>('[data-testid="menu-delta"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="menu-output"]');
		expect(alpha?.tabIndex).toBe(0);
		expect(beta?.tabIndex).toBe(-1);
		alpha?.focus();
		alpha?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		expect(document.activeElement).toBe(charlie);

		charlie?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'd' }));
		expect(document.activeElement).toBe(delta);
		delta?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		expect(output?.textContent).toBe('none');

		delta?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Home' }));
		expect(document.activeElement).toBe(alpha);
		alpha?.click();
		await tick();
		expect(output?.textContent).toBe('alpha');
	});

	it('coordinates DropdownMenu positioning, focus, action dismiss and cancellation', async () => {
		render(DropdownMenuFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="dropdown-trigger"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="dropdown-output"]');
		trigger?.focus();
		trigger?.click();
		await tick();
		let content = document.querySelector<HTMLElement>('[data-testid="dropdown-content"]');
		const inspect = document.querySelector<HTMLElement>('[data-testid="dropdown-inspect"]');
		const copy = document.querySelector<HTMLElement>('[data-testid="dropdown-copy"]');
		expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
		expect(content?.parentNode).toBe(document.body);
		expect(document.activeElement).toBe(inspect);
		inspect?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		expect(document.activeElement).toBe(copy);
		copy?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(document.querySelector('[data-testid="dropdown-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
		expect(output?.textContent).toBe('false:copy');

		trigger?.click();
		await tick();
		const stay = document.querySelector<HTMLElement>('[data-testid="dropdown-stay"]');
		stay?.click();
		await tick();
		content = document.querySelector('[data-testid="dropdown-content"]');
		expect(content?.getAttribute('data-state')).toBe('open');
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
	});

	it('coordinates ContextMenu pointer and keyboard anchors with focus restoration', async () => {
		render(ContextMenuFixture);
		const trigger = document.querySelector<HTMLElement>('[data-testid="context-trigger"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="context-output"]');
		trigger?.dispatchEvent(
			new MouseEvent('contextmenu', {
				bubbles: true,
				cancelable: true,
				clientX: 120,
				clientY: 80
			})
		);
		await new Promise((resolve) => setTimeout(resolve, 0));
		await tick();
		let content = document.querySelector<HTMLElement>('[data-testid="context-content"]');
		const inspect = document.querySelector<HTMLElement>('[data-testid="context-inspect"]');
		expect(content?.parentNode).toBe(document.body);
		expect(content?.getBoundingClientRect().left).toBeCloseTo(120, 0);
		expect(content?.getBoundingClientRect().top).toBeCloseTo(82, 0);
		expect(document.activeElement).toBe(inspect);
		inspect?.click();
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(output?.textContent).toBe('false:inspect');
		expect(document.activeElement).toBe(trigger);

		trigger?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'F10', shiftKey: true })
		);
		await tick();
		content = document.querySelector('[data-testid="context-content"]');
		expect(content?.getAttribute('data-state')).toBe('open');
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
	});

	it('coordinates Select listbox focus, selection, form value, Escape and reset', async () => {
		render(SelectFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="select-trigger"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="select-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="select-output"]');
		trigger?.focus();
		trigger?.click();
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="select-content"]');
		const beta = document.querySelector<HTMLElement>('[data-testid="select-b"]');
		const disabled = document.querySelector<HTMLElement>('[data-testid="select-c"]');
		const delta = document.querySelector<HTMLElement>('[data-testid="select-d"]');
		expect(content?.parentNode).toBe(document.body);
		expect(content?.getAttribute('role')).toBe('listbox');
		expect(document.activeElement).toBe(beta);
		expect(disabled?.getAttribute('aria-disabled')).toBe('true');
		beta?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		expect(document.activeElement).toBe(delta);
		delta?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(document.querySelector('[data-testid="select-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
		expect(trigger?.textContent?.trim()).toBe('Delta');
		expect(new FormData(form!).get('choice')).toBe('d');
		expect(output?.textContent).toBe('d:1:false');

		trigger?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await tick();
		expect(document.querySelector('[data-testid="select-content"]')).not.toBeNull();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await new Promise((resolve) => setTimeout(resolve, 140));
		form?.reset();
		await Promise.resolve();
		await tick();
		expect(trigger?.textContent?.trim()).toBe('Beta');
		expect(output?.textContent).toBe('b:1:false');
	});

	it('coordinates Combobox filtering, active descendant, selection, form value and reset', async () => {
		render(ComboboxFixture);
		const input = document.querySelector<HTMLInputElement>('[data-testid="combobox-input"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="combobox-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="combobox-output"]');
		input?.focus();
		await tick();
		expect(document.activeElement).toBe(input);
		expect(document.querySelector('[data-testid="combobox-content"]')).not.toBeNull();
		if (input) {
			input.value = 'de';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		const delta = document.querySelector<HTMLElement>('[data-testid="combobox-d"]');
		const alpha = document.querySelector<HTMLElement>('[data-testid="combobox-a"]');
		expect(alpha?.hidden).toBe(true);
		expect(delta?.hidden).toBe(false);
		expect(input?.getAttribute('aria-activedescendant')).toBe(delta?.id);
		expect(document.activeElement).toBe(input);

		input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(input?.value).toBe('Delta');
		expect(new FormData(form!).get('choice')).toBe('d');
		expect(output?.textContent).toBe('d:Delta:1:false');
		expect(document.activeElement).toBe(input);

		form?.reset();
		await Promise.resolve();
		await tick();
		expect(input?.value).toBe('Beta');
		expect(output?.textContent).toBe('b:Beta:1:false');
	});

	it('coordinates MultiSelect toggles, persistent content, labels, form values and reset', async () => {
		render(MultiSelectFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="multi-select-trigger"]'
		);
		const form = document.querySelector<HTMLFormElement>('[data-testid="multi-select-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="multi-select-output"]');
		trigger?.focus();
		trigger?.click();
		await tick();
		const alpha = document.querySelector<HTMLElement>('[data-testid="multi-a"]');
		const beta = document.querySelector<HTMLElement>('[data-testid="multi-b"]');
		expect(document.activeElement).toBe(alpha);
		expect(alpha?.getAttribute('aria-selected')).toBe('true');
		alpha?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		expect(document.activeElement).toBe(beta);
		beta?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(document.querySelector('[data-testid="multi-select-content"]')).not.toBeNull();
		expect(beta?.getAttribute('aria-selected')).toBe('true');
		expect(new FormData(form!).getAll('choice')).toEqual(['a', 'c', 'b']);
		expect(output?.textContent).toBe('a,c,b:1:true');
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(trigger?.textContent).toContain('Beta');
		expect(document.activeElement).toBe(trigger);
		form?.reset();
		await Promise.resolve();
		await tick();
		expect(new FormData(form!).getAll('choice')).toEqual(['a', 'c']);
		expect(output?.textContent).toBe('a,c:1:false');
	});

	it('coordinates Segmented roving selection, disabled skipping, form value and reset', async () => {
		render(SegmentedFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="segmented-form"]');
		const beta = document.querySelector<HTMLButtonElement>('[role="radio"][aria-checked="true"]');
		const delta = [...document.querySelectorAll<HTMLButtonElement>('[role="radio"]')].find(
			(item) => item.textContent === 'Delta'
		);
		const output = document.querySelector<HTMLOutputElement>('[data-testid="segmented-output"]');
		beta?.focus();
		beta?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(document.activeElement).toBe(delta);
		expect(delta?.getAttribute('aria-checked')).toBe('true');
		expect(new FormData(form!).get('period')).toBe('d');
		expect(output?.textContent).toBe('d:1');
		form?.reset();
		await Promise.resolve();
		await tick();
		expect(new FormData(form!).get('period')).toBe('b');
		expect(output?.textContent).toBe('b:1');
	});

	it('coordinates TagsInput commit, dedupe, paste batch, Backspace, removal and reset', async () => {
		render(TagsInputFixture);
		const input = document.querySelector<HTMLInputElement>('[aria-label="Add fixture tag"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="tags-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="tags-output"]');
		if (input) {
			input.value = 'beta';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
			input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		}
		await tick();
		expect(new FormData(form!).getAll('tag')).toEqual(['alpha', 'beta']);
		expect(output?.textContent).toBe('alpha,beta:1:');
		if (input) {
			input.value = 'beta';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
			input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		}
		await tick();
		expect(output?.textContent).toBe('alpha,beta:1:beta');
		const transfer = new DataTransfer();
		transfer.setData('text', 'gamma,delta,beta');
		input?.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: transfer }));
		await tick();
		expect(new FormData(form!).getAll('tag')).toEqual(['alpha', 'beta', 'gamma', 'delta']);
		expect(output?.textContent).toBe('alpha,beta,gamma,delta:2:');
		input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Backspace' }));
		await tick();
		expect(output?.textContent).toBe('alpha,beta,gamma:3:');
		document.querySelector<HTMLButtonElement>('[aria-label="Remove alpha"]')?.click();
		await tick();
		expect(output?.textContent).toBe('beta,gamma:4:');
		form?.reset();
		await Promise.resolve();
		await tick();
		expect(output?.textContent).toBe('alpha:4:');
	});

	it('coordinates Tree visible navigation, expansion, selection, form value and reset', async () => {
		render(TreeFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="tree-form"]');
		const web = document.querySelector<HTMLElement>('[role="treeitem"][data-key="web"]');
		const worker = document.querySelector<HTMLElement>('[role="treeitem"][data-key="worker"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="tree-output"]');
		web?.focus();
		web?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		expect(document.activeElement).toBe(worker);
		worker?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(worker?.getAttribute('aria-selected')).toBe('true');
		expect(new FormData(form!).get('node')).toBe('worker');
		expect(output?.textContent).toBe('app:worker:1');
		worker?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		expect(document.activeElement?.getAttribute('data-key')).toBe('app');
		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' })
		);
		expect(document.activeElement).toBe(web);
		form?.reset();
		await Promise.resolve();
		await tick();
		expect(new FormData(form!).get('node')).toBe('web');
		expect(output?.textContent).toBe('app:web:1');
	});

	it('coordinates TreeSelect popup tree, selection, focus restoration, form value and reset', async () => {
		render(TreeSelectFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[aria-haspopup="tree"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="tree-select-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="tree-select-output"]');
		trigger?.focus();
		trigger?.click();
		await tick();
		const beta = document.querySelector<HTMLElement>('[role="treeitem"][data-key="beta"]');
		beta?.click();
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(trigger?.textContent?.trim()).toBe('Beta');
		expect(document.activeElement).toBe(trigger);
		expect(new FormData(form!).get('node')).toBe('beta');
		expect(output?.textContent).toBe('beta');
		form?.reset();
		await Promise.resolve();
		await tick();
		expect(trigger?.textContent?.trim()).toBe('Alpha');
	});
	it('keeps AlertDialog open until an explicit action is chosen', async () => {
		render(AlertDialogFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="alert-dialog-trigger"]'
		);
		trigger?.focus();
		trigger?.click();
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="alert-dialog-content"]');
		const overlay = document.querySelector<HTMLElement>('[data-testid="alert-dialog-overlay"]');
		const cancel = document.querySelector<HTMLButtonElement>('[data-testid="alert-dialog-cancel"]');
		const action = document.querySelector<HTMLButtonElement>('[data-testid="alert-dialog-action"]');
		expect(content?.getAttribute('role')).toBe('alertdialog');
		expect(document.activeElement).toBe(cancel);

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		overlay?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await tick();
		expect(content?.getAttribute('data-state')).toBe('open');
		expect(document.querySelector('[data-testid="alert-dialog-content"]')).toBe(content);

		action?.click();
		await tick();
		await new Promise((resolve) => setTimeout(resolve, 220));
		await tick();
		expect(document.querySelector('[data-testid="alert-dialog-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
		expect(document.querySelector('[data-testid="alert-dialog-output"]')?.textContent).toBe(
			'false:action'
		);
	});

	it('coordinates Dialog modal focus, inert, scroll, dismiss and cleanup', async () => {
		render(DialogFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="dialog-trigger"]');
		const inlineHost = document.querySelector<HTMLElement>('[data-testid="dialog-inline-host"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="dialog-output"]');
		const outsideRoot = inlineHost?.closest('body > *') as HTMLElement | null | undefined;
		const originalOverflow = document.body.style.overflow;
		trigger?.focus();
		trigger?.click();
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="dialog-content"]');
		const overlay = document.querySelector<HTMLElement>('[data-testid="dialog-overlay"]');
		const input = document.querySelector<HTMLInputElement>('[aria-label="Dialog input"]');
		const close = document.querySelector<HTMLButtonElement>('[data-testid="dialog-close"]');
		expect(content?.parentNode).toBe(document.body);
		expect(overlay?.parentNode).toBe(document.body);
		expect(document.body.style.overflow).toBe('hidden');
		expect(outsideRoot?.inert).toBe(true);
		expect(document.activeElement).toBe(input);
		trigger?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		expect(content?.getAttribute('data-state')).toBe('open');
		input?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Tab', shiftKey: true })
		);
		expect(document.activeElement).toBe(close);
		close?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }));
		expect(document.activeElement).toBe(input);
		expect(output?.textContent).toBe('true:1');

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		await new Promise((resolve) => setTimeout(resolve, 220));
		await tick();
		expect(document.querySelector('[data-testid="dialog-content"]')).toBeNull();
		expect(document.querySelector('[data-testid="dialog-overlay"]')).toBeNull();
		expect(document.body.style.overflow).toBe(originalOverflow);
		expect(outsideRoot?.inert).toBe(false);
		expect(document.activeElement).toBe(trigger);
		expect(output?.textContent).toBe('false:2');
	});

	it('coordinates Drawer placement, focus, Escape and Presence cleanup', async () => {
		render(DrawerFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="drawer-trigger"]');
		trigger?.focus();
		trigger?.click();
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="drawer-content"]');
		expect(content?.parentNode).toBe(document.body);
		expect(getComputedStyle(content!).insetInlineEnd).toBe('0px');
		expect(Number.parseFloat(getComputedStyle(content!).width)).toBeCloseTo(
			Math.min(400, innerWidth * 0.9),
			0
		);
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Drawer input');

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		await new Promise((resolve) => setTimeout(resolve, 220));
		await tick();
		expect(document.querySelector('[data-testid="drawer-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('coordinates Tooltip hover, focus, delay, portal and Escape', async () => {
		render(TooltipFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-trigger"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="tooltip-output"]');
		trigger?.dispatchEvent(new PointerEvent('pointerenter'));
		await new Promise((resolve) => setTimeout(resolve, 0));
		await tick();
		let content = document.querySelector<HTMLElement>('[data-testid="tooltip-content"]');
		expect(content?.parentNode).toBe(document.body);
		expect(content?.getAttribute('role')).toBe('tooltip');
		expect(trigger?.getAttribute('aria-describedby')).toBe(content?.id);
		expect(document.activeElement).not.toBe(content);
		expect(output?.textContent).toBe('true:1');

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(trigger?.getAttribute('aria-describedby')).toBeNull();
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		content = document.querySelector('[data-testid="tooltip-content"]');
		expect(content).toBeNull();
		expect(output?.textContent).toBe('false:2');
	});

	it('coordinates Popover portal, focus, dismiss and Presence cleanup', async () => {
		render(PopoverFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="popover-trigger"]');
		const inlineHost = document.querySelector<HTMLElement>('[data-testid="popover-inline-host"]');
		const outside = document.querySelector<HTMLButtonElement>('[data-testid="popover-outside"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="popover-output"]');
		trigger?.focus();
		trigger?.click();
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="popover-content"]');
		expect(content?.parentNode).toBe(document.body);
		expect(inlineHost?.contains(content ?? null)).toBe(false);
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Inside');
		expect(trigger?.getAttribute('aria-expanded')).toBe('true');
		expect(output?.textContent).toBe('true:1');

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(trigger?.getAttribute('aria-expanded')).toBe('false');
		expect(content?.dataset.presence).toBe('exiting');
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(document.querySelector('[data-testid="popover-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
		expect(output?.textContent).toBe('false:2');

		trigger?.click();
		await tick();
		outside?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await tick();
		expect(trigger?.getAttribute('aria-expanded')).toBe('false');
	});

	it('coordinates Popconfirm focus, explicit actions and safe dismiss paths', async () => {
		render(PopconfirmFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="popconfirm-trigger"]');
		const outside = document.querySelector<HTMLButtonElement>('[data-testid="popconfirm-outside"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="popconfirm-output"]');
		trigger?.focus();
		trigger?.click();
		await tick();
		let content = document.querySelector<HTMLElement>('[data-testid="popconfirm-content"]');
		const cancel = document.querySelector<HTMLButtonElement>('[data-testid="popconfirm-cancel"]');
		const action = document.querySelector<HTMLButtonElement>('[data-testid="popconfirm-action"]');
		expect(content?.parentNode).toBe(document.body);
		expect(document.activeElement).toBe(cancel);
		expect(content?.getAttribute('aria-labelledby')).toBe(
			document.querySelector('[data-testid="popconfirm-content"] h2')?.id
		);

		action?.click();
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(document.querySelector('[data-testid="popconfirm-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
		expect(output?.textContent).toBe('false:action');

		trigger?.click();
		await tick();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(document.querySelector('[data-testid="popconfirm-content"]')).toBeNull();

		trigger?.click();
		await tick();
		content = document.querySelector('[data-testid="popconfirm-content"]');
		outside?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(content?.isConnected).toBe(false);
	});

	it('keeps Accordion focus, single/multiple selection and Presence synchronized', async () => {
		render(AccordionFixture);
		const alpha = document.querySelector<HTMLButtonElement>('[data-testid="accordion-a"]');
		const disabled = document.querySelector<HTMLButtonElement>('[data-testid="accordion-b"]');
		const charlie = document.querySelector<HTMLButtonElement>('[data-testid="accordion-c"]');
		const alphaContent = document.querySelector<HTMLElement>('[data-testid="accordion-content-a"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="accordion-output"]');
		expect(alpha?.getAttribute('aria-expanded')).toBe('true');
		expect(disabled?.disabled).toBe(true);

		alpha?.focus();
		alpha?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await tick();
		expect(document.activeElement).toBe(charlie);
		expect(alpha?.getAttribute('aria-expanded')).toBe('true');

		charlie?.click();
		await tick();
		expect(charlie?.getAttribute('aria-expanded')).toBe('true');
		expect(alphaContent?.dataset.presence).toBe('exiting');
		expect(output?.textContent).toBe('c:1');
		await new Promise((resolve) => setTimeout(resolve, 220));
		await tick();
		expect(document.querySelector('[data-testid="accordion-content-a"]')).toBeNull();

		const yankee = document.querySelector<HTMLButtonElement>('[data-testid="accordion-y"]');
		const multipleOutput = document.querySelector<HTMLOutputElement>(
			'[data-testid="accordion-multiple-output"]'
		);
		yankee?.click();
		await tick();
		expect(multipleOutput?.textContent?.trim()).toBe('x,y');
	});

	it('keeps native Slider input, FormData and reset synchronized', async () => {
		render(SliderFixture);
		const control = document.querySelector<HTMLInputElement>('[data-testid="slider"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="slider-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="slider-output"]');
		expect(control?.valueAsNumber).toBe(35);

		if (control) {
			control.value = '40';
			control.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(new FormData(form!).get('threshold')).toBe('40');
		expect(output?.textContent).toBe('40:1');

		form?.reset();
		await new Promise<void>((resolve) => setTimeout(resolve, 0));
		await tick();
		await tick();
		expect(control?.valueAsNumber).toBe(35);
		await expect.poll(() => output?.textContent).toBe('35:1');
	});

	it('keeps pagination window, current page and callbacks synchronized', async () => {
		render(PaginationFixture);
		const navigation = document.querySelector<HTMLElement>('[aria-label="Fixture pagination"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="pagination-output"]');
		const current = navigation?.querySelector<HTMLButtonElement>('[aria-current="page"]');
		expect(current?.textContent).toContain('6');

		const pageSeven = navigation?.querySelector<HTMLButtonElement>('[aria-label="Page 7"]');
		pageSeven?.click();
		await tick();
		expect(navigation?.dataset.page).toBe('7');
		expect(output?.textContent).toBe('7:1');
		expect(pageSeven?.getAttribute('aria-current')).toBe('page');
	});

	it('separates Tabs focus from automatic and manual activation', async () => {
		render(TabsFixture);
		const beta = document.querySelector<HTMLButtonElement>('[data-testid="tab-b"]');
		const disabled = document.querySelector<HTMLButtonElement>('[data-testid="tab-c"]');
		const delta = document.querySelector<HTMLButtonElement>('[data-testid="tab-d"]');
		const panel = document.querySelector<HTMLElement>('[data-testid="panel-d"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="tabs-output"]');
		expect(beta?.getAttribute('aria-selected')).toBe('true');
		expect(disabled?.disabled).toBe(true);

		beta?.focus();
		beta?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(delta?.getAttribute('aria-selected')).toBe('true');
		expect(document.activeElement).toBe(delta);
		expect(panel?.hidden).toBe(false);
		expect(output?.textContent).toBe('d:1');

		const one = document.querySelector<HTMLButtonElement>('[data-testid="manual-one"]');
		const two = document.querySelector<HTMLButtonElement>('[data-testid="manual-two"]');
		const manualOutput = document.querySelector<HTMLOutputElement>(
			'[data-testid="manual-tabs-output"]'
		);
		one?.focus();
		one?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(document.activeElement).toBe(two);
		expect(one?.getAttribute('aria-selected')).toBe('true');
		expect(manualOutput?.textContent).toBe('one:0');
		two?.click();
		await tick();
		expect(two?.getAttribute('aria-selected')).toBe('true');
		expect(manualOutput?.textContent).toBe('two:1');
	});

	it('keeps radio roving focus, selection, FormData and reset synchronized', async () => {
		render(RadioGroupFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="radio-form"]');
		const beta = document.querySelector<HTMLInputElement>('[data-testid="radio-b"]');
		const disabled = document.querySelector<HTMLInputElement>('[data-testid="radio-c"]');
		const delta = document.querySelector<HTMLInputElement>('[data-testid="radio-d"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="radio-output"]');
		expect(beta?.checked).toBe(true);
		expect(beta?.tabIndex).toBe(0);
		expect(disabled?.disabled).toBe(true);
		expect(new FormData(form!).get('choice')).toBe('b');

		beta?.focus();
		beta?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(delta?.checked).toBe(true);
		expect(document.activeElement).toBe(delta);
		expect(new FormData(form!).get('choice')).toBe('d');
		expect(output?.textContent).toBe('d:1');

		form?.reset();
		await new Promise<void>((resolve) => setTimeout(resolve, 0));
		await tick();
		await tick();
		expect(beta?.checked).toBe(true);
		await expect.poll(() => output?.textContent).toBe('b:1');
	});

	it('keeps switch state, FormData and reset synchronized', async () => {
		render(SwitchFixture);
		const control = document.querySelector<HTMLInputElement>('[data-testid="switch"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="switch-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="switch-output"]');
		expect(control?.role).toBe('switch');
		expect(new FormData(form!).get('alerts')).toBeNull();

		control?.click();
		await tick();
		expect(control?.checked).toBe(true);
		expect(control?.getAttribute('aria-checked')).toBe('true');
		expect(new FormData(form!).get('alerts')).toBe('enabled');
		expect(output?.textContent).toBe('true:1');

		form?.reset();
		await new Promise<void>((resolve) => setTimeout(resolve, 0));
		await tick();
		await tick();
		expect(control?.checked).toBe(false);
		await expect.poll(() => output?.textContent).toBe('false:1');
	});

	it('keeps checkbox mixed state, FormData and reset synchronized', async () => {
		render(CheckboxFixture);
		const checkbox = document.querySelector<HTMLInputElement>('[data-testid="checkbox"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="checkbox-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="checkbox-output"]');
		expect(checkbox?.indeterminate).toBe(true);
		expect(checkbox?.getAttribute('aria-checked')).toBe('mixed');
		expect(new FormData(form!).get('choice')).toBeNull();

		checkbox?.click();
		await tick();
		expect(checkbox?.checked).toBe(true);
		expect(checkbox?.indeterminate).toBe(false);
		expect(new FormData(form!).get('choice')).toBe('selected');
		expect(output?.textContent).toBe('true:1');

		form?.reset();
		await new Promise<void>((resolve) => setTimeout(resolve, 0));
		await tick();
		await tick();
		expect(checkbox?.indeterminate).toBe(true);
		expect(checkbox?.getAttribute('aria-checked')).toBe('mixed');
		await expect.poll(() => output?.textContent).toBe('indeterminate:1');
	});

	it('keeps toggle state controllable and cancellable', async () => {
		render(ToggleButtonFixture);
		const toggle = document.querySelector<HTMLButtonElement>('[data-testid="toggle"]');
		const cancelled = document.querySelector<HTMLButtonElement>('[data-testid="cancelled-toggle"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="toggle-output"]');

		expect(toggle?.getAttribute('aria-pressed')).toBe('false');
		toggle?.click();
		await tick();
		expect(toggle?.getAttribute('aria-pressed')).toBe('true');
		expect(toggle?.dataset.state).toBe('on');
		expect(output?.textContent).toBe('true:1');

		cancelled?.click();
		await tick();
		expect(cancelled?.getAttribute('aria-pressed')).toBe('false');
	});

	it('runs S1 semantic primitives through their client lifecycle', async () => {
		let activations = 0;
		render(ZLink, {
			href: '#ready',
			onclick: (event) => {
				event.preventDefault();
				activations += 1;
			},
			tone: 'danger',
			underline: 'always'
		});
		const activeLink = document.querySelector<HTMLAnchorElement>('a[href="#ready"]');
		activeLink?.click();
		expect(activations).toBe(1);

		render(ZLink, {
			disabled: true,
			href: '#blocked',
			onclick: () => (activations += 1),
			tone: 'muted',
			underline: 'none'
		});
		const disabledLink = document.querySelector<HTMLAnchorElement>('a[aria-disabled="true"]');
		expect(disabledLink?.hasAttribute('href')).toBe(false);
		disabledLink?.click();
		expect(activations).toBe(1);

		render(ZSeparator, { orientation: 'horizontal' });
		render(ZSeparator, { orientation: 'vertical' });
		expect(document.querySelector('hr[data-orientation="horizontal"]')).not.toBeNull();
		expect(
			document.querySelector('[role="separator"][aria-orientation="vertical"]')
		).not.toBeNull();

		render(ZKbd, { 'data-testid': 'kbd' });
		render(ZVisuallyHidden, { 'data-testid': 'visually-hidden' });
		expect(document.querySelector('[data-testid="kbd"]')?.tagName).toBe('KBD');
		expect(
			getComputedStyle(document.querySelector('[data-testid="visually-hidden"]')!).position
		).toBe('absolute');

		render(ZAspectRatio, { 'data-testid': 'ratio-fraction', ratio: '4 / 3' });
		render(ZAspectRatio, { 'data-testid': 'ratio-number', ratio: 1.5 });
		expect(
			getComputedStyle(document.querySelector('[data-testid="ratio-fraction"]')!).aspectRatio
		).toBe('4 / 3');
		expect(
			getComputedStyle(document.querySelector('[data-testid="ratio-number"]')!).aspectRatio
		).toBe('1.5 / 1');

		render(ZContainer, { 'data-testid': 'container', gutter: 'large', size: 'small' });
		const container = document.querySelector('[data-testid="container"]');
		expect(getComputedStyle(container!).maxWidth).toBe('640px');
		expect(getComputedStyle(container!).paddingInline).toBe('16px');
	});

	it('enhances ZCode with Shiki tokens without replacing its text semantics', async () => {
		render(ZCode, {
			code: 'const answer: number = 42;',
			highlightedLines: [1],
			lang: 'typescript',
			lineNumbers: true,
			scheme: 'dark'
		});
		const root = document.querySelector<HTMLElement>('[data-highlight-status]');
		expect(root?.textContent).toContain('const answer: number = 42;');
		await expect.poll(() => root?.dataset.highlightStatus, { timeout: 10_000 }).toBe('highlighted');
		expect(root?.querySelectorAll('[data-highlighted="true"]')).toHaveLength(1);
		expect(root?.querySelector('[aria-hidden="true"]')?.textContent).toBe('1');
		expect(root?.dataset.colorScheme).toBe('dark');
		expect(getComputedStyle(root as Element).backgroundColor).toBe('rgb(13, 17, 23)');
		expect(getComputedStyle(root as Element).fontSize).toBe('14px');
	});

	it('keeps ZCode resilient for plain, oversized and invalid language inputs', async () => {
		render(ZCode, { ariaLabel: 'plain-code', code: 'plain', inline: true, wrap: true });
		const plain = document.querySelector<HTMLElement>('[aria-label="plain-code"]');
		expect(plain?.tagName).toBe('CODE');
		expect(plain?.dataset.highlightStatus).toBe('plain');
		expect(plain?.textContent).toBe('plain');

		render(ZCode, {
			ariaLabel: 'large-code',
			code: 'x'.repeat(100_001),
			lang: 'css'
		});
		const large = document.querySelector<HTMLElement>('[aria-label="large-code"]');
		expect(large?.dataset.highlightStatus).toBe('too-large');

		render(ZCode, {
			ariaLabel: 'invalid-code',
			code: 'value',
			lang: 'missing' as never
		});
		const invalid = document.querySelector<HTMLElement>('[aria-label="invalid-code"]');
		await expect.poll(() => invalid?.dataset.highlightStatus).toBe('failed');
		expect(invalid?.textContent).toBe('value');

		for (const [language, source] of [
			['css', '.ready { display: block; }'],
			['json', '{"ready":true}']
		] as const) {
			render(ZCode, { ariaLabel: `${language}-code`, code: source, lang: language });
			const highlighted = document.querySelector<HTMLElement>(`[aria-label="${language}-code"]`);
			await expect.poll(() => highlighted?.dataset.highlightStatus).toBe('highlighted');
		}
	});
	it('updates only the inline variable while class and rules stay stable', async () => {
		render(DynamicBox);
		const target = document.querySelector<HTMLElement>('[data-testid="target"]');
		const increment = document.querySelector<HTMLButtonElement>('[data-testid="increment"]');
		expect(target).not.toBeNull();
		expect(increment).not.toBeNull();
		if (target === null || increment === null) return;

		const variable = [...target.style].find((name) => name.startsWith('--width-'));
		expect(variable).toBeDefined();
		if (variable === undefined) return;
		const initialClass = target.className;
		const initialRules = insertedRuleCount();
		const initialStyleTags = document.querySelectorAll('style[data-icss]').length;
		expect(target.style.getPropertyValue(variable)).toBe('10');

		for (let count = 0; count < 10_000; count += 1) {
			increment.click();
			if (count % 100 === 99) await tick();
		}

		expect(target.style.getPropertyValue(variable)).toBe('10010');
		expect(target.className).toBe(initialClass);
		expect(insertedRuleCount()).toBe(initialRules);
		expect(document.querySelectorAll('style[data-icss]')).toHaveLength(initialStyleTags);
		expect(document.querySelector('svelte-css-wrapper')).toBeNull();
	});

	it('mounts and unmounts the Symbol carrier 100 times without growing CSS resources', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const warmup = mount(DynamicBox, { target });
		await unmount(warmup);
		const baselineRules = insertedRuleCount();
		const baselineTags = document.querySelectorAll('style[data-icss]').length;

		for (let count = 0; count < 100; count += 1) {
			const component = mount(DynamicBox, { target });
			await unmount(component);
		}

		expect(insertedRuleCount()).toBe(baselineRules);
		expect(document.querySelectorAll('style[data-icss]')).toHaveLength(baselineTags);
		expect(target.childNodes).toHaveLength(0);
		target.remove();
	});

	it('updates and removes component-boundary variables without wrappers', async () => {
		render(ComponentGallery);
		const manual = document.querySelector<HTMLElement>('[data-testid="manual"]');
		const change = document.querySelector<HTMLButtonElement>('[data-testid="change"]');
		const style = document.querySelector<HTMLButtonElement>('[data-testid="style"]');
		const remove = document.querySelector<HTMLButtonElement>('[data-testid="remove"]');
		expect(manual?.style.getPropertyValue('--manual-value')).toBe('1');

		change?.click();
		await tick();
		expect(manual?.style.getPropertyValue('--manual-value')).toBe('2');
		style?.click();
		await tick();
		expect(manual?.style.color).toBe('blue');
		expect(manual?.style.getPropertyValue('--manual-value')).toBe('2');
		remove?.click();
		await tick();
		expect(manual?.style.getPropertyValue('--manual-value')).toBe('');
		expect(document.querySelector('svelte-css-wrapper')).toBeNull();
	});

	it('applies provider themes and native button semantics', () => {
		render(ComponentGallery);
		const button = document.querySelector<HTMLButtonElement>('[data-testid="button"]');
		const text = document.querySelector<HTMLElement>('[data-testid="text"]');
		const stack = document.querySelector<HTMLElement>('[data-testid="stack"]');
		const numericStack = document.querySelector<HTMLElement>('[data-testid="numeric-stack"]');
		const icon = document.querySelector<SVGSVGElement>('[data-testid="icon"]');

		expect(button?.type).toBe('button');
		expect(getComputedStyle(button as Element).backgroundColor).toBe('rgb(220, 38, 38)');
		expect(getComputedStyle(text as Element).color).toBe('rgb(124, 58, 237)');
		expect(getComputedStyle(text as Element).fontSize).toBe('16px');
		expect(getComputedStyle(stack as Element).gap).toBe('8px');
		expect(getComputedStyle(numericStack as Element).gap).toBe('6px');
		expect(icon?.getAttribute('role')).toBe('img');
		expect(getComputedStyle(icon as Element).width).toBe('20px');
	});

	it('keeps an explicit ShadowRoot runtime isolated and supports nested themes', async () => {
		const host = document.createElement('div');
		const shadow = host.attachShadow({ mode: 'open' });
		document.body.append(host);
		const runtime = createBrowserIcssRuntime({ root: shadow });
		const nestedTheme = extendTheme(defaultTheme, {
			color: { primary: '#6d28d9', primaryHover: '#5b21b6' }
		});
		const component = mount(ProviderRuntimeFixture, {
			props: { nestedTheme, runtime, theme: defaultTheme },
			target: shadow
		});
		await tick();

		expect(shadow.querySelectorAll('style[data-icss]')).toHaveLength(1);
		expect(shadow.querySelectorAll('button')).toHaveLength(2);
		expect(shadow.querySelector('[data-testid="outer-context"]')?.textContent).toBe(
			'zh-CN:rtl:dark:high:compact:reduced:test:关闭:default-portal'
		);
		expect(shadow.querySelector('[data-testid="inner-context"]')?.textContent).toBe(
			'zh-CN:rtl:dark:high:compact:reduced:test:关闭:default-portal'
		);
		expect(runtime.registry.cssText()).toContain('#2563eb');
		expect(runtime.registry.cssText()).toContain('#6d28d9');

		await unmount(component);
		runtime.registry.clear();
		host.remove();
	});

	it('links field semantics and calls onValueChange once per user input', async () => {
		render(FieldFixture);
		const input = document.querySelector<HTMLInputElement>('[data-testid="field-input"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="field-output"]');
		const label = document.querySelector<HTMLLabelElement>('label');
		const optional = document.querySelector<HTMLInputElement>('[data-testid="optional-input"]');
		const inherited = document.querySelector<HTMLInputElement>('[data-testid="inherited-input"]');
		const field = label?.parentElement;
		const messages = field?.querySelectorAll('[aria-live] p');
		expect(input).not.toBeNull();
		if (input === null) return;
		let resetEvents = 0;
		input.form?.addEventListener('reset', () => (resetEvents += 1));

		expect(label?.htmlFor).toBe(input.id);
		expect(input.required).toBe(true);
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')?.split(' ')).toHaveLength(4);
		expect(optional?.required).toBe(false);
		expect(optional?.hasAttribute('aria-describedby')).toBe(false);
		expect(optional?.hasAttribute('aria-invalid')).toBe(false);
		expect(inherited?.disabled).toBe(true);
		expect(inherited?.readOnly).toBe(true);
		expect(inherited?.name).toBe('inherited');
		expect(field?.className).not.toBe('');
		expect(label?.className).not.toBe('');
		expect(input.className).not.toBe('');
		expect(messages).toHaveLength(2);
		expect([...(messages ?? [])].every((message) => message.className.length > 0)).toBe(true);

		input.value = 'alice';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		expect(output?.textContent).toBe('alice:1');

		input.form?.reset();
		expect(resetEvents).toBe(1);
		await new Promise((resolve) => setTimeout(resolve, 0));
		await tick();
		await tick();
		expect(input.value).toBe('seed');
		expect(output?.textContent).toBe('alice:1');
	});
});
