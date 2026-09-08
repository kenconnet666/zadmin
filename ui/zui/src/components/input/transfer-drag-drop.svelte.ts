import {
	DragDropManager,
	Draggable,
	Droppable,
	PointerActivationConstraints,
	PointerSensor,
	defaultPreset,
	type BeforeDragStartEvent,
	type DragEndEvent,
	type DragStartEvent,
	type DragOverEvent
} from '@dnd-kit/dom';
import type { Attachment } from 'svelte/attachments';
import type { SelectionKey } from '../../runtime/collection/selection.js';
import { connectDragGeometry } from '../../runtime/drag-drop/geometry.js';
import { classOnlyDragDropPlugins } from '../../runtime/drag-drop/plugins.js';
import type { TransferDestination } from '../../runtime/collection/transfer.js';

type TransferSide = TransferDestination;
type TransferDragSource = 'pointer';

interface TransferDragData {
	readonly key: SelectionKey;
	readonly kind: 'item';
	readonly owner: object;
	readonly side: TransferSide;
}

interface TransferDropData {
	readonly kind: 'pane';
	readonly owner: object;
	readonly side: TransferSide;
}

export interface TransferDragDropContext {
	readonly draggingKey: SelectionKey | undefined;
	readonly targetSide: TransferSide | undefined;
	attachItem(options: {
		readonly disabled: boolean;
		readonly key: SelectionKey;
		readonly side: TransferSide;
	}): Attachment<HTMLElement>;
	attachPane(options: {
		readonly disabled: boolean;
		readonly side: TransferSide;
	}): Attachment<HTMLElement>;
	consumeClick(key: SelectionKey): boolean;
}

interface TransferDragDropOptions<TSnapshot> {
	readonly disabled: () => boolean;
	readonly keysFor: (side: TransferSide, key: SelectionKey) => readonly SelectionKey[];
	readonly matchesSnapshot: (snapshot: TSnapshot) => boolean;
	readonly nonce: () => string | undefined;
	readonly onDrop: (detail: {
		readonly destination: TransferSide;
		readonly focusKey: SelectionKey;
		readonly keys: readonly SelectionKey[];
		readonly source: TransferDragSource;
	}) => void;
	readonly snapshot: (side: TransferSide, keys: readonly SelectionKey[]) => TSnapshot;
}

interface DragSession<TSnapshot> {
	readonly key: SelectionKey;
	readonly keys: readonly SelectionKey[];
	readonly side: TransferSide;
	readonly snapshot: TSnapshot;
}

export class TransferDragDropAdapter<TSnapshot> {
	readonly #options: TransferDragDropOptions<TSnapshot>;
	readonly #owner = Object.freeze({});
	#manager: DragDropManager | undefined;
	#stopGeometry: (() => void) | undefined;
	#stopMonitor: (() => void) | undefined;
	#session: DragSession<TSnapshot> | undefined;
	#nextSlot = 0;
	#clearSuppressedClick: (() => void) | undefined;
	#suppressedKey: SelectionKey | undefined;
	draggingKey = $state<SelectionKey>();
	targetSide = $state<TransferSide>();

	readonly context: TransferDragDropContext;

	constructor(options: TransferDragDropOptions<TSnapshot>) {
		this.#options = options;
		const readDraggingKey = (): SelectionKey | undefined => this.draggingKey;
		const readTargetSide = (): TransferSide | undefined => this.targetSide;
		this.context = {
			get draggingKey() {
				return readDraggingKey();
			},
			get targetSide() {
				return readTargetSide();
			},
			attachItem: (input) => this.#attachItem(input),
			attachPane: (input) => this.#attachPane(input),
			consumeClick: (key) => this.#consumeClick(key)
		};
	}

	#ensureManager(): DragDropManager {
		if (this.#manager) return this.#manager;
		const plugins = classOnlyDragDropPlugins(defaultPreset.plugins, {
			nonce: this.#options.nonce()
		});
		const manager = new DragDropManager({ plugins });
		this.#manager = manager;
		this.#stopGeometry = connectDragGeometry(manager);
		this.#stopMonitor = this.#connectMonitor(manager);
		return manager;
	}

	#connectMonitor(manager: DragDropManager): () => void {
		const stopBefore = manager.monitor.addEventListener('beforedragstart', this.#beforeDragStart);
		const stopStart = manager.monitor.addEventListener('dragstart', this.#startDrag);
		const stopOver = manager.monitor.addEventListener('dragover', this.#overDrag);
		const stopEnd = manager.monitor.addEventListener('dragend', this.#endDrag);
		return () => {
			stopBefore();
			stopStart();
			stopOver();
			stopEnd();
		};
	}

	#itemData(value: unknown): TransferDragData | undefined {
		if (!value || typeof value !== 'object') return undefined;
		const data = value as Partial<TransferDragData>;
		return data.owner === this.#owner && data.kind === 'item'
			? (data as TransferDragData)
			: undefined;
	}

	#paneData(value: unknown): TransferDropData | undefined {
		if (!value || typeof value !== 'object') return undefined;
		const data = value as Partial<TransferDropData>;
		return data.owner === this.#owner && data.kind === 'pane'
			? (data as TransferDropData)
			: undefined;
	}

	#beforeDragStart = (event: BeforeDragStartEvent): void => {
		const source = this.#itemData(event.operation.source?.data);
		if (
			this.#options.disabled() ||
			!source ||
			this.#options.keysFor(source.side, source.key).length === 0
		)
			event.preventDefault();
	};

