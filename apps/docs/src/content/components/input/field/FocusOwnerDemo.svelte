<script lang="ts">
	import {
		ZField,
		ZLink,
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger,
		ZStack,
		ZText,
		type SelectionKey
	} from '@zadmin/zui';

	let focused = $state(false);
	let value = $state<SelectionKey>('production');
</script>

<ZStack gap="medium">
	<ZField
		controlId="field-focus-owner-trigger"
		description="点击上方标签后，Field会把焦点交给复合控件注册的唯一trigger。"
		name="environment"
		required
	>
		{#snippet label()}
			部署环境 · <ZLink href="#/guides/accessibility" size="small">标签与焦点说明</ZLink>
		{/snippet}
		<ZSelect bind:value>
			<ZSelectTrigger onblur={() => (focused = false)} onfocus={() => (focused = true)} />
			<ZSelectContent>
				<ZSelectItem value="development">开发环境</ZSelectItem>
				<ZSelectItem value="staging">预发环境</ZSelectItem>
				<ZSelectItem value="production">生产环境</ZSelectItem>
			</ZSelectContent>
		</ZSelect>
	</ZField>
	<ZText aria-live="polite" tone="muted">
		trigger焦点 = {focused ? '已获得' : '未获得'} · value = {String(value)}
	</ZText>
</ZStack>
