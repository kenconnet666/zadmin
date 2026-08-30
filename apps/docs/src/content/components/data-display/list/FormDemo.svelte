<script lang="ts">
	import { ZList } from '@zadmin/zui';
	const items = [
		{ id: 'build', label: '构建', description: '生成可发布产物' },
		{ id: 'scan', label: '扫描', description: '执行依赖与安全检查' }
	];
</script>

<ZList ordered {items} />
