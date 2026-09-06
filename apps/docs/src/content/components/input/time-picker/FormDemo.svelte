<script lang="ts">
	import { Time } from '@internationalized/date';
	import {
		createFormModel,
		ZButton,
		ZForm,
		ZFormField,
		ZGroup,
		ZStack,
		ZText,
		ZTimePicker,
		type ZFormController
	} from '@zadmin/zui';

	interface Values {
		time: Time | null;
	}

	const defaults: Values = { time: new Time(10, 30, 15) };
	const model = createFormModel<Values>({ defaultValues: defaults });
	let controller = $state<ZFormController<Values, Values> | null>(null);
	let changes = $state(0);
	let nativeValues = $state('尚未提交');

	function sameValueCopy(): void {
		controller?.setValues({ time: defaults.time!.copy() });
	}
</script>

<ZForm
	bind:controller
	{model}
	onValidSubmit={({ formData }) => (nativeValues = JSON.stringify(Object.fromEntries(formData)))}
>
	<ZStack gap="medium">
		<ZFormField name="time" label="发布时刻" required>
			<ZTimePicker
				granularity="second"
				onValueChange={() => (changes += 1)}
				pickerLabel="选择发布时刻"
			/>
		</ZFormField>
		<ZGroup gap="small" wrap>
			<ZButton type="submit">读取 FormData</ZButton>
			<ZButton type="button" variant="outline" onclick={sameValueCopy}>写入同值新 Time</ZButton>
			<ZButton type="reset" variant="outline">恢复默认值</ZButton>
		</ZGroup>
		<ZText tone="muted"
			>dirty = {String(model.dirty)} · model.time = {model.values.time?.toString() ?? 'null'} · 用户变更次数
			=
			{changes}</ZText
		>
		<ZText tone="muted">FormData = {nativeValues}</ZText>
		<ZText tone="muted"
			>模型唯一持有 Time；同值新对象保持 dirty=false 且不会增加 onValueChange。</ZText
		>
	</ZStack>
</ZForm>
