<script lang="ts">
	import { ZButton, ZField, ZStack, ZText, ZTextarea } from '@zadmin/zui';

	const formId = 'textarea-external-form';
	let result = $state('尚未提交');
	let value = $state('生产变更说明');

	function handleSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }): void {
		event.preventDefault();
		result = String(new FormData(event.currentTarget).get('description'));
	}
</script>

<ZStack gap="medium">
	<form id={formId} onsubmit={handleSubmit}>
		<ZStack direction="row" gap="small" wrap>
			<ZButton type="submit">读取FormData</ZButton>
			<ZButton type="reset" variant="secondary">重置外部控件</ZButton>
		</ZStack>
	</form>
	<ZField
		description="textarea位于form DOM之外，通过原生form属性加入提交与可取消reset。"
		label="变更说明"
		required
	>
		<ZTextarea
			bind:value
			defaultValue="生产变更说明"
			form={formId}
			name="description"
			onFormReset={() => (result = '已恢复默认值')}
			placeholder="逐行描述变更"
			rows={3}
		/>
	</ZField>
	<ZText tone="muted">binding：{value.replaceAll('\n', ' / ')}</ZText>
	<ZText tone="muted">提交结果：{result}</ZText>
</ZStack>
