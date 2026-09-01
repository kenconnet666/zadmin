<script lang="ts">
	import {
		ZButton,
		ZCascader,
		ZField,
		ZProvider,
		type SelectionKey,
		type TreeLoadContext,
		type TreeNode
	} from '../src/entrypoints/index.js';

	let {
		direction = 'ltr',
		mode = 'main'
	}: { direction?: 'ltr' | 'rtl'; mode?: 'lazy' | 'main' | 'virtual' } = $props();
	const mainNodes: readonly TreeNode[] = [
		{ key: 'root', label: 'Root' },
		{ key: 1, label: 'Numeric one', parentKey: 'root' },
		{ key: '1', label: 'String one', parentKey: 'root' },
		{ disabled: true, key: 'disabled', label: 'Disabled leaf', parentKey: 'root' }
	];
	const virtualNodes: readonly TreeNode[] = [
		{ key: 'services', label: 'Services' },
		...Array.from({ length: 1000 }, (_, index) => ({
			key: `service-${index}`,
			label: `Service ${String(index).padStart(4, '0')}`,
			parentKey: 'services'
		}))
	];
	let value = $state<readonly SelectionKey[]>(['root', 1]);
	let virtualValue = $state<readonly SelectionKey[]>([]);
	let changes = $state(0);
	let lazyNodes = $state<readonly TreeNode[]>([
		{ hasChildren: true, key: 'remote', label: 'Remote' }
	]);
	let pending = $state<
		| {
				readonly complete: () => void;
				readonly fail: () => void;
		  }
		| undefined
	>();
	let attempts = $state(0);
	let aborted = $state(0);
	let errors = $state(0);

	function loadChildren(node: TreeNode, { signal }: TreeLoadContext<SelectionKey>): Promise<void> {
		attempts += 1;
		return new Promise((resolve, reject) => {
			const cleanup = () => signal.removeEventListener('abort', abort);
			const abort = () => {
				cleanup();
				aborted += 1;
				pending = undefined;
				reject(new Error('aborted'));
			};
			signal.addEventListener('abort', abort, { once: true });
			pending = {
				complete: () => {
					cleanup();
					lazyNodes = [
						...lazyNodes,
						{ key: 'remote-leaf', label: 'Remote leaf', parentKey: node.key }
					];
					pending = undefined;
					resolve();
				},
				fail: () => {
					cleanup();
					pending = undefined;
					reject(new Error('failed'));
				}
			};
		});
	}
</script>

<ZProvider {direction}>
	{#if mode === 'main'}
		<form id="cascader-production-form" data-testid="cascader-production-form">
			<ZButton type="reset">Reset</ZButton>
		</form>
		<ZField label="Deployment path" name="path" required>
			<ZCascader
				bind:value
				data-testid="cascader-production"
				defaultValue={['root', 1]}
				form="cascader-production-form"
				nodes={mainNodes}
				onValueChange={() => (changes += 1)}
				searchable
				searchPlaceholder="Filter paths"
			/>
		</ZField>
		<ZButton data-testid="cascader-owner-clear" onclick={() => (value = [])}>Owner clear</ZButton>
		<output data-testid="cascader-production-output">
			{value.join('/')}:{value.length ? typeof value.at(-1) : 'empty'}:{changes}
		</output>
	{:else if mode === 'lazy'}
		<ZCascader
			data-testid="cascader-lazy"
			defaultOpen
			nodes={lazyNodes}
			onLoadChildren={loadChildren}
			onLoadError={() => (errors += 1)}
		/>
		<ZButton
			data-testid="cascader-lazy-complete"
			disabled={!pending}
			onclick={() => pending?.complete()}
		>
			Complete
		</ZButton>
		<ZButton data-testid="cascader-lazy-fail" disabled={!pending} onclick={() => pending?.fail()}>
			Fail
		</ZButton>
		<ZButton
			data-testid="cascader-lazy-remove"
			onclick={() =>
				(lazyNodes = lazyNodes.filter(
					({ key, parentKey }) => key !== 'remote' && parentKey !== 'remote'
				))}
		>
			Remove
		</ZButton>
		<output data-testid="cascader-lazy-output"
			>{attempts}:{aborted}:{errors}:{Boolean(pending)}</output
		>
	{:else}
		<ZCascader
			bind:value={virtualValue}
			data-testid="cascader-virtual"
			defaultOpen
			nodes={virtualNodes}
			virtual
			virtualHeight={240}
			virtualItemSize={36}
		/>
		<output data-testid="cascader-virtual-output">{virtualValue.join('/')}</output>
	{/if}
</ZProvider>
