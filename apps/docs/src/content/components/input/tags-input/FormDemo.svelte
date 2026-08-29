<script lang="ts">
	import { ZButton, ZStack, ZTagsInput, ZText } from '@zadmin/zui';
	let values = $state<readonly string[]>(['production']);
	let changes = $state(0);
	let submitted = $state('尚未读取');
</script>

<form>
	<ZStack gap="medium">
		<ZTagsInput
			addLabel="添加部署标签"
			aria-label="部署标签"
			bind:values
			defaultValues={['production']}
			name="tag"
			onValueChange={() => (changes += 1)}
			placeholder="输入后按Enter，或粘贴逗号分隔文本"
		/>
		<ZStack direction="row" gap="medium">
			<ZButton
				type="button"
				variant="secondary"
				onclick={(event) =>
					(submitted = new FormData(event.currentTarget.form!).getAll('tag').join(','))}
				>读取FormData</ZButton
			>
			<ZButton type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">values = {values.join(',')} · 变更 = {changes} · {submitted}</ZText>
	</ZStack>
</form>
