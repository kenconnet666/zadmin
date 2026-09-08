<script lang="ts">
	import {
		ZField,
		ZProvider,
		ZTree,
		ZTreeSelect,
		type SelectionKey,
		type TreeLoadContext,
		type TreeNode,
		type ZTreeController
	} from '../src/entrypoints/index.js';

	let lazyNodes = $state<readonly TreeNode<string>[]>([
		{ hasChildren: true, key: 'workspace', label: 'Workspace' },
		{ hasChildren: true, key: 'idle', label: 'Idle' }
	]);
	let lazySelected = $state<readonly string[]>([]);
	let loadAttempts = $state(0);
	let abortedLoads = $state(0);
	let loadSignal: AbortSignal | undefined;
	let pendingResolve: ((appendChildren: boolean) => void) | undefined;
	let pendingReject: ((error: unknown) => void) | undefined;
	let treeController = $state<ZTreeController<string> | null>(null);
	let heldTreeController = $state<ZTreeController<string> | null>(null);
	let replacementLoader = $state(false);
	let lazyDisabled = $state(false);
	let retryOnAbort = false;
	const abortRetryResults: boolean[] = [];
	let preloadedNodes = $state<readonly TreeNode<string>[]>([
		{ hasChildren: true, key: 'cached', label: 'Cached' },
		{ key: 'cached-child', label: 'Cached child', parentKey: 'cached' }
	]);
	let preloadedAttempts = $state(0);

	$effect(() => {
		if (treeController) heldTreeController = treeController;
	});

	function beginLoad(node: TreeNode<string>, { signal }: TreeLoadContext<string>): Promise<void> {
		loadAttempts += 1;
		loadSignal = signal;
		return new Promise<void>((resolve, reject) => {
			const abort = (): void => {
				abortedLoads += 1;
				if (retryOnAbort) abortRetryResults.push(heldTreeController?.retryLoad(node.key) ?? false);
				reject(new DOMException('Aborted', 'AbortError'));
			};
			signal.addEventListener('abort', abort, { once: true });
			pendingResolve = (appendChildren) => {
				signal.removeEventListener('abort', abort);
				if (appendChildren)
					lazyNodes = [
						...lazyNodes,
						{ key: 'api', label: 'API', parentKey: node.key },
						{ key: 'docs', label: 'Docs', parentKey: node.key },
						{
							key: 'archive',
							label: 'Archive',
							parentKey: node.key,
							selectionDisabled: true
						}
					];
				resolve();
			};
			pendingReject = (error) => {
				signal.removeEventListener('abort', abort);
				reject(error);
			};
		});
	}

	function loadChildren(node: TreeNode<string>, context: TreeLoadContext<string>): Promise<void> {
		return beginLoad(node, context);
	}

	function replacementLoadChildren(
		node: TreeNode<string>,
		context: TreeLoadContext<string>
	): Promise<void> {
		return beginLoad(node, context);
	}

	const activeLoader = $derived(replacementLoader ? replacementLoadChildren : loadChildren);

	function failLoad(): void {
		pendingReject?.(new Error('Fixture load failed'));
		pendingReject = undefined;
		pendingResolve = undefined;
	}

	function resolveLoad(): void {
		pendingResolve?.(true);
		pendingReject = undefined;
		pendingResolve = undefined;
	}

	function removeDocs(): void {
		lazyNodes = lazyNodes.filter((node) => node.key !== 'docs');
	}

	export function renameWorkspace(): void {
		lazyNodes = [{ hasChildren: true, key: 'workspace', label: 'Workspace replacement' }];
	}

	export function replaceLoader(): void {
		replacementLoader = true;
	}

	export function setLazyDisabled(value: boolean): void {
		lazyDisabled = value;
	}

	export function setRetryOnAbort(value: boolean): void {
		retryOnAbort = value;
	}

	export function lastAbortRetryResult(): boolean | undefined {
		return abortRetryResults.at(-1);
	}

	export function loadAttemptCount(): number {
		return loadAttempts;
	}

	export function retryHeldIdle(): boolean {
		return heldTreeController?.retryLoad('idle') ?? false;
	}

	export function removePreloadedBranch(): void {
		preloadedNodes = [];
	}

	export function restorePreloadedLazyBranch(): void {
		preloadedNodes = [{ hasChildren: true, key: 'cached', label: 'Cached replacement' }];
	}

	export function resolveEmptyLoad(): void {
		pendingResolve?.(false);
		pendingReject = undefined;
		pendingResolve = undefined;
	}

	export function currentLoadSignal(): AbortSignal | undefined {
		return loadSignal;
	}

	const virtualNodes: readonly TreeNode<string>[] = Array.from({ length: 2000 }, (_, index) => ({
		key: `virtual-${index}`,
		label: `Virtual ${index + 1}`
	}));
	let virtualSelected = $state<readonly string[]>([]);

	const selectNodes: readonly TreeNode<string>[] = [
		{ key: 'root', label: 'Root' },
		{ key: 'alpha', label: 'Alpha', parentKey: 'root' },
		{ key: 'beta', label: 'Beta', parentKey: 'root' },
		{ key: 'long', label: 'High contrast professional theme', parentKey: 'root' }
	];
	let treeSelectValue = $state<SelectionKey | null>('alpha');
	let treeSelectOpen = $state(false);
