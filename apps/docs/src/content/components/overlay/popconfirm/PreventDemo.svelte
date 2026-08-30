<script lang="ts">
	import {
		ZInput,
		ZPopconfirm,
		ZPopconfirmAction,
		ZPopconfirmCancel,
		ZPopconfirmContent,
		ZPopconfirmDescription,
		ZPopconfirmTitle,
		ZPopconfirmTrigger,
		ZStack,
		ZText
	} from '@zadmin/zui';
	let confirmation = $state('');
	let blocked = $state(false);
</script>

<ZPopconfirm placement="top-start">
	<ZPopconfirmTrigger variant="danger">输入确认词</ZPopconfirmTrigger>
	<ZPopconfirmContent>
		<ZPopconfirmTitle>输入DELETE继续</ZPopconfirmTitle>
		<ZPopconfirmDescription>错误输入会阻止默认关闭。</ZPopconfirmDescription>
		<ZStack gap="medium">
			<ZInput aria-label="删除确认词" bind:value={confirmation} />
			{#if blocked}<ZText tone="danger">确认词不匹配</ZText>{/if}
			<ZStack direction="row" gap="medium"
				><ZPopconfirmCancel>取消</ZPopconfirmCancel><ZPopconfirmAction
					onclick={(event) => {
						blocked = confirmation !== 'DELETE';
						if (blocked) event.preventDefault();
					}}>删除</ZPopconfirmAction
				></ZStack
			>
		</ZStack>
	</ZPopconfirmContent>
</ZPopconfirm>
