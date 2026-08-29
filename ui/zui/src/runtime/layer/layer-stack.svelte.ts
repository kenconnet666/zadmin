import { untrack } from 'svelte';

export interface LayerOptions {
	readonly element: () => HTMLElement | null;
	readonly id?: string;
	readonly modal?: () => boolean;
	readonly parentId?: () => string | undefined;
}

export interface LayerRegistration {
	readonly id: string;
	destroy(): void;
	registerBranch(element: HTMLElement): () => void;
}

interface LayerRecord extends LayerOptions {
	readonly id: string;
}

interface LayerBranch {
	readonly element: HTMLElement;
	readonly id: number;
	readonly layerId: string;
}

export class LayerStack {
	#branches = $state<readonly LayerBranch[]>([]);
	#layers = $state<readonly LayerRecord[]>([]);
	#nextBranchId = 0;
	#nextId = 0;

	get layers(): readonly string[] {
		return this.#layers.map(({ id }) => id);
	}

	get topmostId(): string | undefined {
		return this.#layers.at(-1)?.id;
	}

	register(options: LayerOptions): LayerRegistration {
		const id = options.id ?? `zui-layer-${(this.#nextId += 1)}`;
		if (untrack(() => this.#layers).some((layer) => layer.id === id)) {
			throw new Error(`Duplicate layer id "${id}".`);
		}
		const record = { ...options, id };
		this.#layers = [...untrack(() => this.#layers), record];
		let active = true;
		return {
			destroy: () => {
				if (!active) return;
				active = false;
				this.#layers = untrack(() => this.#layers).filter((layer) => layer.id !== id);
				this.#branches = untrack(() => this.#branches).filter((branch) => branch.layerId !== id);
			},
			id,
			registerBranch: (element) => this.registerBranch(id, element)
		};
	}

	registerBranch(layerId: string, element: HTMLElement): () => void {
		if (!untrack(() => this.#layers).some(({ id }) => id === layerId)) {
			throw new Error(`Unknown layer id "${layerId}".`);
		}
		const branch = { element, id: (this.#nextBranchId += 1), layerId };
		this.#branches = [...untrack(() => this.#branches), branch];
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			this.#branches = untrack(() => this.#branches).filter((entry) => entry.id !== branch.id);
		};
	}

	contains(layerId: string, target: Node): boolean {
		const layer = this.#layers.find(({ id }) => id === layerId);
		if (layer?.element()?.contains(target)) return true;
		return this.#branches.some(
			(branch) => branch.layerId === layerId && branch.element.contains(target)
		);
	}

	isTopmost(layerId: string): boolean {
		return this.topmostId === layerId;
	}

	isPointerBlocked(layerId: string): boolean {
		const layerIndex = this.#layers.findIndex(({ id }) => id === layerId);
		if (layerIndex < 0) return true;
		return this.#layers.slice(layerIndex + 1).some((layer) => layer.modal?.() ?? false);
	}
}

const documentStacks = new WeakMap<Document, LayerStack>();

export function getLayerStack(ownerDocument: Document): LayerStack {
	let stack = documentStacks.get(ownerDocument);
	if (!stack) {
		stack = new LayerStack();
		documentStacks.set(ownerDocument, stack);
	}
	return stack;
}
