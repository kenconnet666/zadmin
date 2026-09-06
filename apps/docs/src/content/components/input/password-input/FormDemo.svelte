<script lang="ts">
	import { ZPasswordInput, ZText } from '@zadmin/zui';
	let form = $state<HTMLFormElement | null>(null);
	let value = $state('initial-secret');
	let visible = $state(true);
	let output = $state('');
	function inspect(): void {
		if (form) output = String(new FormData(form).get('password') ?? '');
	}
</script>

<form bind:this={form} onsubmit={(event) => event.preventDefault()}>
	<ZPasswordInput
		aria-label="账户密码"
		name="password"
		bind:value
		bind:visible
		defaultValue="initial-secret"
		defaultVisible={true}
	/>
	<button type="button" onclick={inspect}>读取FormData</button>
	<button type="reset">Reset</button>
</form>
<ZText>FormData password: {output || '—'}；visible={visible ? 'true' : 'false'}</ZText>
