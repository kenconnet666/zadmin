<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Stack, Text, defaultTheme, icss } from '@zadmin/zui';

	import type { DesktopError } from '../runtime/error.js';
	import { useDesktopPlatform } from './context.js';

	interface Props {
		children?: Snippet;
		onerror?: (error: DesktopError) => void;
		title?: string;
	}

	let { children, onerror, title = 'ZAdmin Desktop' }: Props = $props();
	const desktop = useDesktopPlatform();
	const titleBarClass = icss(defaultTheme, (css) => {
		css.minHeight.px(40);
		css.padding.px(0, 8);
		css.backgroundColor._surface;
		css.borderBottomWidth._hairline;
		css.borderBottomColor._border;
		css.borderStyle('solid');
		css.userSelect.none;
	});

	async function run(action: () => Promise<import('../runtime/error.js').DesktopResult<void>>) {
		const result = await action();
		if (!result.ok) onerror?.(result.error);
	}

	function startDragging(event: PointerEvent) {
		if (event.button === 0) void run(() => desktop.window.startDragging());
	}
</script>

<Stack
	direction="row"
	align="center"
	justify="space-between"
	gap="small"
	class={titleBarClass}
	data-tauri-drag-region
	onpointerdown={startDragging}
	ondblclick={() => run(() => desktop.window.toggleMaximize())}
>
	<Text as="strong" size="small" data-tauri-drag-region>{title}</Text>
	<div
		role="group"
		aria-label="Window controls"
		onpointerdown={(event) => event.stopPropagation()}
		ondblclick={(event) => event.stopPropagation()}
	>
		{@render children?.()}
	</div>
</Stack>
