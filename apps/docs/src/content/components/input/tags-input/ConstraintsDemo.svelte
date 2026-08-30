<script lang="ts">
	import { ZBadge, ZStack, ZTagsInput } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZTagsInput
		aria-label="最多两个小写标签"
		defaultValues={['prod']}
		delimiters={[',', ';']}
		maxTags={2}
		placeholder="小写字母，逗号或分号提交"
		validate={(value) => /^[a-z]+$/u.test(value)}
	>
		{#snippet children(value)}<ZBadge tone="accent">{value}</ZBadge>{/snippet}
	</ZTagsInput>
	<ZTagsInput aria-label="只读标签" defaultValues={['locked', 'stable']} readonly />
	<ZTagsInput aria-label="禁用标签" defaultValues={['disabled']} disabled />
</ZStack>
