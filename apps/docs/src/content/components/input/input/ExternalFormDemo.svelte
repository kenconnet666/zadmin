<script lang="ts">
	import { ZButton, ZForm, ZInput, ZStack, ZText } from '@zadmin/zui';
	let value = $state('external-seed');
</script>

<ZStack gap="medium">
	<ZForm id="input-external-owner">
		<ZButton type="reset" variant="secondary">重置外部表单</ZButton>
	</ZForm>
	<ZInput
		bind:value
		data-testid="input-external-control"
		defaultValue="external-seed"
		form="input-external-owner"
		name="external"
	/>
	<ZText tone="muted">external value = {value}</ZText>
</ZStack>
