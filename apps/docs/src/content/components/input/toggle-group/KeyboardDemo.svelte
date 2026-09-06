<script lang="ts">
	import { ZProvider, ZStack, ZText, ZToggleGroup } from '@zadmin/zui';

	const items = [
		{ value: 'one', label: '第一项' },
		{ value: 'two', label: '第二项' },
		{ value: 'three', label: '第三项' }
	] as const;
	let value = $state<readonly (typeof items)[number]['value'][]>(['two']);
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZStack gap="medium">
		<ZStack gap="small">
			<ZText weight="semibold">vertical + RTL + roving</ZText>
			<ZToggleGroup bind:value {items} aria-label="مجموعة عمودية" orientation="vertical" />
		</ZStack>
		<ZStack gap="small">
			<ZText weight="semibold">readonly + disabled item</ZText>
			<ZToggleGroup defaultValue={['two']} {items} aria-label="مجموعة للقراءة فقط" readonly />
		</ZStack>
		<ZStack gap="small">
			<ZText weight="semibold">roving=false：原生Tab入口</ZText>
			<ZToggleGroup
				defaultValue={['one']}
				items={[...items.slice(0, 2), { value: 'three', label: '禁用', disabled: true }]}
				aria-label="مجموعة بدون تنقل دائري"
				loop={false}
				roving={false}
			/>
		</ZStack>
	</ZStack>
</ZProvider>
