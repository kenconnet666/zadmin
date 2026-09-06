<script lang="ts">
	import { ZCheckbox, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<label><ZCheckbox size="small" /> 小尺寸</label>
	<label><ZCheckbox defaultChecked tone="success" /> Success选中</label>
	<label><ZCheckbox tone="warning" /> Warning未选中</label>
	<label><ZCheckbox invalid tone="info" /> Invalid优先使用Danger</label>
	<label><ZCheckbox disabled defaultChecked size="large" /> 禁用的大尺寸</label>
</ZStack>
