<script lang="ts">
	import {
		createFormArray,
		createFormModel,
		ZButton,
		ZField,
		ZInput,
		ZStack,
		ZText
	} from '@zadmin/zui';

	interface Member {
		name: string;
	}
	interface Values {
		profile: { name: string };
		members: readonly Member[];
	}

	const model = createFormModel<Values>({
		defaultValues: {
			profile: { name: 'Alice' },
			members: [{ name: 'One' }, { name: 'Two' }]
		}
	});
	const members = createFormArray<Member, Values>(model, 'members');
</script>

<ZStack gap="medium">
	<ZField label="负责人">
		<ZInput
			value={String(model.get(['profile', 'name']))}
			onValueChange={(value) => model.setField(['profile', 'name'], value, 'user')}
		/>
	</ZField>

	<ZStack gap="small">
		{#each members.rows as row (row.id)}
			<ZStack direction="row" gap="small" wrap>
				<ZField label={`成员 ${row.index + 1} · ${row.id}`}>
					<ZInput
						value={row.value.name}
						onValueChange={(value) => model.setField([...row.path, 'name'], value, 'user')}
					/>
				</ZField>
				<ZButton type="button" variant="ghost" onclick={() => members.remove(row.index)}>
					移除
				</ZButton>
			</ZStack>
		{/each}
	</ZStack>

	<ZStack direction="row" gap="small" wrap>
		<ZButton
			type="button"
			disabled={members.rows.length >= 3}
			onclick={() => members.append({ name: `Member ${members.rows.length + 1}` })}
		>
			追加成员
		</ZButton>
		<ZButton
			type="button"
			variant="outline"
			disabled={members.rows.length < 2}
			onclick={() => members.move(0, members.rows.length - 1)}
		>
			首行移到末尾
		</ZButton>
		<ZButton
			type="button"
			variant="outline"
			onclick={() =>
				model.setFields(
					[
						{ path: ['profile', 'name'], value: 'Release Owner' },
						{ path: ['members', 0, 'name'], value: 'Primary' }
					],
					'controller'
				)}
		>
			批量写入
		</ZButton>
		<ZButton type="button" variant="ghost" onclick={() => model.reset()}>Reset Model</ZButton>
	</ZStack>

	<ZText tone="muted"
		>dirty={model.dirty ? 'true' : 'false'} · values={JSON.stringify(model.values)}</ZText
	>
	<ZText tone="muted">move后相同行保留row.id；这个独立model通过受控props显式连接组件。</ZText>
</ZStack>
