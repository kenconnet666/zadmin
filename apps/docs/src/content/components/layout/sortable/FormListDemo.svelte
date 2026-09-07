<script lang="ts">
	import {
		createFormModel,
		ZButton,
		ZForm,
		ZFormField,
		ZFormList,
		ZInput,
		ZSortable,
		ZStack,
		ZText
	} from '@zadmin/zui';
	interface Contact {
		id: string;
		name: string;
		email: string;
	}
	const model = createFormModel({
		defaultValues: {
			contacts: [
				{ id: 'design', name: '林设计', email: 'design@example.test' },
				{ id: 'engineering', name: '周研发', email: 'engineering@example.test' },
				{ id: 'quality', name: '陈测试', email: 'quality@example.test' }
			]
		}
	});
	let reject = $state(false);
	let readonly = $state(false);
	let outcome = $state('尚未移动');
</script>

<ZForm {model} {readonly}>
	<ZStack gap="medium">
		<ZStack direction="row" gap="small" wrap>
			<ZButton
				size="small"
				variant="outline"
				aria-pressed={reject}
				onclick={() => (reject = !reject)}>业务拒绝：{reject ? '开' : '关'}</ZButton
			>
			<ZButton
				size="small"
				variant="outline"
				aria-pressed={readonly}
				onclick={() => (readonly = !readonly)}>表单只读：{readonly ? '开' : '关'}</ZButton
			>
			<ZButton size="small" type="reset" variant="outline">重置表单</ZButton>
		</ZStack>
		<ZFormList name="contacts" getRowKey={(contact: Contact) => contact.id}>
			{#snippet children(rows, operations)}
				<ZSortable
					items={rows}
					itemKey={(row) => row.id}
					itemLabel={(row) => row.value.name || '未命名联系人'}
					aria-label="联系人顺序"
					disabled={operations.disabled}
					readonly={operations.readonly}
					onMoveRequest={({ fromIndex, toIndex }) => !reject && operations.move(fromIndex, toIndex)}
					onMoveEnd={(detail) => (outcome = detail.result)}
				>
					{#snippet item(row)}
						<ZStack gap="small">
							<ZFormField name={[...row.path, 'name']} label="姓名" required><ZInput /></ZFormField>
							<ZFormField name={[...row.path, 'email']} label="邮箱"
								><ZInput type="email" /></ZFormField
							>
						</ZStack>
					{/snippet}
				</ZSortable>
			{/snippet}
		</ZFormList>
		<ZText size="small" tone="muted"
			>{model.values.contacts.map((contact) => contact.name || '未命名').join(' → ')} · 结果：{outcome}</ZText
		>
		<ZText size="small" tone="muted"
			>FormArray仍唯一拥有行身份和顺序。尝试编辑必填姓名后重排，再重置表单。</ZText
		>
	</ZStack>
</ZForm>
