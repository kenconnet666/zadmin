<script lang="ts">
	import {
		createFormModel,
		ZButton,
		ZForm,
		ZFormField,
		ZGroup,
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectItem,
		ZMultiSelectTrigger,
		ZNumberField,
		ZSegmented,
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger,
		ZStack,
		ZTagsInput,
		ZText,
		type ZFormController
	} from '@zadmin/zui';

	interface CollectionValues {
		features: readonly (number | string)[];
		labels: readonly string[];
		region: number;
		replicas: number;
		tier: number;
	}

	const defaults: CollectionValues = {
		features: ['audit'],
		labels: ['stable'],
		region: 1,
		replicas: 3,
		tier: 2
	};
	const model = createFormModel<CollectionValues>({ defaultValues: defaults });
	let controller = $state<ZFormController<CollectionValues, CollectionValues> | null>(null);
	let nativeSnapshot = $state('尚未提交');

	function snapshot(formData: FormData): string {
		return JSON.stringify(
			Object.fromEntries([...new Set(formData.keys())].map((name) => [name, formData.getAll(name)]))
		);
	}
</script>

<ZForm
	bind:controller
	{model}
	onValidSubmit={({ formData }) => (nativeSnapshot = snapshot(formData))}
>
	<ZStack gap="medium">
		<ZFormField name="replicas" label="副本数">
			<ZNumberField min={1} max={9} />
		</ZFormField>
		<ZFormField name="tier" label="服务等级">
			<ZSegmented
				options={[
					{ label: '基础', value: 1 },
					{ label: '标准', value: 2 },
					{ label: '高级', value: 3 }
				]}
			/>
		</ZFormField>
		<ZFormField name="labels" label="发布标签">
			<ZTagsInput addLabel="添加发布标签" placeholder="输入后按Enter" />
		</ZFormField>
		<ZFormField name="region" label="区域">
			<ZSelect valueLabel={(value) => `区域 ${value}`}>
				<ZSelectTrigger />
				<ZSelectContent>
					<ZSelectItem value={1}>华东</ZSelectItem>
					<ZSelectItem value={2}>华北</ZSelectItem>
					<ZSelectItem value={3}>海外</ZSelectItem>
				</ZSelectContent>
			</ZSelect>
		</ZFormField>
		<ZFormField name="features" label="能力">
			<ZMultiSelect clearable valueLabel={String}>
				<ZMultiSelectTrigger />
				<ZMultiSelectContent>
					<ZMultiSelectItem value="audit">审计</ZMultiSelectItem>
					<ZMultiSelectItem value="backup">备份</ZMultiSelectItem>
					<ZMultiSelectItem value={7}>实验能力 7</ZMultiSelectItem>
				</ZMultiSelectContent>
			</ZMultiSelect>
		</ZFormField>
		<ZGroup gap="small" wrap>
			<ZButton type="submit">读取FormData</ZButton>
			<ZButton
				type="button"
				variant="outline"
				onclick={() =>
					controller?.setValues({
						features: ['backup', 7],
						labels: ['preview', 'canary'],
						region: 2,
						replicas: 5,
						tier: 3
					})}>Controller批量更新</ZButton
			>
			<ZButton type="reset" variant="outline">恢复默认值</ZButton>
		</ZGroup>
		<ZText tone="muted">model dirty={model.dirty} · values={JSON.stringify(model.values)}</ZText>
		<ZText tone="muted">FormData={nativeSnapshot}</ZText>
		<ZText tone="muted"
			>Segmented与Select保留number key；TagsInput和MultiSelect通过同名隐藏input提交完整数组。</ZText
		>
	</ZStack>
</ZForm>
