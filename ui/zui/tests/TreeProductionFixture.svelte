<script lang="ts">
	import {
		ZButton,
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
		{ hasChildren: true, key: 'workspace', label: 'Workspace' }
	]);
	let lazySelected = $state<readonly string[]>([]);
	let loadAttempts = $state(0);
	let pendingResolve: (() => void) | undefined;
	let pendingReject: ((error: unknown) => void) | undefined;
	let treeController = $state<ZTreeController<string> | null>(null);

	function loadChildren(
		node: TreeNode<string>,
		{ signal }: TreeLoadContext<string>
	): Promise<void> {
		loadAttempts += 1;
		return new Promise<void>((resolve, reject) => {
			const abort = (): void => reject(new DOMException('Aborted', 'AbortError'));
			signal.addEventListener('abort', abort, { once: true });
			pendingResolve = () => {
				signal.removeEventListener('abort', abort);
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

	function failLoad(): void {
		pendingReject?.(new Error('Fixture load failed'));
		pendingReject = undefined;
		pendingResolve = undefined;
	}

	function resolveLoad(): void {
		pendingResolve?.();
		pendingReject = undefined;
		pendingResolve = undefined;
	}

	function removeDocs(): void {
		lazyNodes = lazyNodes.filter((node) => node.key !== 'docs');
	}

	const virtualNodes: readonly TreeNode<string>[] = Array.from({ length: 2000 }, (_, index) => ({
		key: `virtual-${index}`,
		label: `Virtual ${index + 1}`
	}));
	let virtualSelected = $state<readonly string[]>([]);

	const selectNodes: readonly TreeNode<string>[] = [
		{ key: 'root', label: 'Root' },
		{ key: 'alpha', label: 'Alpha', parentKey: 'root' },
		{ key: 'beta', label: 'Beta', parentKey: 'root' }
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
		name="lazy-node"
		nodes={lazyNodes}
		onLoadChildren={loadChildren}
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
	<output data-testid="tree-production-output">
		{lazySelected.join(',')}:{loadAttempts}:{treeController?.activeKey ?? 'none'}
	</output>
	<button type="reset">Reset lazy tree</button>
</form>

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
			nodes={selectNodes}
		/>
	</ZField>
	<button type="reset">Reset select</button>
	<output data-testid="tree-production-select-output">
		{treeSelectValue ?? 'null'}:{treeSelectOpen}
	</output>
</form>

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
