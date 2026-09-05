<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { LanguageRegistration } from 'shiki/core';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { TypographySize } from './typography.js';

	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';

	export type ZCodeLanguage = 'bash' | 'css' | 'javascript' | 'json' | 'svelte' | 'typescript';
	export type ZCodeCopyStatus = 'copied' | 'failed';
	export type ZCodeScheme = 'dark' | 'light';
	export type ZCodeThemeName = 'github-dark-high-contrast' | 'github-light-high-contrast';

	export interface ZCodeTheme {
		readonly dark: ZCodeThemeName;
		readonly light: ZCodeThemeName;
	}

	export interface ZCodeCopyDetail {
		readonly code: string;
		readonly status: ZCodeCopyStatus;
	}

	export interface ZCodeProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly ariaLabel?: string;
		readonly code: string;
		readonly copiedLabel?: string;
		readonly copyable?: boolean;
		readonly copyFailedLabel?: string;
		readonly copyLabel?: string;
		readonly embedded?: boolean;
		readonly highlightedLines?: readonly number[];
		readonly inline?: boolean;
		readonly lang?: ZCodeLanguage;
		readonly lineNumbers?: boolean;
		readonly loading?: Snippet;
		readonly onCopy?: (detail: ZCodeCopyDetail) => void;
		readonly scheme?: ZCodeScheme;
		readonly size?: TypographySize;
		readonly theme?: ZCodeTheme;
		readonly wrap?: boolean;
		ref?: HTMLElement | null;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'code',
		importStatement: "import { ZCode } from '@zadmin/zui/code';",
		name: 'ZCode',
		bindings: [{ description: '真实code或pre元素引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: ['shiki (optional peer)', 'ZButton', 'ZVisuallyHidden', 'typed locale'],
		events: [
			{
				description: '复制尝试完成后报告安全状态，不暴露Clipboard错误细节。',
				name: 'onCopy',
				type: '(detail: ZCodeCopyDetail) => void'
			}
		],
		keyboard: [],
		parts: [
			{ description: '复制按钮。', name: 'copy-action' },
			{ description: '复制结果polite公告。', name: 'copy-status' }
		],
		props: [
			{
				default: '必填',
				description: '要展示的纯文本源码。',
				name: 'code',
				required: true,
				type: 'string'
			},
			{
				default: 'false',
				description: '为block代码增加保持焦点的复制操作；inline与copyable互斥。',
				name: 'copyable',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.code.copy',
				description: '复制按钮初始可访问名称。',
				name: 'copyLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.code.copied',
				description: '复制成功后的按钮名称与polite公告。',
				name: 'copiedLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.code.copyFailed',
				description: '复制失败后的安全按钮名称与polite公告。',
				name: 'copyFailedLabel',
				type: 'string'
			},
			{ default: '—', description: '允许的Shiki语言。', name: 'lang', type: 'ZCodeLanguage' },
			{
				default: 'github-light-high-contrast / github-dark-high-contrast',
				description: '通过WCAG代码token审计的亮暗Shiki高对比主题。',
				name: 'theme',
				type: 'ZCodeTheme'
			},
			{
				default: "继承Provider或'light'",
				description: '覆盖Provider的代码背景与Shiki token配色，不跟随系统偏好猜测。',
				name: 'scheme',
				type: "'light' | 'dark'"
			},
			{
				default: 'false',
				description: '移除外层边框和圆角，用于嵌入已有容器。',
				name: 'embedded',
				type: 'boolean'
			},
			{ default: 'false', description: '渲染为inline code。', name: 'inline', type: 'boolean' },
			{
				default: 'inline时small，否则medium',
				description:
					'代码字号Theme token；显式值覆盖inline与block默认字号，不改变源码文本或换行规则。',
				name: 'size',
				type: "keyof ZuiTheme['fontSize']"
			},
			{
				default: 'false',
				description: '允许长行及无空格长 token 换行，保留源文本和显式换行。',
				name: 'wrap',
				type: 'boolean'
			},
			{ default: 'false', description: '显示行号。', name: 'lineNumbers', type: 'boolean' },
			{
				default: '[]',
				description: '需要强调的1-based行号。',
				name: 'highlightedLines',
				type: 'readonly number[]'
			},
			{ default: '—', description: '代码区域可访问名称。', name: 'ariaLabel', type: 'string' },
			{
				bindable: true,
				default: 'null',
				description: '真实code或pre引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		since: '0.1.0',
		snippets: [{ description: '异步高亮期间的可选占位内容。', name: 'loading', type: 'Snippet' }],
		source: 'ui/zui/src/components/gene/ZCode.svelte',
		states: [
			{
				description: '解析后的Theme字号；inline默认small，block默认medium。',
				name: 'data-size',
				values: ['small', 'medium', 'large', 'xlarge', 'xxlarge']
			},
			{
				description: '当前代码表面的明暗模式。',
				name: 'data-color-scheme',
				values: ['light', 'dark']
			},
			{
				description: '语法高亮的异步生命周期状态。',
				name: 'data-highlight-status',
				values: ['plain', 'loading', 'highlighted', 'failed', 'too-large']
			},
			{
				description: '最近一次复制尝试状态。',
				name: 'data-copy-state',
				values: ['copied', 'failed']
			}
		],
		status: 'stable',
		summary: 'SSR安全的代码展示组件，按需使用Shiki进行客户端语法高亮。'
	} as const satisfies ZuiComponentMetadata;

	interface TokenStyle {
		readonly color?: string;
	}

	interface HighlightedToken {
		readonly content: string;
		readonly variants: Readonly<Record<string, TokenStyle>>;
	}

	const DEFAULT_THEME: ZCodeTheme = Object.freeze({
		dark: 'github-dark-high-contrast',
		light: 'github-light-high-contrast'
	});
	const MAX_HIGHLIGHT_CHARACTERS = 100_000;
	const NEWLINE = '\n';
	const LANGUAGE_LOADERS = {
		bash: () => import('shiki/langs/bash.mjs'),
		css: () => import('shiki/langs/css.mjs'),
		javascript: () => import('shiki/langs/javascript.mjs'),
		json: () => import('shiki/langs/json.mjs'),
		svelte: () => import('shiki/langs/svelte.mjs'),
		typescript: () => import('shiki/langs/typescript.mjs')
	} as const satisfies Record<ZCodeLanguage, () => Promise<{ default: LanguageRegistration[] }>>;
	const loadedLanguages: Partial<Record<ZCodeLanguage, true>> = {};
	const languageLoads: Partial<Record<ZCodeLanguage, Promise<void>>> = {};
	let highlighter: Promise<
		Awaited<ReturnType<(typeof import('shiki/core'))['createHighlighterCore']>>
	> | null = null;

	function loadHighlighter() {
		highlighter ??= Promise.all([
			import('shiki/core'),
			import('shiki/engine/javascript'),
			import('shiki/themes/github-dark-high-contrast.mjs'),
			import('shiki/themes/github-light-high-contrast.mjs')
		]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }, dark, light]) =>
			createHighlighterCore({
				engine: createJavaScriptRegexEngine(),
				langs: [],
				themes: [light.default, dark.default]
			})
		);
		return highlighter;
	}

	async function highlightCode(
		code: string,
		lang: ZCodeLanguage,
		theme: ZCodeTheme
	): Promise<HighlightedToken[][]> {
		const instance = await loadHighlighter();
		if (!loadedLanguages[lang]) {
			let loading = languageLoads[lang];
			if (loading === undefined) {
				loading = LANGUAGE_LOADERS[lang]().then(async ({ default: registration }) => {
					await instance.loadLanguage(...registration);
					loadedLanguages[lang] = true;
				});
				languageLoads[lang] = loading;
			}
			await loading;
		}
		return instance.codeToTokensWithThemes(code, {
			lang,
			themes: { dark: theme.dark, light: theme.light }
		}) as HighlightedToken[][];
	}

	const codeRecipe = defineSlotRecipe({
		slots: ['root', 'line', 'lineNumber', 'token', 'container', 'copyButton'] as const,
		base: {
			container: (s) => {
				s.minWidth.px(0);
				s.position.relative;
			},
			copyButton: (s) => {
				s.insetBlockStart._small;
				s.insetInlineEnd._small;
				s.position.absolute;
			},
			// Preserve explicit source newlines without adding block-generated line breaks.
			line: () => undefined,
			lineNumber: (s) => {
				s.display.inlineBlock;
				s.minWidth.ch(4);
				s.paddingInlineEnd._medium;
				s.textAlign.end;
				s.userSelect.none;
			},
			root: (s) => {
				s.boxSizing.borderBox;
				s.maxWidth.percent(100);
				s.fontFamily._mono;
				s.lineHeight._normal;
				s._selector('& ::selection', (selection) => {
					selection.backgroundColor._codeSelection;
					selection.color._codeText;
				});
			},
			token: () => undefined
		},
		variants: {
			highlighted: {
				false: {},
				true: { line: (s) => s.boxShadow._codeHighlight }
			},
			inline: {
				false: {
					root: (s) => {
						s.borderRadius._medium;
						s.borderStyle.solid;
						s.borderWidth._hairline;
						s.display.block;
						s.fontSize._medium;
						s.margin.px(0);
						s.overflowX.auto;
						s.padding._large;
					}
				},
				true: {
					root: (s) => {
						s.borderRadius._small;
						s.display.inlineBlock;
						s.fontSize._small;
						s.overflowX.auto;
						s.paddingBlock._xsmall;
						s.paddingInline._small;
					}
				}
			},
			size: {
				large: { root: (s) => s.fontSize._large },
				medium: { root: (s) => s.fontSize._medium },
				small: { root: (s) => s.fontSize._small },
				xlarge: { root: (s) => s.fontSize._xlarge },
				xxlarge: { root: (s) => s.fontSize._xxlarge }
			},
			scheme: {
				dark: {
					lineNumber: (s) => s.color._codeMuted,
					root: (s) => {
						s.backgroundColor._codeBackground;
						s.borderColor._codeBorder;
						s.color._codeText;
					},
					token: (s) => s.color.raw('var(--z-code-dark, var(--z-code-light, currentColor))')
				},
				light: {
					lineNumber: (s) => s.color._textMuted,
					root: (s) => {
						s.backgroundColor._canvas;
						s.borderColor._border;
						s.color._text;
					},
					token: (s) => s.color.raw('var(--z-code-light, currentColor)')
				}
			},
			wrap: {
				false: { root: (s) => s.whiteSpace.pre },
				true: {
					root: (s) => {
						s.whiteSpace.preWrap;
						s.overflowWrap.anywhere;
					}
				}
			},
			embedded: {
				false: {},
				true: {
					root: (s) => {
						s.borderRadius.px(0);
						s.borderWidth.px(0);
					}
				}
			},
			copyable: {
				false: {},
				true: { root: (s) => s.paddingInlineEnd.rem(3.5) }
			}
		},
		defaultVariants: {
			copyable: false,
			embedded: false,
			highlighted: false,
			inline: false,
			scheme: 'light',
			wrap: false
		}
	});

	registerSlotRecipeHmr(import.meta, codeRecipe);
