<script lang="ts">
	import { ZInput, ZStack, ZTabs, ZTabsList, ZTabsPanel, ZTabsTrigger, ZText } from '@zadmin/zui';

	const modes = ['keep-mounted', 'lazy', 'active-only'] as const;
</script>

<ZStack gap="large">
	{#each modes as mode (mode)}
		<ZStack gap="small">
			<ZText tone="muted">panelMount = {mode}</ZText>
			<ZTabs defaultValue="editor" panelMount={mode}>
				<ZTabsList aria-label={`${mode} panels`}>
					<ZTabsTrigger value="editor">编辑器</ZTabsTrigger>
					<ZTabsTrigger value="preview">预览</ZTabsTrigger>
				</ZTabsList>
				<ZTabsPanel value="editor">
					<ZInput aria-label={`${mode} editor state`} defaultValue="本地草稿" />
				</ZTabsPanel>
				<ZTabsPanel value="preview">预览内容</ZTabsPanel>
			</ZTabs>
		</ZStack>
	{/each}
</ZStack>
