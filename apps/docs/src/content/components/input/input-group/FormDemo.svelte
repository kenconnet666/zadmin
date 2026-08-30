<script lang="ts">
	import { ZButton, ZField, ZInput, ZInputGroup, ZStack, ZText } from '@zadmin/zui';

	let value = $state('api');
</script>

<form>
	<ZStack gap="medium">
		<ZField label="服务地址" description="prefix和suffix与真实input共享一个focus边界。" required>
			<ZInputGroup aria-label="服务地址组合">
				{#snippet prefix()}<ZText tone="muted">https://</ZText>{/snippet}
				<ZInput bind:value defaultValue="api" name="host" aria-label="服务主机" />
				{#snippet suffix()}<ZText tone="muted">.internal</ZText>{/snippet}
			</ZInputGroup>
		</ZField>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">url = https://{value || 'empty'}.internal</ZText>
	</ZStack>
</form>
