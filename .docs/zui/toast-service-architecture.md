# ZUI Toast Service Architecture

Status: implemented production increment, 2026-09-02.

## Boundary

`ToastQueue` is an explicitly constructed service owned by an application subtree. `ZToaster` is the
single viewport connection for that queue, while `ZToast` remains independently renderable. There is no
process-wide singleton and no hidden dependency on a root layout.

```text
caller Promise / event
        |
        v
ToastQueue: queued -> visible -> exiting -> removed
        |                    |
        |                    +-- Presence completion
        +-- ZToaster Portal + centralized announcer
```

The queue owns ordering, partial state updates, task generations, timer remainder and dismissal reasons.
The caller owns network cancellation, Promise observation, retries and domain error recovery. The Toaster
owns DOM placement, owner-realm connection and accessibility announcements.

## Public mutation semantics

- `push(options)` creates a record, or fully replaces an existing record with the same id for backwards
  compatibility. Replacement restarts its duration.
- `update(id, partial)` returns `false` for a missing id. It preserves omitted fields, record identity,
  phase and elapsed timer remainder. An explicit new `duration` restarts that timer.
- `dismiss`, `clear` and `dispose` invalidate tracked task generations. A settled task never recreates a
  dismissed Toast.
- Only currently pending tasks occupy the generation registry. Normal `push` records never enter it, and
  settle/dismiss removes the entry, so long-lived queues do not retain every historical Toast id.
- `task(promise, stages)` returns only the Toast id. It observes the original caller-owned Promise and
  updates one record through loading, success or error. Starting another task with the same id increments
  a generation, so a late result from the older task cannot overwrite the newer state.
- Loading defaults to persistent, info and polite. Success defaults to finite, success and polite. Error
  defaults to finite, danger and assertive. Every stage may explicitly override these policies.

## Timing and owner realm

Timers begin only in `visible`. Hover, focus and document visibility add independent pause reasons; a
timer resumes only after every reason is removed. Queueing and dynamic demotion preserve the remaining
duration. `ZToaster` passes `ref.ownerDocument.defaultView` into the queue connection, and timer handles,
clock reads and cleanup all use that owner Window. A server connection without a Window remains inert.

## Announcement contract

Visual queued Toasts set `announce={false}`. `ZToaster` owns one visually hidden polite region and one
assertive region, preventing live semantics from being recreated during an in-place visual update.

- A record instance is announced only when it first becomes visible. Updating the same id and instance
  does not announce again.
- Removing and later recreating the same id produces a new instance and is announced normally.
- Polite records entering in the same render are combined into one ordered message.
- Assertive records are FIFO and separated by at least one second. The content is resolved when its turn
  arrives, so a pending initial announcement uses the latest text without producing an extra announcement.
- A pending record that is removed or returned to the queue is skipped; if later promoted, it becomes
  eligible again.
- Success remains polite unless the caller explicitly asks otherwise. Danger and task errors default to
  assertive, but the throttle prevents a burst from repeatedly interrupting assistive technology.

Standalone `ZToast` keeps its own `status`/`alert` live semantics by default. Escape requests dismissal
only while focus is inside a dismissible Toast; actions remain safe-to-ignore transient actions rather
than a substitute for a dialog.

## Mature-library comparison and deliberate exclusions

Evidence checked on 2026-09-02:

- [React Spectrum Toast](https://react-spectrum.adobe.com/v3/Toast.html) and
  [React Aria Toast state](https://react-aria.adobe.com/Toast/useToastState) support owned queues,
  visible-item limits, pause/resume, programmatic close and accessible navigation. ZUI adopts explicit
  queue ownership and timer policy but does not adopt Spectrum's static application queue.
- [Radix Toast](https://www.radix-ui.com/primitives/docs/components/toast) distinguishes foreground and
  background announcement sensitivity, pauses on hover/focus/window blur and warns that a Toast action
  must be safe to ignore. ZUI maps this to assertive/polite and keeps actions intentionally singular.
- [Sonner Toast](https://github.com/emilkowalski/sonner/blob/main/website/src/pages/toast.mdx) updates by id
  and offers loading-to-success/error Promise feedback. ZUI adopts the interaction but adds explicit
  `update`, task generations and scoped queues rather than a global function.
- [Ant Design Message](https://ant.design/components/message/) updates by unique key and recommends a
  context-aware holder over deprecated static methods. ZUI's queue/Toaster pair is the Svelte-native
  holder boundary.
- [MUI Snackbar](https://mui.com/material-ui/react-snackbar/) treats consecutive messages as a controlled
  sequence and discourages unnecessary stacking. ZUI retains bounded FIFO stacking but throttles the
  interruptive announcement channel.

This increment does not add swipe gestures, a global facade, arbitrary rendered snippets, notification
cards or Promise cancellation. Swipe needs a shared gesture/Presence policy; Notification needs a
different long-lived viewport policy over the same queue kernel; cancellation and retry belong to the
domain task owner.

## Acceptance assets

- Runtime unit contracts cover partial update, missing ids, task success/error and late-result rejection.
- Browser contracts cover Portal ownership, centralized live regions, same-id de-duplication, assertive
  ordering, polite success, Escape and task generations.
- SSR contracts keep the scoped region and visual records renderable without starting timers or touching
  a browser global.
- Documentation demonstrates standalone tones, queue actions, FIFO lifecycle, partial update, caller-owned
  tasks and announcement behavior as distinct examples.
