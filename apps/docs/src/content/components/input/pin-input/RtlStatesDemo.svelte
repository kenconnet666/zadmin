<script lang="ts">
	import { ZButton, ZPinInput, ZProvider, ZStack, ZText } from '@zadmin/zui';

	let readonly = $state(true);
	let readonlyValue = $state<string | null>('1234');
</script>

<ZProvider direction="rtl">
	<ZStack gap="medium">
		<ZText>RTL方向键按视觉方向移动，字符串身份仍保持逻辑顺序。</ZText>
		<ZPinInput
			bind:value={readonlyValue}
			inputLabel={(index, length) => `رمز ${index + 1} من ${length}`}
			length={4}
			{readonly}
			size="large"
		/>
		<ZStack direction="row" gap="small" wrap>
			<ZButton type="button" variant="secondary" onclick={() => (readonly = !readonly)}>
				{readonly ? '开启编辑' : '设为只读'}
			</ZButton>
			<ZButton type="button" variant="secondary" onclick={() => (readonlyValue = null)}>
				外部清空
			</ZButton>
		</ZStack>
		<ZText tone="muted">
			{readonly
				? '只读状态仍可聚焦、选择和使用方向键；不会响应粘贴或Backspace/Delete。'
				: '关闭只读后聚焦任一槽位，使用Backspace/Delete验证逻辑删除。'}
		</ZText>
		<ZPinInput
			inputLabel={(index, length) => `خطأ ${index + 1} من ${length}`}
			invalid
			length={4}
			size="small"
		/>
	</ZStack>
</ZProvider>
