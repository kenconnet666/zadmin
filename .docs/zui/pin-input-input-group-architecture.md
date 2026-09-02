# ZUI PinInput and InputGroup Production Architecture

Status: implemented P1 production increment, 2026-09-02.

## Scope

This increment closes two related form-control boundaries:

- `ZPinInput` owns one nullable continuous OTP/PIN string while presenting multiple native input slots.
- `ZInputGroup` owns no business value. It declares exactly one registered business control and composes
  non-interactive affixes and separately owned actions around that control.

They share the existing ZField contract but do not change ZFormField, invent another form store or allow
multiple business values inside one InputGroup.

## Mature-library comparison and choices

- [Ant Design Input.OTP](https://ant.design/components/input/) exposes length, mask, autocomplete,
  formatter and separators. ZUI adopts bounded length, boolean mask and `one-time-code`, but rejects an
  array value owner, formatter-filled blank strings, arbitrary mask strings, separator DSL and per-slot
  business callbacks. The public value remains one string or explicit null.
- [MUI TextField and InputAdornment](https://mui.com/material-ui/react-text-field/) separate the HTML
  input from start/end adornments and inherit disabled/error state from FormControl. ZUI adopts this
  division while using ZField, direct Svelte context and explicit `prefixAction`/`suffixAction`; it does
  not copy `slotProps`, `sx`, arbitrary component replacement or hidden React owner state.
- [MUI InputAdornment](https://mui.com/material-ui/api/input-adornment/) documents that a non-interactive
  adornment can redirect pointer focus to the input. ZUI applies that only to affix slots; action slots
  retain their own focus and keyboard behavior.
- [Naive UI InputGroup](https://github.com/tusen-ai/naive-ui/blob/main/src/input/src/InputGroup.tsx) is a
  deliberately small visual wrapper. ZUI keeps that low visual surface but adds the Field/control owner
  and nested/multiple-owner checks needed by this repository's form architecture instead of accepting an
  arbitrary sequence of unrelated values.

## PinInput value model

### One owner and explicit empty value

`value` is `string | null`:

- a string is the canonical continuous PIN;
- `null` is an explicit external clear;
- `undefined` means the bindable prop has not supplied a concrete value and therefore selects
  `defaultValue` through `ControllableState`.

Visible slots never own independent values. `onValueChange` emits a canonical string, and
`onComplete` fires only when a user edit creates a new value whose grapheme count equals the current
length. External complete values and form reset do not manufacture completion events.

### Canonicalization and external reconciliation

All entry paths use one normalization strategy:

1. segment the source into Unicode graphemes;
2. validate each grapheme with `validateCharacter`, or with the selected mode default;
3. retain the first `length` accepted graphemes (`length` is bounded to 1–32 to prevent accidental DOM
   explosions);
4. join them into one string.

`numeric` intentionally accepts only ASCII `[0-9]`, because OTP credentials are protocol identifiers,
not localized numbers. `text` accepts non-blank Unicode graphemes.

An externally supplied illegal or overlong string is displayed, submitted and rebound as the same
canonical value. After mount, an owner-Window microtask updates the bindable prop and calls
`onValueChange`; a generation guard drops stale normalization after another prop change or reset. This
eliminates the former split where the slots and hidden form value were normalized while the public
binding remained raw.

Changing `length`, `mode` or `validateCharacter` runs the same process. Shrinking length truncates the
value and clamps the roving index; expansion preserves the existing prefix and adds empty slots.

## Grapheme, IME, paste and autofill

`Intl.Segmenter({ granularity: 'grapheme' })` is resolved from the root's owner realm when available;
`Array.from` is a compatibility fallback. A family emoji, CJK character or base-plus-combining-mark is
therefore one text slot in supported runtimes.

During native composition:

- `compositionstart` marks the active slot;
- interim input and keyboard events are not interpreted;
- `compositionend` distributes the committed string once.

Normal input, paste and mobile OTP autofill use the same distributor. The distributor may receive more
than one grapheme in the current input and fills subsequent slots, so first-slot `one-time-code`
autofill is not blocked by `maxlength=1`. ArrowLeft/ArrowRight follow Provider direction; Home/End and
Backspace/Delete operate on the logical continuous string.

## Autocomplete and mask boundary

`autocomplete` is deliberately limited to `one-time-code | off`; only the first slot receives the chosen
value and every other slot is `off`. This avoids pretending that every visual slot is an independent OTP
credential.

`mask` changes visible slots to password inputs but never changes the canonical value, callbacks or
FormData. It is shoulder-surfing protection only, not encrypted storage. Applications should minimize
OTP retention and transmit it over their authenticated secure channel.

## Field and form ownership

PinInput calls `claimZFieldControlOwner` and registers exactly one focus function with its nearest Field.
Field label activation focuses the first empty slot; all slots receive description/error IDs and
disabled, readonly, required, invalid and size state. The first slot owns the Field control ID, while
subsequent IDs are deterministically scoped from it.

The previous ad hoc disabled reset proxy plus manually repeated hidden input is removed. One
`FormValueBridge` owns:

- the single successful `name=value` pair;
- same-tree or explicit external `form` association;
- reset to the current normalized `defaultValue`;
- disabled omission from FormData.

Visible slots carry `form` so their native required constraint belongs to the same external form, but
they never carry `name` and therefore cannot leak per-slot values.

## PinInput locale integration boundary

This batch does not edit the concurrently owned locale file. `inputLabel(index, length)` remains an
explicit typed formatter and all new demos provide localized labels.

The root integration should add this exact field to `ZuiFormLocale`:

```ts
readonly pinInputPosition: (formattedIndex: string, formattedLength: string) => string;
```

PinInput can then format one-based index and total with `Intl.NumberFormat(zui.locale)` and call the
locale function when `inputLabel` is absent. The English and Chinese defaults should be equivalent to
“Digit 2 of 6” and “第2位，共6位”. Until that integration, the existing English compatibility fallback
remains for unlabelled legacy consumers and production code can pass `inputLabel` explicitly.

## InputGroup control owner

### Field claim and descendant projection

InputGroup claims the nearest Field before rendering children. Claiming shadows the raw Field context so
ordinary descendants cannot accidentally inherit its name or become an auxiliary form owner. A bounded
InputGroup context projects these resolved values to the registered control:

- control ID and label relationship;
- name and description/error IDs;
- disabled, invalid, readonly and required;
- explicit Group size, otherwise Field size, otherwise Provider density.

ZInput and ZTextarea register a stable focus callback during component initialization and clean it up on
destroy. Their explicit props remain highest priority. They preserve their original generated native ID
fallback in markup, which is also a repository static-audit contract.

Field label activation calls the Group's registered owner and focuses the real input/textarea. If a
Field-wrapped Group mounts without a registered ZInput/ZTextarea, it fails instead of silently projecting
name and errors nowhere. Compound owners such as DatePicker claim Field outside the visual Group and may
use the fallback focus query for their own segmented control.

### Multiple and nested owner rejection

The registration slot accepts exactly one business control. A second direct ZInput/ZTextarea throws
synchronously during child initialization. A nested ZInputGroup detects the parent context and throws
before rendering its descendants. These checks prevent one visual border and one Field label from
silently representing unrelated values.

DateRangePicker remains one outer range value owner even though its internal bare date segments are
multiple native inputs; those inner fields have `formParticipation="none"` and the outer picker owns the
single FormValueBridge and Field focus contract.

## Affix and action boundary

`prefix` and `suffix` are non-interactive logical affixes for units, protocol text or decorative Lucide
icons. Pointer activation stays on the Field task and focuses the business control. An owner-realm
MutationObserver rejects interactive descendants added to these affixes and is disconnected on destroy.

`prefixAction` and `suffixAction` are the only regions for ZButton/ZLink. Actions retain normal Tab
order, names and callbacks, and their disabled state is explicitly owned by the caller rather than
implicitly copied from the input. DatePicker, DateRangePicker and the date-field composition demo migrate
their clear/calendar buttons to `suffixAction`.

## Responsive, RTL and motion

The Group uses logical DOM order and logical spacing, so prefix and suffix mirror under RTL without
physical left/right branches. Affixes may consume at most 40% each, use `min-width: 0` and ellipsis, while
the registered direct input/textarea receives `flex: 1 1 auto` and can shrink in narrow owners. The Group
does not wrap controls into a second visual row because that would detach actions and affixes from the
shared border and reading order.

Focus is represented once on the `focus-within` boundary. Child ZInput/ZTextarea focus rings are
suppressed only as direct Group controls. Reduced motion sets the boundary transition duration to zero;
`ReducedMotionState` resolves its Window from the real Group root and cleans up through the existing
runtime.

## Acceptance and shared integration

Dedicated browser, SSR and type sources cover:

- external illegal/overlong reconciliation and null clear;
- dynamic length;
- grapheme and IME composition;
- first-slot OTP autocomplete and mask contract;
- one FormValueBridge, external form and reset;
- Field label/focus/name/description/error/required/size projection;
- affix focus and separately owned actions;
- multiple-control and nested-Group failure;
- Textarea ownership, RTL, long affixes and narrow width;
- valid and invalid TypeScript contracts.

The root integration pass owns shared entrypoint type exports, typed locale implementation, generated API
facts, API contract, production audit and shared package/type/component tests. Local validation for this
batch is limited to Prettier, WebStorm `errorsOnly`, `git diff --check` and fast static audits; browser,
SSR and type specs are CI/CD source evidence and are not executed locally.
