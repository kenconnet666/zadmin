<script lang="ts">
	import { ZAnchor, ZButton, ZHeading, ZScrollArea, ZStack, ZText } from '@zadmin/zui';
	type SectionKey = 'first' | 'second' | 'third';

	const items = [
		{
			key: 'first',
			label: '第一段',
			href: '#anchor-controlled-first',
			targetId: 'anchor-controlled-first'
		},
		{
			key: 'second',
			label: '第二段',
			href: '#anchor-controlled-second',
			targetId: 'anchor-controlled-second'
		},
		{
			key: 'third',
			label: '第三段',
			href: '#anchor-controlled-third',
			targetId: 'anchor-controlled-third'
		}
	] as const;
	let activeKey = $state<SectionKey | null>('first');
	let output = $state('尚未收到active变化');
	let anchor = $state<{
		focus(key?: SectionKey): void;
		scrollTo(key: SectionKey): boolean;
	} | null>(null);
	let scrollContainer = $state<HTMLDivElement | null>(null);

	function onActiveKeyChange(key: SectionKey | null): void {
		activeKey = key;
		output = `observed ${String(key)}`;
	}
</script>

<ZStack gap="small" style="max-width: 100%;">
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={() => anchor?.focus('second')}
			>聚焦第二项</ZButton
		>
		<ZButton size="small" variant="outline" onclick={() => anchor?.scrollTo('third')}
			>滚动第三段</ZButton
		>
		<ZText tone="muted">activeKey={String(activeKey)} · {output}</ZText>
	</ZStack>
	<ZAnchor
		bind:this={anchor}
		aria-label="受控目录"
		{items}
		bind:activeKey
		{onActiveKeyChange}
		{scrollContainer}
		history={false}
	/>
	<ZScrollArea
		bind:ref={scrollContainer}
		aria-label="受控内容"
		height="16rem"
		scrollbarGutter="stable"
	>
		<div style="display: grid; gap: 0.75rem; padding: 0.75rem; max-width: 100%;">
			<section id="anchor-controlled-first" style="min-height: 7rem;">
				<ZHeading level={3} size="medium">第一段</ZHeading>
				<ZText>owner持有activeKey。</ZText>
			</section>
			<section id="anchor-controlled-second" style="min-height: 7rem;">
				<ZHeading level={3} size="medium">第二段</ZHeading>
				<ZText>focus和active观察不会隐式变更路由。</ZText>
			</section>
			<section id="anchor-controlled-third" style="min-height: 7rem;">
				<ZHeading level={3} size="medium">第三段</ZHeading>
				<ZText>scrollTo只请求目标定位。</ZText>
			</section>
		</div>
	</ZScrollArea>
</ZStack>
