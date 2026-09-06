<script lang="ts">
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import {
		createFormModel,
		ZButton,
		ZForm,
		ZFormField,
		ZFormList,
		ZGroup,
		ZInput,
		ZStack,
		ZText,
		type ZFormController
	} from '@zadmin/zui';

	interface Member {
		id: string;
		name: string;
	}
	interface TeamValues {
		members: readonly Member[];
	}

	const defaults: TeamValues = {
		members: [
			{ id: 'owner', name: 'Alice' },
			{ id: 'reviewer', name: 'Bob' }
		]
	};
	const schema: StandardSchemaV1<TeamValues, TeamValues> = {
		'~standard': {
			version: 1,
			vendor: 'zui-docs-form-list',
			validate(input) {
				const values = input as TeamValues;
				const issues = values.members.flatMap((member, index) =>
					typeof member.name === 'string' && member.name.trim()
						? []
						: [{ message: '成员名称不能为空', path: ['members', index, 'name'] as const }]
				);
				return issues.length > 0 ? { issues } : { value: values };
			}
		}
	};
	const model = createFormModel<TeamValues>({ defaultValues: defaults });
	let controller = $state<ZFormController<TeamValues, TeamValues> | null>(null);
	let nextMember = 1;
	let lastAction = $state('尚未修改列表');

	function addedMember(): Member {
		const id = `new-${nextMember++}`;
		return { id, name: `新成员 ${id}` };
	}
</script>

<ZForm bind:controller {model} {schema} validateOn={['change', 'submit']} validationDelay={0}>
	<ZStack gap="medium">
		<ZFormList name="members" getRowKey={(member: Member) => member.id}>
			{#snippet children(rows, operations)}
				{#each rows as row (row.id)}
					{@const namePath = [...row.path, 'name'] as const}
					{@const fieldState = controller?.getFieldState(namePath)}
					<ZStack gap="small">
						<ZFormField name={namePath} label={`成员 ${row.index + 1}`} feedbackMinLines={1}>
							<ZInput autocomplete="off" />
						</ZFormField>
						<ZGroup gap="small" wrap>
							<ZButton
								type="button"
								size="small"
								variant="outline"
								disabled={operations.disabled || operations.readonly || row.index === 0}
								onclick={() =>
									(lastAction = operations.move(row.index, row.index - 1)
										? '已上移成员'
										: '上移被拒绝')}>上移</ZButton
							>
							<ZButton
								type="button"
								size="small"
								variant="outline"
								disabled={operations.disabled ||
									operations.readonly ||
									row.index === rows.length - 1}
								onclick={() =>
									(lastAction = operations.move(row.index, row.index + 1)
										? '已下移成员'
										: '下移被拒绝')}>下移</ZButton
							>
							<ZButton
								type="button"
								size="small"
								variant="outline"
								disabled={operations.disabled || operations.readonly}
								onclick={() =>
									(lastAction = operations.replace(row.index, { ...row.value, name: '' })
										? '已把本行替换为空名称'
										: '替换被拒绝')}>替换为空</ZButton
							>
							<ZButton
								type="button"
								size="small"
								variant="ghost"
								disabled={operations.disabled || operations.readonly}
								onclick={() => {
									controller?.resetField(namePath);
									lastAction = '已重置本行名称';
								}}>重置字段</ZButton
							>
							<ZButton
								type="button"
								size="small"
								tone="danger"
								variant="ghost"
								disabled={operations.disabled || operations.readonly}
								onclick={() =>
									(lastAction = operations.remove(row.index) ? '已删除成员' : '删除被拒绝')}
								>删除</ZButton
							>
						</ZGroup>
						<ZText size="small" tone="muted"
							>row.id={row.id} · dirty={fieldState?.dirty ?? false} · errors={fieldState?.errors
								.length ?? 0}</ZText
						>
					</ZStack>
				{/each}
				<ZGroup gap="small" wrap>
					<ZButton
						type="button"
						disabled={operations.disabled || operations.readonly}
						onclick={() =>
							(lastAction = operations.append(addedMember()) ? '已追加成员' : '追加被拒绝')}
						>追加成员</ZButton
					>
					<ZButton
						type="button"
						variant="outline"
						disabled={operations.disabled || operations.readonly}
						onclick={() =>
							(lastAction = operations.insert(0, addedMember()) ? '已插入首行' : '插入被拒绝')}
						>插入首行</ZButton
					>
				</ZGroup>
			{/snippet}
		</ZFormList>
		<ZGroup gap="small" wrap>
			<ZButton type="submit">校验全部成员</ZButton>
			<ZButton type="reset" variant="outline">恢复默认列表</ZButton>
		</ZGroup>
		<ZText tone="muted">{lastAction} · form dirty={model.dirty}</ZText>
		<ZText tone="muted">values={JSON.stringify(model.values.members)}</ZText>
		<ZText tone="muted"
			>当前为实验性单层列表；嵌套FormList会被明确拒绝，避免内层路径在外层移动后指向错误行。</ZText
		>
	</ZStack>
</ZForm>
