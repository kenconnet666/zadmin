<script lang="ts">
	import { ZButton, ZStack, ZText, ZToggleGroup, ZToolbar, ZToolbarItem } from '@zadmin/zui';

	const items = [
		{ value: 'bold', label: '粗体' },
		{ value: 'italic', label: '斜体' },
		{ value: 'underline', label: '下划线' }
	] as const;
	const readonlyItems = [...items, { value: 'strike', label: '禁用', disabled: true }] as const;
	let first = $state<readonly (typeof items)[number]['value'][]>(['bold']);
	let second = $state<readonly (typeof readonlyItems)[number]['value'][]>([]);
</script>

<ZStack gap="small" style="max-width: 390px;">
	<ZText weight="semibold">Toolbar内的独立ToggleGroup</ZText>
	<ZToolbar aria-label="文字格式工具" orientation="vertical" gap="small">
		<ZToolbarItem value="back">
			{#snippet children(props)}
				<ZButton {...props} variant="outline">前一个</ZButton>
			{/snippet}
		</ZToolbarItem>
		<ZToggleGroup bind:value={first} {items} selectionMode="multiple" aria-label="可编辑格式" />
		<ZToggleGroup
			bind:value={second}
			items={readonlyItems}
			selectionMode="multiple"
			readonly
			aria-label="只读格式"
		/>
		<ZToolbarItem value="forward">
			{#snippet children(props)}
				<ZButton {...props} variant="outline">后一个</ZButton>
			{/snippet}
		</ZToolbarItem>
	</ZToolbar>
	<ZText tone="muted">
		第一组：[{first.join(', ')}]；第二组：[{second.join(
			', '
		)}]。两组使用相同value但状态互不共享；Toolbar焦点移动不会改变pressed值，第二组readonly仍可浏览，禁用项跳过。
	</ZText>
</ZStack>
