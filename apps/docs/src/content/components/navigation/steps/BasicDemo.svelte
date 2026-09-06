<script lang="ts">
	import { ZStack, ZSteps, ZText, type StepsItem } from '@zadmin/zui';
	const items = [
		{
			key: 'profile',
			title: '基础信息',
			description: '已确认负责人和项目名称',
			status: 'complete',
			icon: 'user'
		},
		{ key: 'configure', title: '部署配置', description: '正在填写环境参数', icon: 'sliders' },
		{ key: 'publish', title: '发布服务', description: '等待配置完成' }
	] as const satisfies readonly StepsItem[];
</script>

<ZStack gap="medium">
	<ZSteps {items} currentKey="configure" aria-label="服务发布流程" />
	<ZText tone="muted">这些步骤用于说明进度；没有clickable或href，因此不会产生额外Tab停靠点。</ZText>
</ZStack>
