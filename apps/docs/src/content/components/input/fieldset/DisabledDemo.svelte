<script lang="ts">
	import {
		ZButton,
		ZField,
		ZFieldset,
		ZInputGroup,
		ZPasswordInput,
		ZStack,
		ZText
	} from '@zadmin/zui';

	let disabled = $state(true);
	let secret = $state('release-key');
	let output = $state('尚未读取');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		output = data.get('secret')?.toString() ?? '无值（禁用字段不进入FormData）';
	}
</script>

<form onsubmit={submit}>
	<ZStack gap="small">
		<ZFieldset {disabled} description="第一legend中的恢复按钮保留原生fieldset例外。">
			{#snippet legend()}
				受控连接
				<ZButton size="small" type="button" variant="ghost" onclick={() => (disabled = false)}>
					恢复本组
				</ZButton>
			{/snippet}
			<ZField label="访问口令" name="secret">
				<ZInputGroup>
					{#snippet prefix()}密钥{/snippet}
					<ZPasswordInput aria-label="访问口令" bind:value={secret} defaultValue="release-key" />
				</ZInputGroup>
			</ZField>
		</ZFieldset>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="button" variant="outline" onclick={() => (disabled = true)}>
				禁用本组
			</ZButton>
		</ZStack>
		<ZText tone="muted">
			disabled={disabled ? 'true' : 'false'} · value={secret} · FormData={output}
		</ZText>
	</ZStack>
</form>
