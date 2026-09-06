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
	interface Team {
		id: string;
		name: string;
		members: readonly Member[];
	}
	interface Values {
		teams: readonly Team[];
	}
	const defaults: Values = {
		teams: [
			{
				id: 'release',
				name: '发布团队',
				members: [
					{ id: 'alice', name: 'Alice' },
					{ id: 'ava', name: 'Ava' }
				]
			},
			{
				id: 'quality',
				name: '质量团队',
				members: [
					{ id: 'bob', name: 'Bob' },
					{ id: 'bea', name: 'Bea' }
				]
			}
		]
	};
	const model = createFormModel<Values>({ defaultValues: defaults });
	let controller = $state<ZFormController<Values, Values> | null>(null);
	let sequence = 0;
	const schema: StandardSchemaV1<Values, Values> = {
		'~standard': {
			version: 1,
			vendor: 'zui-docs-nested-list',
			validate(input) {
				const values = input as Values;
				const issues = values.teams.flatMap((team, teamIndex) =>
					team.members.flatMap((member, index) =>
						typeof member.name === 'string' && member.name.trim()
							? []
							: [
									{
										message: '请输入成员姓名',
										path: ['teams', teamIndex, 'members', index, 'name'] as const
									}
								]
					)
				);
				return issues.length ? { issues } : { value: values };
			}
		}
	};
	function newMember(): Member {
		const id = `member-${++sequence}`;
		return { id, name: `新成员 ${sequence}` };
	}
</script>

<ZForm {model} {schema} bind:controller validateOn={['change', 'submit']} validationDelay={0}>
	<ZStack gap="large">
		<ZFormList name="teams" getRowKey={(team: Team) => team.id}>
			{#snippet children(teams, teamOperations)}
				{#each teams as team (team.id)}
					<ZStack gap="small" role="group" aria-label={team.value.name}>
						<ZGroup gap="small" wrap>
							<ZText>{team.value.name}</ZText>
							<ZButton
								type="button"
								size="small"
								variant="outline"
								disabled={team.index === teams.length - 1 ||
									teamOperations.disabled ||
									teamOperations.readonly}
								onclick={() => teamOperations.move(team.index, team.index + 1)}>团队下移</ZButton
							>
							<ZButton
								type="button"
								size="small"
								variant="ghost"
								tone="danger"
								disabled={teamOperations.disabled || teamOperations.readonly}
								onclick={() => teamOperations.remove(team.index)}>删除团队</ZButton
							>
						</ZGroup>
						<ZFormList name={[...team.path, 'members']} getRowKey={(member: Member) => member.id}>
							{#snippet children(members, memberOperations)}
								{#each members as member (member.id)}
									{@const fieldPath = [...member.path, 'name'] as const}
									<ZStack gap="small">
										<ZFormField
											name={fieldPath}
											label={`${team.value.name}成员 ${member.index + 1}`}
											feedbackMinLines={1}
										>
											<ZInput autocomplete="off" />
										</ZFormField>
										<ZGroup gap="small" wrap>
											<ZButton
												type="button"
												size="small"
												variant="outline"
												disabled={member.index === 0 ||
													memberOperations.disabled ||
													memberOperations.readonly}
												onclick={() => memberOperations.move(member.index, member.index - 1)}
												>上移成员</ZButton
											>
											<ZButton
												type="button"
												size="small"
												variant="ghost"
												disabled={memberOperations.disabled || memberOperations.readonly}
												onclick={() => controller?.resetField(fieldPath)}>还原姓名</ZButton
											>
											<ZButton
												type="button"
												size="small"
												variant="ghost"
												tone="danger"
												disabled={memberOperations.disabled || memberOperations.readonly}
												onclick={() => memberOperations.remove(member.index)}>删除成员</ZButton
											>
										</ZGroup>
										<ZText size="small" tone="muted"
											>父行 {team.id} · 子行 {member.id} · dirty={controller?.getFieldState(
												fieldPath
											).dirty ?? false}</ZText
										>
									</ZStack>
								{/each}
								<ZButton
									type="button"
									variant="outline"
									disabled={memberOperations.disabled || memberOperations.readonly}
									onclick={() => memberOperations.append(newMember())}>添加成员</ZButton
								>
							{/snippet}
						</ZFormList>
					</ZStack>
				{/each}
				<ZButton
					type="button"
					disabled={teamOperations.disabled || teamOperations.readonly}
					onclick={() =>
						teamOperations.append({
							id: `team-${++sequence}`,
							name: `新团队 ${sequence}`,
							members: []
						})}>添加团队</ZButton
				>
			{/snippet}
		</ZFormList>
		<ZGroup gap="small" wrap>
			<ZButton type="submit">验证团队</ZButton>
			<ZButton
				type="button"
				variant="outline"
				onclick={() =>
					controller?.setErrors({ 'teams[0].members[0].name': ['服务端：请确认该成员姓名'] })}
				>设置首位成员错误</ZButton
			>
			<ZButton type="reset" variant="outline">恢复全部团队</ZButton>
			<ZButton type="button" variant="ghost" onclick={() => controller?.initialize(defaults)}
				>重新载入初始值</ZButton
			>
		</ZGroup>
		<ZText tone="muted">dirty={model.dirty} · values={JSON.stringify(model.values)}</ZText>
		<ZText tone="muted">errors={JSON.stringify(controller?.getState().errors ?? {})}</ZText>
	</ZStack>
</ZForm>
