<script lang="ts">
	import { ZButton, ZColorPicker, ZField, ZStack, ZText } from '@zadmin/zui';

	const formId = 'color-picker-external-form';
	let value = $state<string | null>('#0f766e');
	let submitted = $state('尚未读取');
</script>

<ZStack gap="medium">
	<form
		id={formId}
		onsubmit={(event) => {
			event.preventDefault();
			submitted = String(new FormData(event.currentTarget).get('brand'));
		}}
	>
		<ZStack direction="row" gap="small">
			<ZButton type="submit">读取外部Form</ZButton>
			<ZButton type="reset" variant="secondary">重置外部控件</ZButton>
		</ZStack>
	</form>
	<ZField
		description="Field拥有label、name、required、invalid与尺寸。"
		error="请确认该颜色满足品牌对比度要求。"
		label="品牌颜色"
		name="brand"
		required
		size="large"
	>
		<ZColorPicker bind:value defaultValue="#0f766e" form={formId} />
	</ZField>
	<ZText tone="muted">value = {value} · submitted = {submitted}</ZText>
</ZStack>
