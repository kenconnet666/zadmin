<script lang="ts">
	import { ZStack, ZTagsInput, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZTagsInput
		aria-label="最多两个小写标签"
		defaultValue={['prod']}
		delimiters={[',', ';']}
		maxTags={2}
		placeholder="小写字母，逗号或分号提交"
		validate={(value) => /^[a-z]+$/u.test(value)}
	>
		{#snippet children(value)}<ZText tone="primary" weight="semibold">{value}</ZText>{/snippet}
	</ZTagsInput>
	<ZTagsInput aria-label="只读标签" defaultValue={['locked', 'stable']} readonly />
	<ZTagsInput aria-label="禁用标签" defaultValue={['disabled']} disabled />
</ZStack>
