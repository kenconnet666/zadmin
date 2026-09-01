<script lang="ts">
	import { ZButton, ZSegmented, ZStack, ZText } from '@zadmin/zui';
	let value = $state<string | number>('week');
	let changes = $state(0);
	const options = [
		{ label: '日', value: 'day' },
		{ label: '周', value: 'week' },
		{ label: '月', value: 'month' },
		{ disabled: true, label: '年（未开放）', value: 'year' }
	] as const;
</script>

<form>
	<ZStack gap="medium">
		<ZSegmented
			aria-label="统计周期"
			bind:value
			defaultValue="week"
			{options}
			name="period"
			onValueChange={() => (changes += 1)}
		/>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">value = {value} · 变更 = {changes}</ZText>
	</ZStack>
</form>
