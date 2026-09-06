<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZButtonProps } from './ZButton.svelte';
	import type { ClipboardSnapshot } from '../../runtime/clipboard.svelte.js';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineSlotRecipe } from '../../recipes/slots.js';
	export interface ZCopyButtonProps extends Omit<
		ZButtonProps,
		'children' | 'start' | 'loading' | 'loadingLabel' | 'value' | 'type'
	> {
		readonly value: string;
		readonly label?: string;
		readonly copiedLabel?: string;
		readonly copyingLabel?: string;
		readonly errorLabel?: string;
		readonly successMessage?: string;
		readonly errorMessage?: string;
		readonly timeout?: number;
		readonly iconOnly?: boolean;
		readonly icon?: Snippet<[snapshot: ClipboardSnapshot]>;
		readonly children?: Snippet<[snapshot: ClipboardSnapshot]>;
		readonly onCopy?: (value: string) => void;
		readonly onCopyError?: (error: unknown) => void;
	}
	export const zuiMetadata = {
		id: 'copy-button',
		name: 'ZCopyButton',
		category: 'gene',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/gene/ZCopyButton.svelte',
		importStatement: "import { ZCopyButton } from '@zadmin/zui';",
		summary: '复用Button和ClipboardController提供真实复制、成功/失败反馈与一致的异步生命周期。',
		dependencies: [
			'ZButton',
			'ZVisuallyHidden',
			'ClipboardController',
			'native Clipboard.writeText'
		],
		props: [
			{
				name: 'value',
				type: 'string',
				required: true,
				default: '必填',
				description: '按原文写入剪贴板的字符串，不读取剪贴板。'
			},
			{
				name: 'label',
				type: 'string',
				default: 'localePack.common.copy',
				description: '空闲状态的可见和可访问名称。'
			},
			{
				name: 'copiedLabel',
				type: 'string',
				default: 'localePack.common.copied',
				description: '成功后的简短标签。'
			},
			{
				name: 'copyingLabel',
				type: 'string',
				default: 'localePack.common.copying',
				description: '正在写入时的标签。'
			},
			{
				name: 'errorLabel',
				type: 'string',
				default: 'localePack.common.copyFailed',
				description: '失败后的简短标签。'
			},
			{
				name: 'successMessage',
				type: 'string',
				default: 'copiedLabel',
				description: '成功时的完整live提示及默认title；可为具体业务内容命名。'
			},
			{
				name: 'errorMessage',
				type: 'string',
				default: 'errorLabel',
				description: '失败时的完整live提示及默认title。'
			},
			{
				name: 'timeout',
				type: 'number',
				default: '2000',
				description: '反馈保留毫秒，0表示保留至reset或value变化；业务反馈时间不使用动画duration。'
			},
			{
				name: 'iconOnly',
				type: 'boolean',
				default: 'false',
				description: '仅显示状态图标，仍使用完整可访问名称。'
			}
		],
		bindings: [{ name: 'ref', type: 'HTMLButtonElement | null', description: '真实Button引用。' }],
		events: [
			{
				name: 'onCopy',
				type: '(value: string) => void',
				description: '当前有效请求真正写入成功后调用；迟到请求与reset后结果不通知。'
			},
			{
				name: 'onCopyError',
				type: '(error: unknown) => void',
				description: '当前有效请求失败后调用，不伪造copied。'
			}
		],
		snippets: [
			{
				name: 'children',
				type: 'Snippet<[ClipboardSnapshot]>',
				description: '替换默认标签，取得只读状态；Button仍拥有交互。'
			},
			{
				name: 'icon',
				type: 'Snippet<[ClipboardSnapshot]>',
				description: '替换状态图标。默认复制/成功/失败使用现有Lucide图标。'
			}
		],
		parts: [
			{ name: 'label', description: '为各反馈标签预留一致宽度的文本区。' },
			{ name: 'copy-icon', description: '默认状态图标。' },
			{ name: 'copy-status', description: '唯一polite状态公告。' }
		],
		states: [
			{
				name: 'data-copy-state',
				values: ['idle', 'copying', 'copied', 'failed'],
				description: '真实写入与反馈状态，UI不反向控制此状态。'
			}
		],
		keyboard: [
			{ key: 'Enter / Space', description: '遵循原生Button激活；调用方取消click后不写入。' }
		]
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineSlotRecipe(
		{
			slots: ['label', 'reserve'] as const,
			base: {
				label: (s) => {
					s.display.grid;
					s._selector('& > span', (s) => s.gridArea.raw('1 / 1'));
					s.textAlign.center;
				},
				reserve: (s) => s.visibility.hidden
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import CopyStatusIcon from './CopyStatusIcon.svelte';
	import ZButton from './ZButton.svelte';
	import ZVisuallyHidden from './ZVisuallyHidden.svelte';
	import {
		ClipboardController,
		DEFAULT_CLIPBOARD_TIMEOUT
	} from '../../runtime/clipboard.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	let {
		value,
		label,
		copiedLabel,
		copyingLabel,
		errorLabel,
		successMessage,
		errorMessage,
		timeout = DEFAULT_CLIPBOARD_TIMEOUT,
		iconOnly = false,
		icon,
		children,
		onCopy,
		onCopyError,
		onclick,
		disabled = false,
		ref = $bindable(null),
		tone,
		size,
		variant,
		shape,
		...rest
	}: ZCopyButtonProps = $props();
	const zui = useZui();
	const resolvedSize = $derived(
		resolveControlSize(
			size ?? zui.componentDefaults.copyButton?.size ?? zui.componentDefaults.button?.size,
			zui.density
		)
	);
	const clipboard = new ClipboardController({ getWindow: () => ref?.ownerDocument.defaultView });
	const snapshot = $derived(clipboard.snapshot);
	const labels = $derived({
		idle: label ?? zui.localePack.common.copy,
		copying: copyingLabel ?? zui.localePack.common.copying,
		copied: copiedLabel ?? zui.localePack.common.copied,
		failed: errorLabel ?? zui.localePack.common.copyFailed
	});
	const actionLabel = $derived(labels[snapshot.status]);
	const announcement = $derived(
		snapshot.status === 'copied'
			? (successMessage ?? labels.copied)
			: snapshot.status === 'failed'
				? (errorMessage ?? labels.failed)
				: ''
	);
	const classes = $derived(zui.slots(recipe));
	$effect(() => {
		value;
		untrack(() => clipboard.reset());
	});
	onDestroy(() => clipboard.destroy());
	export async function copy(): Promise<boolean> {
		if (disabled || ref?.matches(':disabled') || clipboard.pending) return false;
		const result = await clipboard.copy(value, timeout);
		if (result.status === 'copied') {
			onCopy?.(result.value);
			return true;
		}
		if (result.status === 'failed') onCopyError?.(result.error);
		return false;
	}
	export function reset(): void {
		clipboard.reset();
	}
</script>

{#snippet copyIcon()}
	{#if icon}{@render icon(snapshot)}
	{:else}<CopyStatusIcon status={snapshot.status} size={resolvedSize} />{/if}
{/snippet}
<ZButton
	{...rest}
	bind:ref
	type="button"
	{disabled}
	aria-disabled={clipboard.pending || rest['aria-disabled']}
	aria-busy={clipboard.pending || rest['aria-busy']}
	aria-label={rest['aria-label'] ?? actionLabel}
	title={rest.title ?? (announcement || actionLabel)}
	data-copy-state={snapshot.status}
	size={resolvedSize}
	variant={variant ?? zui.componentDefaults.copyButton?.variant}
	shape={shape ?? (iconOnly ? 'square' : zui.componentDefaults.copyButton?.shape)}
	tone={tone ??
		(snapshot.status === 'copied'
			? 'success'
			: snapshot.status === 'failed'
				? 'danger'
				: (zui.componentDefaults.copyButton?.tone ?? 'neutral'))}
	start={iconOnly ? undefined : copyIcon}
	onclick={(event) => {
		onclick?.(event);
		if (!event.defaultPrevented) void copy();
	}}
>
	{#if iconOnly}{@render copyIcon()}
	{:else if children}{@render children(snapshot)}
	{:else}<span class={classes.label} data-slot="label">
			{#each Object.values(labels) as reserved, index (index)}<span
					class={classes.reserve}
					aria-hidden="true">{reserved}</span
				>{/each}
			<span>{actionLabel}</span>
		</span>{/if}
</ZButton>
<ZVisuallyHidden aria-live="polite" aria-atomic="true" data-slot="copy-status"
	>{announcement}</ZVisuallyHidden
>
