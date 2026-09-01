<script lang="ts">
	import { ZAlert, ZButton, ZProvider, ZStack } from '@zadmin/zui';

	let rtlVisible = $state(true);
</script>

<ZProvider contrast="high">
	<ZStack gap="medium">
		<ZAlert live="off" title="高对比发布警告" tone="warning">
			边框、文字与Lucide图标共同表达状态，不只依赖背景色。
		</ZAlert>
		<ZProvider direction="rtl">
			{#if rtlVisible}
				<ZAlert
					dismissible
					live="off"
					onDismiss={() => (rtlVisible = false)}
					title="RTL خطأ في النشر"
					tone="danger"
				>
					逻辑布局让图标、正文与关闭按钮在RTL中保持正确次序。
				</ZAlert>
			{:else}
				<ZButton size="small" variant="secondary" onclick={() => (rtlVisible = true)}>
					恢复RTL Alert
				</ZButton>
			{/if}
		</ZProvider>
	</ZStack>
</ZProvider>
