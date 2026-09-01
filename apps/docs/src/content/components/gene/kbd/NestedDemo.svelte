<script lang="ts">
	import { ZKbd, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZText>重新加载：<ZKbd><ZKbd>Ctrl</ZKbd> + <ZKbd>Shift</ZKbd> + <ZKbd>R</ZKbd></ZKbd></ZText>
	<ZText>菜单路径：<ZKbd>文件 / 新建文档</ZKbd></ZText>
	<ZText tone="muted"
		>原生HTML允许外层kbd表示完整输入、内层kbd表示每个按键；菜单文本由调用方明确提供。</ZText
	>
</ZStack>
