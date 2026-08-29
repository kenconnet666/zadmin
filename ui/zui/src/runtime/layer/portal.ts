export type PortalTarget = Document | Element | ShadowRoot | null | undefined;

export interface PortalOptions {
	readonly target: PortalTarget;
}

function resolveTarget(target: PortalTarget): Element | ShadowRoot | null {
	return target instanceof Document ? target.body : (target ?? null);
}

export function portal(node: HTMLElement, options: PortalOptions) {
	const ownerDocument = node.ownerDocument;
	const placeholder = ownerDocument.createComment('zui-portal');
	const originalParent = node.parentNode;
	originalParent?.insertBefore(placeholder, node);

	const move = (target: PortalTarget) => {
		const destination = resolveTarget(target);
		if (destination && node.parentNode !== destination) destination.append(node);
		else if (!destination && placeholder.parentNode && node.parentNode !== placeholder.parentNode) {
			placeholder.parentNode.insertBefore(node, placeholder.nextSibling);
		}
	};

	move(options.target);
	return {
		destroy() {
			if (placeholder.parentNode && node.parentNode !== placeholder.parentNode) {
				placeholder.parentNode.insertBefore(node, placeholder.nextSibling);
			}
			placeholder.remove();
		},
		update(next: PortalOptions) {
			move(next.target);
		}
	};
}
