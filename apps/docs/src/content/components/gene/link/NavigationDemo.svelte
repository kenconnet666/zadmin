<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { ZLink, ZStack } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZLink aria-current="page" href="#/components/link" underline="always">当前页面</ZLink>
	<ZLink href="https://github.com/kenconnet666/zadmin" target="_blank">
		仓库 <ExternalLink aria-hidden="true" size={14} />
	</ZLink>
	<ZLink href="#/" tone="muted" underline="none">弱化导航</ZLink>
</ZStack>
