<script lang="ts">
	import {
		ZButton,
		ZCombobox,
		ZComboboxContent,
		ZComboboxInput,
		ZComboboxItem,
		ZStack,
		ZText
	} from '@zadmin/zui';
	let value = $state<string | number>('prod');
	let inputValue = $state('生产');
	let changes = $state(0);
	let submitted = $state('尚未读取');
</script>

<form onsubmit={(event) => event.preventDefault()}>
	<ZStack gap="medium">
		<ZCombobox
			bind:inputValue
			bind:value
			defaultInputValue="生产"
			defaultValue="prod"
			name="environment"
			onValueChange={() => (changes += 1)}
		>
			<ZComboboxInput
				aria-label="搜索部署环境"
				id="environment-combobox"
				placeholder="输入环境名称"
			/>
			<ZComboboxContent ariaLabel="部署环境建议" data-testid="combobox-content">
				<ZComboboxItem textValue="开发" value="dev">开发</ZComboboxItem>
				<ZComboboxItem textValue="预发" value="staging">预发</ZComboboxItem>
				<ZComboboxItem textValue="生产" value="prod">生产</ZComboboxItem>
				<ZComboboxItem disabled textValue="归档" value="archived">归档（只读）</ZComboboxItem>
			</ZComboboxContent>
		</ZCombobox>
		<ZStack direction="row" gap="medium">
			<ZButton
				type="button"
				variant="secondary"
				onclick={(event) =>
					(submitted = String(new FormData(event.currentTarget.form!).get('environment')))}
			>
				读取FormData
			</ZButton>
			<ZButton type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted"
			>value = {value} · input = {inputValue} · 变更 = {changes} · {submitted}</ZText
		>
	</ZStack>
</form>
