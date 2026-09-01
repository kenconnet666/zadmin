<script lang="ts">
	import { ZKbd, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZText>Windows/Linux：<ZKbd>Ctrl</ZKbd> + <ZKbd>K</ZKbd></ZText>
	<ZText>macOS：<ZKbd aria-label="Command">⌘</ZKbd> + <ZKbd>K</ZKbd></ZText>
	<ZText tone="muted">应用明确展示平台替代文本；ZKbd不读取navigator也不猜测用户键盘。</ZText>
</ZStack>
