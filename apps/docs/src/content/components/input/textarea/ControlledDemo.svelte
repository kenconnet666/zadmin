<script lang="ts">
	import { ZButton, ZField, ZStack, ZText, ZTextarea } from '@zadmin/zui';

	const limit = 80;
	let composing = $state(false);
	let userChanges = $state(0);
	let value = $state('这是一段由外部状态控制的发布说明。');
</script>

<ZStack gap="medium">
	<ZField
		description="maxlength保留浏览器约束；计数和清空按钮由现有组件组合，不包裹或替换真实textarea。"
		label="发布说明"
	>
		<ZTextarea
			bind:value
			maxlength={limit}
			oncompositionend={() => (composing = false)}
			oncompositionstart={() => (composing = true)}
			onValueChange={() => (userChanges += 1)}
			placeholder="输入发布说明"
			rows={3}
		/>
	</ZField>
	<ZStack align="center" direction="row" gap="small" justify="between" wrap>
		<ZButton disabled={value.length === 0} onclick={() => (value = '')} variant="secondary">
			外部清空
		</ZButton>
		<ZText tone={value.length >= limit ? 'danger' : 'muted'}>
			{value.length}/{limit} · 用户输入事件 {userChanges} 次 · {composing ? 'IME组合中' : 'IME空闲'}
		</ZText>
	</ZStack>
</ZStack>