</script>

<form data-testid="tree-production-form">
	<ZTree
		aria-label="Lazy production tree"
		bind:controller={treeController}
		bind:selectedKeys={lazySelected}
		defaultExpandedKeys={['workspace']}
		disabled={lazyDisabled}
		name="lazy-node"
		nodes={lazyNodes}
		onLoadChildren={activeLoader}
		selectionMode="multiple"
		selectionStyle="checkbox"
		data-testid="tree-production-lazy"
	/>
	<button data-testid="tree-production-fail" type="button" onclick={failLoad}>Fail load</button>
	<button data-testid="tree-production-resolve" type="button" onclick={resolveLoad}>
		Resolve load
	</button>
	<button data-testid="tree-production-remove" type="button" onclick={removeDocs}>
		Remove docs
	</button>
	<button type="reset">Reset lazy tree</button>
</form>
<output data-testid="tree-production-output">
	{lazySelected.join(',')}:{loadAttempts}:{treeController?.activeKey ?? 'none'}:{abortedLoads}
</output>

<ZTree
	aria-label="Preloaded cache tree"
	defaultExpandedKeys={['cached']}
	nodes={preloadedNodes}
	onLoadChildren={() => {
		preloadedAttempts += 1;
	}}
	data-testid="tree-production-preloaded"
/>
<output data-testid="tree-production-preloaded-output">{preloadedAttempts}</output>

<form data-testid="tree-production-single-form">
	<ZTree
		aria-label="Single normalization tree"
		name="single-node"
		nodes={selectNodes}
		selectedKeys={['alpha', 'beta']}
		selectionMode="single"
	/>
</form>

<ZTree
	aria-label="Virtual production tree"
	bind:selectedKeys={virtualSelected}
	height={180}
	itemSize={36}
	nodes={virtualNodes}
	virtualized
	data-testid="tree-production-virtual"
/>
<output data-testid="tree-production-virtual-output">{virtualSelected.join(',')}</output>

<form data-testid="tree-production-select-form">
	<ZField
		controlId="tree-production-select-trigger"
		description="TreeSelect focus owner"
		label="Deployment node"
		name="tree-node"
		required
	>
		<ZTreeSelect
			aria-label="Choose deployment node"
			bind:open={treeSelectOpen}
			bind:value={treeSelectValue}
			clearable
			defaultExpandedKeys={['root']}
			defaultValue="alpha"
			matchWidth={false}
			nodes={selectNodes}
			style="inline-size: 8rem"
		/>
	</ZField>
	<button type="reset">Reset select</button>
</form>
<output data-testid="tree-production-select-output">
	{treeSelectValue ?? 'null'}:{treeSelectOpen}
</output>

<ZProvider direction="rtl">
	<ZTree aria-label="RTL production tree" nodes={selectNodes} data-testid="tree-production-rtl" />
</ZProvider>

<ZTreeSelect
	aria-label="Readonly tree select"
	defaultValue="alpha"
	nodes={selectNodes}
	readonly
	data-testid="tree-production-readonly"
/>
