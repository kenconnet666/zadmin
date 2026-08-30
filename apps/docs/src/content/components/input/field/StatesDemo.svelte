<script lang="ts">
	import { ZField, ZInput, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZField label="紧凑字段" description="适合密集筛选栏。" size="small"
		><ZInput size="small" /></ZField
	>
	<ZField label="只读字段" readonly><ZInput readonly value="release-2026-08" /></ZField>
	<ZField label="禁用字段" disabled><ZInput disabled value="不可编辑" /></ZField>
	<ZField label="多条错误" error={['名称已存在', '只能使用小写字母']} required
		><ZInput invalid /></ZField
	>
</ZStack>
