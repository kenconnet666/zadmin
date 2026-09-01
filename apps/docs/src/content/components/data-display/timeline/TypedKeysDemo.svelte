<script lang="ts">
	import { ZTimeline } from '@zadmin/zui';

	const items = [
		{ key: 1, status: 'done' as const, title: '数字键 1', description: 'number身份独立。' },
		{
			key: '1',
			status: 'current' as const,
			title: '字符串键 “1”',
			description: 'string身份不会与数字键碰撞。'
		}
	];
</script>

<ZTimeline label="Typed SelectionKey时间线" {items} />
