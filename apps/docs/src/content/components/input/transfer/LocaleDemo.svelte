<script lang="ts">
	import {
		ZButton,
		ZProvider,
		ZStack,
		ZText,
		ZTransfer,
		enUSLocalePack,
		zhCNLocalePack
	} from '@zadmin/zui';

	const items = [
		{ key: 'design', label: 'Design' },
		{ key: 'engineering', label: 'Engineering' },
		{ key: 'quality', label: 'Quality' }
	] as const;
	let chinese = $state(true);
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="medium">
		<ZButton variant="secondary" onclick={() => (chinese = !chinese)}>
			切换到{chinese ? '英文' : '中文'}默认文案
		</ZButton>
		<ZText tone="muted">{chinese ? 'zh-CN' : 'en-US'}</ZText>
	</ZStack>
	<ZProvider
		locale={chinese ? 'zh-CN' : 'en-US'}
		localePack={chinese ? zhCNLocalePack : enUSLocalePack}
	>
		<ZTransfer defaultValue={['quality']} {items} />
	</ZProvider>
</ZStack>
