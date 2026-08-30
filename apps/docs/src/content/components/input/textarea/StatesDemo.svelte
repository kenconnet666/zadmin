<script lang="ts">
	import { ZStack, ZTextarea } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZTextarea
		aria-label="小尺寸固定文本域"
		id="textarea-small-fixed"
		placeholder="固定尺寸"
		resize="none"
		rows={2}
		size="small"
	/>
	<ZTextarea
		aria-label="大尺寸可双向调整文本域"
		defaultValue="可以拖动右下角改变宽高。"
		id="textarea-large-resizable"
		resize="both"
		rows={3}
		size="large"
	/>
	<ZTextarea aria-label="无效文本域" id="textarea-invalid" invalid value="不完整说明" />
	<ZTextarea aria-label="禁用文本域" disabled id="textarea-disabled" value="不可编辑" />
</ZStack>
