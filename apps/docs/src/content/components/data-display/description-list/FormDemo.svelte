<script lang="ts">
	import { ZDescriptionList } from '@zadmin/zui';
	const items = [
		{ id: 'version', term: '版本', description: 'v2.4.0' },
		{ id: 'region', term: '区域', description: 'cn-east-1' }
	];
</script>

<ZDescriptionList {items} />
