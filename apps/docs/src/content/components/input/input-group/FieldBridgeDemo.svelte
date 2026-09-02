<script lang="ts">
	import { ZField, ZInput, ZInputGroup } from '@zadmin/zui';
</script>

<ZField
	label="工作区标识"
	description="点击label会聚焦Group注册的唯一业务control。"
	error="标识只能包含小写字母和连字符。"
	name="workspace"
	required
	size="small"
>
	<ZInputGroup>
		{#snippet prefix()}workspace/{/snippet}
		<ZInput value="Invalid Value" />
	</ZInputGroup>
</ZField>
