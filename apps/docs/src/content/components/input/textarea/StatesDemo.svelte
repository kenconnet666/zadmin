<script lang="ts">
	import { ZField, ZStack, ZTextarea } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZField description="Field负责label、required和说明关系。" label="小尺寸固定文本域" required>
		<ZTextarea placeholder="固定尺寸" resize="none" rows={2} size="small" />
	</ZField>
	<ZField description="只读控件仍可聚焦、选择和复制。" label="只读审计记录" readonly>
		<ZTextarea defaultValue="此内容只读，但仍会进入FormData。" name="audit" rows={2} />
	</ZField>
	<ZField error="请补充回滚策略。" label="无效变更说明">
		<ZTextarea defaultValue="尚未补充" rows={2} />
	</ZField>
	<ZField disabled label="禁用文本域">
		<ZTextarea defaultValue="禁用控件不会进入FormData。" rows={2} size="large" />
	</ZField>
</ZStack>
