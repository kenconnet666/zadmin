<script lang="ts">
	import {
		ZButton,
		ZPagination,
		ZProvider,
		ZStack,
		ZText,
		enUSLocalePack,
		zhCNLocalePack
	} from '@zadmin/zui';

	let chinese = $state(true);
</script>

<ZStack gap="medium">
	<ZButton variant="secondary" onclick={() => (chinese = !chinese)}>
		切换到{chinese ? '英文' : '中文'}组件文案
	</ZButton>
	<ZProvider
		locale={chinese ? 'zh-CN' : 'en-US'}
		localePack={chinese ? zhCNLocalePack : enUSLocalePack}
		timeZone={chinese ? 'Asia/Shanghai' : 'America/New_York'}
	>
		<ZStack gap="small">
			<ZText tone="muted">locale = {chinese ? 'zh-CN' : 'en-US'}</ZText>
			<ZText tone="muted">timeZone = {chinese ? 'Asia/Shanghai' : 'America/New_York'}</ZText>
			<ZPagination defaultPage={3} totalPages={8} />
		</ZStack>
	</ZProvider>
</ZStack>
