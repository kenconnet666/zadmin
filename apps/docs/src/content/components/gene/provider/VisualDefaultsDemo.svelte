<script lang="ts">
	import {
		ZAvatar,
		ZBadge,
		ZButton,
		ZDialog,
		ZDialogClose,
		ZDialogContent,
		ZDialogDescription,
		ZDialogTitle,
		ZDialogTrigger,
		ZHeading,
		ZIcon,
		ZLink,
		ZProvider,
		ZSpinner,
		ZStack,
		ZTag,
		ZText,
		ZToggleButton,
		ZTooltip,
		ZTooltipContent,
		ZTooltipTrigger,
		type ZuiComponentDefaults
	} from '@zadmin/zui';

	let compact = $state(false);
	let pressed = $state(false);
	let open = $state(false);
	const defaults = $derived({
		text: { size: compact ? 'small' : 'large', lineHeight: 'relaxed' },
		heading: { size: compact ? 'xlarge' : 'xxlarge', tone: 'primary', wrap: 'balance' },
		icon: { size: compact ? 'small' : 'large', strokeWidth: 1.5 },
		spinner: { size: compact ? 'small' : 'large', tone: 'muted' },
		button: { size: compact ? 'small' : 'large', variant: 'outline' },
		toggleButton: { tone: 'success', variant: 'ghost' },
		link: { appearance: 'button' },
		tag: { size: compact ? 'small' : 'large', tone: 'info' },
		badge: { size: compact ? 'small' : 'large', tone: 'warning' },
		avatar: { size: compact ? 'small' : 'large', shape: 'rounded' },
		dialog: { size: compact ? 'small' : 'large' },
		tooltip: { size: compact ? 'small' : 'large' }
	} satisfies ZuiComponentDefaults);
</script>

<ZStack gap="medium">
	<ZButton variant="outline" onclick={() => (compact = !compact)}>
		切换为{compact ? '宽松' : '紧凑'}配置
	</ZButton>
	<ZProvider componentDefaults={defaults}>
		<ZHeading level={3} id="provider-visual-defaults-title">一个作用域，多种视觉默认值</ZHeading>
		<ZText>正文、标题、图标和控件分别消费自己的尺寸与主题配置。</ZText>
		<ZStack direction="row" gap="small" align="center" wrap>
			<ZIcon name="check" label="配置已生效" />
			<ZSpinner label="正在同步配置" />
			<ZAvatar alt="林晓" />
			<ZBadge count={6} />
			<ZTag>继承语义色</ZTag>
			<ZToggleButton bind:pressed>保留选择</ZToggleButton>
			<ZLink href="#provider-visual-defaults-title">按钮外观链接</ZLink>
		</ZStack>
		<ZText size="small" tone="muted">
			这行显式保留small；Toggle状态为 {pressed ? '已选择' : '未选择'}。
		</ZText>
		<ZProvider componentDefaults={{ text: null }}>
			<ZText>局部停止Text默认值继承，恢复组件内置字号。</ZText>
		</ZProvider>
		<ZStack direction="row" gap="small" wrap>
			<ZDialog bind:open>
				<ZDialogTrigger>打开作用域对话框</ZDialogTrigger>
				<ZDialogContent>
					<ZDialogTitle>浮层也继承配置</ZDialogTitle>
					<ZDialogDescription
						>内容跨Portal挂载后，仍读取当前Provider中的dialog.size。</ZDialogDescription
					>
					<ZDialogClose>关闭</ZDialogClose>
				</ZDialogContent>
			</ZDialog>
			<ZTooltip>
				<ZTooltipTrigger>查看提示</ZTooltipTrigger>
				<ZTooltipContent>提示文本使用tooltip.size，并保留独立的反色表面。</ZTooltipContent>
			</ZTooltip>
		</ZStack>
	</ZProvider>
</ZStack>
