<script lang="ts">
	import { ZButton, ZField, ZNumberField, ZStack, ZText } from '@zadmin/zui';

	let value = $state<number>(1234.5);
	let submitted = $state('尚未提交');
</script>

<form
	onsubmit={(event) => {
		event.preventDefault();
		submitted = `已提交 concurrency = ${String(new FormData(event.currentTarget).get('concurrency') ?? 'empty')}`;
	}}
	onreset={() => (submitted = '尚未提交')}
>
	<ZStack gap="medium">
		<ZField label="并发上限" description="使用zh-CN分组格式，编辑时接受本地小数符与数字。" required>
			<ZNumberField
				bind:value
				defaultValue={1234.5}
				decrementLabel="减少并发"
				incrementLabel="增加并发"
				max={10000}
				min={0}
				name="concurrency"
				pageStep={10}
				precision={2}
				step={0.25}
			/>
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton type="submit">提交数值</ZButton>
			<ZButton type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">value = {value ?? 'empty'}</ZText>
		<ZText tone="muted" size="small"
			>输入未完成的“-”后直接按 Enter，原生校验会阻止提交；失焦后按既有数值恢复。</ZText
		>
		<ZText aria-live="polite" data-testid="number-form-submitted" tone="muted">{submitted}</ZText>
	</ZStack>
</form>
