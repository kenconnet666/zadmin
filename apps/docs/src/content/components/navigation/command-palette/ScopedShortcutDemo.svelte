<script lang="ts">
	import { ZBox, ZCommandPalette, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ key: 'preview', label: '预览发布' },
		{ key: 'promote', label: '提升版本' }
	];
	let scope = $state<HTMLDivElement | null>(null);
	let open = $state(false);
</script>

<ZBox bind:ref={scope} aria-label="发布快捷键作用域" role="group">
	<ZStack gap="medium">
		<ZText>
			快捷键只监听此区域冒泡的 <strong>Ctrl/⌘ + P</strong>；焦点在区域外时不会争抢其他Palette。
		</ZText>
		<ZCommandPalette
			bind:open
			{items}
			shortcut={{ key: 'p', modKey: true }}
			shortcutTarget={scope}
			title="作用域发布命令"
			triggerLabel="打开作用域发布命令"
		/>
		<ZText tone="muted">open = {open} · target = {scope?.tagName ?? 'pending'}</ZText>
	</ZStack>
</ZBox>
