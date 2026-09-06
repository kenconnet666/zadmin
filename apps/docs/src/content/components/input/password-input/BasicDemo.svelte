<script lang="ts">
	import { ZPasswordInput, ZText } from '@zadmin/zui';
	let visible = $state(false);
	let result = $state('尚未切换');
</script>

<ZPasswordInput
	aria-label="示例密码"
	bind:visible
	value="correct-horse"
	toggleLabel={(next) => (next ? '隐藏密码' : '显示密码')}
	onVisibleChange={(next) => (result = next ? '已显示' : '已隐藏')}
/>
<ZText>visible={visible ? 'true' : 'false'}；{result}</ZText>
