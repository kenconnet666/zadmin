<script lang="ts">
	import { ZButton, ZForm, ZInput, ZStack, ZText } from '@zadmin/zui';
	let value = $state('external-seed');
	let owner = $state('input-external-owner');
	let backupVersion = $state(0);
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZForm id="input-external-owner">
			<ZButton type="reset" variant="secondary">重置主表单</ZButton>
		</ZForm>
		{#key backupVersion}
			<ZForm data-version={backupVersion} id="input-external-backup">
				<ZButton type="reset" variant="secondary">重置备用表单</ZButton>
			</ZForm>
		{/key}
		<ZButton
			type="button"
			onclick={() =>
				(owner =
					owner === 'input-external-owner' ? 'input-external-backup' : 'input-external-owner')}
			>{owner === 'input-external-owner' ? '切换到备用表单' : '切换到主表单'}</ZButton
		>
		<ZButton type="button" variant="ghost" onclick={() => (backupVersion += 1)}
			>重建备用表单</ZButton
		>
	</ZStack>
	<ZInput
		bind:value
		data-testid="input-external-control"
		defaultValue="external-seed"
		form={owner}
		name="external"
	/>
	<ZText tone="muted">owner = {owner} · external value = {value}</ZText>
</ZStack>
