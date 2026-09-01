# ZUI Browser Test Isolation

## Failure mode

`vitest-browser-svelte.cleanup()` owns only components created through
`vitest-browser-svelte.render()`. It does not know about Svelte instances created by importing
`mount()` directly from `svelte`.

Most direct-mount tests explicitly called `unmount()` and removed their host at the end of the happy
path. If an assertion, awaited browser operation, or spy expectation failed first, that tail cleanup was
skipped. The surviving component could retain:

- document/window event listeners;
- portal nodes;
- FocusScope or DismissableLayer registrations;
- scroll locks and inert state;
- owner-realm timers, observers, and media-query subscriptions;
- iframe, ShadowRoot, or custom host DOM.

This explains why a global render cleanup existed while Drawer and other imperative browser specs could
still contaminate the next test. The same failure path also skipped local `mockRestore()` calls.

## Ownership model

`tests/browser-lifecycle.ts` is now the only allowed source of imperative `mount` and `unmount` in
browser specs. It records every live Svelte instance in module scope:

- explicit tracked `unmount()` removes the instance from the registry;
- global `afterEach` unmounts every remaining instance in reverse creation order;
- all instances are attempted even if one unmount throws;
- an aggregate cleanup failure is reported after the remaining resources have been released.

`tests/browser.setup.ts` snapshots body children and root/body attributes before each test. After each
test it:

1. unmounts tracked direct Svelte instances;
2. invokes `vitest-browser-svelte.cleanup()` for render-owned components;
3. removes body children added after the snapshot, including abandoned hosts and iframes;
4. restores body and document-element attributes such as style, dir, and theme state;
5. restores all Vitest spies/mocks.

Component unmount runs before DOM removal so component lifecycle code still has access to its owner
Document and Window while releasing portals, timers, focus, scroll, and observers.

## Static enforcement

`scripts/check-browser-lifecycle.mjs` fails when a browser spec:

- imports `mount` or `unmount` directly from `svelte`;
- calls imperative mount/unmount without importing the tracked adapter;
- removes one of the required global cleanup stages.

The script is intentionally read-only and fast. It can run before expensive browser projects and does
not replace real multi-browser validation.
