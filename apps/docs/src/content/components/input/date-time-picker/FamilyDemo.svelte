<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import {
		createFormModel,
		ZButton,
		ZDateTimePicker,
		ZForm,
		ZFormField,
		ZProvider,
		ZStack,
		ZText,
		type ZuiDirection,
		type ZuiMotion
	} from '@zadmin/zui';

	const defaultAt = new CalendarDateTime(2026, 9, 7, 10, 30);
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const model = createFormModel<{ at: CalendarDateTime | null }>({
		defaultValues: { at: defaultAt }
	});
	let direction = $state<ZuiDirection>('ltr');
	let motion = $state<ZuiMotion>('full');
	let open = $state(false);
	let submitted = $state('尚未提交');
	let valueChanges = $state(0);
	let commits = $state(0);

	function clearOwner(): void {
		model.setField('at', null);
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			data-testid="date-time-family-direction"
			size="small"
			variant="outline"
			onclick={() => (direction = direction === 'ltr' ? 'rtl' : 'ltr')}
		>
			逻辑方向：{direction}
		</ZButton>
		<ZButton
			data-testid="date-time-family-motion"
			size="small"
			variant="outline"
			onclick={() => (motion = motion === 'reduced' ? 'full' : 'reduced')}
		>
			动画：{motion}
		</ZButton>
	</ZStack>

	<ZProvider {direction} {motion}>
		<ZStack gap="medium">
			{#each sizes as size (size)}
				<ZDateTimePicker
					aria-label={`${size} 日期时间选择器`}
					defaultValue={defaultAt}
					hourCycle={24}
					{size}
				/>
			{/each}
			<ZDateTimePicker aria-label="只读日期时间" defaultValue={defaultAt} hourCycle={24} readonly />
			<ZDateTimePicker aria-label="禁用日期时间" defaultValue={defaultAt} disabled hourCycle={24} />
			<ZForm
				{model}
				onValidSubmit={({ formData }) => {
					submitted = String(formData.get('at'));
				}}
			>
				<ZStack gap="small">
					<ZFormField name="at" label="计划时刻" required>
						<ZDateTimePicker
							aria-label="计划时刻 owner"
							bind:open
							commitMode="confirm"
							data-testid="date-time-family-owner"
							hourCycle={24}
							onCommit={() => (commits += 1)}
							onValueChange={() => (valueChanges += 1)}
						/>
					</ZFormField>
					<ZStack direction="row" gap="small" wrap>
						<ZButton type="submit">提交计划</ZButton>
						<ZButton
							data-testid="date-time-family-clear"
							type="button"
							variant="outline"
							onclick={clearOwner}
						>
							外部清空 owner
						</ZButton>
						<ZButton data-testid="date-time-family-reset" type="reset" variant="outline"
							>恢复模型与面板草稿</ZButton
						>
					</ZStack>
					<ZText aria-live="polite" data-testid="date-time-family-state" tone="muted">
						direction={direction} · motion={motion} · open={open} · owner={model.values.at?.toString() ??
							'null'} · value变更={valueChanges} · commit={commits} · FormData at={submitted}
					</ZText>
					<ZText tone="muted">
						confirm模式下，面板选择先停留在草稿；确认才交给model
						owner。外部清空和reset都由owner重建字段与面板草稿。
					</ZText>
				</ZStack>
			</ZForm>
		</ZStack>
	</ZProvider>
</ZStack>
