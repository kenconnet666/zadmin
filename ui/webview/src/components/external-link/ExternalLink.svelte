<script lang="ts">
	import { defaultTheme, icss } from '@zadmin/zui';

	import { useDesktopPlatform } from '../provider/context.js';
	import type { ExternalLinkProps } from './types.js';

	let { children, class: className, href, onerror, ...rest }: ExternalLinkProps = $props();
	const desktop = useDesktopPlatform();
	const linkClass = icss(defaultTheme, (s) => {
		s.display.inlineFlex;
		s.alignItems.center;
		s.gap.px(4);
		s.color._primary;
		s.cursor.pointer;
		s.fontWeight._medium;
		s._hover((hover) => hover.color._primaryHover);
	});

	async function open(event: MouseEvent): Promise<void> {
		event.preventDefault();
		const result = await desktop.opener.openUrl(href);
		if (!result.ok) onerror?.(result.error);
	}
</script>

<a {...rest} {href} class={[linkClass, className]} rel="noreferrer" onclick={open}>
	{@render children?.()}
</a>
