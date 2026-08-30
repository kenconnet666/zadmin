<script lang="ts">
	import { ZButton, ZForm, ZFormField, ZInput, ZStack, ZText } from '@zadmin/zui';
	let busy = $state(false);
</script>

<ZForm aria-busy={busy || undefined} data-testid="external-busy-form">
	<ZStack gap="medium">
		<ZFormField label="发布批次" name="batch">
			<ZInput defaultValue="release-2026-08" />
		</ZFormField>
		<ZButton
			aria-busy={busy || undefined}
			data-testid="external-busy-button"
			type="button"
			onclick={() => (busy = !busy)}>{busy ? '结束外部任务' : '开始外部任务'}</ZButton
		>
		<ZText aria-live="polite" role="status" tone="muted"
			>{busy ? '外部任务进行中，表单仍可操作。' : '外部任务空闲。'}</ZText
		>
	</ZStack>
</ZForm>
