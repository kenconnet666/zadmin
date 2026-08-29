<script lang="ts">
	import { ZButton, ZMention, ZStack, ZText, type MentionItem } from '@zadmin/zui';

	const items: readonly MentionItem[] = [
		{
			description: '前端负责人',
			key: 'lilei',
			keywords: ['li', 'frontend'],
			label: '李雷',
			value: 'lilei'
		},
		{
			description: '发布负责人',
			key: 'hanmeimei',
			keywords: ['han', 'release'],
			label: '韩梅梅',
			value: 'hanmeimei'
		},
		{ description: '服务已停用', disabled: true, key: 'legacy-bot', label: '旧版机器人' }
	];
	let value = $state('发布通知：');
</script>

<form>
	<ZStack gap="medium">
		<ZMention
			aria-label="发布通知"
			bind:value
			defaultValue="发布通知："
			listLabel="成员建议"
			name="message"
			placeholder="输入 @ 提及成员"
			rows={4}
			triggers={['@', '#']}
			{items}
		/>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">message = {value}</ZText>
	</ZStack>
</form>
