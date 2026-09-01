# ZUI Form Field Graph Architecture

Status: implemented baseline for R3, 2026-09-02

## Decision

ZForm keeps the browser as the value owner. Native controls and `FormValueBridge` produce
`FormData`; Standard Schema validates the object derived from that data. The field graph owns only
field identity, registration, dependency edges, messages and interaction state. It does not copy
Ant Design's private value store or rules DSL.

| Concern                                             | Owner                            |
| --------------------------------------------------- | -------------------------------- |
| Current control value and successful-control rules  | Native control / FormValueBridge |
| Submitted payload                                   | Native `FormData`                |
| Typed validated output                              | Standard Schema                  |
| Field identity                                      | Typed `FieldPath`                |
| Mounted instances and DOM order                     | `FormRegistry`                   |
| dirty, touched, validating, error, warning, success | `FormRegistry` path state        |
| Server errors and imperative navigation             | `ZFormController`                |

## Identity contract

- `FieldPath` is a non-empty `readonly (string | number)[]`; numeric segments are non-negative safe
  integers so array identity cannot drift through string coercion.
- Internal keys encode both segment value and type. `['1']` and `[1]` are different fields.
- Public error keys and default HTML names use a stable readable spelling: `users[0].email`.
  Punctuation-bearing scalar names are quoted (`["users[0].email"]`), so they cannot collide with a
  segmented path.
- A mounted Svelte field instance has an independent internal instance ID. Multiple instances may
  share one FieldPath and HTML name, which supports native repeated checkbox values without
  duplicate-registration errors.
- An explicit `htmlName` may differ from FieldPath. One HTML name cannot represent two different
  paths because native FormData could not recover that distinction.

## Validation and dependency contract

- Submit validates the complete native payload and maps every Standard Schema issue path, not only
  its first segment.
- Change and blur identify the changed field plus the transitive reverse-dependency closure. Standard
  Schema still parses the complete payload, but only those field states are replaced. This is the
  smallest adapter that preserves Standard Schema as the single validation boundary.
- Each affected path receives its own monotonically increasing race token. An old async result may
  still update unaffected paths, but can never overwrite a newer result for the same path.
- Reset and unmount invalidate outstanding tokens. Reset also clears dirty, touched, validating and
  all message states while leaving native controls responsible for their own default values.
- Schema exceptions use `localePack.form.unexpectedValidation`; `validationMessages.unexpected`
  remains the explicit instance override.

## Focus, scroll and realm contract

`focusField`, `scrollToField` and submit failure resolve the current mounted nodes at call time.
Candidates are sorted by live DOM order inside their owner document, with registration order only as
a deterministic fallback across disconnected documents. Focus selection prefers the real visible
input, textarea, select, button or tabbable descendant. The implementation does not use global
`Node` constants and therefore remains safe in iframe, ShadowRoot and WebView realms.

## Mature-library comparison and deliberate omissions

- [Ant Design Form](https://ant.design/components/form/) informed tuple NamePath, dependencies,
  per-field status and focus/scroll controller operations. ZUI does not adopt its form-owned value
  domain, rules DSL, normalization hooks or React-specific render subscriptions.
- [Naive UI Form](https://github.com/tusen-ai/naive-ui/tree/main/src/form) informed explicit field
  paths, partial validation and imperative validation restoration. ZUI keeps Standard Schema rather
  than adding a second rules format.
- [MUI FormControl](https://mui.com/material-ui/api/form-control/) informed consistent inheritance of
  disabled, required, error and size through field context. ZUI keeps semantic snippets and stable
  ARIA IDs instead of `slotProps`, `sx` or owner-state styling.
- [React Hook Form](https://github.com/react-hook-form/react-hook-form) informed typed field paths,
  field arrays, field-level async state, server `setError` and focus APIs. ZUI does not add a hook
  runtime, proxy form state or another controlled-value store.

## Known boundary

Standard Schema v1 exposes whole-input validation, not a standard field validator. Dependency-driven
validation therefore saves state churn and prevents unrelated error replacement, but it cannot skip
the schema's whole-input parse. A future optional schema adapter may expose true field parsing; it
must remain additive and may not replace the Standard Schema/native FormData baseline.
