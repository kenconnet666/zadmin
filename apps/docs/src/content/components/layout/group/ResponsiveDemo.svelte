<script lang="ts">
	import { ZButton, ZGroup, ZText } from '@zadmin/zui';
</script>

<ZGroup
	align={{ base: 'stretch', medium: 'center' }}
	gap={{ base: 'small', medium: 'medium' }}
	justify={{ base: 'start', medium: 'between' }}
	wrap={{ base: true, medium: false }}
>
	<ZText style="overflow-wrap: anywhere"
		>workspace-production-release-with-an-intentionally-long-identifier</ZText
	>
	<ZButton>继续</ZButton>
</ZGroup>
