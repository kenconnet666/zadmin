import { isDomHtmlElement, isDomShadowRoot } from './dom-realm.js';

interface InertSnapshot {
	readonly ariaHidden: string | null;
	readonly element: HTMLElement;
	readonly inert: boolean;
}

export function inertOthers(root: HTMLElement, branches: readonly HTMLElement[] = []): () => void {
	const rootNode = root.getRootNode();
	const container =
		root.parentElement ?? (isDomShadowRoot(rootNode) ? rootNode : root.ownerDocument.body);
	const allowed = [root, ...branches];
	const snapshots: InertSnapshot[] = [];
	for (const element of container.children) {
		if (!isDomHtmlElement(element)) continue;
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
