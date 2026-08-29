<script lang="ts">
	import { ZStack, ZText, defaultTheme, icss } from '@zadmin/zui';

	import type { DesktopResult } from '../../platform/types.js';
	import { useDesktopPlatform } from '../provider/context.js';
	import type { WindowTitleBarProps } from './types.js';

	let { children, onerror, title = 'ZAdmin Desktop' }: WindowTitleBarProps = $props();
	const desktop = useDesktopPlatform();
	const titleBarClass = icss(defaultTheme, (s) => {
		s.minHeight.px(40);
		s.padding.px(0, 8);
		s.backgroundColor._surface;
		s.borderBottomWidth._hairline;
		s.borderBottomColor._border;
		s.borderStyle.solid;
		s.userSelect.none;
	});

	async function run(action: () => Promise<DesktopResult<void>>) {
		const result = await action();
		if (!result.ok) onerror?.(result.error);
	}
	function startDragging(event: PointerEvent) {
		if (event.button === 0) void run(() => desktop.window.startDragging());
	}
</script>

<ZStack
	direction="row"
	align="center"
	justify="between"
	gap="small"
	class={titleBarClass}
	data-webview-drag-region
	onpointerdown={startDragging}
	ondblclick={() => run(() => desktop.window.toggleMaximize())}
>
	<ZText as="strong" size="small" data-webview-drag-region>{title}</ZText>
	<div
		role="group"
		aria-label="Window controls"
		onpointerdown={(event) => event.stopPropagation()}
		ondblclick={(event) => event.stopPropagation()}
	>
		{@render children?.()}
	</div>
</ZStack>
