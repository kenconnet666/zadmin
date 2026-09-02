<script lang="ts">
	import { ZBox, ZCarousel, ZHeading, ZProvider, ZText } from '@zadmin/zui';

	const items = [
		{
			key: 'resource',
			label: 'معرّف المورد / 资源标识',
			copy: 'production-platform/services/reporting/deployments/2026-09-02/extremely-long-resource-identifier'
		},
		{ key: 'owner', label: 'المالك / 所有者', copy: 'Platform Engineering / منصة الإنتاج' }
	];
</script>

<ZProvider direction="rtl">
	<ZBox style="max-width: 24rem; overflow-wrap: anywhere">
		<ZCarousel
			aria-label="تفاصيل النشر / 发布详情轮播"
			{items}
			itemKey={(entry) => entry.key}
			itemLabel={(entry) => entry.label}
			loop={false}
		>
			{#snippet item(entry)}
				<ZHeading level={4}>{entry.label}</ZHeading>
				<ZText>{entry.copy}</ZText>
			{/snippet}
		</ZCarousel>
	</ZBox>
</ZProvider>
