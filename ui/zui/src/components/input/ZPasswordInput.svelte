<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZInputProps } from './ZInput.svelte';
	import { defineSlotRecipe } from '../../recipes/slots.js';

	export interface ZPasswordInputToggleContext {
		readonly disabled: boolean;
		readonly readonly: boolean;
		readonly visible: boolean;
	}

	export interface ZPasswordInputProps extends Omit<ZInputProps, 'type'> {
		readonly defaultVisible?: boolean;
		readonly onVisibleChange?: (visible: boolean) => void;
		rootRef?: HTMLDivElement | null;
		readonly toggle?: Snippet<[context: ZPasswordInputToggleContext]>;
		readonly toggleLabel?: (visible: boolean) => string;
		toggleRef?: HTMLButtonElement | null;
		visible?: boolean;
	}

	export const zuiMetadata = {
		bindings: [
			{ name: 'value', type: 'string', description: '由内部唯一ZInput拥有的密码文本。' },
			{ name: 'visible', type: 'boolean', description: '当前是否以原生text类型显示。' },
			{ name: 'ref', type: 'HTMLInputElement | null', description: '真实input引用。' },
			{ name: 'rootRef', type: 'HTMLDivElement | null', description: '组合根引用。' },
			{ name: 'toggleRef', type: 'HTMLButtonElement | null', description: '真实切换button引用。' }
		],
		category: 'input',
		dependencies: [
			'ZInput',
			'ZButton',
			'ZIcon',
			'ControllableState',
			'FieldContext',
			'InputGroupContext'
		],
		events: [
			{
				name: 'onVisibleChange',
				type: '(visible: boolean) => void',
				description: '仅用户切换可见性时调用；外部同步和form reset不通知。'
			}
		],
		id: 'password-input',
		importStatement: "import { ZPasswordInput } from '@zadmin/zui';",
		keyboard: [
			{ key: 'Tab', description: 'input与真实visibility button均进入原生Tab顺序。' },
			{ key: 'Enter / Space', description: '在visibility button上使用原生button激活。' }
		],
		name: 'ZPasswordInput',
		parts: [
			{ name: 'root', description: '无业务值状态的输入与切换按钮布局根。' },
			{ name: 'toggle', description: '真实ZButton可见性控制。' }
		],
		props: [
			{
				name: 'value',
				type: 'string',
				default: 'undefined',
				description: '受控或可绑定密码值。',
				bindable: true
			},
			{
				name: 'defaultValue',
				type: 'string',
				default: "''",
				description: 'ZInput初值与form reset目标。'
			},
			{
				name: 'visible',
				type: 'boolean',
				default: 'undefined',
				description: '受控或可绑定可见状态。',
				bindable: true
			},
			{
				name: 'defaultVisible',
				type: 'boolean',
				default: 'false',
				description: '初始可见状态与form reset目标。'
			},
			{
				name: 'onVisibleChange',
				type: '(visible: boolean) => void',
				default: 'undefined',
				description: '用户可见性请求。'
			},
			{
				name: 'toggleLabel',
				type: '(visible: boolean) => string',
				default: 'localePack.common.showPassword/hidePassword',
				description: '切换button可访问名称。'
			},
			{
				name: 'toggle',
				type: 'Snippet<[ZPasswordInputToggleContext]>',
				default: 'Eye/EyeOff图标',
				description: '替换button内容但保留原生控制。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: '继承InputGroup/Field或false',
				description: '同时禁用input与toggle；Group统一拥有组合透明度。'
			},
			{
				name: 'readonly',
				type: 'boolean',
				default: '继承InputGroup/Field或false',
				description: '阻止文本编辑但仍允许查看/隐藏。'
			},
			{
				name: 'required',
				type: 'boolean',
				default: '继承InputGroup/Field或false',
				description: '转发原生required。'
			},
			{
				name: 'invalid',
				type: 'boolean',
				default: '继承InputGroup/Field或false',
				description: '复用ZInput invalid chrome。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'InputGroup → Field → componentDefaults.passwordInput → input → density',
				description: '输入与toggle共享五档尺寸。'
			},
			{
				name: 'name',
				type: 'string',
				default: '继承Field或undefined',
				description: '转发到唯一原生input。'
			},
			{ name: 'form', type: 'string', default: 'undefined', description: '原生外部form关联。' },
			{
				name: 'resetOnForm',
				type: 'boolean',
				default: 'true',
				description: '是否让内部ZInput恢复defaultValue；visibility始终恢复。'
			},
			{
				name: 'onValueChange',
				type: '(value: string) => void',
				default: 'undefined',
				description: '由内部ZInput报告用户文本输入。'
			},
			{
				name: 'onFormReset',
				type: '() => void',
				default: 'undefined',
				description: 'value/visibility reset完成后调用。'
			},
			{
				name: 'ref',
				type: 'HTMLInputElement | null',
				default: 'null',
				description: '真实input引用。',
				bindable: true
			},
			{
				name: 'rootRef',
				type: 'HTMLDivElement | null',
				default: 'null',
				description: '布局根引用。',
				bindable: true
			},
			{
				name: 'toggleRef',
				type: 'HTMLButtonElement | null',
				default: 'null',
				description: '切换button引用。',
				bindable: true
			}
		],
		since: 'unreleased',
		snippets: [
			{
				name: 'toggle',
				type: 'Snippet<[ZPasswordInputToggleContext]>',
				description: '获得冻结visible/disabled/readonly状态的button内部内容。'
			}
		],
		source: 'ui/zui/src/components/input/ZPasswordInput.svelte',
		states: [
			{
				name: 'data-visible',
				values: ['true', 'false'],
				description: '当前原生input类型可见状态。'
			},
			{
				name: 'data-disabled',
				values: ['true'],
				description: 'InputGroup、Field或显式禁用。'
			},
			{
				name: 'data-readonly',
				values: ['true'],
				description: 'InputGroup、Field或显式只读。'
			},
			{
				name: 'data-invalid',
				values: ['true'],
				description: 'InputGroup、Field或显式无效。'
			},
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '解析后的五档尺寸。'
			}
		],
		status: 'experimental',
		summary:
			'以唯一ZInput保留密码值与原生表单语义，并用独立可控ZButton切换password/text类型；在InputGroup中仍是一个业务control。'
	} as const satisfies ZuiComponentMetadata;

	const recipe = defineSlotRecipe(
		{
			slots: ['root', 'input', 'toggle'] as const,
			base: {
				root: (s) => {
					s.position.relative;
					s.display.flex;
					s.width._full;
					s.minWidth.px(0);
				},
				input: (s) => s.paddingInlineEnd.raw('calc(var(--zui-password-toggle-size) + 0.25rem)'),
				toggle: (s) => {
					s.position.absolute;
					s.insetBlockStart.percent(50);
					s.insetInlineEnd.px(0);
					s.transform.raw('translateY(-50%)');
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { onDestroy, tick } from 'svelte';

	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { getActiveElement } from '../../runtime/layer/dom-realm.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { useZInputGroup } from '../../runtime/form/input-group-context.svelte.js';
	import ZButton from '../gene/ZButton.svelte';
	import ZIcon from '../gene/ZIcon.svelte';
	import { inputGroupCompositeControlRecipe } from './input-control.js';
	import ZInput from './ZInput.svelte';

	let {
		class: className,
		defaultVisible = false,
		disabled = false,
		invalid,
		onFormReset,
		onVisibleChange,
		readonly = false,
		ref = $bindable(null),
		resetOnForm = true,
		rootRef = $bindable(null),
		size,
		toggle,
		toggleLabel,
		toggleRef = $bindable(null),
		visible = $bindable(),
		...inputProps
	}: ZPasswordInputProps = $props();
	const zui = useZui();
	const field = useZField();
	const inputGroup = useZInputGroup();
	const visibility = new ControllableState<boolean>({
		defaultValue: () => validateVisible(defaultVisible, 'defaultVisible'),
		onChange: () => onVisibleChange,
		read: () => visible,
		write: (next) => (visible = next)
	});
	const currentVisible = $derived(validateVisible(visibility.current, 'visible'));
	const resolvedDisabled = $derived(disabled || inputGroup?.disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || inputGroup?.readonly || field?.readonly || false);
	const resolvedInvalid = $derived(invalid ?? inputGroup?.invalid ?? field?.invalid ?? false);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				inputGroup?.size ??
				field?.size ??
				zui.componentDefaults.passwordInput?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const classes = $derived(zui.slots(recipe, {}));
	const inputGroupClass = $derived(
		inputGroup
			? zui.recipe(inputGroupCompositeControlRecipe, { disabled: inputGroup.disabled })
			: undefined
	);
	const metrics = $derived(controlSizeMetrics(zui.theme, resolvedSize));
	const style = $derived(`--zui-password-toggle-size:${metrics.height}`);
	let restoreFrame: number | undefined;
	let restoreGeneration = 0;
	let restoreWindow: Window | undefined;

	function validateVisible(value: boolean, name: string): boolean {
		if (typeof value !== 'boolean') throw new TypeError(`ZPasswordInput ${name} must be boolean.`);
		return value;
	}

	function pointerdown(event: PointerEvent): void {
		const input = ref;
		if (event.button === 0 && input && getActiveElement(input) === input) event.preventDefault();
	}
	function cancelSelectionRestore(): number {
		restoreGeneration += 1;
		if (restoreFrame !== undefined) restoreWindow?.cancelAnimationFrame(restoreFrame);
		restoreFrame = undefined;
		restoreWindow = undefined;
		return restoreGeneration;
	}
	async function toggleVisible(event: MouseEvent): Promise<void> {
		if (event.defaultPrevented || resolvedDisabled) return;
		const generation = cancelSelectionRestore();
		const input = ref;
		const focused = input ? getActiveElement(input) === input : false;
		const start = input?.selectionStart ?? null;
		const end = input?.selectionEnd ?? null;
		const direction = input?.selectionDirection ?? undefined;
		visibility.setFromUser(!currentVisible);
		await tick();
		const inputWindow = input?.ownerDocument.defaultView;
		if (!focused || start === null || end === null || !input?.isConnected || !inputWindow) return;
		restoreWindow = inputWindow;
		restoreFrame = inputWindow.requestAnimationFrame(() => {
			restoreFrame = undefined;
			restoreWindow = undefined;
			if (
				generation !== restoreGeneration ||
				resolvedDisabled ||
				!input.isConnected ||
				getActiveElement(input) !== input
			)
				return;
			input.setSelectionRange(start, end, direction);
		});
	}
	function reset(): void {
		visibility.reset();
		onFormReset?.();
	}
	function label(): string {
		const value =
			toggleLabel?.(currentVisible) ??
			(currentVisible ? zui.localePack.common.hidePassword : zui.localePack.common.showPassword);
		if (typeof value !== 'string' || !value.trim())
			throw new TypeError('ZPasswordInput toggle label must not be empty.');
		return value;
	}
	function context(): ZPasswordInputToggleContext {
		return Object.freeze({
			disabled: resolvedDisabled,
			readonly: resolvedReadonly,
			visible: currentVisible
		});
	}
	onDestroy(() => {
		cancelSelectionRestore();
	});
</script>

<div
	bind:this={rootRef}
	dir={inputProps.dir ?? (inputGroup ? undefined : zui.direction)}
	class={[classes.root, inputGroupClass]}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-size={resolvedSize}
	data-slot="root"
	data-visible={currentVisible ? 'true' : 'false'}
	{style}
>
	<ZInput
		{...inputProps}
		bind:ref
		class={[classes.input, className]}
		{disabled}
		{invalid}
		onFormReset={reset}
		{readonly}
		{resetOnForm}
		size={resolvedSize}
		type={currentVisible ? 'text' : 'password'}
	/>
	<ZButton
		bind:ref={toggleRef}
		aria-label={label()}
		class={classes.toggle}
		data-slot="toggle"
		disabled={resolvedDisabled}
		onclick={toggleVisible}
		onpointerdown={pointerdown}
		shape="square"
		size={resolvedSize}
		tone="neutral"
		variant="ghost"
	>
		{#if toggle}{@render toggle(context())}{:else}<ZIcon
				name={currentVisible ? 'eyeOff' : 'eye'}
				size={resolvedSize}
			/>{/if}
	</ZButton>
</div>
