<script lang="ts">
	import { ZButton, ZStack, ZSwitch, ZText } from '@zadmin/zui';

	let checked = $state(true);
	let userChanges = $state(0);
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="medium">
		<ZSwitch bind:checked id="switch-controlled-scan" onCheckedChange={() => (userChanges += 1)} />
		<ZText as="label" for="switch-controlled-scan">受控安全扫描</ZText>
	</ZStack>
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton size="small" variant="secondary" onclick={() => (checked = true)}>外部开启</ZButton>
		<ZButton size="small" variant="secondary" onclick={() => (checked = false)}>外部关闭</ZButton>
		<ZSwitch aria-label="独立非受控开关" defaultChecked />
	</ZStack>
	<ZText tone="muted">checked = {checked} · 仅用户操作回调 {userChanges} 次</ZText>
</ZStack>
