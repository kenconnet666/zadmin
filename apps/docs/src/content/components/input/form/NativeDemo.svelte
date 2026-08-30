<script lang="ts">
	import { ZButton, ZForm, ZFormField, ZInput, ZStack, ZText } from '@zadmin/zui';
	let result = $state('尚未提交');
</script>

<ZForm nativeValidation onValidSubmit={(detail) => (result = String(detail.formData.get('slug')))}>
	<ZStack gap="medium">
		<ZFormField label="发布标识" name="slug" required>
			<ZInput name="slug" pattern="[a-z0-9-]+" placeholder="release-2026-08" required />
		</ZFormField>
		<ZButton type="submit">使用原生约束提交</ZButton>
		<ZText tone="muted">result = {result}</ZText>
	</ZStack>
</ZForm>
