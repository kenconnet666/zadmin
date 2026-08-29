<script lang="ts">
	import {
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

	let open = $state(false);
	let changes = $state(0);
</script>

<ZDialog bind:open onOpenChange={() => (changes += 1)}>
	<ZDialogTrigger data-testid="dialog-trigger">编辑部署</ZDialogTrigger>
	<ZDialogOverlay data-testid="dialog-overlay" />
	<ZDialogContent data-testid="dialog-content">
		<ZStack gap="medium">
			<ZDialogTitle>编辑生产部署</ZDialogTitle>
			<ZDialogDescription>更新显示名称；关闭后焦点会返回触发按钮。</ZDialogDescription>
			<ZInput
				aria-label="部署名称"
				id="dialog-deployment-name"
				name="deployment-name"
				value="zadmin-web"
			/>
			<ZDialogClose data-testid="dialog-close" variant="secondary">完成</ZDialogClose>
		</ZStack>
	</ZDialogContent>
</ZDialog>
<ZText tone="muted">open = {open} · 用户变更次数 = {changes}</ZText>
