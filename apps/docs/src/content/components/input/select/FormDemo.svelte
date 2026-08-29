<script lang="ts">
	import {
		ZButton,
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger,
		ZStack,
		ZText
	} from '@zadmin/zui';
	let value = $state<string | number>('生产');
	let changes = $state(0);
	let submitted = $state('尚未读取');
	function read(form: HTMLFormElement): void {
		submitted = String(new FormData(form).get('environment'));
	}
</script>

<form onsubmit={(event) => event.preventDefault()}>
	<ZStack gap="medium">
		<ZSelect
			bind:value
			defaultValue="生产"
			name="environment"
			onValueChange={() => (changes += 1)}
			required
		>
			<ZSelectTrigger aria-label="部署环境" data-testid="select-trigger" />
			<ZSelectContent data-testid="select-content">
				<ZSelectItem value="开发">开发</ZSelectItem>
				<ZSelectItem value="预发">预发</ZSelectItem>
				<ZSelectItem value="生产">生产</ZSelectItem>
				<ZSelectItem disabled value="归档">归档（只读）</ZSelectItem>
			</ZSelectContent>
		</ZSelect>
		<ZStack direction="row" gap="medium">
			<ZButton
				type="button"
				variant="secondary"
				onclick={(event) => read(event.currentTarget.form!)}
			>
				读取FormData
			</ZButton>
			<ZButton type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">value = {value} · 用户变更次数 = {changes} · {submitted}</ZText>
	</ZStack>
</form>
