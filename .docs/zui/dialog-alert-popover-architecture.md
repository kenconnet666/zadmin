# Dialog, AlertDialog, and Popover Production Contract

Status: implemented, 2026-09-02.

Dialog remains modal-only. It reuses the existing Portal, LayerManager, DismissableLayer, FocusScope,
scroll-lock, inert and Presence implementations. Content owns initial/restore focus and typed cancellable
Escape/pointer/focus-outside events. Title and Description register their real presence: the default Title id
is SSR-stable, optional Description is emitted only when mounted or explicitly supplied, and missing Title
requires an explicit aria label.

AlertDialog layers a decision owner over Dialog. Cancel is the default initial focus. The root may own a
caller-provided Promise action; one generation is active at a time. Pending disables Action and Cancel while
Escape/outside remain blocked. Resolve closes, reject keeps the dialog open, clears pending, focuses Action,
and notifies the caller. Promise creation, abort, retry and error presentation remain application-owned.

Popover remains the element-triggered modal/nonmodal floating surface. Presence uses the Content owner Window.
Trigger replacement reruns Floating/branch/focus ownership through reactive effects; cleanup stops observers,
branches, FocusScope, locks and timers. Nested Popovers remain independent top-layer branches. Content exposes
explicit ARIA overrides, cancellable dismiss events and initial/restore focus without arbitrary asChild.

The three families share Layer infrastructure but not product meaning: Dialog is a modal task surface,
AlertDialog requires an explicit decision, and Popover is a positioned contextual surface. Nonmodal Dialog,
virtual coordinate anchors, Menu selection, form submission and request clients are deliberately excluded.

References: WAI-ARIA Dialog/AlertDialog patterns, React Aria Dialog/Popover, MUI Dialog/Popover,
Ant Design Modal/Popover, Naive UI Modal/Popover.