	#startDrag = (event: DragStartEvent): void => {
		const source = this.#itemData(event.operation.source?.data);
		if (!source) return;
		const keys = this.#options.keysFor(source.side, source.key);
		if (keys.length === 0) return;
		this.#session = {
			key: source.key,
			keys: Object.freeze([...keys]),
			side: source.side,
			snapshot: this.#options.snapshot(source.side, keys)
		};
		this.draggingKey = source.key;
		this.#suppressedKey = source.key;
	};

	#overDrag = (event: DragOverEvent): void => {
		const pane = this.#paneData(event.operation.target?.data);
		this.targetSide = pane?.side;
	};

	#endDrag = (event: DragEndEvent): void => {
		const session = this.#session;
		const pane = this.#paneData(event.operation.target?.data);
		this.#session = undefined;
		this.draggingKey = undefined;
		this.targetSide = undefined;
		this.#scheduleClickRelease(event.operation.source?.element);
		if (
			event.canceled ||
			!session ||
			!pane ||
			pane.side === session.side ||
			this.#options.disabled() ||
			!this.#options.matchesSnapshot(session.snapshot)
		)
			return;
		this.#options.onDrop({
			destination: pane.side,
			focusKey: session.key,
			keys: session.keys,
			source: 'pointer'
		});
	};

	reconcile(): void {
		if (
			!this.#session ||
			(!this.#options.disabled() && this.#options.matchesSnapshot(this.#session.snapshot))
		)
			return;
		this.#manager?.actions.stop({ canceled: true });
	}

	#scheduleClickRelease(element: Element | undefined): void {
		this.#clearSuppressedClick?.();
		const view = element?.ownerDocument.defaultView;
		if (!view) {
			this.#suppressedKey = undefined;
			return;
		}
		const timer = view.setTimeout(() => {
			this.#suppressedKey = undefined;
			this.#clearSuppressedClick = undefined;
		}, 0);
		this.#clearSuppressedClick = () => {
			view.clearTimeout(timer);
			this.#suppressedKey = undefined;
			this.#clearSuppressedClick = undefined;
		};
	}

	#consumeClick(key: SelectionKey): boolean {
		if (!Object.is(this.#suppressedKey, key)) return false;
		this.#clearSuppressedClick?.();
		return true;
	}

	#attachItem(options: {
		readonly disabled: boolean;
		readonly key: SelectionKey;
		readonly side: TransferSide;
	}): Attachment<HTMLElement> {
		return (element) => {
			const manager = this.#ensureManager();
			const slot = (this.#nextSlot += 1);
			const draggable = new Draggable(
				{
					data: Object.freeze({
						key: options.key,
						kind: 'item',
						owner: this.#owner,
						side: options.side
					}) satisfies TransferDragData,
					disabled: options.disabled,
					element,
					id: `transfer-item-${options.side}-${slot}`,
					register: false,
					sensors: [
						PointerSensor.configure({
							activationConstraints: [new PointerActivationConstraints.Distance({ value: 6 })]
						})
					],
					type: 'zui-transfer-item'
				},
				manager
			);
			draggable.register();
			return () => draggable.destroy();
		};
	}

	#attachPane(options: {
		readonly disabled: boolean;
		readonly side: TransferSide;
	}): Attachment<HTMLElement> {
		return (element) => {
			const manager = this.#ensureManager();
			const droppable = new Droppable(
				{
					accept: (source) => {
						const data = this.#itemData(source.data);
						return Boolean(
							source.type === 'zui-transfer-item' && data && data.side !== options.side
						);
					},
					data: Object.freeze({
						kind: 'pane',
						owner: this.#owner,
						side: options.side
					}) satisfies TransferDropData,
					disabled: options.disabled,
					element,
					id: `transfer-pane-${options.side}`,
					register: false,
					type: 'zui-transfer-pane'
				},
				manager
			);
			droppable.register();
			return () => droppable.destroy();
		};
	}

	destroy(): void {
		this.#clearSuppressedClick?.();
		this.#stopMonitor?.();
		this.#stopMonitor = undefined;
		this.#stopGeometry?.();
		this.#stopGeometry = undefined;
		this.#manager?.destroy();
		this.#manager = undefined;
		this.#session = undefined;
		this.draggingKey = undefined;
		this.targetSide = undefined;
	}
}
