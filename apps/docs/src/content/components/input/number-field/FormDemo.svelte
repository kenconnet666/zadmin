<script lang="ts">
	import { ZButton, ZField, ZNumberField, ZStack, ZText } from '@zadmin/zui';

	let value = $state<number>(1234.5);
</script>

<form>
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
				step={0.25}
			/>
		</ZField>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">value = {value ?? 'empty'}</ZText>
	</ZStack>
</form>
