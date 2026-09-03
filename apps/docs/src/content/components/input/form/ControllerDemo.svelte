<script lang="ts">
	import {
		ZButton,
		ZForm,
		ZFormField,
		ZInput,
		ZStack,
		ZText,
		type ZFormController
	} from '@zadmin/zui';

	let controller = $state<ZFormController | null>(null);
	let disabled = $state(false);
	let nativeSubmits = $state(0);
	let nativeResets = $state(0);
	let releaseSummary = $state('未观察到字段状态变化');

	$effect(() => {
		const current = controller;
		if (!current) return;
		releaseSummary = '已连接（等待状态变化）';
		return current.subscribeField('release', (state) => {
			releaseSummary = `dirty=${state.dirty}; touched=${state.touched}; validating=${state.validating}; errors=${state.errors.length}`;
		});
	});
</script>

<ZStack gap="medium">
	<ZForm
		bind:controller
		{disabled}
		id="controller-demo-form"
		onreset={() => (nativeResets += 1)}
		onsubmit={() => (nativeSubmits += 1)}
		scrollToFirstError={{ block: 'center' }}
		size="small"
	>
		<ZStack gap="medium">
			<ZFormField
				name="release"
				label="发布版本"
				description="错误、警告与成功状态由字段图统一拥有。"
			>
				<ZInput defaultValue="1.0.0" />
			</ZFormField>
			<ZFormField name="channel" label="发布通道">
				<ZInput defaultValue="stable" />
			</ZFormField>
		</ZStack>
	</ZForm>

	<ZStack direction="row" gap="medium" wrap>
		<ZButton form="controller-demo-form" type="submit">表单外提交</ZButton>
		<ZButton
			type="button"
			variant="secondary"
			onclick={() => {
				controller?.setErrors({ release: ['版本已经存在'] });
				controller?.focusField('release');
			}}
			>注入服务端错误
		</ZButton>
		<ZButton
			type="button"
			variant="secondary"
			onclick={() =>
				controller?.setFieldState('channel', {
					success: '通道可用',
					warnings: ['将立即对生产用户可见']
				})}
			>设置字段状态
		</ZButton>
		<ZButton type="button" variant="secondary" onclick={() => (disabled = !disabled)}>
			{disabled ? '启用表单' : '禁用表单'}
		</ZButton>
		<ZButton type="button" variant="secondary" onclick={() => controller?.reset()}>重置</ZButton>
	</ZStack>
	<ZText tone="muted">native submit/reset = {nativeSubmits}/{nativeResets}</ZText>
	<ZText tone="muted">release状态订阅：{releaseSummary}</ZText>
</ZStack>
