<script lang="ts">
	import { ZBreadcrumb, ZProvider, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ href: '/workspace', key: 'workspace', label: 'مساحة العمل' },
		{ href: '/workspace/projects', key: 'projects', label: 'المشاريع' },
		{ current: true, key: 'details', label: 'تفاصيل التسليم' }
	] as const;
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZStack gap="small">
		<ZText tone="muted">布局使用逻辑属性；祖先RTL方向会自然镜像文本与换行起点。</ZText>
		<ZBreadcrumb aria-label="مسار التنقل" {items} />
	</ZStack>
</ZProvider>
