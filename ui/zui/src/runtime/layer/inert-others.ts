interface InertSnapshot {
	readonly ariaHidden: string | null;
	readonly element: HTMLElement;
	readonly inert: boolean;
}

export function inertOthers(root: HTMLElement, branches: readonly HTMLElement[] = []): () => void {
	const body = root.ownerDocument.body;
	const allowed = [root, ...branches];
	const snapshots: InertSnapshot[] = [];
	for (const element of body.children) {
		if (!(element instanceof HTMLElement)) continue;
		if (allowed.some((entry) => element.contains(entry) || entry.contains(element))) continue;
		snapshots.push({
			ariaHidden: element.getAttribute('aria-hidden'),
			element,
			inert: element.inert
		});
		element.inert = true;
		element.setAttribute('aria-hidden', 'true');
	}
	let active = true;
	return () => {
		if (!active) return;
		active = false;
		for (const snapshot of snapshots) {
			snapshot.element.inert = snapshot.inert;
			if (snapshot.ariaHidden === null) snapshot.element.removeAttribute('aria-hidden');
			else snapshot.element.setAttribute('aria-hidden', snapshot.ariaHidden);
		}
	};
}
