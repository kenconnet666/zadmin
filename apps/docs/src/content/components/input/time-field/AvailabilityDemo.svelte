<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZField, ZStack, ZText, ZTimeField } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZField description="09:00–18:00，且午休 12:00–13:59 不可提交。" label="支持时段">
		<ZTimeField
			defaultValue={new Time(10, 0)}
			isTimeUnavailable={(value) => value.hour === 12 || value.hour === 13}
			maxValue={new Time(18, 0)}
			minValue={new Time(9, 0)}
			minuteStep={15}
		/>
	</ZField>
	<ZText tone="muted">键盘cycle跳过不可用值；直接输入不可用时间会保持草稿并暴露invalid。</ZText>
</ZStack>
