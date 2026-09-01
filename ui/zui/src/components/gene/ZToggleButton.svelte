<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZButtonProps } from './ZButton.svelte';

	type ButtonClickEvent = Parameters<NonNullable<ZButtonProps['onclick']>>[0];

	export type ZToggleButtonProps = Omit<
		ZButtonProps,
		| 'aria-pressed'
		| 'children'
		| 'loading'
		| 'loadingIndicator'
		| 'loadingLabel'
		| 'onclick'
		| 'variant'
	> & {
		readonly children?: Snippet;
		readonly defaultPressed?: boolean;
		readonly onclick?: ZButtonProps['onclick'];
		readonly onPressedChange?: (pressed: boolean) => void;
		pressed?: boolean;
	};

	export const zuiMetadata = {
		category: 'gene',
		id: 'toggle-button',
		importStatement: "import { ZToggleButton } from '@zadmin/zui';",
		name: 'ZToggleButton',
		bindings: [
			{ description: '当前按下状态。', name: 'pressed', type: 'boolean' },
			{ description: '真实button元素引用。', name: 'ref', type: 'HTMLButtonElement | null' }
		],
		dependencies: ['ZButton', 'ControllableState'],
		events: [
			{
				description: '用户操作改变按下状态后调用一次。',
				name: 'onPressedChange',
				type: '(pressed: boolean) => void'
			},
			{
				description: '原生click回调；preventDefault可取消状态转换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [
			{ description: '获得焦点时切换pressed。', key: 'Enter' },
			{ description: '获得焦点时切换pressed。', key: 'Space' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前按下状态；传入或绑定后作为受控状态。',
				name: 'pressed',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控模式的初始按下状态。',
				name: 'defaultPressed',
				type: 'boolean'
			},
			{
				default: "'medium'",
				description: '按钮尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{ default: 'false', description: '扩展到父容器宽度。', name: 'fullWidth', type: 'boolean' },
			{ default: 'false', description: '映射到原生disabled。', name: 'disabled', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实button引用。',
				name: 'ref',
				type: 'HTMLButtonElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: '按钮主体内容。', name: 'children', type: 'Snippet' },
			{ description: '主体内容之前的图标或内容。', name: 'start', type: 'Snippet' },
			{ description: '主体内容之后的图标或内容。', name: 'end', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/gene/ZToggleButton.svelte',
		states: [{ description: '切换状态。', name: 'data-state', values: ['on', 'off'] }],
		status: 'experimental',
		summary: '以原生button和aria-pressed表达的受控或非受控双态操作组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import ZButton from './ZButton.svelte';

	let {
		children,
		defaultPressed = false,
		onclick,
		onPressedChange,
		pressed = $bindable(),
		ref = $bindable(null),
		...rest
	}: ZToggleButtonProps = $props();

	const state = new ControllableState<boolean>({
		defaultValue: () => defaultPressed,
		onChange: () => onPressedChange,
		read: () => pressed,
		write: (next) => (pressed = next)
	});
	const resolvedPressed = $derived(state.current);

	function handleClick(event: ButtonClickEvent): void {
		onclick?.(event);
		if (!event.defaultPrevented) state.setFromUser(!resolvedPressed);
	}
</script>

<ZButton
	{...rest}
	bind:ref
	variant={resolvedPressed ? 'primary' : 'secondary'}
	aria-pressed={resolvedPressed}
	data-state={resolvedPressed ? 'on' : 'off'}
	onclick={handleClick}
>
	{@render children?.()}
</ZButton>
