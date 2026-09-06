<script lang="ts">
	import {
		ZStack,
		ZTabs,
		ZTabsList,
		ZTabsTrigger,
		ZTabsPanel,
		type ZControlSize
	} from '../src/entrypoints/index.js';
	let {
		size = 'medium',
		orientation = 'horizontal'
	}: {
		size?: ZControlSize;
		orientation?: 'horizontal' | 'vertical';
	} = $props();
</script>

<div
	style="display:grid;grid-template-columns:minmax(0,1fr);width:280px;"
	data-testid="tabs-boundary"
>
	<ZStack gap="small">
		<ZStack direction="row" gap="small">
			<ZTabs {size} {orientation} defaultValue="overview" data-testid="bounded-tabs">
				<ZTabsList aria-label="Long labels in a bounded layout">
					<ZTabsTrigger value="overview">概览</ZTabsTrigger>
					<ZTabsTrigger value="history">不会被压缩换行的完整发布记录标签和额外发布说明</ZTabsTrigger
					>
					<ZTabsTrigger value="settings">设置</ZTabsTrigger>
				</ZTabsList>
				<ZTabsPanel value="overview">Overview</ZTabsPanel>
				<ZTabsPanel value="history">History</ZTabsPanel>
				<ZTabsPanel value="settings">Settings</ZTabsPanel>
			</ZTabs>
		</ZStack>
	</ZStack>
</div>
