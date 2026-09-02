<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		ZAlertDialog,
		ZAlertDialogAction,
		ZAlertDialogCancel,
		ZAlertDialogContent,
		ZAlertDialogDescription,
		ZAlertDialogOverlay,
		ZAlertDialogTitle,
		ZAlertDialogTrigger,
		ZText
	} from '@zadmin/zui';

	let completed = $state(0);
	let clearPending: (() => void) | undefined;
	function confirm(event: MouseEvent): Promise<void> {
		const ownerWindow = (event.currentTarget as HTMLElement).ownerDocument.defaultView!;
		return new Promise<void>((resolve) => {
			const timer = ownerWindow.setTimeout(() => {
				clearPending = undefined;
				resolve();
			}, 700);
			clearPending = () => ownerWindow.clearTimeout(timer);
		}).then(() => {
			completed += 1;
		});
	}
	onDestroy(() => clearPending?.());
</script>

<ZAlertDialog onAction={confirm}>
	<ZAlertDialogTrigger>异步删除</ZAlertDialogTrigger>
	<ZAlertDialogOverlay />
	<ZAlertDialogContent>
		<ZAlertDialogTitle>删除已归档制品？</ZAlertDialogTitle>
		<ZAlertDialogDescription
			>pending期间确认、取消、Escape与outside都不能重复决策。</ZAlertDialogDescription
		>
		<ZAlertDialogCancel>取消</ZAlertDialogCancel>
		<ZAlertDialogAction>确认删除</ZAlertDialogAction>
	</ZAlertDialogContent>
</ZAlertDialog>
<ZText tone="muted">成功次数：{completed}</ZText>
