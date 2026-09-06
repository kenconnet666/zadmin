<script lang="ts">
	import { ZButton, ZField, ZRating, ZStack, ZText } from '@zadmin/zui';

	let readonlyValue = $state(4);
	let output = $state('尚未读取');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		output = [...data.entries()].map(([name, value]) => `${name}=${value}`).join(', ');
	}
</script>

<form onreset={() => (output = '已重置')} onsubmit={submit}>
	<ZStack gap="medium">
		<ZField label="只读评分" name="kept" readonly>
			<ZRating bind:value={readonlyValue} defaultValue={4} itemLabel={(value) => `${value}星`} />
		</ZField>
		<ZField label="禁用评分" name="omitted" disabled>
			<ZRating defaultValue={2} itemLabel={(value) => `${value}星`} />
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="button" onclick={() => (readonlyValue = 3)}>Owner设为3星</ZButton>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="outline">重置</ZButton>
		</ZStack>
		<ZText tone="muted">只读值={readonlyValue} · {output || '无FormData字段'}</ZText>
	</ZStack>
</form>
