<script lang="ts">
	import { ZColorPicker, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZColorPicker defaultValue="#16a34a" triggerLabel={(value) => `品牌绿色 ${value}`} />
	<ZColorPicker
		allowAlpha
		defaultValue="#dc262680"
		triggerLabel={(value) => `半透明危险色 ${value}`}
	/>
	<ZColorPicker disabled defaultValue="#64748b" triggerLabel={(value) => `锁定颜色 ${value}`} />
</ZStack>
