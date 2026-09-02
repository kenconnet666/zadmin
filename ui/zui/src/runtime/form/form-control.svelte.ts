export type FieldMessage = string;
export type FieldMessages = FieldMessage | readonly FieldMessage[];

export function normalizeFieldMessages(
	messages: FieldMessages | null | undefined
): readonly string[] {
	if (messages === null || messages === undefined) return [];
	return (Array.isArray(messages) ? messages : [messages]).filter(
		(message): message is string => typeof message === 'string' && message.length > 0
	);
}

export function mergeFieldMessages(
	...values: readonly (FieldMessages | null | undefined)[]
): readonly string[] {
	const messages = values.flatMap(normalizeFieldMessages);
	// This function returns an immutable snapshot; the temporary set is not rendered state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	return Object.freeze([...new Set(messages)]);
}

export function mergeAriaIds(
	...values: readonly (string | null | undefined)[]
): string | undefined {
	const ids: string[] = [];
	for (const value of values) {
		for (const id of value?.trim().split(/\s+/u) ?? []) {
			if (id.length > 0 && !ids.includes(id)) ids.push(id);
		}
	}
	return ids.length === 0 ? undefined : ids.join(' ');
}

export function listenForFormReset(
	control: HTMLElement & { readonly form: HTMLFormElement | null },
	reset: () => void
): () => void {
	const { associatedForm, root } = readFormAssociation(control);
	const explicitFormId = control.getAttribute('form');
	const eventOwner = associatedForm ?? (explicitFormId === null ? root : control.ownerDocument);
	return listenToResetEvents(
		[eventOwner],
		(event) => {
			const form = event.target;
			if (!isFormElement(form, control.ownerDocument)) return false;
			return (
				control.form === form ||
				form.contains(control) ||
				(explicitFormId !== null && explicitFormId === form.id)
			);
		},
		reset
	);
}

function readFormAssociation(control: HTMLElement & { readonly form: HTMLFormElement | null }) {
	return {
		associatedForm: control.form ?? control.closest('form'),
		root: control.getRootNode()
	};
}

function isFormElement(
	target: EventTarget | null,
	ownerDocument: Document
): target is HTMLFormElement {
	if (target === null || typeof target !== 'object') return false;
	const node = target as Partial<Element>;
	return node.nodeType === 1 && node.localName === 'form' && node.ownerDocument === ownerDocument;
}

export function formReset(
	control: HTMLElement & { readonly form: HTMLFormElement | null },
	reset: () => void
): { destroy(): void; update(reset: () => void): void } {
	let currentReset = reset;
	let active = true;
	let refreshQueued = false;
	let mountObserver: MutationObserver | undefined;
	let association = readFormAssociation(control);
	let disconnect = listenForFormReset(control, () => currentReset());

	const stopMountObserver = () => {
		mountObserver?.disconnect();
		mountObserver = undefined;
	};
	const refreshAssociation = () => {
		refreshQueued = false;
		if (!active) return;
		const next = readFormAssociation(control);
		if (next.associatedForm !== association.associatedForm || next.root !== association.root) {
			disconnect();
			association = next;
			disconnect = listenForFormReset(control, () => currentReset());
		}
		if (association.associatedForm !== null || control.isConnected) stopMountObserver();
	};
	const scheduleAssociationRefresh = () => {
		if (refreshQueued || !active) return;
		refreshQueued = true;
		queueMicrotask(refreshAssociation);
	};

	// Svelte may initialize an action before its node enters the final form tree.
	const MutationObserverConstructor = control.ownerDocument.defaultView?.MutationObserver;
	if (!control.isConnected && MutationObserverConstructor) {
		mountObserver = new MutationObserverConstructor(scheduleAssociationRefresh);
		mountObserver.observe(control.ownerDocument, { childList: true, subtree: true });
	}
	scheduleAssociationRefresh();
	return {
		destroy() {
			active = false;
			stopMountObserver();
			disconnect();
		},
		update(nextReset) {
			currentReset = nextReset;
			scheduleAssociationRefresh();
		}
	};
}

export function formElementReset(
	form: HTMLFormElement,
	reset: () => void
): { destroy(): void; update(reset: () => void): void } {
	let currentReset = reset;
	const destroy = listenToFormReset(form, () => currentReset());
	return {
		destroy,
		update(nextReset) {
			currentReset = nextReset;
		}
	};
}

export function listenToFormReset(form: HTMLFormElement | null, reset: () => void): () => void {
	if (!form) return () => undefined;
	return listenToResetEvents([form], (event) => event.target === form, reset);
}

function listenToResetEvents(
	targets: readonly (EventTarget | null)[],
	accepts: (event: Event) => boolean,
	reset: () => void
): () => void {
	const activeTargets = [
		...new Set(targets.filter((target): target is EventTarget => target !== null))
	];
	let active = true;
	let generation = 0;
	const handleReset = (event: Event) => {
		if (!accepts(event)) return;
		const ticket = (generation += 1);
		queueMicrotask(() => {
			queueMicrotask(() => {
				if (active && ticket === generation && !event.defaultPrevented) reset();
			});
		});
	};
	for (const target of activeTargets) target.addEventListener('reset', handleReset, true);
	return () => {
		active = false;
		generation += 1;
		for (const target of activeTargets) target.removeEventListener('reset', handleReset, true);
	};
}
