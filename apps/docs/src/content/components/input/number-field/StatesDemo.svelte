<script lang="ts">
	import { ZNumberField, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZNumberField
		defaultValue={1280.5}
		formatOptions={{ style: 'currency', currency: 'CNY' }}
		inputLabel="预算"
		locale="zh-CN"
		step={100}
	/>
	<ZNumberField defaultValue={50} inputLabel="只读比例" max={100} min={0} readonly />
	<ZNumberField allowOutOfRange defaultValue={120} inputLabel="越界比例" max={100} min={0} />
	<ZNumberField defaultValue={4} disabled inputLabel="禁用副本数" />
</ZStack>
