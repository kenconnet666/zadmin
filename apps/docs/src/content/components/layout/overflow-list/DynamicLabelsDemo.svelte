<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const itemRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.borderRadius._medium;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.paddingBlock._small;
				s.paddingInline._medium;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZButton,
		ZOverflowList,
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZStack,
		useZui
	} from '@zadmin/zui';

	let expanded = $state(false);
	let instance = $state<{ refresh(): void } | null>(null);
	let items = $state([
		{ key: 'account', label: '账户' },
		{ key: 'project', label: '项目' },
		{ key: 'notice', label: '通知' },
		{ key: 'audit', label: '审计记录' }
	]);
	let open = $state(false);
	const zui = useZui();
	const itemClass = $derived(zui.recipe(itemRecipe));

	function toggleLabels(): void {
		expanded = !expanded;
		items = items.map((item) => {
			if (item.key === 'account')
				return { ...item, label: expanded ? '含异步标签与较长描述的账户' : '账户' };
			if (item.key === 'project')
				return { ...item, label: expanded ? '等待字体加载后重新测量的项目' : '项目' };
			return item;
		});
	}
</script>

<ZStack gap="small">
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={toggleLabels}>切换标签长度</ZButton>
		<ZButton size="small" variant="outline" onclick={() => instance?.refresh()}>refresh()</ZButton>
	</ZStack>
	<ZOverflowList bind:this={instance} {items} itemKey={(item) => item.key} suspended={open}>
		{#snippet item(item)}
			<div class={itemClass}><ZButton variant="outline">{item.label}</ZButton></div>
		{/snippet}
		{#snippet overflow(state)}
			<ZPopover bind:open placement="bottom-start">
				<ZPopoverTrigger variant="outline">+{state.overflowItems.length}</ZPopoverTrigger>
				<ZPopoverContent>
					<ZStack gap="small">
						{#each state.overflowItems as item (item.key)}
							<ZButton variant="ghost">{item.label}</ZButton>
						{/each}
					</ZStack>
				</ZPopoverContent>
			</ZPopover>
		{/snippet}
	</ZOverflowList>
</ZStack>
