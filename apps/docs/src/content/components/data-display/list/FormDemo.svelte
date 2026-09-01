<script lang="ts">
	import { ZList } from '@zadmin/zui';
	const items = [
		{ key: 'build', label: '构建', description: '生成可发布产物' },
		{ key: 'scan', label: '扫描', description: '执行依赖与安全检查' }
	];
</script>

<ZList ordered {items} />
