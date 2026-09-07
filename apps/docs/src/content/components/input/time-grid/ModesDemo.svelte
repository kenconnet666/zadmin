<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZStack, ZText, ZTimeGrid } from '@zadmin/zui';

	const slots = [
		{ value: new Time(8) },
		{ value: new Time(9) },
		{ value: new Time(10) },
		{ value: new Time(11) }
	] as const;
</script>

<ZStack gap="large">
	<ZTimeGrid gridLabel="只读时隙" readonly {slots} value={new Time(9)} />
	<ZTimeGrid gridLabel="禁用时隙" disabled {slots} value={new Time(9)} />
	<ZTimeGrid gridLabel="RTL时隙" dir="rtl" {slots} value={new Time(9)} />
	<ZText tone="muted"
		>readonly保留焦点与提交但方向键只浏览；disabled退出交互和FormData；可编辑radio中方向键循环移动并选择，RTL按逻辑方向反转。
	</ZText>
</ZStack>
