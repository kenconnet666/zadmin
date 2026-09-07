<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import {
		ZDateTimePicker,
		ZStack,
		ZText,
		ZForm,
		ZFormField,
		ZButton,
		createFormModel
	} from '@zadmin/zui';
	const model = createFormModel<{ appointment: CalendarDateTime | null }>({
		defaultValues: { appointment: new CalendarDateTime(2026, 9, 7, 9, 30) }
	});
	let commits = $state(0);
	let submitted = $state('尚未提交');
</script>

<ZStack gap="medium">
	<ZForm
		{model}
		onValidSubmit={({ formData }) => {
			submitted = String(formData.get('appointment'));
		}}
	>
		<ZStack gap="medium">
			<ZFormField name="appointment" label="预约日期时间" required>
				<ZDateTimePicker
					presentation="inline"
					commitMode="confirm"
					hourCycle={24}
					minuteStep={15}
					onCommit={() => commits++}
					presets={[{ label: '下午预约', value: new CalendarDateTime(2026, 9, 8, 14, 30) }]}
				/>
			</ZFormField>
			<ZStack direction="row" gap="small" wrap
				><ZButton type="submit">提交预约</ZButton><ZButton type="reset" variant="outline"
					>恢复预约</ZButton
				></ZStack
			>
		</ZStack>
	</ZForm>
	<ZText tone="muted"
		>面板常驻；确认后保持显示，取消只撤回未提交面板草稿。与浮层模式共用分段输入、校验和表单值。</ZText
	>
	<ZText tone="muted">commit={commits} · FormData={submitted}</ZText>
</ZStack>
