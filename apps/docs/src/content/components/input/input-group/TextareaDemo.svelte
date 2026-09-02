<script lang="ts">
	import { ZField, ZInputGroup, ZTextarea } from '@zadmin/zui';
</script>

<ZField label="部署说明" description="Textarea仍是唯一value owner；affix只解释单位。" name="notes">
	<ZInputGroup>
		{#snippet prefix()}备注{/snippet}
		<ZTextarea autosize={{ minRows: 2, maxRows: 4 }} placeholder="输入多行部署说明" resize="none" />
		{#snippet suffix()}Markdown{/snippet}
	</ZInputGroup>
</ZField>
