<script lang="ts">
	import { ZButton, ZNavigationMenu, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ key: 'overview', label: '概览', href: '/docs' },
		{ key: 'settings', label: '设置', href: '/docs/settings' },
		{ key: 'reports', label: '报表', href: '/docs/reports' }
	] as const;
	let currentKey = $state<'overview' | 'settings' | 'reports'>('overview');
	let accept = $state(false);
	let output = $state('尚未请求导航');

	function navigate(request: {
		key: typeof currentKey;
		href: string;
		preventDefault(): void;
		close(): void;
	}): void {
		output = accept ? `accepted ${request.href}` : `cancelled ${request.href}`;
		if (!accept) {
			request.preventDefault();
			return;
		}
		currentKey = request.key;
		request.close();
	}
</script>

<ZStack gap="small" style="max-width: 100%;">
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={() => (accept = !accept)}
			>accept={accept}</ZButton
		>
		<ZText tone="muted">currentKey={currentKey} · {output}</ZText>
	</ZStack>
	<ZNavigationMenu aria-label="受控文档导航" {items} {currentKey} onNavigateRequest={navigate} />
	<ZText tone="muted"
		>取消请求保留当前页和展开状态；接受后owner先写currentKey，再调用request.close。</ZText
	>
</ZStack>
