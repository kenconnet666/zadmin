<script lang="ts">
	import { ZButton, ZStack, ZText, ZTransfer, type TransferItem } from '@zadmin/zui';

	const items: readonly TransferItem[] = [
		{ description: '面向最终用户', key: 'production', label: '生产环境' },
		{ description: '发布前验证', key: 'staging', label: '预发环境' },
		{ description: '按需创建', key: 'preview', label: '预览环境' },
		{ description: '已冻结', disabled: true, key: 'legacy', label: '旧版环境' }
	];
	let value = $state<readonly (string | number)[]>(['staging']);
</script>

<form>
	<ZStack gap="medium">
		<ZTransfer
			aria-label="发布通道转移"
			bind:value
			defaultValue={['staging']}
			name="channel"
			{items}
			moveToSourceLabel="移回可用通道"
			moveToTargetLabel="加入已选通道"
			searchPlaceholder="筛选通道"
			sourceTitle="可用通道"
			targetTitle="已选通道"
		/>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">selected = {value.join('/') || 'none'}</ZText>
	</ZStack>
</form>
