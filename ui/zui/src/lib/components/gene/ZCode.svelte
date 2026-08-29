<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { LanguageRegistration } from 'shiki/core';
	import type { ZuiComponentMetadata } from '../../component-metadata.js';

	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';

	export type ZCodeLanguage = 'bash' | 'css' | 'javascript' | 'json' | 'svelte' | 'typescript';
	export type ZCodeThemeName = 'github-dark' | 'github-light';

	export interface ZCodeTheme {
		readonly dark: ZCodeThemeName;
		readonly light: ZCodeThemeName;
	}

	export interface ZCodeProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly ariaLabel?: string;
		readonly code: string;
		readonly highlightedLines?: readonly number[];
		readonly inline?: boolean;
		readonly lang?: ZCodeLanguage;
		readonly lineNumbers?: boolean;
		readonly loading?: Snippet;
		readonly theme?: ZCodeTheme;
		readonly wrap?: boolean;
		ref?: HTMLElement | null;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'code',
		importStatement: "import { ZCode } from '@zadmin/zui/code';",
		name: 'ZCode',
		props: [
			{
				default: '必填',
				description: '要展示的纯文本源码。',
				name: 'code',
				required: true,
				type: 'string'
			},
			{ default: '—', description: '允许的Shiki语言。', name: 'lang', type: 'ZCodeLanguage' },
			{
				default: 'github-light / github-dark',
				description: '亮暗Shiki主题。',
				name: 'theme',
				type: 'ZCodeTheme'
			},
			{ default: 'false', description: '渲染为inline code。', name: 'inline', type: 'boolean' },
			{ default: 'false', description: '允许长行换行。', name: 'wrap', type: 'boolean' },
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
		source: 'ui/zui/src/lib/components/gene/ZCode.svelte',
		status: 'experimental',
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
		dark: 'github-dark',
		light: 'github-light'
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
			import('shiki/themes/github-dark.mjs'),
			import('shiki/themes/github-light.mjs')
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
		slots: ['root', 'line', 'lineNumber', 'token'] as const,
		base: {
			line: (s) => s.display.block,
			lineNumber: (s) => {
				s.color._textMuted;
				s.display.inlineBlock;
				s.minWidth.ch(4);
				s.paddingInlineEnd._medium;
				s.textAlign.right;
				s.userSelect.none;
			},
			root: (s) => {
				s.fontFamily._mono;
				s.fontSize._small;
				s.lineHeight._normal;
			},
			token: (s) => {
				s.color.raw('var(--z-code-light, currentColor)');
				s._media('(prefers-color-scheme: dark)', (dark) => {
					dark.color.raw('var(--z-code-dark, var(--z-code-light, currentColor))');
				});
			}
		},
		variants: {
			highlighted: {
				false: {},
				true: { line: (s) => s.boxShadow._codeHighlight }
			},
			inline: {
				false: {
					root: (s) => {
						s.backgroundColor._canvas;
						s.borderColor._border;
						s.borderRadius._medium;
						s.borderStyle.solid;
						s.borderWidth._hairline;
						s.color._text;
						s.display.block;
						s.margin.px(0);
						s.overflowX.auto;
						s.padding._large;
					}
				},
				true: {
					root: (s) => {
						s.backgroundColor._canvas;
						s.borderRadius._small;
						s.color._text;
						s.display.inlineBlock;
						s.paddingBlock._xsmall;
						s.paddingInline._small;
					}
				}
			},
			wrap: {
				false: { root: (s) => s.whiteSpace.pre },
				true: { root: (s) => s.whiteSpace.preWrap }
			}
		},
		defaultVariants: { highlighted: false, inline: false, wrap: false }
	});

	registerSlotRecipeHmr(import.meta, codeRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../component-runtime/root-style.js';
	import { useZui } from '../../component-runtime/zui-context.js';
	import { readIcssCarrier } from '../../runtime/internal.js';

	let {
		ariaLabel,
		class: className,
		code,
		highlightedLines = [],
		inline = false,
		lang,
		lineNumbers = false,
		loading,
		ref = $bindable(null),
		style,
		theme = DEFAULT_THEME,
		wrap = false,
		...rest
	}: ZCodeProps = $props();

	const zui = useZui();
	const classes = $derived(zui.slots(codeRecipe, { highlighted: false, inline, wrap }));
	const highlighted = $derived(new Set(highlightedLines));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	let tokens = $state<HighlightedToken[][]>();
	let status = $state<'failed' | 'highlighted' | 'loading' | 'plain' | 'too-large'>('plain');
	let generation = 0;

	$effect(() => {
		const source = code;
		const language = lang;
		const themes = { dark: theme.dark, light: theme.light };
		const current = ++generation;
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
</script>

{#snippet highlightedContent()}
	{#if tokens}
		{#each tokens as line, index (index)}
			{@const lineClasses = zui.slots(codeRecipe, {
				highlighted: highlighted.has(index + 1),
				inline,
				wrap
			})}
			<span class={lineClasses.line} data-highlighted={highlighted.has(index + 1) || undefined}>
				{#if lineNumbers}<span class={classes.lineNumber} aria-hidden="true">{index + 1}</span>{/if}
				{#each line as token, tokenIndex (`${index}:${tokenIndex}`)}
					<span class={classes.token} style={tokenVariables(token)}>{token.content}</span>
				{/each}
			</span>{#if index < tokens.length - 1}{NEWLINE}{/if}
		{/each}
	{:else}
		{code}
	{/if}
{/snippet}

{#if inline}
	<code
		{...rest}
		bind:this={ref}
		class={[classes.root, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		aria-label={ariaLabel}
		data-highlight-status={status}
	>
		{#if status === 'loading' && loading}{@render loading()}{:else}{@render highlightedContent()}{/if}
	</code>
{:else}
	<pre
		{...rest}
		bind:this={ref}
		class={[classes.root, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		aria-label={ariaLabel}
		data-highlight-status={status}><code>{@render highlightedContent()}</code></pre>
{/if}
