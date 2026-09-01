<script lang="ts">
	import { ZCascader, ZField, ZProvider, ZStack } from '@zadmin/zui';
	const nodes = [
		{ key: 'cn', label: '中国' },
		{ key: 'east', label: '华东', parentKey: 'cn' },
		{ key: 'shanghai', label: '上海', parentKey: 'east' }
	];
</script>

<ZStack gap="medium">
	<ZField label="只读区域" name="readonly-region" readonly size="small">
		<ZCascader {nodes} defaultValue={['cn', 'east', 'shanghai']} separator=" / " />
	</ZField>
	<ZField error="区域同步尚未完成。" label="加载中的区域" size="large">
		<ZCascader {nodes} loading placeholder="正在同步区域" />
	</ZField>
	<ZField disabled label="禁用区域">
		<ZCascader {nodes} defaultValue={['cn', 'east', 'shanghai']} />
	</ZField>
	<ZProvider direction="rtl">
		<ZField label="RTL区域">
			<ZCascader {nodes} defaultValue={['cn', 'east', 'shanghai']} />
		</ZField>
	</ZProvider>
</ZStack>
