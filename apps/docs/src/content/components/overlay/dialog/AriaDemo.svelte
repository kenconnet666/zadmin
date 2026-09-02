<script lang="ts">
	import {
		ZDialog,
		ZDialogClose,
		ZDialogContent,
		ZDialogOverlay,
		ZDialogTitle,
		ZDialogTrigger,
		ZStack,
		ZText
	} from '@zadmin/zui';
</script>

<ZStack direction="row" gap="small" wrap>
	<ZDialog>
		<ZDialogTrigger>只有标题</ZDialogTrigger>
		<ZDialogOverlay />
		<ZDialogContent>
			<ZDialogTitle>无需补充说明</ZDialogTitle>
			<ZText>没有Description时不会输出悬空aria-describedby。</ZText>
			<ZDialogClose>关闭</ZDialogClose>
		</ZDialogContent>
	</ZDialog>
	<ZDialog>
		<ZDialogTrigger>显式ARIA名称</ZDialogTrigger>
		<ZDialogOverlay />
		<ZDialogContent ariaDescribedBy={null} ariaLabel="快速状态" ariaLabelledBy={null}>
			<ZText>无需Title时必须显式提供ariaLabel或ariaLabelledBy。</ZText>
			<ZDialogClose>关闭</ZDialogClose>
		</ZDialogContent>
	</ZDialog>
</ZStack>
