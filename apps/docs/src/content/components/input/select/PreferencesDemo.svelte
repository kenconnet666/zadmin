<script lang="ts">
	import {
		ZProvider,
		ZSelect,
		ZSelectContent,
		ZSelectTrigger,
		ZStack,
		ZText,
		type ZSelectOption
	} from '@zadmin/zui';

	const options = [
		{ group: 'البيئات', label: 'التطوير', value: 'development' },
		{ group: 'البيئات', label: 'الإنتاج', value: 'production' }
	] satisfies readonly ZSelectOption[];
</script>

<ZProvider
	direction="rtl"
	locale="ar"
	localePack={{
		collection: { empty: 'لا توجد خيارات', loading: 'جارٍ التحميل', selectOption: 'اختر بيئة' }
	}}
>
	<ZStack gap="small">
		<ZText>RTL + العربية</ZText>
		<ZSelect {options} placement="bottom-start">
			<ZSelectTrigger aria-label="بيئة النشر" />
			<ZSelectContent />
		</ZSelect>
	</ZStack>
</ZProvider>
