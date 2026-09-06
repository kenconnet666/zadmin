<script lang="ts">
	import { ZSpinner, ZStack, ZText } from '@zadmin/zui';
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="small">
		<ZSpinner label="正在保存表单" size="small" />
		<ZText>正在保存表单…</ZText>
	</ZStack>
	<ZStack align="center" direction="row" gap="medium" wrap>
		{#each sizes as size (size)}<ZSpinner {size} label={`${size}等待指示`} />{/each}
	</ZStack>
	<ZText tone="muted">Spinner自带status名称，旁边文字提供持久的视觉上下文。</ZText>
</ZStack>
