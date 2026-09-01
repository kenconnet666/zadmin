<script lang="ts">
	import { ZBox, ZButton, ZField, ZStack, ZText, ZTextarea } from '@zadmin/zui';

	let height = $state(0);
	let narrow = $state(false);
	let visible = $state(true);
	let value = $state(
		'Autosize会合并快速输入，并在容器宽度或字体完成加载后重新测量。\n超过五行后固定高度并启用内部滚动。'
	);
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={() => (narrow = !narrow)} variant="secondary">
			{narrow ? '切换为宽容器' : '切换为窄容器'}
		</ZButton>
		<ZButton onclick={() => (visible = !visible)} variant="secondary">
			{visible ? '隐藏' : '重新显示'}
		</ZButton>
	</ZStack>
	<ZBox hidden={!visible} style={`max-width: ${narrow ? '20rem' : '42rem'}`}>
		<ZField description="隐藏时不做零宽测量；重新可见后由ResizeObserver恢复。" label="有界Autosize">
			<ZTextarea
				autosize={{ minRows: 2, maxRows: 5 }}
				bind:value
				onResize={(next) => (height = Math.round(next))}
				placeholder="输入多行内容"
				rows={2}
			/>
		</ZField>
	</ZBox>
	<ZText tone="muted">最近一次可见高度：{height || '等待测量'}{height ? 'px' : ''}</ZText>
</ZStack>
