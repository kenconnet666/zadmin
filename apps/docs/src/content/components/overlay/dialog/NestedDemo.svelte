<script lang="ts">
	import {
		ZDialog,
		ZDialogClose,
		ZDialogContent,
		ZDialogDescription,
		ZDialogOverlay,
		ZDialogTitle,
		ZDialogTrigger,
		ZStack,
		ZText
	} from '@zadmin/zui';
</script>

<ZDialog>
	<ZDialogTrigger>打开外层Dialog</ZDialogTrigger>
	<ZDialogOverlay />
	<ZDialogContent>
		<ZStack gap="large">
			<ZDialogTitle>外层设置</ZDialogTitle>
			<ZDialogDescription
				>内层关闭后焦点返回内层Trigger；外层关闭后返回页面Trigger。</ZDialogDescription
			>
			<ZDialog>
				<ZDialogTrigger variant="secondary">打开内层Dialog</ZDialogTrigger>
				<ZDialogOverlay />
				<ZDialogContent>
					<ZStack gap="medium"
						><ZDialogTitle>内层确认</ZDialogTitle><ZDialogDescription
							>Escape只关闭当前顶层。</ZDialogDescription
						><ZDialogClose>关闭内层</ZDialogClose></ZStack
					>
				</ZDialogContent>
			</ZDialog>
			<ZText tone="muted">嵌套层共享LayerStack与FocusScope。</ZText>
			<ZDialogClose variant="secondary">关闭外层</ZDialogClose>
		</ZStack>
	</ZDialogContent>
</ZDialog>
