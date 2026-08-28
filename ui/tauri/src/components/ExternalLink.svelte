<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { defaultTheme, icss } from '@zadmin/zui';

	import type { DesktopError } from '../runtime/error.js';
	import { useDesktopPlatform } from './context.js';

	type Props = Omit<HTMLAnchorAttributes, 'children' | 'href' | 'onclick' | 'onerror'> & {
		children?: Snippet;
		href: string;
		onerror?: (error: DesktopError) => void;
	};

	let { children, class: className, href, onerror, ...rest }: Props = $props();
	const desktop = useDesktopPlatform();
	const linkClass = icss(defaultTheme, (css) => {
		css.display.inlineFlex;
		css.alignItems.center;
		css.gap.px(4);
		css.color._primary;
		css.cursor.pointer;
		css.fontWeight._medium;
		css._hover((hover) => hover.color._primaryHover);
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
