<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const portalHostRecipe = defineRecipe(
		{
			base: (s) => {
				s.borderColor._border;
				s.borderRadius._medium;
				s.borderStyle.dashed;
				s.borderWidth._hairline;
				s.paddingBlock._medium;
				s.paddingInline._large;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZBox,
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZProvider,
		ZStack,
		ZText,
		useZui
	} from '@zadmin/zui';

	const zui = useZui();
	const portalHostClass = $derived(zui.recipe(portalHostRecipe));
	let open = $state(false);
	let portalHost = $state<HTMLDivElement | null>(null);
</script>

<ZStack gap="medium">
	<ZBox bind:ref={portalHost} class={portalHostClass} data-testid="provider-portal-host">
		<ZText tone="muted">Popover Content会挂载到这个ZBox，而不是document.body。</ZText>
	</ZBox>
	<ZProvider idPrefix="provider-demo" portalContainer={portalHost}>
		<ZPopover bind:open placement="bottom-start">
			<ZPopoverTrigger variant="secondary">检查Portal边界</ZPopoverTrigger>
			<ZPopoverContent data-testid="provider-portal-content">
				<ZText>自定义Portal容器中的内容</ZText>
			</ZPopoverContent>
		</ZPopover>
	</ZProvider>
	<ZText tone="muted">open = {open} · idPrefix = provider-demo</ZText>
</ZStack>
