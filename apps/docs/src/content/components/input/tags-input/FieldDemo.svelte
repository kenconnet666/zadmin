<script lang="ts">
	import { ZButton, ZField, ZStack, ZTagsInput, ZText } from '@zadmin/zui';

	const formId = 'tags-input-external-form';
	let values = $state<readonly string[]>(['stable']);
	let submitted = $state('尚未读取');
</script>

<ZStack gap="medium">
	<form
		id={formId}
		onsubmit={(event) => {
			event.preventDefault();
			submitted = new FormData(event.currentTarget).getAll('labels').join(',');
		}}
	>
		<ZStack direction="row" gap="small">
			<ZButton type="submit">读取外部Form</ZButton>
			<ZButton type="reset" variant="secondary">重置外部控件</ZButton>
		</ZStack>
	</form>
	<ZField
		description="Field拥有label、name、required、invalid与尺寸。"
		error="至少保留一个生产发布标签。"
		label="发布标签"
		name="labels"
		required
		size="large"
	>
		<ZTagsInput bind:value={values} defaultValue={['stable']} form={formId} />
	</ZField>
	<ZText tone="muted">values = {values.join(',')} · submitted = {submitted}</ZText>
</ZStack>
