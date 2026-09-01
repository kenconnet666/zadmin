<script lang="ts">
	import { ZDescriptionList } from '@zadmin/zui';
	const items = [
		{ key: 'version', term: '版本', description: 'v2.4.0' },
		{ key: 'region', term: '区域', description: 'cn-east-1' }
	];
</script>

<ZDescriptionList {items} />
