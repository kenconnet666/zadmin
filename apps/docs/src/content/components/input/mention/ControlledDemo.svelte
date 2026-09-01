<script lang="ts">
	import { ZButton, ZMention, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ key: 'alice', label: 'Alice', value: 'alice' },
		{ key: 'bob', label: 'Bob', value: 'bob' }
	];
	let value = $state('Review @alice ');
	let readonly = $state(false);
	let changes = $state(0);
</script>

<ZStack gap="medium">
	<ZMention
		aria-label="受控Mention"
		bind:value
		{items}
		onValueChange={() => (changes += 1)}
		{readonly}
	/>
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={() => (value = '')} variant="secondary">外部清空</ZButton>
		<ZButton onclick={() => (value = 'Notify @')} variant="secondary">外部替换文本</ZButton>
		<ZButton onclick={() => (readonly = !readonly)} variant="secondary">切换Readonly</ZButton>
	</ZStack>
	<ZText tone="muted"
		>value = {value || 'empty'} · readonly = {readonly} · 用户变更 = {changes}</ZText
	>
</ZStack>
