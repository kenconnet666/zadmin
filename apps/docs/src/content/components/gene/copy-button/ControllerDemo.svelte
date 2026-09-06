<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ClipboardController, ZButton, ZStack, ZText } from '@zadmin/zui';

	let ref = $state<HTMLButtonElement | null>(null);
	let result = $state('尚未复制');
	const clipboard = new ClipboardController({
		getWindow: () => ref?.ownerDocument.defaultView
	});

	onDestroy(() => clipboard.destroy());
</script>

<ZStack gap="small">
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			bind:ref
			onclick={() => {
				void clipboard.copy('明确示例文本').then((copyResult) => {
					result =
						copyResult.status === 'copied'
							? '写入成功'
							: copyResult.status === 'failed'
								? '写入失败'
								: '反馈已失效';
				});
			}}
		>
			复制明确示例文本
		</ZButton>
		<ZButton
			variant="ghost"
			onclick={() => {
				clipboard.reset();
				result = '已重置反馈';
			}}>Reset</ZButton
		>
	</ZStack>
	<ZText>snapshot.status：{clipboard.snapshot.status}；{result}</ZText>
	<ZText tone="muted">
		默认反馈保留2000ms；timeout=0可持续到reset。stale只忽略迟到反馈，不能撤销已经发起的原生写入。
	</ZText>
</ZStack>
