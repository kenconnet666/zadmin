<script lang="ts">
	import { ZField, ZFieldset, ZInput, ZNativeSelect } from '@zadmin/zui';

	const regions = [
		{ label: '华北', value: 'north' },
		{ label: '华东', value: 'east' }
	] as const;
</script>

<ZFieldset legend="部署目标" description="fieldset命名整个组，每个值控件仍由自己的Field命名。">
	<ZField label="服务名称" name="service" required>
		<ZInput defaultValue="gateway" />
	</ZField>
	<ZField label="区域" name="region">
		<ZNativeSelect aria-label="部署区域" items={regions} defaultValue="east" />
	</ZField>
</ZFieldset>
