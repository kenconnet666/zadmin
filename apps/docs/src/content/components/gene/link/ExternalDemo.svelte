<script lang="ts">
	import { ZLink, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="large" wrap>
		<ZLink external href="https://github.com/kenconnet666/zadmin">同窗口外链</ZLink>
		<ZLink external href="https://www.w3.org/WAI/ARIA/apg/patterns/link/" target="_blank">
			新窗口外链
		</ZLink>
		<ZLink href="#/components/link" target="_blank">新窗口内部文档</ZLink>
	</ZStack>
	<ZText tone="muted">
		external只控制Lucide图标；只有显式target=_blank才打开新窗口并附加隐藏提示与安全rel。
	</ZText>
</ZStack>
