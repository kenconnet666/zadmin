<script lang="ts">
	import { ZTimeline } from '@zadmin/zui';

	const items = [
		{ key: 'received', status: 'done' as const, title: '已接收请求', time: '09:10' },
		{ key: 'running', status: 'current' as const, title: '正在处理', time: '09:12' },
		{ key: 'failed', status: 'error' as const, title: '区域副本失败', time: '09:13' },
		{ key: 'retry', status: 'pending' as const, title: '等待人工重试' },
		{ key: 'audit', title: '中性审计记录', tone: 'default' as const }
	];
</script>

<ZTimeline label="状态与语义色调" {items} />
