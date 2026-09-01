<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ZButton, ZIcon, ZStack, ZText } from '@zadmin/zui';

	let pending = $state(false);
	let result = $state('尚未保存');
	let timer: ReturnType<typeof setTimeout> | undefined;

	function save(): void {
		if (pending) return;
		pending = true;
		result = '正在保存，按钮会阻止重复提交';
		timer = setTimeout(() => {
			pending = false;
			result = '保存完成';
			timer = undefined;
		}, 900);
	}

	onDestroy(() => {
		if (timer !== undefined) clearTimeout(timer);
	});
</script>

{#snippet saveIcon()}
	<ZIcon name="check" />
{/snippet}

<ZStack gap="small" align="start">
	<ZButton loading={pending} loadingLabel="正在保存配置" start={saveIcon} onclick={save}>
		保存配置
	</ZButton>
	<ZText aria-live="polite" tone="muted">{result}</ZText>
</ZStack>
