<script lang="ts">
	import { ZDescriptionList } from '@zadmin/zui';

	const items = [
		{ id: 'commit', term: 'Commit', description: 'a31f7c2' },
		{ id: 'actor', term: '发起人', description: 'release-bot' },
		{ id: 'time', term: '开始时间', description: '2026-08-30 14:20' },
		{ id: 'strategy', term: '策略', description: '滚动发布' }
	];
</script>

<ZDescriptionList aria-label="发布详情" {items} />
