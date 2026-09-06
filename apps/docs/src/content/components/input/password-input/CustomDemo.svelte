<script lang="ts">
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import { ZButton, ZInputGroup, ZPasswordInput, ZText } from '@zadmin/zui';
	const readonly = true;
	let disabled = $state(false);
</script>

<div style="inline-size:min(100%, 24rem)">
	<ZInputGroup {readonly} {disabled} size="xsmall" dir="rtl">
		<ZPasswordInput aria-label="只读密码" defaultValue="read-only-secret">
			{#snippet toggle(context)}
				{#if context.visible}<EyeOff aria-hidden="true" size={16} />{:else}<Eye
						aria-hidden="true"
						size={16}
					/>{/if}
			{/snippet}
		</ZPasswordInput>
	</ZInputGroup>
</div>
<ZButton size="small" variant="outline" onclick={() => (disabled = !disabled)}
	>{disabled ? '启用组合' : '禁用组合'}</ZButton
>
<ZText>InputGroup统一提供xsmall、RTL与readonly；禁用状态同时传给输入和切换按钮。</ZText>
