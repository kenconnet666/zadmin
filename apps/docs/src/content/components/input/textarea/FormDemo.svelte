<script lang="ts">
	import { ZButton, ZField, ZStack, ZText, ZTextarea } from '@zadmin/zui';

	let value = $state('生产变更说明');
	let height = $state(0);
</script>

<form>
	<ZStack gap="medium">
		<ZField label="变更说明" description="内容和容器宽度变化时自动计算高度。" required>
			<ZTextarea
				autosize
				bind:value
				defaultValue="生产变更说明"
				name="description"
				onResize={(next) => (height = Math.round(next))}
				placeholder="逐行描述变更"
				rows={2}
			/>
		</ZField>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">value = {value.replaceAll('\n', ' / ')} · height = {height}px</ZText>
	</ZStack>
</form>
