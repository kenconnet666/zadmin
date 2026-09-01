<script lang="ts">
	import {
		ZCombobox,
		ZComboboxContent,
		ZComboboxInput,
		ZProvider,
		ZStack,
		ZText,
		type ZComboboxOption
	} from '@zadmin/zui';

	const options = [
		{ group: 'البيئات', label: 'التطوير', value: 'development' },
		{ group: 'البيئات', label: 'الإنتاج', value: 'production' }
	] satisfies readonly ZComboboxOption[];
</script>

<ZProvider
	direction="rtl"
	locale="ar"
	localePack={{
		collection: { empty: 'لا توجد نتائج', loading: 'جارٍ التحميل', selectOptions: 'نتائج البيئة' }
	}}
>
	<ZStack gap="small">
		<ZText>RTL + العربية</ZText>
		<ZCombobox {options}>
			<ZComboboxInput aria-label="ابحث عن بيئة" placeholder="اكتب للبحث" />
			<ZComboboxContent />
		</ZCombobox>
	</ZStack>
</ZProvider>
