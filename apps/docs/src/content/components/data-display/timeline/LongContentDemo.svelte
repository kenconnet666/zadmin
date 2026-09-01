<script lang="ts">
	import { ZTimeline } from '@zadmin/zui';

	const items = [
		{
			key: 'migration',
			status: 'done' as const,
			title: '完成跨区域数据迁移与一致性校验',
			description:
				'迁移窗口覆盖多个租户与大批量历史记录，正文保留在稳定li中，并在窄视口自然换行而不改变事件顺序。',
			time: '2026-09-02 01:40'
		},
		{
			key: 'observation',
			status: 'current' as const,
			title: '观察生产指标',
			description: '持续核对错误率、延迟、队列积压和区域健康状态，再由业务owner决定是否结束观察。',
			time: '2026-09-02 02:05'
		}
	];
</script>

<ZTimeline label="长内容生产事件" {items} />