</script>

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { onDestroy, untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import ZButton from './ZButton.svelte';
	import ZVisuallyHidden from './ZVisuallyHidden.svelte';

	let {
		ariaLabel,
		class: className,
		code,
		copiedLabel,
		copyable = false,
		copyFailedLabel,
		copyLabel,
		embedded = false,
		highlightedLines = [],
		inline = false,
		lang,
		lineNumbers = false,
		loading,
		onCopy,
		ref = $bindable(null),
		scheme,
		size,
		style,
		theme = DEFAULT_THEME,
		wrap = false,
		...rest
	}: ZCodeProps = $props();

	const zui = useZui();
	const resolvedCopyLabel = $derived(copyLabel ?? zui.localePack.code.copy);
	const resolvedCopiedLabel = $derived(copiedLabel ?? zui.localePack.code.copied);
	const resolvedCopyFailedLabel = $derived(copyFailedLabel ?? zui.localePack.code.copyFailed);
	const resolvedScheme = $derived(scheme ?? zui.colorScheme);
	const resolvedSize = $derived(size ?? (inline ? 'small' : 'medium'));
	const classes = $derived(
		zui.slots(codeRecipe, {
			copyable,
			embedded,
			highlighted: false,
			inline,
			scheme: resolvedScheme,
			size: resolvedSize,
			wrap
		})
	);
	const highlighted = $derived(new Set(highlightedLines));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	let tokens = $state<HighlightedToken[][]>();
	let status = $state<'failed' | 'highlighted' | 'loading' | 'plain' | 'too-large'>('plain');
	let copyStatus = $state<ZCodeCopyStatus | 'idle'>('idle');
	let copyGeneration = 0;
	let copyTimer: number | undefined;
	let copyTimerWindow: Window | undefined;
	let generation = 0;
	const copyActionLabel = $derived.by(() => {
		switch (copyStatus) {
			case 'copied':
				return resolvedCopiedLabel;
			case 'failed':
				return resolvedCopyFailedLabel;
			case 'idle':
				return resolvedCopyLabel;
		}
	});
	const copyAnnouncement = $derived(copyStatus === 'idle' ? '' : copyActionLabel);

	function assertCopyContract(): void {
		if (inline && copyable)
			throw new TypeError('ZCode inline and copyable are mutually exclusive.');
	}

	assertCopyContract();
	$effect(assertCopyContract);

	$effect(() => {
		const source = code;
		const language = lang;
		const themes = { dark: theme.dark, light: theme.light };
		const current = ++generation;
		untrack(() => {
			copyGeneration += 1;
			clearCopyTimer();
			copyStatus = 'idle';
		});
		tokens = undefined;
		if (language === undefined) {
			status = 'plain';
			return;
		}
		if (source.length > MAX_HIGHLIGHT_CHARACTERS) {
			status = 'too-large';
			return;
		}
		status = 'loading';
		void highlightCode(source, language, themes)
			.then((result) => {
				if (generation !== current) return;
				tokens = result;
				status = 'highlighted';
			})
			.catch(() => {
				if (generation === current) status = 'failed';
			});
		return () => {
			generation += 1;
		};
	});

	function tokenVariables(token: HighlightedToken): string | undefined {
		const light = token.variants.light?.color;
		const dark = token.variants.dark?.color;
		const values = [
			light ? `--z-code-light:${light}` : undefined,
			dark ? `--z-code-dark:${dark}` : undefined
		].filter(Boolean);
		return values.length === 0 ? undefined : values.join(';');
	}

	function clearCopyTimer(): void {
		if (copyTimer !== undefined) copyTimerWindow?.clearTimeout(copyTimer);
		copyTimer = undefined;
		copyTimerWindow = undefined;
	}

	async function copyCode(): Promise<void> {
		clearCopyTimer();
		const source = code;
		const current = (copyGeneration += 1);
		const ownerWindow = ref?.ownerDocument.defaultView ?? undefined;
		let result: ZCodeCopyStatus;
		try {
			const clipboard = ownerWindow?.navigator.clipboard;
			if (!clipboard?.writeText) throw new Error('Clipboard unavailable.');
			await clipboard.writeText(source);
			result = 'copied';
		} catch {
			result = 'failed';
		}
		if (current !== copyGeneration) return;
		copyStatus = result;
		onCopy?.({ code: source, status: result });
		if (!ownerWindow) return;
		copyTimerWindow = ownerWindow;
		copyTimer = ownerWindow.setTimeout(() => {
			if (current !== copyGeneration) return;
			copyTimer = undefined;
			copyTimerWindow = undefined;
			copyStatus = 'idle';
		}, 1500);
	}

	onDestroy(() => {
		copyGeneration += 1;
		clearCopyTimer();
	});
</script>

{#snippet highlightedContent()}
	{#if tokens}
		{#each tokens as line, index (index)}
			{@const lineClasses = zui.slots(codeRecipe, {
				copyable,
				embedded,
				highlighted: highlighted.has(index + 1),
				inline,
				scheme: resolvedScheme,
				size: resolvedSize,
				wrap
			})}
			<span class={lineClasses.line} data-highlighted={highlighted.has(index + 1) || undefined}
				>{#if lineNumbers}<span class={classes.lineNumber} aria-hidden="true">{index + 1}</span
					>{/if}{#each line as token, tokenIndex (`${index}:${tokenIndex}`)}<span
						class={classes.token}
						style={tokenVariables(token)}>{token.content}</span
					>{/each}</span
			>{#if index < tokens.length - 1}{NEWLINE}{/if}
		{/each}
	{:else}
		{code}
	{/if}
{/snippet}

{#snippet blockContent()}
	<pre
		{...rest}
		bind:this={ref}
		class={[classes.root, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		aria-label={ariaLabel}
		data-color-scheme={resolvedScheme}
		data-size={resolvedSize}
		data-copy-state={copyStatus === 'idle' ? undefined : copyStatus}
		data-highlight-status={status}><code>{@render highlightedContent()}</code></pre>
{/snippet}

{#if inline}
	<code
		{...rest}
		bind:this={ref}
		class={[classes.root, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		aria-label={ariaLabel}
		data-color-scheme={resolvedScheme}
		data-size={resolvedSize}
		data-highlight-status={status}
		>{#if status === 'loading' && loading}{@render loading()}{:else}{@render highlightedContent()}{/if}</code
	>
{:else if copyable}
	<div class={classes.container} data-slot="copy-container">
		{@render blockContent()}
		<ZButton
			aria-label={copyActionLabel}
			class={classes.copyButton}
			data-slot="copy-action"
			shape="square"
			size="small"
			title={copyActionLabel}
			variant="ghost"
			onclick={() => void copyCode()}
		>
			{#if copyStatus === 'copied'}
				<Check aria-hidden="true" size={15} />
			{:else if copyStatus === 'failed'}
				<TriangleAlert aria-hidden="true" size={15} />
			{:else}
				<Copy aria-hidden="true" size={15} />
			{/if}
		</ZButton>
		<ZVisuallyHidden aria-atomic="true" aria-live="polite" data-slot="copy-status">
			{copyAnnouncement}
		</ZVisuallyHidden>
	</div>
{:else}
	{@render blockContent()}
{/if}
