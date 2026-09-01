<script lang="ts">
	import { ZButton, ZInput, ZProvider, ZStack, ZText, ZTextarea } from '@zadmin/zui';
</script>

<ZProvider contrast="high" density="compact" direction="rtl" locale="ar" motion="reduced">
	<ZStack gap="medium">
		<ZText weight="semibold">嵌套高对比、紧凑、RTL、减少动画Provider</ZText>
		<ZText tone="muted">未传size的控件继承compact并解析为small；显式size始终优先。</ZText>
		<ZStack direction="row" gap="small" wrap>
			<ZButton data-testid="provider-density-button">继承紧凑密度</ZButton>
			<ZButton data-testid="provider-explicit-button" size="large" variant="secondary"
				>显式大按钮</ZButton
			>
		</ZStack>
		<ZInput
			aria-label="继承Provider密度的输入框"
			data-testid="provider-density-input"
			placeholder="继承紧凑密度"
		/>
		<ZTextarea
			aria-label="继承Provider密度的文本域"
			data-testid="provider-density-textarea"
			placeholder="Textarea与Input共享尺寸解析"
			rows={2}
		/>
	</ZStack>
</ZProvider>
