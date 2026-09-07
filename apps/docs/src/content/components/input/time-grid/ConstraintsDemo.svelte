<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZField, ZStack, ZText, ZTimeGrid, type TimeGridSlot } from '@zadmin/zui';

	const slots = Object.freeze<readonly TimeGridSlot[]>([
		Object.freeze({ value: new Time(8) }),
		Object.freeze({ value: new Time(9) }),
		Object.freeze({ label: '维护时段', value: new Time(10) }),
		Object.freeze({ value: new Time(11) }),
		Object.freeze({ disabled: true, label: '已预订', value: new Time(12) }),
		Object.freeze({ value: new Time(13) })
	]);
	let value = $state<Time | null>(new Time(9));
</script>

<ZStack gap="medium">
	<form>
		<ZField label="值班开始时间" name="shift" required>
			<ZTimeGrid
				bind:value
				allowDeselect
				columns={3}
				isTimeUnavailable={(candidate) => candidate.hour === 10}
				minValue={new Time(9)}
				maxValue={new Time(12)}
				required
				{slots}
			/>
		</ZField>
	</form>
	<ZText tone="muted"
		>范围、业务谓词与单个slot的disabled状态共同决定可选性；清空后required只报告无效，不恢复旧值。
	</ZText>
</ZStack>
