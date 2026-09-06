# ZToggleGroup execution record — 2026-09-06

`ZToggleGroup<TKey>` is an experimental data-mode component with real `button[aria-pressed]` semantics. It directly reuses LogicalCollection, SelectionModel, CollectionNavigation, MountedElements, ControllableState, Button appearance recipes and FormValueBridge.

## Contract

- Both single and multiple selection use readonly key arrays. `items` defines the key domain; `value` and `defaultValue` do not widen that domain. Single mode rejects multiple owner values rather than silently trimming them. Missing items remain owner data.
- `allowEmpty=false` prevents a user from clearing the final selected key; it does not invent a default value. Focus movement does not select. Space/Enter rely on real native button activation. Readonly preserves focus and form values; disabled prevents activation and submission.
- A content-only item snippet cannot replace button/pressed semantics. The group owns selection exactly once; children use ZButton's shared pressed styling rather than separate ToggleButton state.
- Stable Svelte attachments register actual buttons and return real cleanup functions. Parent Toolbar metadata is captured at an effect boundary, avoiding a recursive dependency between the two collections.
- Standalone roving supports direction, loop, selected initial entry, disabled/removal repair and external-focus preservation. An actual containing Toolbar receives individually scoped keys; two groups may reuse the same business keys. A group in a Portal retains local roving even when it inherits a Toolbar context.
- Five sizes, six tones and three Button variants share the established theme. Field and Toolbar size context, componentDefaults.toggleGroup, shared Button defaults and explicit child props retain defined precedence. The new default group never configures business selection.
- Field labels/descriptions, control id and focus owner are integrated. Repeated native FormData entries preserve order; reset restores the initial default array without user-change notifications. Number 1 and string "1" remain distinct in state while native form serialization emits text.

## Evidence

The public-entrypoint fixtures cover standalone selection, form reset, readonly/disabled, five actual heights, cancellation, identity-preserving dynamic focus, and Toolbar/Portal composition. SSR negative cases read the lazy render body. These are authored remote CI contracts, not a claim that the new candidate has completed its stability matrix.

Real Chrome Docs inspection verified all five heights (24/28/32/40/48px), 390px without page overflow, actual RTL, one Toolbar Tab stop across two groups, Arrow focus-only behavior, and Space updating only the editable group. WebStorm affected-file diagnostics and source API generation were used locally; full tests and type checks remain remote.
