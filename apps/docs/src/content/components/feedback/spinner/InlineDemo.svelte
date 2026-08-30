<script lang="ts">
	import { ZSpinner, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="small">
		<ZSpinner label="正在保存表单" size="small" />
		<ZText>正在保存表单…</ZText>
	</ZStack>
	<ZText tone="muted">Spinner自带status名称，旁边文字提供持久的视觉上下文。</ZText>
</ZStack>
