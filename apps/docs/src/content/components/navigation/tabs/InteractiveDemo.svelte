<script lang="ts">
	import { ZTabs, ZTabsList, ZTabsPanel, ZTabsTrigger, ZText } from '@zadmin/zui';

	let value = $state('overview');
	let changes = $state(0);
</script>

<ZTabs bind:value defaultValue="overview" onValueChange={() => (changes += 1)}>
	<ZTabsList aria-label="服务视图">
		<ZTabsTrigger value="overview">概览</ZTabsTrigger>
		<ZTabsTrigger value="metrics">指标</ZTabsTrigger>
		<ZTabsTrigger disabled value="legacy">旧版</ZTabsTrigger>
		<ZTabsTrigger value="events">事件</ZTabsTrigger>
	</ZTabsList>
	<ZTabsPanel value="overview">生产服务运行正常，最近部署没有回滚。</ZTabsPanel>
	<ZTabsPanel value="metrics">P95延迟为82ms，错误率为0.03%。</ZTabsPanel>
	<ZTabsPanel value="legacy">不可访问的旧版内容。</ZTabsPanel>
	<ZTabsPanel value="events">最近24小时记录了18个部署事件。</ZTabsPanel>
</ZTabs>
<ZText tone="muted">value = {value} · 用户变更次数 = {changes}</ZText>
