<script lang="ts">
	import { ZAnchor, ZProvider, ZScrollArea, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{
			key: 'long-one',
			label: '华东区域合作伙伴结算与对账中心',
			href: '#anchor-horizontal-one',
			targetId: 'anchor-horizontal-one'
		},
		{
			key: 'long-two',
			label: '第二个包含较长中文说明的章节',
			href: '#anchor-horizontal-two',
			targetId: 'anchor-horizontal-two'
		},
		{
			key: 'long-three',
			label: '第三个章节',
			href: '#anchor-horizontal-three',
			targetId: 'anchor-horizontal-three'
		}
	] as const;
	let scrollContainer = $state<HTMLDivElement | null>(null);
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZStack gap="medium" style="max-width: 100%;">
		<ZText weight="semibold">横向目录与RTL</ZText>
		<ZAnchor
			aria-label="فهرس الصفحة"
			{items}
			orientation="horizontal"
			{scrollContainer}
			history={false}
		/>
		<ZScrollArea
			bind:ref={scrollContainer}
			aria-label="محتوى الصفحة"
			height="16rem"
			scrollbarGutter="stable"
		>
			<div style="padding: 0.75rem;">
				<section id="anchor-horizontal-one" style="min-height: 7rem;">
					<ZText as="h3">华东区域合作伙伴结算与对账中心</ZText>
				</section>
				<section id="anchor-horizontal-two" style="min-height: 7rem;">
					<ZText as="h3">第二个包含较长中文说明的章节</ZText>
				</section>
				<section id="anchor-horizontal-three" style="min-height: 7rem;">
					<ZText as="h3">第三个章节</ZText>
				</section>
			</div>
		</ZScrollArea>
	</ZStack>
</ZProvider>
