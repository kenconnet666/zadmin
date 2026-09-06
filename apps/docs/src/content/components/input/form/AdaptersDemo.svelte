<script lang="ts">
	import {
		createFormModel,
		ZButton,
		ZForm,
		ZFormField,
		ZGroup,
		ZRadioGroup,
		ZRangeSlider,
		ZRating,
		ZSlider,
		ZStack,
		ZSwitch,
		ZText,
		type SliderRangeValue
	} from '@zadmin/zui';

	interface PreferenceValues {
		alerts: boolean;
		budget: SliderRangeValue;
		channel: string;
		rating: number;
		threshold: number;
	}

	const defaults: PreferenceValues = {
		alerts: true,
		budget: [20, 80],
		channel: 'stable',
		rating: 4,
		threshold: 35
	};
	const model = createFormModel<PreferenceValues>({ defaultValues: defaults });
	let nativeSnapshot = $state('尚未提交');

	function snapshot(formData: FormData): string {
		return JSON.stringify(
			Object.fromEntries([...new Set(formData.keys())].map((name) => [name, formData.getAll(name)]))
		);
	}
</script>

<ZForm {model} onValidSubmit={({ formData }) => (nativeSnapshot = snapshot(formData))}>
	<ZStack gap="medium">
		<ZFormField name="alerts" label="发布提醒">
			<label><ZSwitch value="enabled" /> 开启提醒</label>
		</ZFormField>
		<ZFormField name="channel" label="发布通道" required>
			<ZRadioGroup
				options={[
					{ label: '稳定版', value: 'stable' },
					{ label: '预览版', value: 'preview' }
				]}
				orientation="horizontal"
			/>
		</ZFormField>
		<ZFormField name="threshold" label="告警阈值">
			<ZSlider marks={[{ label: '50', value: 50 }]} step={5} valueLabel="focus" />
		</ZFormField>
		<ZFormField name="budget" label="预算范围">
			<ZRangeSlider
				minRange={10}
				step={5}
				thumbLabels={['最低预算', '最高预算']}
				valueLabel="focus"
			/>
		</ZFormField>
		<ZFormField name="rating" label="发布信心">
			<ZRating />
		</ZFormField>
		<ZGroup gap="small" wrap>
			<ZButton type="submit">读取FormData</ZButton>
			<ZButton
				type="button"
				variant="outline"
				onclick={() =>
					model.setValues({
						alerts: false,
						budget: [35, 65],
						channel: 'preview',
						rating: 3,
						threshold: 60
					})}>批量更新Model</ZButton
			>
			<ZButton type="reset" variant="outline">恢复默认值</ZButton>
		</ZGroup>
		<ZText tone="muted">model dirty={model.dirty} · values={JSON.stringify(model.values)}</ZText>
		<ZText tone="muted">FormData={nativeSnapshot}</ZText>
		<ZText tone="muted"
			>RangeSlider以同名双值提交；其他控件仍由各自真实input/radio拥有FormData。</ZText
		>
	</ZStack>
</ZForm>
