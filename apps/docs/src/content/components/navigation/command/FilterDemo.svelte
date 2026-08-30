<script lang="ts">
	import { ZCommand, ZStack, ZText } from '@zadmin/zui';
	const items = [
		{ key: 'build', label: '构建组件库', keywords: ['ci'] },
		{ key: 'bundle', label: '检查Bundle', keywords: ['size'] },
		{ key: 'browser', label: '打开浏览器', keywords: ['chrome'] }
	];
	let escaped = $state(0);
</script>

<ZStack gap="medium">
	<ZCommand
		defaultQuery="b"
		emptyText="没有前缀匹配"
		filter={(item, query) => item.label.toLocaleLowerCase().startsWith(query.toLocaleLowerCase())}
		inputLabel="按前缀过滤命令"
		{items}
		listLabel="最多两个命令"
		loop={false}
		maxResults={2}
		onEscape={() => (escaped += 1)}
	/>
	<ZText tone="muted">Escape次数 = {escaped}</ZText>
</ZStack>
