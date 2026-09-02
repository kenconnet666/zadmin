import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { mount, unmount } from './browser-lifecycle.js';

import DynamicBox from './DynamicBox.svelte';
import ComponentGallery from './ComponentGallery.svelte';
import ComboboxFixture from './ComboboxFixture.svelte';
import CommandFixture from './CommandFixture.svelte';
import CoverageFixture from './CoverageFixture.svelte';
import DocsExamplesFixture from './DocsExamplesFixture.svelte';
import CommandPaletteFixture from './CommandPaletteFixture.svelte';
import CascaderFixture from './CascaderFixture.svelte';
import CarouselFixture from './CarouselFixture.svelte';
import ColorPickerFixture from './ColorPickerFixture.svelte';
import CodeRaceFixture from './CodeRaceFixture.svelte';
import ContextMenuFixture from './ContextMenuFixture.svelte';
import ContextBoundaryFixture from './ContextBoundaryFixture.svelte';
import AccordionFixture from './AccordionFixture.svelte';
import AccordionTabsProductionFixture from './AccordionTabsProductionFixture.svelte';
import AlertDialogFixture from './AlertDialogFixture.svelte';
import CheckboxFixture from './CheckboxFixture.svelte';
import FieldFixture from './FieldFixture.svelte';
import FileUploadFixture from './FileUploadFixture.svelte';
import FormFixture from './FormFixture.svelte';
import FormSubmitEpochFixture from './FormSubmitEpochFixture.svelte';
import FormEdgeFixture from './FormEdgeFixture.svelte';
import FormGraphFixture from './FormGraphFixture.svelte';
import FormValueBridgeFixture from './FormValueBridgeFixture.svelte';
import InputGroupFixture from './InputGroupFixture.svelte';
import DialogFixture from './DialogFixture.svelte';
import DateFixture from './DateFixture.svelte';
import DateLocaleFixture from './DateLocaleFixture.svelte';
import DateProductionFixture from './DateProductionFixture.svelte';
import DataFixture from './DataFixture.svelte';
import DisplayFixture from './DisplayFixture.svelte';
import FeedbackFixture from './FeedbackFixture.svelte';
import DrawerFixture from './DrawerFixture.svelte';
import DropdownMenuFixture from './DropdownMenuFixture.svelte';
import MenuFixture from './MenuFixture.svelte';
import MentionFixture from './MentionFixture.svelte';
import NativeIdentityFixture from './NativeIdentityFixture.svelte';
import MultiSelectFixture from './MultiSelectFixture.svelte';
import NumberFieldFixture from './NumberFieldFixture.svelte';
import PinInputFixture from './PinInputFixture.svelte';
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
import VirtualTreeFixture from './VirtualTreeFixture.svelte';
import TreeSelectFixture from './TreeSelectFixture.svelte';
import TransferFixture from './TransferFixture.svelte';
import TooltipFixture from './TooltipFixture.svelte';
import TourFixture from './TourFixture.svelte';
import TagsInputFixture from './TagsInputFixture.svelte';
import TextareaFixture from './TextareaFixture.svelte';
import ThemeSwitchFixture from './ThemeSwitchFixture.svelte';
import ToastLifecycleFixture from './ToastLifecycleFixture.svelte';
import { createBrowserIcssRuntime } from '../src/icss/runtime.js';
import FormResetSignal from '../src/runtime/form/FormResetSignal.svelte';
import { defaultTheme } from '../src/theme/default.js';
import { extendTheme } from '../src/theme/define.js';
import { ZCode } from '../src/entrypoints/code.js';
import {
	createToastQueue,
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

function dispatchPaste(target: HTMLElement | null | undefined, text: string): void {
	if (!target) return;
	const transfer = new DataTransfer();
	transfer.setData('text', text);
	const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
	Object.defineProperty(event, 'clipboardData', { configurable: true, value: transfer });
	target.dispatchEvent(event);
}

async function settleFormReset(): Promise<void> {
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
	await tick();
}

async function resetForm(form: HTMLFormElement | null | undefined): Promise<void> {
	// Component behavior leaves the page call stack through the browser provider; layer tests retain
	// direct form.reset() coverage for the low-level programmatic contract.
	const control = form?.querySelector<HTMLButtonElement | HTMLInputElement>(
		'button[type="reset"], input[type="reset"]'
	);
	if (control) await userEvent.click(control);
	else form?.reset();
	await settleFormReset();
}

describe('compiled ICSS browser updates', () => {
	it('generates unique native control ids while preserving consumer and Field ownership', () => {
		render(NativeIdentityFixture);
		const controls = [
			...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
				'input:not([type="hidden"]):not([hidden]), textarea'
			)
		];
		const ids = controls.map(({ id }) => id);
		expect(ids.every(Boolean)).toBe(true);
		expect(new Set(ids).size).toBe(ids.length);
		expect(document.querySelector<HTMLInputElement>('[data-testid="identity-explicit"]')?.id).toBe(
			'consumer-input'
		);
		const field = document.querySelector<HTMLInputElement>('[data-testid="identity-field"]');
		expect(document.querySelector<HTMLLabelElement>('label')?.htmlFor).toBe(field?.id);
		expect(document.querySelector<HTMLInputElement>('[aria-label="Select all rows"]')?.id).not.toBe(
			''
		);
		expect(document.querySelectorAll('[data-zui-form-reset-signal]')).toHaveLength(0);
	});

	it('updates Provider theme recipes through their visual transition', async () => {
		render(ThemeSwitchFixture);
		const target = document.querySelector<HTMLElement>('[data-testid="theme-switch-target"]')!;
		const next = document.querySelector<HTMLButtonElement>('[data-testid="theme-switch-next"]')!;
		expect(getComputedStyle(target).backgroundColor).toBe('rgb(36, 87, 230)');
		next.click();
		await expect.poll(() => getComputedStyle(target).backgroundColor).toBe('rgb(34, 211, 238)');
		next.click();
		await expect.poll(() => getComputedStyle(target).backgroundColor).toBe('rgb(154, 52, 18)');
	});

	it.skipIf(!navigator.userAgent.includes('Chrome'))(
		'renders every documentation example against the source package',
		async () => {
			const target = document.createElement('div');
			document.body.append(target);
			const fixture = mount(DocsExamplesFixture, { target });
			await tick();
			expect(target.querySelectorAll('[data-docs-example]').length).toBeGreaterThanOrEqual(105);
			const example = (suffix: string) =>
				target.querySelector<HTMLElement>(`[data-docs-example$="${suffix}"]`)!;
			const dismissTop = async () => {
				document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
				await new Promise((resolve) => setTimeout(resolve, 140));
				await tick();
			};

			example('/input/color-picker/StatesDemo.svelte')
				.querySelector<HTMLButtonElement>('button')
				?.click();
			await tick();
			await dismissTop();

			example('/input/select/StatesDemo.svelte')
				.querySelector<HTMLButtonElement>('button')
				?.click();
			await tick();
			[...document.querySelectorAll<HTMLElement>('[role="option"]')]
				.find((option) => option.textContent?.includes('维护中'))
				?.click();
			await dismissTop();

			example('/input/multi-select/StatesDemo.svelte')
				.querySelector<HTMLButtonElement>('button')
				?.click();
			await tick();
			document.querySelector<HTMLElement>('[role="option"]')?.click();
			await dismissTop();

			for (const suffix of [
				'/input/date-picker/ConstraintsDemo.svelte',
				'/input/date-range-picker/StatesDemo.svelte'
			]) {
				example(suffix).querySelector<HTMLButtonElement>('button:not(:disabled)')?.click();
				await tick();
				await dismissTop();
			}

			const calendar = example('/input/calendar/ConstraintsDemo.svelte');
			const calendarCell = calendar.querySelector<HTMLButtonElement>(
				'[role="grid"] button:not(:disabled)'
			);
			calendarCell?.focus();
			for (const key of ['PageDown', 'PageUp', 'Home', 'End']) {
				calendarCell?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
			}

			example('/input/tree-select/StatesDemo.svelte')
				.querySelector<HTMLButtonElement>('button:not(:disabled)')
				?.click();
			await tick();
			[...document.querySelectorAll<HTMLElement>('[role="treeitem"]')]
				.find((item) => item.textContent?.trim() === 'API服务')
				?.click();
			await new Promise((resolve) => setTimeout(resolve, 140));

			example('/input/cascader/StatesDemo.svelte')
				.querySelector<HTMLButtonElement>('button:not(:disabled)')
				?.click();
			await tick();
			for (const label of ['中国', '华东', '上海']) {
				[...document.querySelectorAll<HTMLElement>('[role="option"]')]
					.find((option) => option.textContent?.trim() === label)
					?.click();
				await tick();
			}
			await new Promise((resolve) => setTimeout(resolve, 140));

			const mention = example('/input/mention/TriggersDemo.svelte').querySelector(
				'textarea'
			) as HTMLTextAreaElement | null;
			if (mention) {
				mention.value = '#de';
				mention.setSelectionRange(3, 3);
				mention.dispatchEvent(new InputEvent('input', { bubbles: true }));
				mention.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
				mention.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
			}

			example('/input/number-field/StatesDemo.svelte')
				.querySelector<HTMLButtonElement>('button:not(:disabled)')
				?.click();
			example('/input/segmented/VerticalDemo.svelte')
				.querySelectorAll<HTMLButtonElement>('button')[1]
				?.click();
			const slider = example('/input/slider/StatesDemo.svelte').querySelector<HTMLInputElement>(
				'input[type="range"]'
			);
			if (slider) {
				slider.value = '500';
				slider.dispatchEvent(new InputEvent('input', { bubbles: true }));
			}
			await tick();

			const accordion = example('/navigation/accordion/MultipleDemo.svelte');
			accordion.querySelectorAll<HTMLButtonElement>('button')[0]?.click();
			accordion
				.querySelectorAll<HTMLButtonElement>('button')[2]
				?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Home' }));
			const commandInput = example('/navigation/command/FilterDemo.svelte').querySelector(
				'input'
			) as HTMLInputElement | null;
			if (commandInput) {
				commandInput.value = '构';
				commandInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
				commandInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
			}
			const manualTabs = example('/navigation/tabs/ManualDemo.svelte');
			const manualFirst = manualTabs.querySelector<HTMLButtonElement>('[role="tab"]');
			manualFirst?.focus();
			manualFirst?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
			(document.activeElement as HTMLElement | null)?.dispatchEvent(
				new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })
			);

			example('/navigation/dropdown-menu/StatesDemo.svelte')
				.querySelector<HTMLButtonElement>('button')
				?.click();
			await tick();
			document.querySelector<HTMLElement>('[role="menuitem"]')?.click();
			await dismissTop();

			example('/overlay/popover/FocusDemo.svelte')
				.querySelector<HTMLButtonElement>('button')
				?.click();
			await tick();
			await dismissTop();
			await expect
				.poll(() => target.querySelectorAll('[data-highlight-status="loading"]').length, {
					timeout: 10_000
				})
				.toBe(0);
			await unmount(fixture);
			target.remove();
		}
	);

	it('reports every orphan compound part through a real Svelte error boundary', async () => {
		render(ContextBoundaryFixture);
		await tick();
		await Promise.resolve();
		const output = document.querySelector('[data-testid="context-boundary-output"]');
		expect(output?.textContent).toMatch(/^26:/u);
		expect(output?.textContent).toContain('ZAccordion');
		expect(output?.textContent).toContain('ZTooltip');
		expect(output?.textContent).toContain(
			'ZTooltipContent cannot contain interactive or focusable content'
		);
		expect(output?.textContent).toContain('Duplicate ZList');
		expect(output?.textContent).toContain('Duplicate ZTimeline');
		expect(output?.textContent).toContain('requires at least one item');
		expect(output?.textContent).toContain('Duplicate ZCarousel key');
		expect(output?.textContent).toContain('maxFiles');
		expect(output?.textContent).toContain('maxSize');
		expect(output?.textContent).toContain('Virtualizer itemSize');
		expect(output?.textContent).toContain('Duplicate ZVirtualList key');
		expect(output?.textContent).toContain('ZPopconfirm compound components');
		expect(output?.textContent).toContain('ZFormField requires a parent ZForm');
		expect(output?.textContent).toContain('requires at least one column');
		expect(output?.textContent).toContain('Duplicate or empty ZDataTable column');
		expect(output?.textContent).toContain('Duplicate ZDataTable row key');
	});

	it('honors consumer cancellation across trigger and close controllers', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		{
			const component = mount(TooltipFixture, { props: { prevent: true }, target });
			const trigger = target.querySelector<HTMLElement>('[data-testid="tooltip-trigger"]');
			trigger?.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, cancelable: true }));
			trigger?.dispatchEvent(new FocusEvent('focus', { bubbles: true, cancelable: true }));
			await tick();
			expect(document.querySelector('[data-testid="tooltip-content"]')).toBeNull();
			await unmount(component);
		}
		{
			const component = mount(ContextMenuFixture, { props: { prevent: true }, target });
			const trigger = target.querySelector<HTMLElement>('[data-testid="context-trigger"]');
			trigger?.dispatchEvent(
				new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })
			);
			trigger?.dispatchEvent(
				new KeyboardEvent('keydown', {
					bubbles: true,
					cancelable: true,
					key: 'F10',
					shiftKey: true
				})
			);
			await tick();
			expect(document.querySelector('[data-testid="context-content"]')).toBeNull();
			await unmount(component);
		}
		{
			const component = mount(MultiSelectFixture, {
				props: { defaultOpen: true, prevent: true },
				target
			});
			await tick();
			const beta = document.querySelector<HTMLElement>('[data-testid="multi-b"]');
			beta?.click();
			await tick();
			expect(beta?.getAttribute('aria-selected')).toBe('false');
			await unmount(component);
		}
		{
			const component = mount(SelectFixture, {
				props: { defaultOpen: true, prevent: true },
				target
			});
			await tick();
			document.querySelector<HTMLElement>('[data-testid="select-d"]')?.click();
			await tick();
			expect(target.querySelector('[data-testid="select-output"]')?.textContent).toMatch(/^b:/u);
			await unmount(component);
		}
		{
			const component = mount(ComboboxFixture, {
				props: { defaultOpen: true, prevent: true },
				target
			});
			await tick();
			document.querySelector<HTMLElement>('[data-testid="combobox-d"]')?.click();
			await tick();
			expect(target.querySelector('[data-testid="combobox-output"]')?.textContent).toMatch(/^b:/u);
			await unmount(component);
		}
		{
			const component = mount(MentionFixture, { props: { prevent: true }, target });
			const input = target.querySelector<HTMLTextAreaElement>('[aria-label="Message"]');
			if (input) {
				input.value = 'Changed';
				input.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
				input.dispatchEvent(
					new CompositionEvent('compositionend', { bubbles: true, cancelable: true })
				);
				input.dispatchEvent(
					new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowDown' })
				);
			}
			await tick();
			expect(target.querySelector('[data-testid="mention-output"]')?.textContent).toContain(
				'Notify '
			);
			await unmount(component);
		}
		{
			const component = mount(DialogFixture, { props: { prevent: true }, target });
			target.querySelector<HTMLButtonElement>('[data-testid="dialog-trigger"]')?.click();
			await tick();
			expect(document.querySelector('[data-testid="dialog-content"]')).toBeNull();
			await unmount(component);
		}
		{
			const component = mount(PopoverFixture, { props: { prevent: true }, target });
			target.querySelector<HTMLButtonElement>('[data-testid="popover-trigger"]')?.click();
			await tick();
			expect(document.querySelector('[data-testid="popover-content"]')).toBeNull();
			await unmount(component);
		}
		{
			const component = mount(DialogFixture, {
				props: { defaultOpen: true, prevent: true },
				target
			});
			await tick();
			document.querySelector<HTMLButtonElement>('[data-testid="dialog-close"]')?.click();
			await tick();
			expect(document.querySelector('[data-testid="dialog-content"]')).not.toBeNull();
			await unmount(component);
		}
		{
			const component = mount(PopconfirmFixture, {
				props: { defaultOpen: true, prevent: true },
				target
			});
			await tick();
			document.querySelector<HTMLButtonElement>('[data-testid="popconfirm-cancel"]')?.click();
			document.querySelector<HTMLButtonElement>('[data-testid="popconfirm-action"]')?.click();
			await tick();
			expect(document.querySelector('[data-testid="popconfirm-content"]')).not.toBeNull();
			await unmount(component);
		}
		target.remove();
	});

	it('pauses, resumes, times out and disposes explicit ToastQueue timers', async () => {
		const dismissed: string[] = [];
		const queue = createToastQueue();
		const id = queue.push({
			duration: 40,
			onDismiss: (_id, reason) => dismissed.push(reason),
			title: 'Timed'
		});
		const disconnectViewport = queue.connectViewport();
		queue.pause(id, 'hover');
		queue.pause(id, 'hover');
		queue.resume(id, 'focus');
		await new Promise((resolve) => setTimeout(resolve, 60));
		expect(queue.items).toHaveLength(1);
		queue.resume(id, 'hover');
		await new Promise((resolve) => setTimeout(resolve, 60));
		expect(queue.items[0]).toMatchObject({ id, phase: 'exiting' });
		queue.completeExit(id);
		expect(queue.items).toHaveLength(0);
		expect(dismissed).toEqual(['timeout']);
		const persistent = queue.push({ duration: null, title: 'Persistent' });
		queue.pause(persistent, 'hover');
		queue.resume(persistent, 'hover');
		const disconnect = queue.connectVisibility();
		disconnect();
		disconnectViewport();
		queue.dispose();
	});

	it('portals Toasts, admits FIFO work after exit and removes reduced-motion exits immediately', async () => {
		render(ToastLifecycleFixture);
		document.querySelector<HTMLButtonElement>('[data-testid="toast-add-pair"]')?.click();
		await tick();
		const target = document.querySelector<HTMLElement>('[data-testid="toast-portal-target"]');
		const lifecycle = target?.querySelector<HTMLElement>('[aria-label="Lifecycle notifications"]');
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="toast-lifecycle-output"]'
		);
		expect(lifecycle).not.toBeNull();
		expect(output?.textContent).toBe('first:visible|second:queued:0');
		expect(lifecycle?.textContent).toContain('First');
		expect(lifecycle?.textContent).not.toContain('Second');

		await new Promise((resolve) => setTimeout(resolve, 550));
		expect(output?.textContent).toBe('first:visible|second:queued:0');
		lifecycle?.querySelector<HTMLButtonElement>('article button:not([aria-label])')?.click();
		await tick();
		expect(output?.textContent).toBe('first:exiting|second:queued:1');
		expect(lifecycle?.textContent).not.toContain('Second');

		await expect.poll(() => output?.textContent, { timeout: 10_000 }).toBe('second:visible:1');
		expect(lifecycle?.textContent).toContain('Second');

		document.querySelector<HTMLButtonElement>('[data-testid="toast-add-reduced"]')?.click();
		await tick();
		const reduced = target?.querySelector<HTMLElement>('[aria-label="Reduced notifications"]');
		expect(reduced?.textContent).toContain('Reduced');
		reduced?.querySelector<HTMLButtonElement>('[aria-label="Dismiss Reduced"]')?.click();
		await tick();
		await Promise.resolve();
		expect(reduced?.querySelector('article')).toBeNull();
	});

	it('covers optional display, feedback and reduced non-looping Carousel behavior', async () => {
		render(CoverageFixture);
		const carousel = document.querySelector<HTMLElement>('[data-testid="coverage-carousel"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="coverage-output"]');
		const reducedCarousel = document.querySelector<HTMLElement>(
			'[data-testid="coverage-carousel-reduced"]'
		);
		const nativeBusyButton = document.querySelector<HTMLButtonElement>(
			'[data-testid="coverage-button-native-busy"]'
		);
		expect(nativeBusyButton?.getAttribute('aria-busy')).toBe('true');
		expect(nativeBusyButton?.disabled).toBe(false);
		expect(reducedCarousel?.dataset.reducedMotion).toBe('true');
		expect(
			reducedCarousel?.querySelector<HTMLButtonElement>(
				'[aria-label="Automatic rotation disabled by motion preference"]'
			)?.disabled
		).toBe(true);
		expect(carousel?.querySelector<HTMLButtonElement>('[aria-label="Next slide"]')?.disabled).toBe(
			true
		);
		carousel?.querySelector<HTMLButtonElement>('[aria-label="Previous slide"]')?.click();
		await tick();
		expect(output?.textContent).toContain('a:1');
		expect(
			carousel?.querySelector<HTMLButtonElement>('[aria-label="Previous slide"]')?.disabled
		).toBe(true);
		carousel?.querySelector<HTMLButtonElement>('[aria-label="Pause automatic rotation"]')?.click();
		await tick();
		expect(carousel?.querySelector('[aria-label="Start automatic rotation"]')).not.toBeNull();
		document
			.querySelector<HTMLButtonElement>('[data-testid="coverage-alert"] [aria-label]')
			?.click();
		document
			.querySelector<HTMLButtonElement>('[data-testid="coverage-toast-action"] button')
			?.click();
		document
			.querySelector<HTMLButtonElement>('[data-testid="coverage-toast-dismiss"] [aria-label]')
			?.click();
		const interactiveToast = document.querySelector<HTMLElement>(
			'[data-testid="coverage-toast-dismiss"]'
		);
		interactiveToast?.dispatchEvent(new MouseEvent('mouseenter'));
		interactiveToast?.dispatchEvent(new MouseEvent('mouseleave'));
		const toastButtons = interactiveToast?.querySelectorAll<HTMLButtonElement>('button');
		toastButtons?.[0]?.focus();
		toastButtons?.[1]?.focus();
		carousel?.querySelector<HTMLButtonElement>('button')?.focus();
		await tick();
		expect(output?.textContent).toBe('a:1:1:1:enabled:0:0');
		expect(document.querySelector<HTMLInputElement>('[aria-label="Select row 3"]')?.disabled).toBe(
			true
		);
		document.querySelector<HTMLInputElement>('[aria-label="Select row 1"]')?.click();
		await tick();
		expect(output?.textContent).toContain('a:1:1:1:other:0:0');
		expect(document.body.textContent).toContain('Nothing to display');
		const dateField = document.querySelector<HTMLElement>('[data-testid="coverage-date-field"]');
		const dateInputs = dateField?.querySelectorAll<HTMLInputElement>('input') ?? [];
		dateInputs[0]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
			dateInputs[0]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
		}
		if (dateInputs[1]) {
			dateInputs[1].value = '99';
			dateInputs[1].dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(dateField?.dataset.invalid).toBe('true');
		const emptyDate = document.querySelector<HTMLElement>('[data-testid="coverage-date-empty"]');
		emptyDate
			?.querySelector<HTMLInputElement>('input')
			?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		const timeField = document.querySelector<HTMLElement>('[data-testid="coverage-time-field"]');
		const timeInputs = timeField?.querySelectorAll<HTMLInputElement>('input') ?? [];
		timeInputs[1]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'ArrowDown']) {
			timeInputs[0]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
		}
		timeField?.querySelector<HTMLButtonElement>('[aria-label="Toggle AM PM"]')?.click();
		if (timeInputs[1]) {
			timeInputs[1].value = '99';
			timeInputs[1].dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(timeField?.dataset.invalid).toBe('true');
		const readonlyPeriod = document.querySelector<HTMLButtonElement>(
			'[data-testid="coverage-time-readonly"] [aria-label="Toggle AM/PM"]'
		);
		expect(readonlyPeriod?.disabled).toBe(true);
		expect(
			document.querySelector('[data-testid="coverage-toast-danger"]')?.getAttribute('role')
		).toBe('alert');
		expect(
			document.querySelector('[data-testid="coverage-skeleton-circle"]')?.getAnimations()
		).toHaveLength(0);
		const avatar = document.querySelector<HTMLElement>('[data-testid="coverage-avatar-image"]');
		const avatarImage = avatar?.querySelector('img');
		avatarImage?.dispatchEvent(new Event('load'));
		await tick();
		expect(avatarImage?.hidden).toBe(false);
		avatarImage?.dispatchEvent(new Event('error'));
		await tick();
		expect(avatar?.textContent).toContain('IL');
	});
	it('coordinates Tour target spotlight, floating steps, completion and focus restoration', async () => {
		render(TourFixture);
		const start = document.querySelector<HTMLButtonElement>('#tour-start');
		start?.focus();
		start?.click();
		await tick();
		await Promise.resolve();
		let dialog = document.querySelector<HTMLElement>('[role="dialog"][data-step="summary"]');
		expect(dialog?.textContent).toContain('Release summary');
		expect(document.activeElement).toBe(dialog?.querySelector('[aria-label="Close tour"]'));
		expect(document.querySelectorAll('[data-slot="mask"]')).toHaveLength(4);
		expect(document.querySelector('[data-slot="spotlight"]')).not.toBeNull();
		document.querySelector<HTMLButtonElement>('#tour-metrics')?.focus();
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		dialog?.querySelector<HTMLButtonElement>('[data-slot="actions"] button:last-child')?.click();
		await expect
			.poll(
				() =>
					document.querySelector<HTMLElement>('[role="dialog"][data-step="metrics"]')
						?.textContent ?? ''
			)
			.toContain('Production metrics');
		dialog = document.querySelector<HTMLElement>('[role="dialog"][data-step="metrics"]');
		expect(dialog?.textContent).toContain('Production metrics');
		dialog
			?.querySelector<HTMLButtonElement>('[data-slot="actions"] button:nth-last-child(2)')
			?.click();
		await tick();
		expect(document.querySelector('[role="dialog"]')?.getAttribute('data-step')).toBe('summary');
		document
			.querySelector<HTMLElement>('[role="dialog"]')
			?.querySelector<HTMLButtonElement>('[data-slot="actions"] button:last-child')
			?.click();
		await tick();
		dialog = document.querySelector<HTMLElement>('[role="dialog"][data-step="metrics"]');
		dialog?.querySelector<HTMLButtonElement>('[data-slot="actions"] button:last-child')?.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(start);
		expect(document.querySelector('[data-testid="tour-output"]')?.textContent).toBe(
			'false:1:1:1:3'
		);

		start?.click();
		await tick();
		document.querySelector<HTMLButtonElement>('[data-slot="mask"]')?.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(start);

		start?.click();
		await tick();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		expect(document.activeElement).toBe(start);

		document.querySelector<HTMLButtonElement>('#tour-missing-start')?.click();
		await tick();
		await Promise.resolve();
		expect(document.querySelector('[data-testid="tour-missing-output"]')?.textContent).toBe(
			'false:1'
		);

		const persistent = document.querySelector<HTMLButtonElement>('#tour-persistent-start');
		persistent?.focus();
		persistent?.click();
		await tick();
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		document.querySelector<HTMLButtonElement>('[data-slot="mask"]')?.click();
		await tick();
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		document.querySelector<HTMLButtonElement>('[aria-label="Close persistent tour"]')?.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(persistent);
	});
	it('keeps Carousel slides, controls and stable value synchronized', async () => {
		render(CarouselFixture);
		const carousel = document.querySelector<HTMLElement>('[data-testid="carousel"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="carousel-output"]');
		expect(
			carousel?.querySelectorAll('[data-slot="slide"][role="group"]:not([hidden])')
		).toHaveLength(1);
		carousel?.querySelector<HTMLButtonElement>('[aria-label="Next slide"]')?.click();
		await tick();
		expect(output?.textContent).toBe('two:1');
		expect(carousel?.querySelector('[aria-current="true"]')?.getAttribute('aria-label')).toContain(
			'Metrics'
		);
		carousel?.querySelector<HTMLButtonElement>('[aria-label^="Go to slide 3"]')?.click();
		await tick();
		expect(output?.textContent).toBe('three:2');
	});
	it('keeps Table semantics and VirtualList DOM bounded while scrolling', async () => {
		render(DataFixture);
		const table = document.querySelector<HTMLTableElement>('[data-testid="table"]');
		const viewport = document.querySelector<HTMLDivElement>('[data-testid="virtual-list"]');
		const rangeOutput = document.querySelector('[data-testid="virtual-list-output"]');
		expect(table?.caption?.textContent).toBe('Deployments');
		expect(table?.tHead?.rows[0]?.cells).toHaveLength(2);
		expect(viewport?.querySelectorAll('[role="listitem"]').length).toBeLessThan(20);
		expect(rangeOutput?.textContent).not.toBe('none');
		if (viewport) {
			viewport.scrollTop = 4000;
			viewport.dispatchEvent(new Event('scroll'));
		}
		await tick();
		expect(Number(viewport?.dataset.rangeStart)).toBeGreaterThanOrEqual(90);
		expect(viewport?.textContent).toContain('Row 100');
		expect(viewport?.querySelectorAll('[role="listitem"]').length).toBeLessThan(20);
	});

	it('keeps DataTable sort, stable selection and virtual rows synchronized', async () => {
		render(DataFixture);
		const viewport = document.querySelector<HTMLDivElement>('[data-testid="data-table"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="data-table-output"]');
		expect(viewport?.querySelectorAll('tbody tr[data-slot="row"]')).toHaveLength(7);
		document.querySelector<HTMLInputElement>('[aria-label="Select row 1"]')?.click();
		await tick();
		expect(output?.textContent).toContain('row-2,row-0');
		const sort = [...document.querySelectorAll<HTMLButtonElement>('th button')].find((button) =>
			button.textContent?.includes('Index')
		);
		sort?.click();
		sort?.click();
		await tick();
		expect(output?.textContent).toContain('index-descending');
		expect(viewport?.querySelector('tbody tr[data-slot="row"]')?.getAttribute('data-key')).toBe(
			'row-999'
		);
		expect(output?.textContent).toContain('row-2,row-0');
		sort?.click();
		await tick();
		expect(output?.textContent).toContain(':none');
		const selectAll = viewport?.querySelector<HTMLInputElement>('thead input[type="checkbox"]');
		selectAll?.click();
		await tick();
		expect(selectAll?.checked).toBe(true);
		selectAll?.click();
		await tick();
		expect(selectAll?.checked).toBe(false);
	});

	it('coordinates feedback semantics, motion cleanup, Toast action and paused timeout', async () => {
		render(FeedbackFixture);
		const determinate = document.querySelector<HTMLElement>('[data-testid="loading-determinate"]');
		const indeterminate = document.querySelector<HTMLElement>(
			'[data-testid="loading-indeterminate"]'
		);
		expect(determinate?.getAttribute('aria-valuenow')).toBe('65');
		expect(indeterminate?.hasAttribute('aria-valuenow')).toBe(false);
		const spinner = document.querySelector<SVGSVGElement>(
			'[data-testid="spinner"] [data-slot="indicator"]'
		);
		expect(spinner?.classList.contains('lucide-loader-circle')).toBe(true);
		expect(spinner?.getAnimations()).toHaveLength(1);

		document.querySelector<HTMLButtonElement>('[aria-label="Dismiss saved alert"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="alert-output"]')?.textContent).toBe('dismissed');
		document.querySelector<HTMLButtonElement>('article button:not([aria-label])')?.click();
		await expect
			.poll(
				() =>
					[...document.querySelectorAll<HTMLElement>('article')].some((element) =>
						element.textContent?.includes('Release ready')
					),
				{ timeout: 10_000 }
			)
			.toBe(false);

		document.querySelector<HTMLButtonElement>('[data-testid="add-timed-toast"]')?.click();
		await expect
			.poll(() =>
				[
					...(document
						.querySelector<HTMLElement>('[data-slot="viewport"]')
						?.querySelectorAll<HTMLElement>('article') ?? [])
				].find((element) => element.textContent?.includes('Timed notification'))
			)
			.toBeDefined();
		const timed = [
			...(document
				.querySelector<HTMLElement>('[data-slot="viewport"]')
				?.querySelectorAll<HTMLElement>('article') ?? [])
		].find((element) => element.textContent?.includes('Timed notification'))!;
		timed?.dispatchEvent(new MouseEvent('mouseenter'));
		// Stay hovered beyond the declared duration to prove the user-visible timer is paused.
		await new Promise((resolve) => setTimeout(resolve, 550));
		expect(document.body.contains(timed ?? null)).toBe(true);
		timed?.dispatchEvent(new MouseEvent('mouseleave'));
		await expect.poll(() => document.body.contains(timed ?? null)).toBe(false);
	});

	it('keeps data-display image fallback, document semantics and removal ownership synchronized', async () => {
		render(DisplayFixture);
		const imageAvatar = document.querySelector<HTMLElement>('[data-testid="avatar-image"]');
		const image = imageAvatar?.querySelector<HTMLImageElement>('img');

		expect(
			document.querySelector('[data-testid="avatar-fallback"] [role="img"]')?.textContent
		).toBe('A');
		expect(image?.alt).toBe('Broken image');
		image?.dispatchEvent(new Event('error'));
		await tick();
		expect(imageAvatar?.dataset.fallback).toBe('true');
		expect(imageAvatar?.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
			'Broken image'
		);
		expect(document.querySelector('[data-testid="ordered-list"]')?.tagName).toBe('OL');
		expect(document.querySelectorAll('[data-testid="ordered-list"] > li')).toHaveLength(2);
		expect(document.querySelector('[data-testid="description-list"]')?.tagName).toBe('DL');
		expect(document.querySelectorAll('[data-testid="description-list"] dt')).toHaveLength(2);
		expect(document.querySelector('article > header h2')?.textContent).toBe('Production release');
		expect(
			document.querySelector<HTMLProgressElement>('[data-testid="progress-line"]')?.value
		).toBe(68);
		expect(document.querySelector('[data-testid="progress-circle"]')?.getAttribute('role')).toBe(
			'progressbar'
		);
		expect(document.querySelector('[data-testid="meter"]')?.getAttribute('data-state')).toBe(
			'suboptimal'
		);
		expect(document.querySelector('[data-testid="skeleton"]')?.getAnimations()).toHaveLength(1);
		expect(document.querySelector('[data-testid="empty"] [data-slot="title"]')?.tagName).toBe('H3');
		expect(document.querySelectorAll('[data-testid="timeline"] > li')).toHaveLength(3);
		expect(document.querySelector('[data-testid="timeline"] time')?.getAttribute('datetime')).toBe(
			'2026-08-30T09:00:00Z'
		);
		expect(document.querySelector('[data-testid="statistic"] data')?.getAttribute('value')).toBe(
			'128430'
		);

		document.querySelector<HTMLButtonElement>('[aria-label="Remove production"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="tag"]')).toBeNull();
		expect(document.querySelector('[data-testid="tag-output"]')?.textContent).toBe('removed');
	});

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
		const anchor = document.querySelector<HTMLElement>(
			`[data-zui-context-menu-anchor="${trigger?.getAttribute('aria-controls')}"]`
		);
		const inspect = document.querySelector<HTMLElement>('[data-testid="context-inspect"]');
		expect(anchor?.parentNode).toBe(document.body);
		expect(anchor?.getBoundingClientRect().left).toBeCloseTo(120, 0);
		expect(anchor?.getBoundingClientRect().top).toBeCloseTo(80, 0);
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
		const label = form?.querySelector<HTMLLabelElement>('label');
		expect(trigger?.textContent?.trim()).toBe('Beta');
		expect(trigger?.id).toBe(label?.htmlFor);
		expect(trigger?.getAttribute('aria-required')).toBe('true');
		expect(trigger?.getAttribute('aria-invalid')).toBeNull();
		expect(trigger?.getAttribute('aria-describedby')).toBeTruthy();
		expect(new FormData(form!).getAll('choice')).toEqual(['b']);
		label?.click();
		expect(document.activeElement).toBe(trigger);
		trigger?.click();
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="select-content"]');
		const beta = document.querySelector<HTMLElement>('[data-testid="select-b"]');
		const disabled = document.querySelector<HTMLElement>('[data-testid="select-c"]');
		const delta = document.querySelector<HTMLElement>('[data-testid="select-d"]');
		expect(content?.parentNode).toBe(document.body);
		expect(content?.getAttribute('role')).toBe('listbox');
		expect(document.activeElement).toBe(content);
		await expect.poll(() => content?.getAttribute('aria-activedescendant')).toBe(beta?.id);
		expect(disabled?.getAttribute('aria-disabled')).toBe('true');
		content?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		expect(document.activeElement).toBe(content);
		await expect.poll(() => content?.getAttribute('aria-activedescendant')).toBe(delta?.id);
		content?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
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
		await resetForm(form);
		await expect.poll(() => trigger?.textContent?.trim()).toBe('Beta');
		await expect
			.poll(() => document.querySelector('[data-testid="select-output"]')?.textContent)
			.toBe('b:1:false');
		const clearOwner = document.querySelector<HTMLButtonElement>(
			'[data-testid="select-owner-clear"]'
		);
		if (clearOwner) await userEvent.click(clearOwner);
		expect(trigger?.textContent?.trim()).toBe('Select an option');
		expect(trigger?.getAttribute('aria-invalid')).toBe('true');
		expect(new FormData(form!).getAll('choice')).toEqual([]);
		expect(document.querySelector('[data-testid="select-output"]')?.textContent).toBe(':1:false');
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
		expect(getComputedStyle(alpha!).display).toBe('none');
		expect(alpha?.checkVisibility()).toBe(false);
		expect(delta?.hidden).toBe(false);
		await expect.poll(() => input?.getAttribute('aria-activedescendant')).toBe(delta?.id);
		expect(document.activeElement).toBe(input);

		input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(input?.value).toBe('Delta');
		expect(new FormData(form!).get('choice')).toBe('d');
		expect(output?.textContent).toBe('d:Delta:1:false');
		expect(document.activeElement).toBe(input);

		await resetForm(form);
		expect(input?.value).toBe('Beta');
		expect(output?.textContent).toBe('b:Beta:1:false');
		if (input) {
			input.value = '';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		const restoredAlpha = document.querySelector<HTMLElement>('[data-testid="combobox-a"]');
		expect(restoredAlpha?.id).toBe(alpha?.id);
		expect(restoredAlpha?.hidden).toBe(false);
		expect(getComputedStyle(restoredAlpha!).display).not.toBe('none');
		for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
			input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
		}
		document
			.querySelector<HTMLElement>('[data-testid="combobox-a"]')
			?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		document.querySelector<HTMLElement>('[data-testid="combobox-c"]')?.click();
		input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(new FormData(form!).get('choice')).toBe('b');
	});

	it('coordinates MultiSelect toggles, persistent content, labels, form values and reset', async () => {
		render(MultiSelectFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="multi-select-trigger"]'
		);
		const form = document.querySelector<HTMLFormElement>('[data-testid="multi-select-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="multi-select-output"]');
		const label = form?.querySelector<HTMLLabelElement>('label');
		expect(trigger?.textContent).toContain('Alpha');
		expect(trigger?.textContent).toContain('Charlie');
		expect(trigger?.id).toBe(label?.htmlFor);
		expect(trigger?.getAttribute('aria-required')).toBe('true');
		expect(trigger?.getAttribute('aria-invalid')).toBeNull();
		expect(trigger?.getAttribute('aria-describedby')).toBeTruthy();
		label?.click();
		expect(document.activeElement).toBe(trigger);
		trigger?.click();
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="multi-select-content"]');
		const alpha = document.querySelector<HTMLElement>('[data-testid="multi-a"]');
		const beta = document.querySelector<HTMLElement>('[data-testid="multi-b"]');
		expect(document.activeElement).toBe(content);
		await expect.poll(() => content?.getAttribute('aria-activedescendant')).toBe(alpha?.id);
		expect(alpha?.getAttribute('aria-selected')).toBe('true');
		content?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await expect.poll(() => content?.getAttribute('aria-activedescendant')).toBe(beta?.id);
		content?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
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
		await resetForm(form);
		expect(new FormData(form!).getAll('choice')).toEqual(['a', 'c']);
		await expect
			.poll(() => document.querySelector('[data-testid="multi-select-output"]')?.textContent)
			.toBe('a,c:1:false');
		document.querySelector<HTMLButtonElement>('[data-testid="multi-select-owner-clear"]')?.click();
		await tick();
		expect(trigger?.textContent?.trim()).toBe('Select options');
		expect(trigger?.getAttribute('aria-invalid')).toBe('true');
		expect(new FormData(form!).getAll('choice')).toEqual([]);
		expect(document.querySelector('[data-testid="multi-select-output"]')?.textContent).toBe(
			':1:false'
		);
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
		await resetForm(form);
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
		await expect.poll(() => new FormData(form!).getAll('tag')).toEqual(['alpha', 'beta']);
		expect(output?.textContent).toBe('alpha,beta:1:');
		if (input) {
			input.value = 'beta';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
			input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		}
		await tick();
		expect(output?.textContent).toBe('alpha,beta:1:beta');
		dispatchPaste(input, 'gamma,delta,beta');
		await tick();
		expect(new FormData(form!).getAll('tag')).toEqual(['alpha', 'beta', 'gamma', 'delta']);
		expect(output?.textContent).toBe('alpha,beta,gamma,delta:2:');
		input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Backspace' }));
		await tick();
		expect(output?.textContent).toBe('alpha,beta,gamma:3:');
		document.querySelector<HTMLButtonElement>('[aria-label="Remove alpha"]')?.click();
		await tick();
		expect(output?.textContent).toBe('beta,gamma:4:');
		await resetForm(form);
		expect(output?.textContent).toBe('alpha:4:');
	});

	it('coordinates Tree visible navigation, expansion, selection, form value and reset', async () => {
		render(TreeFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="tree-form"]');
		const tree = document.querySelector<HTMLElement>('[aria-label="Fixture tree"]');
		const worker = document.querySelector<HTMLElement>('[role="treeitem"][data-key="worker"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="tree-output"]');
		tree?.focus();
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await expect.poll(() => tree?.dataset.activeKey).toBe('admin');
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'd' }));
		await expect.poll(() => tree?.dataset.activeKey).toBe('docs');
		for (const key of ['Home', 'End', 'ArrowUp']) {
			tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
			await tick();
		}
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		await tick();
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		await tick();
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await expect.poll(() => tree?.dataset.activeKey).toBe('worker');
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(worker?.getAttribute('aria-selected')).toBe('true');
		expect(new FormData(form!).get('node')).toBe('worker');
		expect(output?.textContent).toBe('app:worker:1');
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		await expect.poll(() => tree?.dataset.activeKey).toBe('app');
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await expect.poll(() => tree?.dataset.activeKey).toBe('web');
		expect(document.activeElement).toBe(tree);
		await resetForm(form);
		expect(new FormData(form!).get('node')).toBe('web');
		expect(output?.textContent).toBe('app:web:1');

		const multiple = document.querySelector<HTMLElement>('[aria-label="Fixture multiple tree"]');
		const multipleForm = document.querySelector<HTMLFormElement>(
			'[data-testid="tree-multiple-form"]'
		);
		const multipleOutput = document.querySelector<HTMLOutputElement>(
			'[data-testid="tree-multiple-output"]'
		);
		const multipleWorker = multiple?.querySelector<HTMLElement>('[data-key="worker"]');
		expect(multiple?.getAttribute('aria-multiselectable')).toBe('true');
		expect(getComputedStyle(multiple as Element).borderWidth).toBe('0px');
		expect(new FormData(multipleForm!).getAll('nodes')).toEqual(['web']);
		multipleWorker?.click();
		await tick();
		expect(new FormData(multipleForm!).getAll('nodes')).toEqual(['web', 'worker']);
		expect(multipleOutput?.textContent).toBe('web,worker');
		await resetForm(multipleForm);
		expect(new FormData(multipleForm!).getAll('nodes')).toEqual(['web']);
		expect(multipleOutput?.textContent).toBe('web');
	});

	it('keeps virtual Tree DOM bounded and scrolls keyboard focus to distant nodes', async () => {
		render(VirtualTreeFixture);
		const tree = document.querySelector<HTMLElement>('[data-testid="virtual-tree"]');
		expect(tree?.querySelectorAll('[role="treeitem"]').length).toBeLessThan(20);
		tree?.focus();
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
		await tick();
		await Promise.resolve();
		expect(tree?.dataset.activeKey).toBe('node-4999');
		expect(document.activeElement).toBe(tree);
		expect(tree?.scrollTop).toBeGreaterThan(170000);
		expect(tree?.querySelectorAll('[role="treeitem"]').length).toBeLessThan(20);
		tree?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(document.querySelector('[data-testid="virtual-tree-output"]')?.textContent).toBe(
			'node-4999'
		);
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
		await resetForm(form);
		expect(trigger?.textContent?.trim()).toBe('Alpha');
	});

	it('coordinates Cascader columns, leaf path commit, form value and reset', async () => {
		render(CascaderFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[aria-haspopup="listbox"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="cascader-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="cascader-output"]');
		trigger?.focus();
		trigger?.click();
		await tick();
		let columns = document.querySelectorAll<HTMLElement>('[role="listbox"]');
		expect(columns).toHaveLength(3);
		const rootColumn = columns[0]!;
		rootColumn.focus();
		rootColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		columns = document.querySelectorAll<HTMLElement>('[role="listbox"]');
		const childColumn = columns[1]!;
		expect(document.activeElement).toBe(childColumn);
		childColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		columns = document.querySelectorAll<HTMLElement>('[role="listbox"]');
		const leafColumn = columns[2]!;
		expect(document.activeElement).toBe(leafColumn);
		leafColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		await expect.poll(() => document.activeElement).toBe(childColumn);
		await tick();
		childColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
		const worker = [...childColumn.querySelectorAll<HTMLElement>('[role="option"]')].find(
			(item) => item.textContent?.trim() === 'Worker'
		);
		await expect.poll(() => childColumn.getAttribute('aria-activedescendant')).toBe(worker?.id);
		childColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await expect.poll(() => trigger?.textContent?.trim()).toBe('Root / Worker');
		await expect.poll(() => document.activeElement).toBe(trigger);
		expect(new FormData(form!).get('path')).toBe('root/worker');
		expect(output?.textContent).toBe('root/worker');
		await resetForm(form);
		expect(trigger?.textContent?.trim()).toBe('Root / Alpha / Leaf');
	});

	it('coordinates Transfer filtering, keyboard selection, moves, form values and reset', async () => {
		render(TransferFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="transfer-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="transfer-output"]');
		const source = document.querySelector<HTMLElement>('[role="listbox"][aria-label="Available"]');
		const production = [...(source?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])].find(
			(item) => item.textContent?.trim() === 'Production'
		);
		production?.focus();
		production?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
		await tick();
		document.querySelector<HTMLButtonElement>('[aria-label="Move to selected"]')?.click();
		await tick();
		expect(output?.textContent).toBe('production,staging');
		expect(new FormData(form!).getAll('channel')).toEqual(['production', 'staging']);
		const sourceSearch = document.querySelector<HTMLInputElement>(
			'input[aria-label="Available: Filter items"]'
		);
		if (sourceSearch) {
			sourceSearch.value = 'Preview';
			sourceSearch.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(source?.querySelectorAll('[role="option"]')).toHaveLength(1);
		await resetForm(form);
		await expect
			.poll(() => document.querySelector('[data-testid="transfer-output"]')?.textContent)
			.toBe('staging');
		const resetSource = document.querySelector<HTMLElement>(
			'[role="listbox"][aria-label="Available"]'
		);
		await expect.poll(() => resetSource?.querySelectorAll('[role="option"]').length).toBe(3);
		const sourceProduction = [
			...(resetSource?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])
		].find((item) => item.textContent?.trim() === 'Production');
		sourceProduction?.focus();
		for (const key of ['End', 'ArrowUp', 'Home', 'ArrowDown']) {
			document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
		}
		sourceProduction?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, ctrlKey: true, key: 'a' })
		);
		await tick();
		document.querySelector<HTMLButtonElement>('[aria-label="Move to selected"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="transfer-output"]')?.textContent).toBe(
			'production,staging,preview'
		);
		const target = document.querySelector<HTMLElement>('[role="listbox"][aria-label="Selected"]');
		const targetProduction = target?.querySelector<HTMLElement>('[role="option"]');
		targetProduction?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, ctrlKey: true, key: 'a' })
		);
		await tick();
		document.querySelector<HTMLButtonElement>('[aria-label="Move to available"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="transfer-output"]')?.textContent).toBe('');
	});

	it('coordinates Mention caret parsing, active descendant insertion, form value and reset', async () => {
		render(MentionFixture);
		const editor = document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="mention-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="mention-output"]');
		if (editor) {
			editor.value = 'Notify @al';
			editor.setSelectionRange(10, 10);
			editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(editor?.getAttribute('aria-expanded')).toBe('true');
		expect(editor?.getAttribute('aria-activedescendant')).toBeTruthy();
		for (const key of ['End', 'Home', 'ArrowDown', 'ArrowUp']) {
			editor?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
		}
		editor?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(editor?.value).toBe('Notify @alice ');
		expect(document.activeElement).toBe(editor);
		expect(new FormData(form!).get('message')).toBe('Notify @alice ');
		expect(output?.textContent).toBe('Notify @alice ');
		await resetForm(form);
		expect(editor?.value).toBe('Notify ');
		expect(output?.textContent).toBe('Notify ');
		if (editor) {
			editor.value = 'Notify @zz';
			editor.setSelectionRange(10, 10);
			editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(document.querySelector('[role="listbox"]')?.textContent).toContain('No suggestions');
		editor?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(editor?.getAttribute('aria-expanded')).toBe('false');
	});

	it('coordinates Command ranking, active descendant action and form reset', async () => {
		render(CommandFixture);
		const input = document.querySelector<HTMLInputElement>('input[aria-label="Search commands"]');
		const status = document.querySelector<HTMLElement>('[data-slot="status"][role="status"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="command-output"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="command-form"]');
		expect(input?.getAttribute('aria-describedby')).toBe(status?.id);
		expect(status?.getAttribute('aria-live')).toBe('polite');
		expect(status?.getAttribute('aria-atomic')).toBe('true');
		expect(status?.textContent).toContain('commands found');
		const numeric = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('Numeric one')
		);
		const string = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('String one')
		);
		expect(numeric?.id).toBeTruthy();
		expect(string?.id).toBeTruthy();
		expect(numeric?.id).not.toBe(string?.id);
		input?.focus();
		numeric?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		expect(document.activeElement).toBe(input);
		await expect.poll(() => input?.getAttribute('aria-activedescendant')).toBe(numeric?.id);
		if (input) {
			input.value = 'dep';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(document.querySelectorAll('[role="option"]')).toHaveLength(2);
		expect(input?.getAttribute('aria-activedescendant')).toBeTruthy();
		input?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, isComposing: true, key: 'Enter' })
		);
		expect(output?.textContent).toBe('dep:none:0');
		for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
			input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
			await tick();
		}
		input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(output?.textContent).toBe('dep:preview:0');
		await resetForm(form);
		expect(input?.value).toBe('');
		if (input) {
			input.value = 'nothing';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
			await tick();
			input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
			input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		}
		await expect
			.poll(() => document.querySelector('[data-slot="list"]')?.textContent)
			.toContain('No commands found');
		await expect
			.poll(() => document.querySelector('[data-testid="command-output"]')?.textContent)
			.toBe('nothing:preview:1');
	});

	it('reconciles a dynamically removed active Command to its nearest enabled successor', async () => {
		render(CommandFixture);
		const input = document.querySelector<HTMLInputElement>('input[aria-label="Search commands"]');
		input?.focus();
		input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		const preview = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('Deploy preview')
		);
		await expect.poll(() => input?.getAttribute('aria-activedescendant')).toBe(preview?.id);

		document.querySelector<HTMLButtonElement>('[data-testid="command-remove-preview"]')?.click();
		await tick();
		const numeric = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('Numeric one')
		);
		await expect.poll(() => input?.getAttribute('aria-activedescendant')).toBe(numeric?.id);
		expect(document.querySelectorAll('[data-active="true"], [aria-selected="true"]')).toHaveLength(
			1
		);
	});

	it('coordinates CommandPalette modal focus, action close, shortcut and Escape', async () => {
		render(CommandPaletteFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[aria-label="Open palette"]');
		trigger?.focus();
		trigger?.click();
		await tick();
		await Promise.resolve();
		const input = document.querySelector<HTMLInputElement>('input[aria-label="Search palette"]');
		expect(document.activeElement).toBe(input);
		if (input) {
			input.value = 'dark';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
			await tick();
			input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		}
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
		expect(document.querySelector('[data-testid="command-palette-output"]')?.textContent).toBe(
			'false:theme'
		);
		document.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, ctrlKey: true, key: 'k' })
		);
		await tick();
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('removes an open CommandPalette portal when its owner unmounts', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(CommandPaletteFixture, { props: { defaultOpen: true }, target });
		await tick();
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		await unmount(component);
		await tick();
		expect(document.querySelector('[role="dialog"]')).toBeNull();
		target.remove();
	});

	it('coordinates Textarea autosize, Field semantics, FormData and reset', async () => {
		render(TextareaFixture);
		const textarea = document.querySelector<HTMLTextAreaElement>('textarea[name="description"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="textarea-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="textarea-output"]');
		if (textarea) {
			textarea.value = 'Line one\nLine two\nLine three\nLine four';
			textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
		expect(Number.parseFloat(textarea?.style.height ?? '0')).toBeGreaterThan(0);
		expect(new FormData(form!).get('description')).toBe(
			'Line one\nLine two\nLine three\nLine four'
		);
		expect(output?.textContent?.startsWith('Line one\nLine two')).toBe(true);
		await resetForm(form);
		expect(textarea?.value).toBe('Seed');
		expect(output?.textContent?.startsWith('Seed:')).toBe(true);
	});

	it('coordinates InputGroup focus boundary, context state, FormData and reset', async () => {
		render(InputGroupFixture);
		const group = document.querySelector<HTMLElement>('[role="group"][aria-label="Endpoint"]');
		const input = document.querySelector<HTMLInputElement>('input[aria-label="Host"]');
		const disabledInput = document.querySelector<HTMLInputElement>(
			'input[aria-label="Disabled host"]'
		);
		const form = document.querySelector<HTMLFormElement>('[data-testid="input-group-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="input-group-output"]');
		expect(getComputedStyle(input!).borderStyle).toBe('none');
		expect(disabledInput?.disabled).toBe(true);
		expect(disabledInput?.getAttribute('aria-invalid')).toBe('true');
		input?.focus();
		expect(getComputedStyle(group!).outlineStyle).toBe('solid');
		if (input) {
			input.value = 'gateway';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(new FormData(form!).get('host')).toBe('gateway');
		expect(output?.textContent).toBe('gateway');
		await resetForm(form);
		expect(input?.value).toBe('api');
		expect(output?.textContent).toBe('api');
	});

	it('coordinates NumberField locale parsing, stepping, invalid draft, FormData and reset', async () => {
		render(NumberFieldFixture);
		const input = document.querySelector<HTMLInputElement>('[role="spinbutton"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="number-field-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="number-field-output"]');
		input?.focus();
		if (input) {
			input.value = '2,75';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(output?.textContent).toBe('2.75');
		expect(new FormData(form!).get('amount')).toBe('2.75');
		input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		await tick();
		expect(output?.textContent).toBe('3');
		input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'PageDown' }));
		await tick();
		expect(output?.textContent).toBe('0.5');
		if (input) {
			input.value = 'invalid';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(input?.getAttribute('aria-invalid')).toBe('true');
		input?.blur();
		await tick();
		expect(input?.value).toBe('0,5');
		await resetForm(form);
		expect(input?.value).toBe('1,5');
		expect(output?.textContent).toBe('1.5');
	});

	it('coordinates PinInput paste, roving deletion, completion, FormData and reset', async () => {
		render(PinInputFixture);
		const inputs = [...document.querySelectorAll<HTMLInputElement>('[data-slot="input"]')];
		const form = document.querySelector<HTMLFormElement>('[data-testid="pin-input-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="pin-input-output"]');
		dispatchPaste(inputs[2], '3456');
		await tick();
		expect(output?.textContent).toBe('1234:1');
		expect(document.activeElement).toBe(inputs[3]);
		expect(new FormData(form!).get('pin')).toBe('1234');
		for (const [key, target] of [
			['ArrowLeft', inputs[2]],
			['ArrowRight', inputs[3]],
			['Home', inputs[0]],
			['End', inputs[3]]
		] as const) {
			(document.activeElement as HTMLElement)?.dispatchEvent(
				new KeyboardEvent('keydown', { bubbles: true, key })
			);
			expect(document.activeElement).toBe(target);
		}
		const ignored = new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			key: 'Escape'
		});
		(document.activeElement as HTMLElement)?.dispatchEvent(ignored);
		expect(ignored.defaultPrevented).toBe(false);
		inputs[3]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Backspace' }));
		await tick();
		expect(output?.textContent).toBe('123:1');
		if (inputs[3]) {
			inputs[3].value = '4';
			inputs[3].dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(output?.textContent).toBe('1234:2');
		inputs[3]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Delete' }));
		await tick();
		expect(output?.textContent).toBe('123:2');
		inputs[3]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Backspace' }));
		await tick();
		expect(output?.textContent).toBe('12:2');
		await resetForm(form);
		expect(output?.textContent).toBe('12:2');
		expect(inputs.map((input) => input.value)).toEqual(['1', '2', '', '']);
	});

	it('coordinates ColorPicker RGB, alpha, invalid hex, focus, FormData and reset', async () => {
		render(ColorPickerFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="color-picker-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="color-picker-output"]');
		trigger?.focus();
		trigger?.click();
		await tick();
		const native = document.querySelector<HTMLInputElement>('input[type="color"]');
		const alpha = document.querySelector<HTMLInputElement>('input[type="range"]');
		const hex = document.querySelector<HTMLInputElement>('input[aria-label="Hex color"]');
		if (native) {
			native.value = '#ff0000';
			native.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(output?.textContent).toBe('#ff000080');
		if (alpha) {
			alpha.value = '25';
			alpha.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(output?.textContent).toBe('#ff000040');
		if (hex) {
			hex.value = 'bad';
			hex.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(hex?.getAttribute('aria-invalid')).toBe('true');
		expect(new FormData(form!).get('color')).toBe('#ff000040');
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await new Promise((resolve) => setTimeout(resolve, 140));
		expect(document.activeElement).toBe(trigger);
		await resetForm(form);
		expect(output?.textContent).toBe('#33669980');
	});

	it('coordinates FileUpload validation, drop queue, native FormData, removal and reset', async () => {
		render(FileUploadFixture);
		const input = document.querySelector<HTMLInputElement>('input[type="file"]');
		const form = document.querySelector<HTMLFormElement>('[data-testid="file-upload-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="file-upload-output"]');
		const selected = new DataTransfer();
		selected.items.add(new File(['{}'], 'a.json', { lastModified: 1, type: 'application/json' }));
		selected.items.add(new File(['text'], 'bad.txt', { lastModified: 2, type: 'text/plain' }));
		if (input) {
			input.files = selected.files;
			input.dispatchEvent(new Event('change', { bubbles: true }));
		}
		await tick();
		expect(output?.textContent).toBe('a.json:1');
		expect((new FormData(form!).get('asset') as File).name).toBe('a.json');
		const dropped = new DataTransfer();
		dropped.items.add(new File(['yaml'], 'b.yaml', { lastModified: 3, type: 'text/yaml' }));
		document
			.querySelector<HTMLElement>('[data-slot="dropzone"]')
			?.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dropped }));
		await tick();
		expect(output?.textContent).toBe('a.json,b.yaml:1');
		expect((new FormData(form!).getAll('asset') as File[]).map(({ name }) => name)).toEqual([
			'a.json',
			'b.yaml'
		]);
		document.querySelector<HTMLButtonElement>('[aria-label="Remove a.json"]')?.click();
		await tick();
		expect(output?.textContent).toBe('b.yaml:1');
		await resetForm(form);
		expect(output?.textContent).toBe('none:1');
		expect(input?.files).toHaveLength(0);
		expect(new FormData(form!).get('asset')).toBeNull();
	});

	it('keeps disabled FileUpload inert across drag, drop, change and remove paths', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FileUploadFixture, { props: { disabled: true }, target });
		const root = target.querySelector<HTMLElement>('[role="group"]');
		const dropzone = target.querySelector<HTMLElement>('[data-slot="dropzone"]');
		const input = target.querySelector<HTMLInputElement>('input[type="file"]');
		const transfer = new DataTransfer();
		transfer.items.add(new File(['{}'], 'disabled.json', { type: 'application/json' }));

		dropzone?.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: transfer }));
		dropzone?.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
		if (input) {
			input.files = transfer.files;
			input.dispatchEvent(new Event('change', { bubbles: true }));
		}
		await tick();
		expect(root?.getAttribute('aria-disabled')).toBe('true');
		expect(root?.hasAttribute('data-dragging')).toBe(false);
		expect(target.querySelector('[data-testid="file-upload-output"]')?.textContent).toBe('none:0');

		await unmount(component);
		target.remove();
	});

	it('coordinates Form async validation races, field state, first-error focus, submit and reset', async () => {
		render(FormFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="z-form"]');
		const account = document.querySelector<HTMLInputElement>('[data-testid="form-account"]');
		const email = document.querySelector<HTMLInputElement>('[data-testid="form-email"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="form-output"]');
		form?.requestSubmit();
		await new Promise((resolve) => setTimeout(resolve, 10));
		await tick();
		expect(document.activeElement).toBe(account);
		expect(account?.getAttribute('aria-invalid')).toBe('true');
		expect(email?.getAttribute('aria-invalid')).toBe('true');
		if (account) {
			account.value = 'x';
			account.dispatchEvent(new InputEvent('input', { bubbles: true }));
			account.value = 'alice';
			account.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		if (email) {
			email.value = 'alice@example.com';
			email.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await new Promise((resolve) => setTimeout(resolve, 60));
		await tick();
		expect(account?.getAttribute('aria-invalid')).not.toBe('true');
		expect(form?.querySelector('[data-dirty="true"]')).not.toBeNull();
		form?.requestSubmit();
		await new Promise((resolve) => setTimeout(resolve, 10));
		await tick();
		expect(output?.textContent).toBe('true:false:0:alice');
		await resetForm(form);
		expect(output?.textContent).toBe('false:false:0:alice');
		expect(form?.querySelector('[data-dirty="true"]')).toBeNull();
	});

	it('makes submit the only accepted result when change validation is still pending', async () => {
		render(FormSubmitEpochFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="submit-epoch-form"]')!;
		const input = document.querySelector<HTMLInputElement>('[data-testid="submit-epoch-input"]')!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="submit-epoch-output"]'
		)!;
		input.value = 'ready';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		form.requestSubmit();
		await expect.poll(() => output.textContent).toContain('2:true:true:0:0');
		document.querySelector<HTMLButtonElement>('[data-testid="resolve-submit"]')!.click();
		await expect.poll(() => output.textContent).toContain('2:true:true:0:1');
		document.querySelector<HTMLButtonElement>('[data-testid="resolve-old"]')!.click();
		await expect.poll(() => output.textContent).toBe('2:true:false:0:1');
	});

	it('lets FormField consumers cancel dirty and touched transitions', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormFixture, { props: { preventFieldEvents: true }, target });
		const account = target.querySelector<HTMLInputElement>('[data-testid="form-account"]');
		if (account) {
			account.value = 'blocked';
			account.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
			account.dispatchEvent(new FocusEvent('focusout', { bubbles: true, cancelable: true }));
		}
		await tick();
		expect(target.querySelector('[data-dirty="true"]')).toBeNull();
		expect(target.querySelector('[data-touched="true"]')).toBeNull();

		await unmount(component);
		target.remove();
	});

	it('covers Form schema failure, delayed change, invalid submit, reset and prevented submit', async () => {
		render(FormEdgeFixture);
		const input = document.querySelector<HTMLInputElement>('[data-testid="edge-input"]');
		const throwing = document.querySelector<HTMLFormElement>('[data-testid="throwing-form"]');
		const prevented = document.querySelector<HTMLFormElement>('[data-testid="prevented-form"]');
		const preventedReset = document.querySelector<HTMLFormElement>(
			'[data-testid="prevented-reset-form"]'
		);
		const preservedInput = preventedReset?.querySelector<HTMLInputElement>(
			'input:not([type="hidden"]):not([hidden])'
		);
		const preservedOutput = document.querySelector<HTMLOutputElement>(
			'[data-testid="prevented-reset-output"]'
		);
		const wrappedForm = document.querySelector<HTMLFormElement>(
			'[data-testid="wrapped-label-form"]'
		);
		const wrappedLabel = document.querySelector<HTMLLabelElement>('[data-testid="wrapped-label"]');
		const wrappedInput = document.querySelector<HTMLInputElement>('[data-testid="wrapped-input"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="form-edge-output"]');
		expect(prevented?.getAttribute('aria-busy')).toBe('true');
		if (input) {
			input.value = 'changed';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await new Promise((resolve) => setTimeout(resolve, 20));
		await tick();
		expect(output?.textContent).toContain(':1:0:0:0');
		throwing?.requestSubmit();
		await tick();
		await Promise.resolve();
		expect(output?.textContent).toContain(':2:1:0:0');
		await resetForm(throwing);
		expect(output?.textContent).toContain(':2:1:1:0');
		prevented?.requestSubmit();
		await tick();
		expect(prevented?.getAttribute('aria-busy')).toBe('true');
		expect(output?.textContent).toContain(':2:1:1:1');
		if (preservedInput) {
			preservedInput.value = 'changed';
			preservedInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		preventedReset?.reset();
		await settleFormReset();
		expect(preservedInput?.value).toBe('changed');
		expect(preservedOutput?.textContent).toBe('changed');
		expect(wrappedLabel?.control).toBe(wrappedInput);
		expect(wrappedLabel?.querySelectorAll('input')).toHaveLength(1);
		expect(wrappedForm?.querySelector('[data-zui-form-reset-signal]')?.parentElement).toBe(
			wrappedForm
		);
	});

	it('maps typed FieldPaths, dependencies, controller state and dynamic unmounts', async () => {
		render(FormGraphFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="form-graph"]');
		const email = document.querySelector<HTMLInputElement>('[data-testid="graph-email"]');
		const password = document.querySelector<HTMLInputElement>('[data-testid="graph-password"]');
		const confirm = document.querySelector<HTMLInputElement>('[data-testid="graph-confirm"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="graph-output"]');
		expect(email?.name).toBe('users[0].email');

		if (password) {
			password.value = 'secret';
			password.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await expect.poll(() => confirm?.getAttribute('aria-invalid')).toBe('true');
		if (confirm) {
			confirm.value = 'secret';
			confirm.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		if (email) {
			email.value = ' Alice@Example.COM ';
			email.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		await Promise.resolve();
		form?.requestSubmit();
		await expect.poll(() => output?.textContent).toContain('alice@example.com');

		document.querySelector<HTMLButtonElement>('[data-testid="graph-server-error"]')?.click();
		await tick();
		expect(document.activeElement).toBe(email);
		expect(email?.getAttribute('aria-invalid')).toBe('true');
		document.querySelector<HTMLButtonElement>('[data-testid="graph-status"]')?.click();
		await tick();
		const emailField = email?.closest<HTMLElement>('[data-success], [data-warning]');
		expect(emailField?.getAttribute('data-success')).toBe('true');
		expect(emailField?.getAttribute('data-warning')).toBe('true');

		document.querySelector<HTMLButtonElement>('[data-testid="graph-toggle"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="graph-confirm"]')).toBeNull();
		await resetForm(form);
		expect(email?.getAttribute('aria-invalid')).not.toBe('true');
		expect(emailField?.hasAttribute('data-success')).toBe(false);
		expect(emailField?.hasAttribute('data-warning')).toBe(false);
	});

	it('keeps the dedicated reset signal cancelable inside a ShadowRoot', async () => {
		const host = document.createElement('div');
		const shadow = host.attachShadow({ mode: 'open' });
		const form = document.createElement('form');
		shadow.append(form);
		document.body.append(host);
		let resets = 0;
		const component = mount(FormResetSignal, {
			props: { onReset: () => (resets += 1), owner: form },
			target: form
		});
		await tick();
		const signal = form.querySelector<HTMLInputElement>('[data-zui-form-reset-signal]');
		expect(signal?.hidden).toBe(true);
		expect(signal?.disabled).toBe(true);
		expect(signal?.name).toBe('');
		expect(signal?.id).toBe('');

		form.reset();
		await settleFormReset();
		expect(resets).toBe(1);
		const prevent = (event: Event) => event.preventDefault();
		form.addEventListener('reset', prevent);
		form.reset();
		await settleFormReset();
		expect(resets).toBe(1);

		form.removeEventListener('reset', prevent);
		await unmount(component);
		host.remove();
	});

	it('bridges dynamic external form values and one reset lifecycle without proxy FormData fields', async () => {
		render(FormValueBridgeFixture);
		await tick();
		await Promise.resolve();
		const first = document.querySelector<HTMLFormElement>('[data-testid="form-value-owner-a"]');
		const second = document.querySelector<HTMLFormElement>('[data-testid="form-value-owner-b"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="form-value-output"]');
		expect(first).not.toBeNull();
		expect(second).not.toBeNull();
		if (!first || !second) return;

		expect([...new FormData(first).entries()]).toEqual([
			['tag', 'alpha'],
			['tag', 'alpha'],
			['tag', '2'],
			['range.start', '2026-09-01'],
			['range.end', '2026-09-03']
		]);
		const signal = document.querySelector<HTMLInputElement>('[data-zui-form-reset-signal]');
		expect(signal?.form).toBe(first);
		expect(document.querySelectorAll('[data-zui-form-reset-signal]')).toHaveLength(1);
		expect(document.querySelectorAll('input[data-zui-form-value]')).toHaveLength(5);
		expect(document.querySelectorAll('input[data-zui-form-value-bridge]')).toHaveLength(1);
		expect(document.querySelectorAll('input[name]')).toHaveLength(5);

		document.querySelector<HTMLButtonElement>('[data-testid="form-value-update"]')?.click();
		await tick();
		expect(new FormData(first).getAll('tag')).toEqual(['beta', 'beta', '3', 'on']);
		expect(new FormData(first).get('range.start')).toBe('2026-10-10');

		document
			.querySelector<HTMLButtonElement>('[data-testid="form-value-toggle-disabled"]')
			?.click();
		await tick();
		expect([...new FormData(first).entries()]).toEqual([]);
		await resetForm(first);
		expect(output?.textContent).toBe('form-value-owner-a:1');
		expect([...new FormData(first).entries()]).toEqual([]);
		document
			.querySelector<HTMLButtonElement>('[data-testid="form-value-toggle-disabled"]')
			?.click();
		await tick();
		expect(new FormData(first).getAll('tag')).toEqual(['alpha', 'alpha', '2']);
		document.querySelector<HTMLButtonElement>('[data-testid="form-value-clear"]')?.click();
		await tick();
		expect([...new FormData(first).entries()]).toEqual([]);
		expect(document.querySelectorAll('input[data-zui-form-value]')).toHaveLength(0);

		document.querySelector<HTMLButtonElement>('[data-testid="form-value-update"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="form-value-rename-owner"]')?.click();
		await tick();
		await new Promise<void>((resolve) => queueMicrotask(() => queueMicrotask(resolve)));
		expect(signal?.form).toBeNull();
		expect(document.querySelectorAll('[data-zui-form-reset-signal]')).toHaveLength(1);
		expect([...new FormData(first).entries()]).toEqual([]);

		document.querySelector<HTMLButtonElement>('[data-testid="form-value-follow-renamed"]')?.click();
		await tick();
		await Promise.resolve();
		expect(signal?.form).toBe(first);
		expect(new FormData(first).getAll('tag')).toEqual(['beta', 'beta', '3', 'on']);

		document.querySelector<HTMLButtonElement>('[data-testid="form-value-move-owner"]')?.click();
		await tick();
		await Promise.resolve();
		expect(signal?.form).toBe(second);
		expect(document.querySelectorAll('[data-zui-form-reset-signal]')).toHaveLength(1);
		expect(new FormData(second).getAll('tag')).toEqual(['beta', 'beta', '3', 'on']);

		await resetForm(second);
		expect(output?.textContent).toBe('form-value-owner-b:2');
		expect(new FormData(second).getAll('tag')).toEqual(['alpha', 'alpha', '2']);
		expect(new FormData(second).get('range.end')).toBe('2026-09-03');

		document.querySelector<HTMLButtonElement>('[data-testid="form-value-unmount"]')?.click();
		await tick();
		expect(document.querySelector('[data-zui-form-reset-signal]')).toBeNull();
		expect(document.querySelector('[data-zui-form-value-bridge]')).toBeNull();
		expect([...new FormData(second).entries()]).toEqual([]);
	});

	it('coordinates Calendar and segmented date/time fields with FormData and reset', async () => {
		render(DateFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="date-form"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="date-output"]');
		const selected = document.querySelector<HTMLButtonElement>(
			'[data-slot="grid"] button[data-selected="true"]'
		);
		selected?.focus();
		selected?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		(document.activeElement as HTMLElement)?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })
		);
		await tick();
		expect(new FormData(form!).get('calendar')).toBe('2026-08-19');
		const month = document.querySelector<HTMLInputElement>('input[aria-label="Month"]');
		month?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		const minute = document.querySelector<HTMLInputElement>('input[aria-label="Minute"]');
		const dayPeriod = document.querySelector<HTMLButtonElement>('[aria-label="Toggle AM/PM"]');
		expect(document.querySelector('input[aria-label="Hour"]')).not.toBeNull();
		expect(document.querySelector('input[aria-label="Second"]')).not.toBeNull();
		expect(dayPeriod?.textContent).toBe('AM');
		minute?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		await tick();
		expect(new FormData(form!).get('date')).toBe('2026-09-18');
		expect(new FormData(form!).get('time')).toBe('09:31:15');
		expect(output?.textContent).toContain('2026-08-19:2026-09-18:09:31:15');
		await resetForm(form);
		expect(new FormData(form!).get('calendar')).toBe('2026-08-18');
		expect(new FormData(form!).get('date')).toBe('2026-08-18');
	});

	it('covers Calendar page, week-boundary and month navigation keys', async () => {
		render(DateFixture);
		const calendar = document.querySelector<HTMLElement>('[role="grid"]');
		let active = calendar?.querySelector<HTMLButtonElement>('button[data-selected="true"]');
		active?.focus();
		for (const key of ['Home', 'End', 'PageDown', 'PageUp']) {
			(document.activeElement as HTMLElement)?.dispatchEvent(
				new KeyboardEvent('keydown', { bubbles: true, key })
			);
			await tick();
		}
		const ignored = new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			key: 'Escape'
		});
		(document.activeElement as HTMLElement)?.dispatchEvent(ignored);
		expect(ignored.defaultPrevented).toBe(false);
		(document.activeElement as HTMLElement)?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'PageDown', shiftKey: true })
		);
		await tick();
		active = document.activeElement as HTMLButtonElement;
		expect(active?.getAttribute('aria-label')).toContain('2027');
		const navigation = calendar?.parentElement?.querySelectorAll<HTMLButtonElement>('button');
		navigation?.[0]?.click();
		navigation?.[1]?.click();
		await tick();
		expect(calendar?.querySelectorAll('[role="gridcell"]')).toHaveLength(42);
	});

	it('inherits typed Chinese date/time copy and hour cycle from Provider', () => {
		render(DateLocaleFixture);
		const calendar = document.querySelector<HTMLElement>('[data-testid="localized-calendar"]');
		expect(calendar?.querySelector('[role="grid"]')?.getAttribute('aria-label')).toContain('日历');
		expect(calendar?.querySelector('button[aria-label="上个月"]')).not.toBeNull();
		expect(calendar?.querySelector('button[aria-label="下个月"]')).not.toBeNull();
		const date = document.querySelector<HTMLElement>('[data-testid="localized-date-field"]');
		expect(date?.querySelector('input[aria-label="年"]')).not.toBeNull();
		expect(date?.querySelector('input[aria-label="月"]')).not.toBeNull();
		expect(date?.querySelector('input[aria-label="日"]')).not.toBeNull();
		const time = document.querySelector<HTMLElement>('[data-testid="localized-time-field"]');
		expect(time?.querySelector('input[aria-label="小时"]')).not.toBeNull();
		expect(time?.querySelector('input[aria-label="分钟"]')).not.toBeNull();
		expect(time?.querySelector('input[aria-label="秒"]')).not.toBeNull();
		expect(time?.querySelector('[data-slot="day-period"]')).toBeNull();
	});

	it('keeps date/time explicit-null owners, partial ranges and reset/FormData aligned', async () => {
		render(DateProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="date-production-form"]');
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="date-production-output"]'
		);
		expect(new FormData(form!).get('calendar')).toBeNull();
		expect(new FormData(form!).get('window.start')).toBe('2026-09-16');
		expect(new FormData(form!).get('window.end')).toBeNull();

		document.querySelector<HTMLButtonElement>('[data-testid="production-reverse"]')?.click();
		await tick();
		expect(new FormData(form!).get('window.start')).toBe('2026-09-20');
		expect(new FormData(form!).get('window.end')).toBe('2026-09-28');

		document.querySelector<HTMLButtonElement>('[data-testid="production-clear"]')?.click();
		await tick();
		expect([...new FormData(form!).entries()]).toEqual([]);
		expect(output?.textContent).toContain('|null|null|null|null|null|null|');

		document.querySelector<HTMLButtonElement>('[data-testid="production-open"]')?.click();
		await tick();
		expect(output?.textContent).toContain('|true|true');
		await resetForm(form);
		expect(new FormData(form!).get('window.start')).toBe('2026-09-16');
		expect(new FormData(form!).get('window.end')).toBeNull();
		expect(output?.textContent).toContain('|false|false');

		const readonly = document.querySelector<HTMLElement>(
			'[data-testid="production-readonly-picker"]'
		);
		expect(readonly?.querySelector('input')?.getAttribute('aria-readonly')).toBe('true');
		expect(readonly?.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')?.disabled).toBe(
			true
		);
	});

	it('uses RTL calendar arrows while skipping unavailable dates and publishing focusedValue', async () => {
		render(DateProductionFixture);
		const calendar = document.querySelector<HTMLElement>('[data-testid="production-calendar"]');
		const focused = calendar?.querySelector<HTMLButtonElement>('[tabindex="0"]');
		focused?.focus();
		focused?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="date-production-output"]'
		);
		expect(output?.textContent.trim().startsWith('2026-09-11|')).toBe(true);
		expect(document.activeElement?.getAttribute('aria-disabled')).not.toBe('true');
	});

	it('coordinates DatePicker and DateRangePicker popup selection and focus restoration', async () => {
		render(DateFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="date-form"]');
		const dateTrigger = [
			...document.querySelectorAll<HTMLButtonElement>('[aria-haspopup="dialog"]')
		].find((button) => button.getAttribute('aria-label')?.startsWith('Pick date'));
		const dateLabel = [...(form?.querySelectorAll<HTMLLabelElement>('label') ?? [])].find((label) =>
			label.textContent?.includes('Picked date')
		);
		const dateControl = document.getElementById(
			dateLabel?.htmlFor ?? ''
		) as HTMLInputElement | null;
		expect(dateControl?.tagName).toBe('INPUT');
		expect(dateTrigger?.getAttribute('role')).toBeNull();
		expect(dateControl?.required).toBe(true);
		expect(dateControl?.getAttribute('aria-describedby')).toBeTruthy();
		dateLabel?.click();
		expect(document.activeElement).toBe(dateControl);
		dateTrigger?.click();
		await tick();
		expect(new FormData(form!).getAll('picked')).toEqual(['2026-08-18']);
		const date20 = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(
			(button) => button.getAttribute('aria-label')?.includes('August 20, 2026')
		);
		date20?.click();
		await new Promise((resolve) => setTimeout(resolve, 140));
		expect(new FormData(form!).get('picked')).toBe('2026-08-20');
		expect(document.activeElement).toBe(dateTrigger);
		const rangeTrigger = [
			...document.querySelectorAll<HTMLButtonElement>('[aria-haspopup="dialog"]')
		].find((button) => button.getAttribute('aria-label') === 'Range calendar');
		const rangeLabel = [...(form?.querySelectorAll<HTMLLabelElement>('label') ?? [])].find(
			(label) => label.textContent?.includes('Date range')
		);
		const rangeControl = document.getElementById(
			rangeLabel?.htmlFor ?? ''
		) as HTMLInputElement | null;
		expect(rangeControl?.tagName).toBe('INPUT');
		expect(rangeControl?.required).toBe(true);
		expect(new FormData(form!).get('range')).toBeNull();
		rangeLabel?.click();
		expect(document.activeElement).toBe(rangeControl);
		rangeTrigger?.click();
		await tick();
		for (const day of [25, 22]) {
			const button = [
				...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')
			].find((candidate) => candidate.getAttribute('aria-label')?.includes(`August ${day}, 2026`));
			button?.click();
			await tick();
		}
		const readonlyDateRoot = form?.querySelector<HTMLElement>(
			'[data-testid="readonly-date-picker"]'
		);
		const readonlyRangeRoot = form?.querySelector<HTMLElement>(
			'[data-testid="readonly-date-range-picker"]'
		);
		const readonlyDate = readonlyDateRoot?.querySelector<HTMLButtonElement>(
			'[aria-haspopup="dialog"]'
		);
		const readonlyRange = readonlyRangeRoot?.querySelector<HTMLButtonElement>(
			'[aria-haspopup="dialog"]'
		);
		expect(readonlyDateRoot?.querySelector('input')?.getAttribute('aria-readonly')).toBe('true');
		expect(readonlyRangeRoot?.querySelector('input')?.getAttribute('aria-readonly')).toBe('true');
		readonlyDate?.click();
		readonlyRange?.click();
		await tick();
		expect(readonlyDate?.getAttribute('aria-expanded')).toBe('false');
		expect(readonlyRange?.getAttribute('aria-expanded')).toBe('false');
		expect(new FormData(form!).get('readonly-date')).toBe('2026-08-18');
		expect(new FormData(form!).getAll('readonly-range.start')).toEqual(['2026-08-18']);
		expect(new FormData(form!).getAll('readonly-range.end')).toEqual(['2026-08-21']);
		await new Promise((resolve) => setTimeout(resolve, 140));
		expect(new FormData(form!).get('range.start')).toBe('2026-08-22');
		expect(new FormData(form!).get('range.end')).toBe('2026-08-25');
		expect(document.activeElement).toBe(rangeTrigger);
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
		expect(content?.inert).toBe(true);
		expect(content?.hasAttribute('aria-hidden')).toBe(false);
		expect(document.activeElement).toBe(trigger);
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
		const content = document.querySelector<HTMLElement>('[data-testid="tooltip-content"]');
		expect(content?.parentNode).toBe(document.body);
		expect(content?.getAttribute('role')).toBe('tooltip');
		expect(trigger?.getAttribute('aria-describedby')).toBe(content?.id);
		expect(document.activeElement).not.toBe(content);
		expect(output?.textContent).toBe('true:1');

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(trigger?.getAttribute('aria-describedby')).toBeNull();
		await expect.poll(() => document.querySelector('[data-testid="tooltip-content"]')).toBeNull();
		expect(output?.textContent).toBe('false:2');

		trigger?.focus();
		await new Promise((resolve) => setTimeout(resolve, 0));
		await tick();
		expect(document.querySelector('[data-testid="tooltip-content"]')).not.toBeNull();
		trigger?.dispatchEvent(new PointerEvent('pointerleave'));
		trigger?.blur();
		await expect.poll(() => document.querySelector('[data-testid="tooltip-content"]')).toBeNull();
		trigger?.dispatchEvent(new PointerEvent('pointerenter'));
		await tick();
		trigger?.dispatchEvent(new PointerEvent('pointerleave'));
		await expect.poll(() => document.querySelector('[data-testid="tooltip-content"]')).toBeNull();
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
		expect(content?.inert).toBe(true);
		expect(content?.hasAttribute('aria-hidden')).toBe(false);
		expect(document.activeElement).toBe(trigger);
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

	it('coordinates modal Popover semantics, width and resource cleanup', async () => {
		render(PopoverFixture, { matchWidth: true, modal: true });
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="popover-trigger"]');
		const outside = document.querySelector<HTMLButtonElement>('[data-testid="popover-outside"]');
		trigger?.click();
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="popover-content"]');
		expect(content?.getAttribute('aria-modal')).toBe('true');
		expect(content?.getBoundingClientRect().width).toBe(trigger?.getBoundingClientRect().width);
		expect(outside?.inert || outside?.closest('[inert]') !== null).toBe(true);
		expect(document.body.style.overflow).toBe('hidden');

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await new Promise((resolve) => setTimeout(resolve, 140));
		await tick();
		expect(document.querySelector('[data-testid="popover-content"]')).toBeNull();
		expect(document.body.style.overflow).toBe('');
		expect(outside?.inert || outside?.closest('[inert]') !== null).toBe(false);
		expect(document.activeElement).toBe(trigger);
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
		expect(alphaContent?.inert).toBe(true);
		expect(alphaContent?.hasAttribute('aria-hidden')).toBe(false);
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

	it('covers Accordion close, non-collapsible and root-disabled state machines', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		let component = mount(AccordionFixture, { target });
		await tick();
		target.querySelector<HTMLButtonElement>('[data-testid="accordion-a"]')?.click();
		target.querySelector<HTMLButtonElement>('[data-testid="accordion-x"]')?.click();
		await tick();
		expect(target.querySelector('[data-testid="accordion-output"]')?.textContent).toBe('none:1');
		expect(
			target.querySelector('[data-testid="accordion-multiple-output"]')?.textContent?.trim()
		).toBe('');
		await unmount(component);

		component = mount(AccordionFixture, { props: { collapsible: false }, target });
		const locked = target.querySelector<HTMLButtonElement>('[data-testid="accordion-a"]');
		locked?.click();
		await tick();
		expect(target.querySelector('[data-testid="accordion-output"]')?.textContent).toBe('a:0');
		expect(locked?.getAttribute('aria-disabled')).toBe('true');
		await unmount(component);

		component = mount(AccordionFixture, { props: { disabledRoot: true }, target });
		const disabled = target.querySelector<HTMLButtonElement>('[data-testid="accordion-a"]');
		disabled?.click();
		disabled?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await tick();
		expect(disabled?.disabled).toBe(true);
		expect(disabled?.tabIndex).toBe(-1);
		expect(target.querySelector('[data-testid="accordion-output"]')?.textContent).toBe('a:0');
		await unmount(component);
		target.remove();
	});

	it('lets an established Accordion binding clear externally without reviving its fallback', async () => {
		render(AccordionFixture);
		const charlie = document.querySelector<HTMLButtonElement>('[data-testid="accordion-c"]');
		const clear = document.querySelector<HTMLButtonElement>(
			'[data-testid="accordion-external-clear"]'
		);
		const output = document.querySelector<HTMLOutputElement>('[data-testid="accordion-output"]');

		charlie?.click();
		await tick();
		expect(output?.textContent).toBe('c:1');

		clear?.click();
		await tick();
		expect(charlie?.getAttribute('aria-expanded')).toBe('false');
		expect(output?.textContent).toBe('none:1');
	});

	it('keeps typed Accordion active/expanded identity and restores nearest focus after removal', async () => {
		render(AccordionTabsProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="production-accordion"]');
		const triggers = root?.querySelectorAll<HTMLButtonElement>('button[aria-expanded]');
		const numeric = triggers?.[0];
		const string = triggers?.[1];
		const output = root?.querySelector<HTMLOutputElement>(
			'[data-testid="production-accordion-output"]'
		);
		expect(numeric?.getAttribute('aria-expanded')).toBe('true');
		expect(string?.getAttribute('aria-expanded')).toBe('false');

		string?.focus();
		string?.click();
		await tick();
		expect(output?.textContent?.trim()).toBe('string:1|string:1|1');
		expect(numeric?.getAttribute('aria-expanded')).toBe('false');
		expect(string?.getAttribute('aria-expanded')).toBe('true');

		root?.querySelector<HTMLButtonElement>('[data-testid="remove-accordion-active"]')?.click();
		await tick();
		await Promise.resolve();
		expect(output?.textContent?.trim()).toBe('null|string:last|1');
		expect(document.activeElement?.textContent).toContain('Last');
		const nested = [
			...(root?.querySelectorAll<HTMLButtonElement>('button[aria-expanded]') ?? [])
		].find((button) => button.textContent?.includes('Nested group'));
		nested?.click();
		await tick();
		expect(root?.querySelector('[role="heading"][aria-level="4"]')).not.toBeNull();
	});

	it('moves focus out of Accordion content before a controlled close enters Presence exit', async () => {
		render(AccordionTabsProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="production-accordion"]')!;
		const trigger = root.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')!;
		const input = root.querySelector<HTMLInputElement>('[data-testid="accordion-panel-input"]')!;
		input.focus();
		document.querySelector<HTMLButtonElement>('[data-testid="clear-accordion-value"]')?.click();
		await tick();
		expect(document.activeElement).toBe(trigger);
		const content = root.querySelector<HTMLElement>(
			'[data-state="closed"][data-presence="exiting"]'
		);
		expect(content?.hasAttribute('inert')).toBe(true);
		expect(content?.hasAttribute('aria-hidden')).toBe(false);
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

		await resetForm(form);
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

		pageSeven?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(document.activeElement).toBe(
			navigation?.querySelector<HTMLButtonElement>('[aria-label="Page 8"]')
		);

		const dynamic = document.querySelector<HTMLElement>('[aria-label="Dynamic pagination"]');
		const dynamicCurrent = dynamic?.querySelector<HTMLButtonElement>('[data-page-number="6"]');
		dynamicCurrent?.focus();
		document.querySelector<HTMLButtonElement>('[data-testid="pagination-shrink"]')?.click();
		await tick();
		expect(dynamic?.dataset.page).toBe('2');
		expect(document.querySelector('[data-testid="pagination-focus-output"]')?.textContent).toBe(
			'2:12'
		);
		await expect.poll(() => document.activeElement?.getAttribute('data-page-number')).toBe('2');

		const sized = document.querySelector<HTMLElement>('[aria-label="Sized pagination"]');
		const sizeSelect = sized?.querySelector<HTMLSelectElement>('[data-slot="size-select"]');
		if (sizeSelect) {
			sizeSelect.value = '50';
			sizeSelect.dispatchEvent(new Event('change', { bubbles: true }));
		}
		await tick();
		expect(sized?.dataset.page).toBe('2');
		expect(sized?.dataset.pageSize).toBe('50');
		expect(document.querySelector('[data-testid="pagination-size-output"]')?.textContent).toBe(
			'2:50:1:1'
		);
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

	it('keeps typed Tabs identity and recovers selection/active to the nearest enabled trigger', async () => {
		render(AccordionTabsProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="production-tabs"]');
		const triggers = root?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
		const numeric = triggers?.[0];
		const string = triggers?.[1];
		const output = root?.querySelector<HTMLOutputElement>('[data-testid="production-tabs-output"]');
		expect(output?.textContent?.trim()).toBe('number:1|number:1|0');
		expect(root?.querySelectorAll('[role="tabpanel"]')).toHaveLength(4);

		string?.focus();
		string?.click();
		await tick();
		expect(output?.textContent?.trim()).toBe('string:1|string:1|1');
		expect(numeric?.getAttribute('aria-selected')).toBe('false');
		expect(string?.getAttribute('aria-selected')).toBe('true');

		root?.querySelector<HTMLButtonElement>('[data-testid="remove-tabs-selected"]')?.click();
		await tick();
		await Promise.resolve();
		expect(output?.textContent?.trim()).toBe('string:last|string:last|1');
		expect(document.activeElement?.textContent).toContain('Last');
	});

	it('implements keep-mounted, lazy and active-only Tabs lifecycle policies explicitly', async () => {
		render(AccordionTabsProductionFixture);
		const lazyA = document.querySelector<HTMLButtonElement>('[data-testid="lazy-trigger-a"]')!;
		const lazyB = document.querySelector<HTMLButtonElement>('[data-testid="lazy-trigger-b"]')!;
		expect(document.querySelector('[data-testid="lazy-panel-a"]')).not.toBeNull();
		expect(document.querySelector('[data-testid="lazy-panel-b"]')).toBeNull();
		expect(lazyA.getAttribute('aria-controls')).toBeTruthy();
		expect(lazyB.hasAttribute('aria-controls')).toBe(false);
		document.querySelector<HTMLButtonElement>('[data-testid="lazy-select-b"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="lazy-panel-a"]')?.hasAttribute('hidden')).toBe(
			true
		);
		expect(document.querySelector('[data-testid="lazy-panel-b"]')).not.toBeNull();
		expect(lazyB.getAttribute('aria-controls')).toBeTruthy();

		expect(document.querySelector('[data-testid="active-panel-a"]')).not.toBeNull();
		expect(document.querySelector('[data-testid="active-panel-b"]')).toBeNull();
		const activeA = document.querySelector<HTMLButtonElement>('[data-testid="active-trigger-a"]')!;
		const activeB = document.querySelector<HTMLButtonElement>('[data-testid="active-trigger-b"]')!;
		expect(activeA.getAttribute('aria-controls')).toBeTruthy();
		expect(activeB.hasAttribute('aria-controls')).toBe(false);
		document.querySelector<HTMLInputElement>('[data-testid="active-panel-a"] input')?.focus();
		document.querySelector<HTMLButtonElement>('[data-testid="active-select-b"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="active-panel-a"]')).toBeNull();
		expect(document.querySelector('[data-testid="active-panel-b"]')).not.toBeNull();
		expect(activeA.hasAttribute('aria-controls')).toBe(false);
		expect(activeB.getAttribute('aria-controls')).toBeTruthy();
		expect(document.activeElement).toBe(activeB);
	});

	it('uses RTL logical arrows and ignores IME navigation before manual Tabs activation', async () => {
		render(AccordionTabsProductionFixture);
		const left = document.querySelector<HTMLButtonElement>('[data-testid="rtl-tab-left"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="rtl-tabs-output"]');
		left?.focus();
		left?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, isComposing: true, key: 'ArrowRight' })
		);
		await tick();
		expect(output?.textContent?.trim()).toBe('string:left|string:left');
		left?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(output?.textContent?.trim()).toBe('string:left|string:right');
		(document.activeElement as HTMLElement)?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })
		);
		await tick();
		expect(output?.textContent?.trim()).toBe('string:right|string:right');
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

		await resetForm(form);
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

		await resetForm(form);
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

		await resetForm(form);
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
		render(ZSeparator, { decorative: true });
		expect(document.querySelector('hr[data-orientation="horizontal"]')).not.toBeNull();
		expect(
			document.querySelector('[role="separator"][aria-orientation="vertical"]')
		).not.toBeNull();
		expect(document.querySelector('[role="presentation"][aria-hidden="true"]')).not.toBeNull();

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

		render(ZCode, { ariaLabel: 'embedded-code', code: 'embedded', embedded: true });
		const embedded = document.querySelector<HTMLElement>('[aria-label="embedded-code"]');
		expect(getComputedStyle(embedded as Element).borderWidth).toBe('0px');
		expect(getComputedStyle(embedded as Element).borderRadius).toBe('0px');
	});

	it('keeps only the latest asynchronous ZCode highlight result', async () => {
		render(CodeRaceFixture);
		const root = document.querySelector<HTMLElement>('[aria-label="Racing code"]');
		document.querySelector<HTMLButtonElement>('[data-testid="code-invalid"]')?.click();
		await tick();
		document.querySelector<HTMLButtonElement>('[data-testid="code-valid"]')?.click();
		await expect.poll(() => root?.dataset.highlightStatus, { timeout: 10_000 }).toBe('highlighted');
		expect(root?.textContent).toContain('const recovered = true;');
		expect(root?.textContent).not.toContain('invalid');
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
			['bash', 'echo ready'],
			['css', '.ready { display: block; }'],
			['javascript', 'const ready = true;'],
			['json', '{"ready":true}'],
			['svelte', '<p>{ready}</p>']
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
		expect(getComputedStyle(button as Element).backgroundColor).toBe('rgb(180, 35, 24)');
		expect(getComputedStyle(text as Element).color).toBe('rgb(124, 58, 237)');
		expect(getComputedStyle(text as Element).fontSize).toBe('16px');
		expect(getComputedStyle(stack as Element).gap).toBe('8px');
		expect(getComputedStyle(numericStack as Element).gap).toBe('6px');
		expect(icon?.getAttribute('role')).toBe('img');
		expect(getComputedStyle(icon as Element).width).toBe('20px');
		for (const size of ['small', 'medium', 'large'] as const) {
			const square = document.querySelector<HTMLButtonElement>(
				`[data-testid="button-square-${size}"]`
			);
			const style = getComputedStyle(square as Element);
			expect(square?.dataset.shape).toBe('square');
			expect(style.width).toBe(style.height);
		}
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
			'zh-CN:rtl:dark:high:compact:reduced:test:关闭:Asia/Shanghai:日历:24:default-portal'
		);
		expect(shadow.querySelector('[data-testid="inner-context"]')?.textContent).toBe(
			'zh-CN:rtl:dark:high:compact:reduced:test:关闭:Asia/Shanghai:日历:24:default-portal'
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
		const external = document.querySelector<HTMLInputElement>('[data-testid="external-input"]');
		const externalForm = document.querySelector<HTMLFormElement>(
			'[data-testid="external-input-form"]'
		);
		const externalNextForm = document.querySelector<HTMLFormElement>(
			'[data-testid="external-input-next-form"]'
		);
		const externalReassign = document.querySelector<HTMLButtonElement>(
			'[data-testid="external-input-reassign"]'
		);
		const externalOutput = document.querySelector<HTMLOutputElement>(
			'[data-testid="external-input-output"]'
		);
		const delegated = document.querySelector<HTMLInputElement>('[data-testid="delegated-input"]');
		const delegatedForm = document.querySelector<HTMLFormElement>(
			'[data-testid="delegated-input-form"]'
		);
		const delegatedOutput = document.querySelector<HTMLOutputElement>(
			'[data-testid="delegated-input-output"]'
		);
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
		expect(output?.textContent).toBe('alice:1:0');

		await resetForm(input.form);
		expect(resetEvents).toBe(1);
		expect(input.value).toBe('seed');
		expect(input.dataset.resetCallback).toBe('true');
		expect(output?.textContent).toBe('seed:1:1');

		expect(external?.form).toBe(externalForm);
		expect(
			externalForm?.querySelector<HTMLInputElement>('[data-zui-form-reset-signal]')?.form
		).toBe(externalForm);
		if (external) {
			external.value = 'external-changed';
			external.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		await resetForm(externalForm);
		expect(external?.value).toBe('external-seed');
		expect(externalOutput?.textContent).toBe('external-seed');
		expect([...new FormData(externalForm!).entries()]).toEqual([['external', 'external-seed']]);

		externalReassign?.click();
		await tick();
		await Promise.resolve();
		expect(external?.form).toBe(externalNextForm);
		expect(externalForm?.querySelector('[data-zui-form-reset-signal]')).toBeNull();
		expect(
			externalNextForm?.querySelector<HTMLInputElement>('[data-zui-form-reset-signal]')?.form
		).toBe(externalNextForm);
		if (external) {
			external.value = 'reassigned-change';
			external.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		await resetForm(externalNextForm);
		expect(external?.value).toBe('external-seed');
		expect(externalOutput?.textContent).toBe('external-seed');
		expect([...new FormData(externalNextForm!).entries()]).toEqual([['external', 'external-seed']]);

		const replacementForm = document.createElement('form');
		replacementForm.id = 'external-input-next-form';
		replacementForm.dataset.testid = 'external-input-replacement-form';
		const replacementReset = document.createElement('button');
		replacementReset.type = 'reset';
		replacementReset.textContent = 'Reset replacement';
		replacementForm.append(replacementReset);
		externalNextForm?.replaceWith(replacementForm);
		await new Promise<void>((resolve) => queueMicrotask(() => queueMicrotask(resolve)));
		expect(external?.form).toBe(replacementForm);
		expect(
			replacementForm.querySelector<HTMLInputElement>('[data-zui-form-reset-signal]')?.form
		).toBe(replacementForm);
		if (external) {
			external.value = 'replacement-change';
			external.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		await resetForm(replacementForm);
		expect(external?.value).toBe('external-seed');
		expect(externalOutput?.textContent).toBe('external-seed');
		expect([...new FormData(replacementForm).entries()]).toEqual([['external', 'external-seed']]);

		if (delegated) {
			delegated.value = 'delegated-change';
			delegated.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		await resetForm(delegatedForm);
		expect(delegated?.value).toBe('delegated-seed');
		expect(delegatedOutput?.textContent).toBe('delegated-seed:1');
	});

	it('commits Field reset state through provider-level user interaction', async () => {
		render(FieldFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="field-form"]');
		const input = document.querySelector<HTMLInputElement>('[data-testid="field-input"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="field-output"]');
		const reset = form?.querySelector<HTMLButtonElement>('button[type="reset"]');
		expect(input).not.toBeNull();
		expect(reset).not.toBeNull();
		if (!input || !reset) return;

		await userEvent.fill(input, 'driver-change');
		expect(output?.textContent).toBe('driver-change:1:0');
		await userEvent.click(reset);
		await settleFormReset();
		expect(input.value).toBe('seed');
		expect(output?.textContent).toBe('seed:1:1');
	});
});
