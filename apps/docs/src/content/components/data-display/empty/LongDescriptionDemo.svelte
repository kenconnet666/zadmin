<script lang="ts">
	import { ZButton, ZEmpty } from '@zadmin/zui';
</script>

<ZEmpty data-empty-kind="responsive" headingLevel={5} title="当前工作区没有可显示的审计记录">
	{#snippet description()}
		这是一个用于验证窄容器和长内容的空集合说明：审计任务可能尚未创建，也可能因为region-production-east-with-an-intentionally-long-name筛选条件而暂时没有记录。请先确认时间范围与环境，然后决定创建任务或清除筛选。
	{/snippet}
	{#snippet actions()}
		<ZButton>创建审计任务</ZButton>
		<ZButton variant="secondary">清除全部筛选条件</ZButton>
	{/snippet}
</ZEmpty>
