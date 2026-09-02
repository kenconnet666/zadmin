<script lang="ts">
	import { onDestroy } from 'svelte';
	import { createToastQueue, ZButton, ZProvider, ZToaster } from '../src/entrypoints/index.js';

	const queue = createToastQueue({ maxVisible: 4 });
	let portalTarget = $state<HTMLDivElement | null>(null);
	let resolveOld: (value: string) => void = () => undefined;
	let resolveNew: (value: string) => void = () => undefined;
	const snapshot = $derived(
		queue.items
			.map((item) => `${item.id}:${item.title}:${item.tone}:${item.priority}:${item.phase}`)
			.join('|')
	);

	function addUpdateTarget(): void {
		queue.push({
			actionLabel: 'Review',
			description: 'Preserve this description',
			duration: null,
			id: 'update-target',
			title: 'Initial title'
		});
	}
	function addOverflow(): void {
		for (let index = 1; index <= 5; index += 1) {
			queue.push({ duration: null, id: `fifo-${index}`, title: `FIFO ${index}` });
		}
	}
	function addTimed(): void {
		queue.push({ duration: 100, id: 'timed', title: 'Timed notification' });
	}
	function startTasks(): void {
		const oldTask = new Promise<string>((resolve) => (resolveOld = resolve));
		const newTask = new Promise<string>((resolve) => (resolveNew = resolve));
		const stages = {
			error: 'Task failed',
			id: 'task-target',
			loading: 'Task loading',
			success: (value: string) => `Task ready ${value}`
		} as const;
		queue.task(oldTask, stages);
		queue.task(newTask, stages);
	}

	onDestroy(() => queue.dispose());
</script>

<ZButton data-testid="toast-add-update" onclick={addUpdateTarget}>Add update target</ZButton>
<ZButton data-testid="toast-add-overflow" onclick={addOverflow}>Add FIFO overflow</ZButton>
<ZButton data-testid="toast-add-timed" onclick={addTimed}>Add timed notification</ZButton>
<ZButton
	data-testid="toast-update"
	onclick={() => queue.update('update-target', { title: 'Updated title', tone: 'success' })}
	>Update target</ZButton
>
<ZButton data-testid="toast-start-tasks" onclick={startTasks}>Start tasks</ZButton>
<ZButton data-testid="toast-resolve-new" onclick={() => resolveNew('new')}>Resolve new</ZButton>
<ZButton data-testid="toast-resolve-old" onclick={() => resolveOld('old')}>Resolve old</ZButton>
<ZButton
	data-testid="toast-add-alert"
	onclick={() =>
		queue.push({ duration: null, id: 'critical-one', title: 'Critical one', tone: 'danger' })}
	>Add critical one</ZButton
>
<ZButton
	data-testid="toast-update-alert"
	onclick={() => queue.update('critical-one', { title: 'Critical one updated' })}
	>Update critical one</ZButton
>
<ZButton
	data-testid="toast-add-second-alert"
	onclick={() =>
		queue.push({ duration: null, id: 'critical-two', title: 'Critical two', tone: 'danger' })}
	>Add critical two</ZButton
>
<ZButton
	data-testid="toast-add-success"
	onclick={() => queue.push({ duration: null, id: 'success', title: 'Saved', tone: 'success' })}
	>Add success</ZButton
>
<output data-testid="toast-production-output">{snapshot}</output>
<div bind:this={portalTarget} data-testid="toast-production-portal"></div>
<ZProvider portalContainer={portalTarget}>
	<ZToaster {queue} maxVisible={4} label="Production notifications" />
</ZProvider>
