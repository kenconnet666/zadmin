<script lang="ts">
	import { ZCascader, ZStack } from '@zadmin/zui';
	const nodes = [
		{ key: 'cn', label: '中国' },
		{ key: 'east', label: '华东', parentKey: 'cn' },
		{ key: 'shanghai', label: '上海', parentKey: 'east' }
	];
</script>

<ZStack gap="medium">
	<ZCascader {nodes} placeholder="选择区域" separator=" › " />
	<ZCascader {nodes} disabled defaultValue={['cn', 'east', 'shanghai']} separator=" › " />
</ZStack>
