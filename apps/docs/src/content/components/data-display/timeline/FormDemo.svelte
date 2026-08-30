<script lang="ts">
	import { ZTimeline } from '@zadmin/zui';
	const items = [
		{
			datetime: '2026-08-30T09:10:00+08:00',
			id: 'build',
			status: 'done' as const,
			time: '09:10',
			title: '构建完成',
			description: '生成Windows与Web制品'
		},
		{
			datetime: '2026-08-30T09:18:00+08:00',
			id: 'deploy',
			status: 'current' as const,
			time: '09:18',
			title: '部署生产',
			description: '正在等待区域健康检查'
		},
		{ id: 'verify', status: 'pending' as const, title: '验证指标' }
	];
</script>

<ZTimeline label="发布进度时间线" {items} />
