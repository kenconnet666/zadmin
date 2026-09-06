<script lang="ts">
	import { ZButton, ZSplitter, ZStack, ZText } from '@zadmin/zui';

	const panels = [
		{ key: 'files', label: '文件', min: '10rem', collapsible: true, collapsedSize: '2.5rem' },
		{ key: 'work', label: '工作区', min: '35%' },
		{ key: 'details', label: '详情', min: '8rem', collapsible: true, collapsedSize: '2.5rem' }
	] as const;
	let instance = $state<{
		collapse(key: string): void;
		expand(key: string): void;
		reset(): void;
	} | null>(null);
	let action = $state('尚未操作');

	function run(label: string, callback: () => void): void {
		callback();
		action = label;
	}
</script>

<ZStack gap="small" style="max-width: 100%;">
	<ZText weight="semibold">实例方法控制折叠与恢复</ZText>
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			size="small"
			variant="outline"
			onclick={() => run('collapse(files)', () => instance?.collapse('files'))}>折叠文件</ZButton
		>
		<ZButton
			size="small"
			variant="outline"
			onclick={() => run('expand(files)', () => instance?.expand('files'))}>恢复文件</ZButton
		>
		<ZButton size="small" variant="outline" onclick={() => run('reset()', () => instance?.reset())}
			>Reset</ZButton
		>
	</ZStack>
	<ZSplitter
		bind:this={instance}
		{panels}
		defaultSizes={[25, 50, 25]}
		style="width: 100%; max-width: 100%; height: 17rem;"
	>
		{#snippet panel(panel)}
			<div style="padding: 0.75rem; min-width: 0; overflow-wrap: anywhere;">
				<ZText weight="semibold">{panel.label}</ZText>
				<ZText tone="muted">{action}；折叠面板仍由同一个panel snippet拥有内容。</ZText>
			</div>
		{/snippet}
	</ZSplitter>
</ZStack>
