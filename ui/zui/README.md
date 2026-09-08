# @zadmin/zui

[![CI](https://github.com/kenconnet666/zadmin/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/kenconnet666/zadmin/actions/workflows/ci.yml)

Production-oriented Svelte 5 components backed by typed ICSS, semantic themes, native HTML, explicit ARIA and keyboard contracts, real form behavior, shared overlay lifecycles, and fixed-size virtualization.

## Install

```sh
pnpm add @zadmin/zui '@lucide/svelte@>=1.37.0 <1.42.0' svelte
```

`@lucide/svelte` and Svelte 5 are required peers. Install `shiki` only when using the optional `@zadmin/zui/code` syntax-highlighting entrypoint.

The Lucide peer range currently stops before 1.42.0: that published version imports `@lucide/shared/types` without a published dependency, breaking strict consumer type checks. The workspace uses 1.41.0, whose declarations are self-contained and pass the external consumer gate. Review this boundary when upstream repairs the published declaration dependency. See the [1.42.0 type source](https://github.com/lucide-icons/lucide/blob/1.42.0/packages/svelte/src/types.ts).

## Start with a provider

```svelte
<script lang="ts">
	import { ZButton, ZProvider, ZStack, zhCNLocalePack } from '@zadmin/zui';
	import { auroraLight } from '@zadmin/zui/themes';
</script>

<ZProvider
	theme={auroraLight}
	colorScheme="light"
	locale="zh-CN"
	localePack={zhCNLocalePack}
	timeZone="Asia/Shanghai"
>
	<ZStack gap="medium">
		<h1>Release console</h1>
		<ZButton>Deploy</ZButton>
	</ZStack>
</ZProvider>
```

`ZProvider` also owns direction, contrast, density, motion, typed locale packs, an explicit SSR-stable IANA time zone (UTC by default), portal boundaries, and the ICSS runtime. Providers can be nested without creating DOM wrappers. Translation overrides use `localePack`; the untyped `translations` alias has been removed before release.

### Theme palettes and effects

`withPrimaryPalette(base, name, mode)` selects one of eight primary palettes (`blue`,
`violet`, `teal`, `green`, `amber`, `orange`, `rose`, `slate`). Explicit `light`/`dark`
mode must match the surface; the helper updates primary, hover and foreground colors
and derives subtle colors without replacing semantic status colors. Preserve dedicated
high-contrast presets when resolving accessibility preferences.

```ts
import { auroraLight, withPrimaryPalette } from '@zadmin/zui/themes';

const theme = withPrimaryPalette(auroraLight, 'teal', 'light');
```

`ZCard` exposes `elevation="none|small|medium|large"`, backed by the corresponding
`shadow` tokens. `focusOffset` and `easing` control shared focus geometry and motion
curves. ICSS `_media({ min: 'medium' }, callback)` reads the theme breakpoint;
`backgroundColor.canvas` uses native CSS `Canvas`, while `backgroundColor._canvas`
uses the theme color. Zeroes, percentages and runtime geometry remain explicit values.

### Component defaults

`componentDefaults` is a typed whitelist of component props. Its accepted component keys and property
rules come from the typed `COMPONENT_RULES` source in `runtime/foundation/component-defaults.ts`;
the list is not a fixed number of groups. It currently covers button/action controls, data
display and typography, navigation/layout, form and date controls, collection controls, and
feedback/overlay helpers (including keys such as `button`, `copyButton`, `card`, `dataTable`,
`input`, `pagination`, `tag`, `toolbar`, and `tooltip`). The rule source is the compatibility
boundary: a component key or property not represented there is rejected at runtime.
Family components may intentionally fall back to a related key: for example, `copyButton`,
`menubar`, and `toolbar` fall back to `button` for shared size defaults, while checkbox-group
and range-slider tone resolution can fall back to their base family. `input.size` is consumed
by `ZInput`, `ZInputGroup`, and `ZTextarea` so single-line, composed, and multiline text
controls share the same application default.
Explicit component props always win; nearest Field/InputGroup context remains more local than
a Provider default, followed by Provider density and the component's local fallback. Controlled
values (`open`, `value`, `page`, selection/sort state), callbacks, DOM references, `class`/`style`,
and arbitrary CSS are rejected. `null` clears the whole defaults axis, while a component value
of `null` stops inheritance for that component.

```svelte
<ZProvider
	componentDefaults={{
		button: { size: 'small', variant: 'outline' },
		card: { variant: 'outlined' },
		dataTable: { virtualized: true, overscan: 0 },
		input: { size: 'large' },
		pagination: { mode: 'simple' },
		tag: { size: 'small', tone: 'info' }
	}}
>
	<ZButton>Small outlined button</ZButton>
	<!-- Explicit props override Provider defaults. -->
	<ZButton variant="solid">Primary button</ZButton>
	<ZInput placeholder="Large input" />
</ZProvider>
```

Nested providers merge only the declared whitelist fields. Use `componentDefaults={null}`
to clear all inherited component defaults, or `{ button: null }` to restore only Button's
local defaults. This API does not change native form ownership, disabled/loading/pressed
state, DataTable selection/sort ownership, ARIA relationships, focus behavior, or virtual
window lifecycle.

### Toast queue ownership

Use an explicit `ToastQueue` with `ZToaster`. The queue is caller-owned: `ZToaster` connects
and disconnects its viewport, but never calls `dispose()` on a queue supplied by the caller.
One queue may be connected to one viewport only; a second `ZToaster` is rejected with a
diagnostic that can include the optional `debugName`. Call `queue.dispose()` explicitly when
the code that created an internal queue is released. Queue replacement disconnects the old
queue before connecting the new one and does not dispose either queue.
`dispose()` is terminal and idempotent; after disposal, creating, updating, configuring, or
connecting queue work fails fast, while late task settlements cannot revive records.

```svelte
<script lang="ts">
	import { createToastQueue, ZButton, ZToaster } from '@zadmin/zui';

	const queue = createToastQueue({ debugName: 'release-console' });
</script>

<ZToaster {queue} />
<ZButton onclick={() => queue.push({ title: 'Saved', tone: 'success' })}>Save</ZButton>
```

## Public entrypoints

| Entrypoint             | Purpose                                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@zadmin/zui`          | Components, public runtime helpers, recipes, theme primitives, and public types                                                                                 |
| `@zadmin/zui/themes`   | Official light, dark, and high-contrast theme presets                                                                                                           |
| `@zadmin/zui/theme`    | Theme schema/types, `defineTheme`/`extendTheme`, semantic tones, and palette helpers; use for defining or extending themes                                      |
| `@zadmin/zui/layer`    | Public overlay primitives (`DismissableLayer`, `FloatingPositioner`, `FocusScope`, portal, inert, scroll-lock, and layer-stack helpers) for custom integrations |
| `@zadmin/zui/code`     | Optional Shiki-backed `ZCode` component                                                                                                                         |
| `@zadmin/zui/runtime`  | Browser and SSR ICSS runtimes                                                                                                                                   |
| `@zadmin/zui/compiler` | ICSS Svelte preprocessing                                                                                                                                       |
| `@zadmin/zui/metadata` | Component identity, release, structure, and tooling metadata                                                                                                    |
| `@zadmin/zui/testing`  | Test harnesses and contract assertions; never import into production bundles                                                                                    |

`theme` and `layer` expose only the symbols listed by their current entrypoint files; they are
public integration boundaries, but this pre-1.0 package does not promise compatibility for
unexported runtime modules or `internal`. Component internals remain implementation details.

## Component contracts

- Components render real platform elements and forward applicable native attributes, callbacks, `class`, `style`, and `ref`.
- Stateful controls support explicit controlled and uncontrolled ownership, native `FormData`, and form reset.
- Collection components use stable business keys, disabled-item skipping, roving focus, list navigation, and typeahead where applicable.
- Dialogs, popovers, tooltips, menus, pickers, and tours share portal, positioning, layer ownership, dismissal, focus, inert, and scroll-lock runtimes.
- Direction, locale, contrast, density, and motion are orthogonal provider axes. Reduced motion remains a first-class behavior contract.
- UI icons use static `@lucide/svelte/icons/*` imports. ZUI does not accept arbitrary SVG strings or ship a runtime icon-name registry for the full Lucide set.
- ICSS has a class-only public API. Stable visual decisions belong in semantic Theme tokens; structural and runtime values remain explicit.

Every documented root component has at least two executable examples in `apps/docs`, while compound parts expose their contracts through the root component page and metadata.

## Metadata and release facts

Public `*Props` types are the source of truth for prop names, types, and requiredness. The documentation generator extracts those facts with the TypeScript AST; `apps/docs` owns teaching copy such as summaries, defaults, explanations, examples, and usage guidance. Component metadata also supplies structure and runtime tooling facts. Pre-release deprecated aliases are removed directly, with callers, generated contracts and documentation migrated together.

`since` is either a real package version that has already been published or `unreleased`. Development stages and roadmap milestones are never represented as SemVer history.

```sh
pnpm --filter @zadmin/zui metadata:facts:check
pnpm --filter @zadmin/zui metadata:since:normalize
pnpm --filter @zadmin/docs api:source:check
```

The normalize command only converts versions newer than the current `@zadmin/zui` package version to `unreleased`. The release PR runs `pnpm release:version`: it updates package versions, materializes pending ZUI metadata when that package version changes, and regenerates the API, support and versioned Docs contracts in the same commit. Any failed stage aborts preparation; this command does not publish packages.

For a manual metadata-only operation after the package version has already been updated:

```sh
pnpm --filter @zadmin/zui metadata:since:materialize -- 0.2.0
```

## Package and browser support

- Svelte `>=5.56.0 <6`
- Node.js `>=22`
- Modern Chromium, Firefox, WebKit, and WebView2
- SSR, CSP, ShadowRoot, HMR, repository-external tarball installation, and optional-peer boundaries are covered by the repository CI workflow

The package is pre-1.0. Consult each component's exported metadata for its current `stable` or `experimental` status before standardizing an application-wide API.

Repository development and CI use Node.js 24. The Vitest 5 toolchain requires a supported newer Node release (including Node 22.12+ or Node 24); that development requirement is separate from the published component package's runtime floor.

## Source and license

- Source: <https://github.com/kenconnet666/zadmin/tree/master/ui/zui>
- Documentation app: <https://github.com/kenconnet666/zadmin/tree/master/apps/docs>
- License: MIT
