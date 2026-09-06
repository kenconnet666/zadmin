# ZAppShell execution record — 2026-09-06

## Implemented baseline

`ZAppShell` is an `experimental`, `unreleased` CSS Grid application shell with native header/navbar/aside/main-or-div/footer regions. It owns layout geometry only; routes, navigation selection, mobile menu triggers, persistence, safe-area policy, and application data remain caller-owned.

- `layout='default'` gives header/footer the full shell width. `layout='alternative'` positions them between navbar and aside. Both preserve a single DOM order: header, navbar, main, aside, footer.
- Region sizes are responsive CSS lengths. Missing regions have zero tracks. `navbarCollapsed` and `asideCollapsed` are responsive booleans, so `{ base: true, medium: false }` produces a deterministic mobile/desktop collapse with matching zero track and `display:none` region rule.
- Visible grid tracks are the only region offset model. `mainPadding` is the explicit content inset, avoiding a second family of fixed/offset booleans that would contradict flow-grid layout.
- `scroll='main'` is the default: the bounded root clips and the main region uses a `minmax(0, 1fr)` track to scroll. `scroll='root'` switches the main row to `minmax(max-content, 1fr)` and restores its native auto minimum block size, placing footer after the complete main content inside the bounded root scroll range rather than letting visible content paint over a fixed footer. Neither mode measures content or viewport in JavaScript.
- `mainAs='main'|'div'` prevents nested landmarks in Docs and embedded views. Root `style`, native attributes, ICSS variables, and a bindable `HTMLDivElement` ref remain caller-controlled.
- Theme defaults use dedicated `size.appShellHeaderHeight` (56px), `appShellFooterHeight` (40px), `appShellNavbarWidth` (240px), and `appShellAsideWidth` (240px), rather than control, menu, or switch dimensions. Navbar's default name is owned by `localePack.common.primaryNavigation`.

## Evidence authored for CI

- `ui/zui/tests/app-shell-production.spec.ts` covers SSR native root/regions and uses `render(...).body` for closed-axis failures.
- `ui/zui/tests/app-shell-production.browser.spec.ts` and `AppShellFixture.svelte` cover fixed grid offsets, bounded main scrolling, alternative/root scrolling, responsive base collapse, and RTL DOM order.
- `ui/zui/tests/app-shell-production-types.ts` covers responsive region values, main landmark choice, and collapse typing.
- Docs cover the complete desktop shell, responsive side-region collapse, alternative layout/root scrolling, and RTL. Every demo shell gives its root a bounded height and uses `mainAs='div'`, so it neither creates nested main landmarks nor hides body content by accident.

The Docs-only `AppShellRegion.svelte` recipe gives each rendered region a Theme surface, border, spacing, and bounded side-panel scroll treatment. It does not alter ZAppShell's public API or layout behavior; its purpose is to make the example regions and main-content scrolling relationship visually inspectable.

WebStorm affected-file diagnostics, Prettier, and whitespace checks completed. Real Chrome Docs inspection confirmed all four shells at 390px have 324px viewport/content widths, responsive side regions are hidden, and root-scroll main content ends before its footer. At 1440px the full region layout and RTL direction were also inspected. The desktop demo has a bounded main scroll area with eight activity cards. Test suites, full type checks, builds, and multi-browser stability acceptance remain remote CI work.

## Deliberately deferred

This first shell does not introduce a controlled collapse controller, persisted panel state, a Burger trigger, drag resizing, safe-area insets, a global fixed/overlay mode, or nested scroll ownership. Those require separate owner, focus, mobile-interaction, and platform contracts. The present Grid tracks are complete for flow-layout offset and responsive CSS collapse.

## Integration

Public entrypoints export `ZAppShell`, its props/layout/main-element/scroll/length types and metadata. `appShellApiFacts`, `appShellDoc`, catalog/loaders, API contracts, and source evidence artifacts are integrated. Generated source evidence is not a substitute for executed browser or release acceptance.
