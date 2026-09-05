<script lang="ts">
	import { ZCard, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZCard bodyPadding="none" variant="outlined">
		<ZText>bodyPadding="none"</ZText>
	</ZCard>
	<ZCard bodyPadding="large" variant="outlined">
		<ZText>bodyPadding="large" 适合可读正文。</ZText>
	</ZCard>
</ZStack>
