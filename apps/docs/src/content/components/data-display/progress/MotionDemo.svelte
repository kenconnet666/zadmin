<script lang="ts">
	import { ZProgress, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZStack align="center" direction="row" gap="large" wrap>
		<ZProgress indeterminateText="正在等待构建节点" label="构建队列" view="circle" />
		<ZProgress indeterminateText="正在等待制品" label="制品队列" />
	</ZStack>
	<ZProvider motion="reduced">
		<ZStack align="center" direction="row" gap="large" wrap>
			<ZProgress indeterminateText="减少动画等待" label="减少动画圆环" view="circle" />
			<ZProgress label="减少动画确定值" value={62} view="circle" />
		</ZStack>
	</ZProvider>
	<ZText tone="muted">value缺失才是不确定；reduced motion下圆形SVG保持静态且语义不变。</ZText>
</ZStack>
