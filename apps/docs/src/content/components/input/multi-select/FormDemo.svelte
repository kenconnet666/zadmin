<script lang="ts">
	import {
		ZButton,
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectItem,
		ZMultiSelectTrigger,
		ZStack,
		ZText
	} from '@zadmin/zui';

	let value = $state<readonly (string | number)[]>(['开发', '生产']);
	let changes = $state(0);
	let submitted = $state('尚未读取');
</script>

<form onsubmit={(event) => event.preventDefault()}>
	<ZStack gap="medium">
		<ZMultiSelect
			bind:value
			defaultValue={['开发', '生产']}
			name="environment"
			onValueChange={() => (changes += 1)}
		>
			<ZMultiSelectTrigger aria-label="部署环境" data-testid="multi-select-trigger" />
			<ZMultiSelectContent data-testid="multi-select-content">
				<ZMultiSelectItem value="开发">开发</ZMultiSelectItem>
				<ZMultiSelectItem value="预发">预发</ZMultiSelectItem>
				<ZMultiSelectItem value="生产">生产</ZMultiSelectItem>
				<ZMultiSelectItem disabled value="归档">归档（只读）</ZMultiSelectItem>
			</ZMultiSelectContent>
		</ZMultiSelect>
		<ZStack direction="row" gap="medium">
			<ZButton
				type="button"
				variant="secondary"
				onclick={(event) =>
					(submitted = new FormData(event.currentTarget.form!).getAll('environment').join(','))}
				>读取FormData
			</ZButton>
			<ZButton type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">value = {value.join(',')} · 变更 = {changes} · {submitted}</ZText>
	</ZStack>
</form>
