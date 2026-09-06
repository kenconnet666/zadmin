<script lang="ts">
	import { ZButton, ZNavigationMenu, ZProvider, ZStack, ZText } from '@zadmin/zui';

	let collapsed = $state(false);
	const items = [
		{
			key: 'dashboard',
			label: 'لوحة المعلومات',
			href: '/docs/dashboard',
			children: [
				{ key: 'activity', label: 'النشاط', href: '/docs/dashboard/activity' },
				{ key: 'health', label: 'الصحة', href: '/docs/dashboard/health' }
			]
		},
		{ key: 'settings', label: 'الإعدادات', href: '/docs/settings' }
	] as const;
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZStack gap="small" style="max-width: 100%;">
		<ZButton size="small" variant="outline" onclick={() => (collapsed = !collapsed)}
			>collapsed={collapsed}</ZButton
		>
		<ZNavigationMenu
			aria-label="التنقل الرئيسي"
			{items}
			mode="inline"
			{collapsed}
			currentKey="activity"
		/>
		<ZText tone="muted">collapsed模式保留真实NavLink和flyout入口，不只是隐藏标签。</ZText>
	</ZStack>
</ZProvider>
