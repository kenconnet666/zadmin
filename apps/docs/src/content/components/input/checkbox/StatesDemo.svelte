<script lang="ts">
	import { ZCheckbox, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<label><ZCheckbox size="small" /> 小尺寸</label>
	<label><ZCheckbox defaultChecked /> 默认选中</label>
	<label><ZCheckbox invalid /> 校验失败</label>
	<label><ZCheckbox disabled defaultChecked size="large" /> 禁用的大尺寸</label>
</ZStack>
