<script lang="ts">
	import { ZRadioGroup, ZRadioGroupItem, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZRadioGroup aria-label="不循环的部署策略" defaultValue="rolling" invalid loop={false}>
		<label><ZRadioGroupItem textValue="滚动" value="rolling" /> 滚动发布</label>
		<label><ZRadioGroupItem textValue="蓝绿" value="blue-green" /> 蓝绿发布</label>
		<label><ZRadioGroupItem textValue="金丝雀" value="canary" /> 金丝雀发布</label>
	</ZRadioGroup>
	<ZText tone="muted">loop=false时方向键停在首尾；invalid传递到所有radio。</ZText>
	<ZRadioGroup aria-label="禁用的发布策略" defaultValue="rolling" disabled>
		<label><ZRadioGroupItem textValue="滚动" value="rolling" /> 滚动发布</label>
	</ZRadioGroup>
</ZStack>
