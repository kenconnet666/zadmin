<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import Star from '@lucide/svelte/icons/star';
	import { ZStack, ZText, ZToggleButton } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZStack align="center" direction="row" gap="small">
		<ZToggleButton aria-label="收藏" shape="square" title="收藏">
			<Star aria-hidden="true" size={16} />
		</ZToggleButton>
		<ZToggleButton aria-label="订阅通知" defaultPressed shape="circle" title="订阅通知">
			<Bell aria-hidden="true" size={16} />
		</ZToggleButton>
	</ZStack>
	<ZText tone="muted">图标切换按钮使用Lucide并提供aria-label；title只是可选视觉提示。</ZText>
</ZStack>
