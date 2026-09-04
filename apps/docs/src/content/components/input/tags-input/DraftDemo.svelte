<script lang="ts">
	import { ZButton, ZStack, ZTagsInput, ZText } from '@zadmin/zui';

	let duplicateDraft = $state('release');
	let duplicateValues = $state<readonly string[]>(['release']);
	let manualDraft = $state('manual');
	let manualValues = $state<readonly string[]>(['stable']);
</script>

<ZStack gap="large">
	<ZTagsInput
		allowDuplicates
		aria-label="允许重复的发布标签"
		bind:inputValue={duplicateDraft}
		bind:value={duplicateValues}
		defaultValue={['release']}
	/>
	<ZTagsInput
		aria-label="仅手动提交的标签"
		bind:inputValue={manualDraft}
		bind:value={manualValues}
		commitOnBlur={false}
		defaultValue={['stable']}
	/>
	<ZButton type="button" variant="secondary">把焦点移到这里</ZButton>
	<ZText tone="muted"
		>自动 = {duplicateValues.join(',')} / 草稿 {duplicateDraft || '空'} · 手动 = {manualValues.join(
			','
		)} / 草稿 {manualDraft || '空'}</ZText
	>
</ZStack>
