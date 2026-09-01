<script lang="ts">
	import { ZList, ZText } from '@zadmin/zui';
</script>

<ZList aria-label="手写嵌套列表">
	<li>
		<ZText weight="semibold">生产环境</ZText>
		<ZList
			items={[
				{ key: 'api', label: 'API服务' },
				{ key: 'worker', label: '异步任务' }
			]}
		/>
	</li>
	<li>预发布环境</li>
</ZList>
