<script lang="ts">
	import {
		ZButton,
		ZCheckbox,
		ZForm,
		ZFormField,
		ZInput,
		ZStack,
		ZText,
		type ZFormController
	} from '@zadmin/zui';

	let controller = $state<ZFormController | null>(null);
	let dirty = $state(false);
	let values = $state('尚未读取');
	let profileName = $state('尚未读取');

	$effect(() => {
		const current = controller;
		if (!current) return;
		dirty = current.getFieldState(['profile', 'name']).dirty;
		return current.subscribeField(['profile', 'name'], (state) => (dirty = state.dirty));
	});

	function readValues(): void {
		values = JSON.stringify(controller?.getValues());
		profileName = String(controller?.getFieldValue(['profile', 'name']) ?? 'undefined');
	}
</script>

<ZForm bind:controller>
	<ZStack gap="medium">
		<ZFormField label="显示名称" name={['profile', 'name']}>
			<ZInput defaultValue="Alice" />
		</ZFormField>
		<ZFormField label="通知" name="alerts">
			<label><ZCheckbox defaultChecked value="email" /> 邮件通知</label>
		</ZFormField>
		<ZButton type="button" onclick={readValues}>读取Native Values</ZButton>
		<ZText tone="muted">profile.name dirty={dirty ? 'true' : 'false'}</ZText>
		<ZText tone="muted">getFieldValue(profile.name)={profileName}</ZText>
		<ZText tone="muted">getValues()={values}</ZText>
	</ZStack>
</ZForm>
