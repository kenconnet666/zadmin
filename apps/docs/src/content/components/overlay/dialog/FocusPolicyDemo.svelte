<script lang="ts">
	import {
		ZButton,
		ZDialog,
		ZDialogClose,
		ZDialogContent,
		ZDialogDescription,
		ZDialogOverlay,
		ZDialogTitle,
		ZDialogTrigger,
		ZInput,
		ZStack,
		ZText
	} from '@zadmin/zui';

	let inputRef = $state<HTMLInputElement | null>(null);
	let restoreRef = $state<HTMLButtonElement | null>(null);
</script>

<ZStack direction="row" gap="small" wrap>
	<ZDialog>
		<ZDialogTrigger>打开聚焦策略</ZDialogTrigger>
		<ZDialogOverlay />
		<ZDialogContent initialFocus={() => inputRef} restoreTarget={() => restoreRef}>
			<ZDialogTitle>编辑发布名称</ZDialogTitle>
			<ZDialogDescription>打开后聚焦输入框，关闭后转到显式恢复按钮。</ZDialogDescription>
			<ZInput aria-label="发布名称" bind:ref={inputRef} defaultValue="Production" />
			<ZDialogClose>保存并关闭</ZDialogClose>
		</ZDialogContent>
	</ZDialog>
	<ZButton bind:ref={restoreRef} variant="secondary">显式恢复目标</ZButton>
</ZStack>
<ZText tone="muted">restoreFocus=false可完全关闭自动恢复；默认仍恢复Trigger。</ZText>
