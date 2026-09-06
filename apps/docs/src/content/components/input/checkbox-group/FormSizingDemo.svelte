<script lang="ts">
	import { ZButton, ZCheckboxGroup, ZField, ZStack, ZText, type SelectionKey } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const tones = ['neutral', 'info', 'primary', 'warning', 'danger'] as const;
	const options = [
		{ label: '邮件', value: 'email' },
		{ label: '短信', value: 'sms' }
	] as const;
	let value = $state<readonly SelectionKey[]>(['email', 'sms']);
	let output = $state('尚未读取');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		output = new FormData(event.currentTarget as HTMLFormElement)
			.getAll('notices')
			.map(String)
			.join(', ');
	}
</script>

<form onreset={() => (output = '已重置')} onsubmit={submit}>
	<ZStack gap="medium">
		<ZField label="只读通知方式" name="notices" readonly>
			<ZCheckboxGroup
				bind:value
				defaultValue={['email', 'sms']}
				{options}
				orientation="horizontal"
			/>
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="button" onclick={() => (value = ['sms'])}>Owner设为短信</ZButton>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="outline">重置</ZButton>
		</ZStack>
		<ZText tone="muted">value={value.join(', ')} · 重复FormData={output}</ZText>
	</ZStack>
</form>

<ZStack gap="medium">
	{#each sizes as size, index (size)}
		<ZCheckboxGroup
			aria-label={`${size}尺寸组`}
			defaultValue={['email']}
			disabled={size === 'xlarge'}
			{options}
			orientation="horizontal"
			{size}
			tone={tones[index]}
		/>
	{/each}
</ZStack>
