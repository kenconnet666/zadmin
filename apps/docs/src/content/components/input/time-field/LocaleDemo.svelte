<script lang="ts">
	import { Time } from '@internationalized/date';
	import {
		ZProvider,
		ZStack,
		ZText,
		ZTimeField,
		enUSLocalePack,
		zhCNLocalePack
	} from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZProvider locale="en-US" localePack={enUSLocalePack}>
		<ZStack gap="small">
			<ZText tone="muted">en-US默认12小时制</ZText>
			<ZTimeField defaultValue={new Time(13, 5, 9)} granularity="second" />
		</ZStack>
	</ZProvider>
	<ZProvider locale="zh-CN" localePack={zhCNLocalePack}>
		<ZStack gap="small">
			<ZText tone="muted">zh-CN默认24小时制并提供中文segment名称</ZText>
			<ZTimeField defaultValue={new Time(13, 5, 9)} granularity="second" />
		</ZStack>
	</ZProvider>
	<ZProvider locale="fa-IR-u-ca-persian">
		<ZStack gap="small">
			<ZText tone="muted">fa-IR使用Persian数字显示并接受同一数字输入</ZText>
			<ZTimeField defaultValue={new Time(13, 5, 9, 125)} granularity="second" hourCycle={24} />
		</ZStack>
	</ZProvider>
</ZStack>
