<script lang="ts">
	import { MButton, MProvider, MStack, MText } from '../../../../../src/index.ts';

	let count = $state(0);
</script>

<MProvider>
	<MStack gap="small">
		<MText>count:{count}</MText>
		<MButton id="increment" onclick={() => (count += 1)}>increment</MButton>
	</MStack>
</MProvider>
