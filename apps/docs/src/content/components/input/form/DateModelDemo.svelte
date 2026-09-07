<script lang="ts">
	import { CalendarDate, Time } from '@internationalized/date';
	import {
		createFormModel,
		ZButton,
		ZCalendar,
		ZDateField,
		ZDatePicker,
		ZDateRangePicker,
		ZForm,
		ZFormField,
		ZGroup,
		ZStack,
		ZText,
		ZTimeField,
		type CalendarRangeValue,
		type FormState,
		type ZFormController
	} from '@zadmin/zui';
	interface Values {
		calendar: CalendarDate | null;
		date: CalendarDate | null;
		field: CalendarDate | null;
		range: CalendarRangeValue;
		time: Time | null;
	}
	const defaults: Values = {
		calendar: new CalendarDate(2026, 9, 7),
		date: new CalendarDate(2026, 9, 7),
		field: new CalendarDate(2026, 9, 7),
		range: { start: new CalendarDate(2026, 9, 7), end: new CalendarDate(2026, 9, 10) },
		time: new Time(10, 30, 15)
	};
	const model = createFormModel<Values>({ defaultValues: defaults });
	let controller = $state<ZFormController<Values, Values> | null>(null);
	let changes = $state(0);
	let formState = $state<FormState>();
	let nativeValues = $state('尚未提交');
	function sameValueCopies(): void {
		controller?.setValues({
			calendar: defaults.calendar!.copy(),
			date: defaults.date!.copy(),
			field: defaults.field!.copy(),
			range: { start: defaults.range.start!.copy(), end: defaults.range.end!.copy() },
			time: defaults.time!.copy()
		});
	}
</script>

<ZForm
	{model}
	bind:controller
	onStateChange={(next) => (formState = next)}
	onValidSubmit={({ formData }) => {
		nativeValues = JSON.stringify(Object.fromEntries(formData));
	}}
>
	<ZStack gap="medium">
		<ZFormField name="date" label="发布日期"
			><ZDatePicker clearable onValueChange={() => (changes += 1)} /></ZFormField
		>
		<ZFormField name="field" label="归档日期"
			><ZDateField onValueChange={() => (changes += 1)} /></ZFormField
		>
		<ZFormField name="time" label="发布时刻"
			><ZTimeField granularity="second" onValueChange={() => (changes += 1)} /></ZFormField
		>
		<ZFormField name="range" label="观察周期"
			><ZDateRangePicker clearable onValueChange={() => (changes += 1)} /></ZFormField
		>
		<ZFormField name="calendar" label="复核日期"
			><ZCalendar calendarLabel="选择复核日期" onValueChange={() => (changes += 1)} /></ZFormField
		>
		<ZGroup gap="small" wrap>
			<ZButton type="submit">读取日期FormData</ZButton>
			<ZButton type="button" variant="outline" onclick={sameValueCopies}>换成同值日期对象</ZButton>
			<ZButton type="reset" variant="outline">恢复日期默认值</ZButton>
			<ZButton type="button" variant="outline" onclick={() => controller?.resetField('time')}
				>恢复时间字段</ZButton
			>
		</ZGroup>
		<ZText tone="muted"
			>dirty={formState?.dirty ?? false} · valid={formState?.valid ?? true} · 用户变更次数={changes} ·
			date={model.values.date?.toString() ?? '空'} · time={model.values.time?.toString() ??
				'空'}</ZText
		>
		<ZText tone="muted">FormData={nativeValues}</ZText>
		<ZText tone="muted"
			>模型保留CalendarDate/Time类型，FormData序列化为字符串；同值新对象不会产生dirty或额外用户事件。</ZText
		>
		<ZText tone="muted"
			>清空一个时间分段会保留上次有效模型值，但草稿会阻止提交；恢复时间字段会同时撤销未完成输入。</ZText
		>
	</ZStack>
</ZForm>
