# @zadmin/zui

[![CI](https://github.com/kenconnet666/zadmin/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/kenconnet666/zadmin/actions/workflows/ci.yml)

Production-oriented Svelte 5 components backed by typed ICSS, semantic themes, native HTML, explicit ARIA and keyboard contracts, real form behavior, shared overlay lifecycles, and fixed-size virtualization.

## Install

```sh
pnpm add @zadmin/zui @lucide/svelte svelte
```

`@lucide/svelte` and Svelte 5 are required peers. Install `shiki` only when using the optional `@zadmin/zui/code` syntax-highlighting entrypoint.

## Start with a provider

```svelte
<script lang="ts">
	import { ZButton, ZProvider, ZStack, ZText } from '@zadmin/zui';
	import { auroraLight } from '@zadmin/zui/themes';
</script>

<ZProvider theme={auroraLight} colorScheme="light" locale="zh-CN">
	<ZStack gap="medium">
		<ZText as="h1">Release console</ZText>
		<ZButton>Deploy</ZButton>
	</ZStack>
</ZProvider>
```

`ZProvider` also owns direction, contrast, density, motion, translations, portal boundaries, and the ICSS runtime. Providers can be nested without creating DOM wrappers.

## Public entrypoints

| Entrypoint             | Purpose                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| `@zadmin/zui`          | Components, public runtime helpers, recipes, theme primitives, and public types |
| `@zadmin/zui/themes`   | Six official light, dark, and high-contrast themes                              |
| `@zadmin/zui/code`     | Optional Shiki-backed `ZCode` component                                         |
| `@zadmin/zui/runtime`  | Browser and SSR ICSS runtimes                                                   |
| `@zadmin/zui/compiler` | ICSS Svelte preprocessing                                                       |
| `@zadmin/zui/metadata` | Component documentation metadata                                                |
| `@zadmin/zui/testing`  | Test harnesses and contract assertions; never import into production bundles    |

`internal` is an unstable package-development boundary and is not a compatibility promise.

## Component contracts

- Components render real platform elements and forward applicable native attributes, callbacks, `class`, `style`, and `ref`.
- Stateful controls support explicit controlled and uncontrolled ownership, native `FormData`, and form reset.
- Collection components use stable business keys, disabled-item skipping, roving focus, list navigation, and typeahead where applicable.
- Dialogs, popovers, tooltips, menus, pickers, and tours share portal, positioning, layer ownership, dismissal, focus, inert, and scroll-lock runtimes.
- Direction, locale, contrast, density, and motion are orthogonal provider axes. Reduced motion remains a first-class behavior contract.
- UI icons use static `@lucide/svelte/icons/*` imports. ZUI does not accept arbitrary SVG strings or ship a runtime icon-name registry for the full Lucide set.
- ICSS has a class-only public API. Stable visual decisions belong in semantic Theme tokens; structural and runtime values remain explicit.

Every documented root component has at least two executable examples in `apps/docs`, while compound parts expose their contracts through the root component page and metadata.

## Package and browser support

- Svelte `>=5.56.0 <6`
- Node.js `>=22`
- Modern Chromium, Firefox, WebKit, and WebView2
- SSR, CSP, ShadowRoot, HMR, repository-external tarball installation, and optional-peer boundaries are covered by the repository CI workflow

The package is pre-1.0. Consult each component's exported metadata for its current `stable` or `experimental` status before standardizing an application-wide API.

## Source and license

- Source: <https://github.com/kenconnet666/zadmin/tree/master/ui/zui>
- Documentation app: <https://github.com/kenconnet666/zadmin/tree/master/apps/docs>
- License: MIT
