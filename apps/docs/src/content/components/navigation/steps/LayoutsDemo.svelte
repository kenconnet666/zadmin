<script lang="ts">
	import { ZIcon, ZProvider, ZStack, ZSteps, ZText } from '@zadmin/zui';
	const items = [
		{ key: 'account', title: '账号认证', description: '已验证基础信息', status: 'complete' },
		{
			key: 'configuration',
			title: '部署环境参数需要修正',
			description: 'environment-variable-with-a-long-unbroken-name',
			status: 'error',
			clickable: true
		},
		{ key: 'help', title: '阅读发布说明', href: '#steps-layout-help' }
	] as const;
</script>

<ZStack gap="large">
	<ZProvider direction="rtl">
		<ZSteps {items} currentKey="configuration" aria-label="RTL配置流程" />
	</ZProvider>
	<ZSteps {items} currentKey="configuration" orientation="vertical" aria-label="纵向配置流程">
		{#snippet indicator(_item, context)}
			<ZIcon
				name={context.status === 'complete'
					? 'check'
					: context.status === 'error'
						? 'warning'
						: 'arrowRight'}
				size="medium"
			/>
		{/snippet}
		{#snippet title(item, context)}
			<span>{item.title}{context.current ? '（当前处理）' : ''}</span>
		{/snippet}
	</ZSteps>
	<ZText id="steps-layout-help" tone="muted"
		>步骤链接保留原生href与浏览器键盘行为；长标签和描述自然断行，方向来自Provider或显式dir。</ZText
	>
</ZStack>
