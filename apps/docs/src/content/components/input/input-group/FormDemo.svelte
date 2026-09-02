<script lang="ts">
	import { ZButton, ZField, ZInput, ZInputGroup, ZStack, ZText } from '@zadmin/zui';

	let value = $state('api');
</script>

<form>
	<ZStack gap="medium">
		<ZField
			label="服务地址"
			description="Field label、name、required和size由Group投射给唯一真实input。"
			name="host"
			required
			size="large"
		>
			<ZInputGroup>
				{#snippet prefix()}<ZText tone="muted">https://</ZText>{/snippet}
				<ZInput bind:value defaultValue="api" />
				{#snippet suffix()}<ZText tone="muted">.internal</ZText>{/snippet}
			</ZInputGroup>
		</ZField>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">url = https://{value || 'empty'}.internal</ZText>
	</ZStack>
</form>
