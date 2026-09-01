<script lang="ts">
	import { ZDescriptionList, ZEmpty, ZStack, ZText } from '@zadmin/zui';
	const items = [{ key: 'version', term: '版本', description: 'v2.4.0' }];
</script>

<ZStack gap="large">
	<ZStack gap="small">
		<ZText weight="semibold">默认空状态</ZText>
		<ZDescriptionList aria-label="空元数据" emptyText="没有元数据" items={[]} />
	</ZStack>
	<ZStack gap="small">
		<ZText weight="semibold">自定义空状态</ZText>
		<ZDescriptionList aria-label="空配置" items={[]}>
			{#snippet empty()}<ZEmpty title="尚未配置">保存配置后将在此展示。</ZEmpty>{/snippet}
		</ZDescriptionList>
	</ZStack>
	<ZStack gap="small">
		<ZText weight="semibold">加载中</ZText>
		<ZDescriptionList aria-label="正在加载元数据" {items} loading loadingCount={2} />
	</ZStack>
</ZStack>
