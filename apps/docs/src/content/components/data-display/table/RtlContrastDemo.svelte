<script lang="ts">
	import { ZProvider, ZTable } from '@zadmin/zui';
</script>

<ZProvider contrast="high" density="spacious" direction="rtl">
	<ZTable caption="سجل النشر / 发布记录" striped>
		{#snippet header()}
			<tr
				><th scope="col">الخدمة / 服务</th><th scope="col">الإصدار / 版本</th><th scope="col"
					>الحالة / 状态</th
				></tr
			>
		{/snippet}
		<tr><th scope="row">موقع الوثائق / 文档站</th><td>v2.4.0</td><td>جاهز / 就绪</td></tr>
		<tr
			><th scope="row">عامل المهام / 任务执行器</th><td>v5.1.2</td><td>قيد المراقبة / 观察中</td
			></tr
		>
	</ZTable>
</ZProvider>
