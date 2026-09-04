<script lang="ts">
	import { ZStack, ZTagsInput, ZText } from '@zadmin/zui';

	let values = $state<readonly string[]>(['production', 'staging']);
</script>

<ZStack gap="medium">
	<ZTagsInput
		aria-label="可编辑部署标签"
		bind:value={values}
		defaultValue={['production', 'staging']}
		editable
		transform={(value) => value.toLocaleLowerCase().replaceAll(/\s+/gu, '-')}
		validate={(value) => /^[a-z][a-z0-9-]*$/u.test(value)}
	/>
	<ZText tone="muted"
		>双击不是唯一入口：方向键进入标签后按Enter编辑。values = {values.join(',')}</ZText
	>
</ZStack>
