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
		ZText,
		useZui
	} from '@zadmin/zui';

	let width = $state(320);
	let items = $state([
		{ key: 'account', label: '账户', selected: false },
		{ key: 'project', label: '项目', selected: false },
		{ key: 'notice', label: '通知', selected: false },
		{ key: 'audit', label: '审计', selected: false },
		{ key: 'billing', label: '账单', selected: false },
		{ key: 'integration', label: '集成', selected: false },
		{ key: 'archive', label: '归档', selected: false }
	]);
	let open = $state(false);
	const zui = useZui();
	const itemClass = $derived(zui.recipe(itemRecipe));

	function toggle(key: string): void {
		items = items.map((item) => (item.key === key ? { ...item, selected: !item.selected } : item));
	}
</script>

<ZStack gap="small">
	<ZText weight="semibold">拖动宽度或使用按钮观察拆分</ZText>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={() => (width = 320)}>窄 320px</ZButton>
		<ZButton size="small" variant="outline" onclick={() => (width = 640)}>宽 640px</ZButton>
		<ZText tone="muted">当前 {width}px</ZText>
	</ZStack>
	<div style={`width: ${width}px; max-width: 100%; resize: horizontal; overflow: auto;`}>
		<ZOverflowList {items} itemKey={(item) => item.key} suspended={open}>
			{#snippet item(item)}
				<div class={itemClass}>
					<ZButton
						size="small"
						variant={item.selected ? 'solid' : 'outline'}
						onclick={() => toggle(item.key)}
					>
						{item.label}
					</ZButton>
				</div>
			{/snippet}
			{#snippet overflow(state)}
				<ZPopover bind:open placement="bottom-start">
					<ZPopoverTrigger variant="outline">+{state.overflowItems.length} 项</ZPopoverTrigger>
					<ZPopoverContent>
						<ZStack gap="small">
							{#each state.overflowItems as item (item.key)}
								<ZButton variant="ghost" onclick={() => toggle(item.key)}>{item.label}</ZButton>
							{/each}
						</ZStack>
					</ZPopoverContent>
				</ZPopover>
			{/snippet}
		</ZOverflowList>
	</div>
</ZStack>
