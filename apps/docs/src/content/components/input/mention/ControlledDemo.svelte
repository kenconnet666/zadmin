<script lang="ts">
	import { ZButton, ZField, ZMention, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ key: 'alice', label: 'Alice', value: 'alice' },
		{ key: 'bob', label: 'Bob', value: 'bob' }
	];
	let value = $state('Review @alice ');
	let readonly = $state(false);
	let disabled = $state(false);
	let changes = $state(0);
	let resets = $state(0);
	const formId = $props.id();
</script>

<ZStack gap="medium">
	<form id={formId}>
		<ZField label="受控 Mention" {disabled} {readonly} name="comment">
			<ZMention
				aria-label="受控Mention"
				bind:value
				defaultValue="Review @alice "
				{items}
				onFormReset={() => (resets += 1)}
				onValueChange={() => (changes += 1)}
			/>
		</ZField>
	</form>
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={() => (value = '')} variant="secondary">外部清空</ZButton>
		<ZButton onclick={() => (value = 'Notify @')} variant="secondary">外部替换文本</ZButton>
		<ZButton onclick={() => (readonly = !readonly)} variant="secondary">切换Readonly</ZButton>
		<ZButton onclick={() => (disabled = !disabled)} variant="secondary">切换Disabled</ZButton>
		<ZButton form={formId} type="reset" variant="secondary">重置表单</ZButton>
	</ZStack>
	<ZText tone="muted"
		>value = {value || 'empty'} · readonly = {readonly} · disabled = {disabled} · 用户变更 = {changes}
		· 重置 = {resets}</ZText
	>
</ZStack>
