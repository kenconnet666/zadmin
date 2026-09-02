<script lang="ts">
	import { ZProvider, ZStack, ZTag, ZText } from '@zadmin/zui';

	let requested = $state('none');
</script>

<ZStack gap="medium">
	<ZTag onRemove={() => (requested = 'production')} removable textValue="production">
		production
	</ZTag>
	<ZProvider
		locale="en-US"
		localePack={{
			tag: { removeTag: (value) => (value ? `Delete label ${value}` : 'Delete label') }
		}}
	>
		<ZTag onRemove={() => (requested = 'staging')} removable textValue="staging">staging</ZTag>
	</ZProvider>
	<ZTag onRemove={() => (requested = 'audit')} removable removeLabel="移除显式审计标签">audit</ZTag>
	<ZText tone="muted">
		显式removeLabel优先，其次为Provider的typed tag.removeTag；requested = {requested}。
	</ZText>
</ZStack>
