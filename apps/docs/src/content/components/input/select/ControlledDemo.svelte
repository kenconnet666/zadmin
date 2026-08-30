<script lang="ts">
	import {
		ZButton,
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger,
		ZStack,
		ZText,
		type SelectionKey
	} from '@zadmin/zui';

	const labels: Readonly<Record<string, string>> = {
		dev: '开发环境',
		prod: '生产环境',
		staging: '预发环境'
	};
	let open = $state(false);
	let value = $state<SelectionKey>('prod');
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" align="center" wrap>
		<ZButton type="button" variant="secondary" onclick={() => (open = !open)}
			>{open ? '由外部关闭' : '由外部打开'}</ZButton
		>
		<ZSelect bind:open bind:value valueLabel={(key) => labels[String(key)] ?? String(key)}>
			<ZSelectTrigger aria-label="受控部署环境" />
			<ZSelectContent>
				<ZSelectItem textValue="开发环境" value="dev">开发环境</ZSelectItem>
				<ZSelectItem textValue="预发环境" value="staging">预发环境</ZSelectItem>
				<ZSelectItem textValue="生产环境" value="prod">生产环境</ZSelectItem>
			</ZSelectContent>
		</ZSelect>
	</ZStack>
	<ZText tone="muted"
		>open = {open} · value = {String(value)} · label = {labels[String(value)]}</ZText
	>
</ZStack>
