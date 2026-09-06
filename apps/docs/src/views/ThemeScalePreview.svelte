<script lang="ts">
	import {
		controlSizes,
		semanticTones,
		useZui,
		ZBadge,
		ZButton,
		ZCard,
		ZCheckbox,
		ZContainer,
		ZHeading,
		ZInput,
		ZSeparator,
		ZSpinner,
		ZStack,
		ZSwitch,
		ZTag,
		ZText
	} from '@zadmin/zui';

	const zui = useZui();
	const typographySizes = [
		'xsmall',
		'small',
		'medium',
		'large',
		'xlarge',
		'xxlarge',
		'xxxlarge',
		'xxxxlarge'
	] as const;
	const appearances = ['solid', 'outline', 'ghost'] as const;
	const toneLabels = {
		neutral: '中性',
		info: '信息',
		success: '成功',
		warning: '警告',
		danger: '危险'
	} as const;
	let notifications = $state(1);
	function formatValue(value: string | number, unit: 'px' | 'ms'): string {
		return typeof value === 'number' ? `${value}${unit}` : value;
	}
</script>

<ZStack gap="xlarge" data-testid="theme-scale-preview">
	<ZSeparator />
	<section aria-labelledby="control-scale">
		<ZStack gap="large">
			<ZHeading id="control-scale" level={2} size="xxlarge">五档控件尺寸</ZHeading>
			<ZText as="p" tone="muted">
				同一档位保持协调的控件、文字和指示器比例。极小号适合紧凑工具栏，大号适合触屏或主要操作；显式尺寸优先于密度偏好。
			</ZText>
			{#each controlSizes as size (size)}
				<ZCard variant="outlined" data-testid={`theme-control-${size}`}>
					<ZStack gap="medium">
						<ZText weight="semibold">{size} · {formatValue(zui.theme.size[size], 'px')}</ZText>
						<ZStack direction="row" align="center" gap="medium" wrap>
							<ZButton {size}>保存更改</ZButton>
							<ZButton {size} variant="outline">次要操作</ZButton>
							<ZContainer size="xsmall" gutter="none">
								<ZInput {size} aria-label={`${size} 示例输入`} placeholder="输入内容" />
							</ZContainer>
							<ZText as="label" size={size === 'xlarge' ? 'large' : size}>
								<ZCheckbox {size} /> 订阅更新
							</ZText>
							<ZSwitch {size} aria-label={`${size} 自动保存`} />
							<ZSpinner {size} label={`${size} 正在加载`} />
						</ZStack>
					</ZStack>
				</ZCard>
			{/each}
		</ZStack>
	</section>
	<section aria-labelledby="semantic-scale">
		<ZStack gap="large">
			<ZHeading id="semantic-scale" level={2} size="xxlarge">语义色与外观形式</ZHeading>
			<ZText as="p" tone="muted">
				中性、信息、成功、警告、危险是五种状态含义。品牌主色独立配置；实心、描边和轻量外观改变强调程度，颜色含义保持一致。
			</ZText>
			{#each semanticTones as tone (tone)}
				<ZCard variant="outlined" data-testid={`theme-tone-${tone}`}>
					<ZStack direction="row" align="center" gap="large" wrap>
						<ZTag {tone}>{toneLabels[tone]}</ZTag>
						{#each appearances as variant (variant)}
							<ZButton {tone} {variant}>{toneLabels[tone]} · {variant}</ZButton>
						{/each}
						<ZButton {tone} disabled>不可用</ZButton>
					</ZStack>
				</ZCard>
			{/each}
		</ZStack>
	</section>
	<section aria-labelledby="typography-scale">
		<ZStack gap="large">
			<ZHeading id="typography-scale" level={2} size="xxlarge">八档排版字号</ZHeading>
			<ZText as="p" tone="muted"
				>控件使用合适的正文字号；标题层级由 level 决定，视觉大小单独选择。</ZText
			>
			{#each typographySizes as size (size)}
				<ZText as="p" {size} data-testid={`theme-typography-${size}`}
					>Aa 字体预览 · {size}
					· {formatValue(zui.theme.fontSize[size], 'px')}</ZText
				>
			{/each}
		</ZStack>
	</section>
	<section aria-labelledby="motion-preview">
		<ZStack gap="large">
			<ZHeading id="motion-preview" level={2} size="xxlarge">状态变化与动画</ZHeading>
			<ZText as="p" tone="muted">
				点击更新通知，观察计数变化。顶部“显示”面板可切换减少动画；主题的时长与缓动用于真实组件。
			</ZText>
			<ZStack direction="row" align="center" gap="large" wrap>
				<ZBadge count={notifications} tone="info">
					<ZButton
						onclick={() => (notifications += 1)}
						aria-label={`更新通知，当前 ${notifications} 条`}
					>
						更新通知
					</ZButton>
				</ZBadge>
				<ZButton variant="ghost" onclick={() => (notifications = 0)}>清空通知</ZButton>
				<ZText tone="muted"
					>快速 {formatValue(zui.theme.duration.fast, 'ms')} · 常规 {formatValue(
						zui.theme.duration.normal,
						'ms'
					)} · 入场 {zui.theme.easing.enter}</ZText
				>
			</ZStack>
		</ZStack>
	</section>
</ZStack>
