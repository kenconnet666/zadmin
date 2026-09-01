<script lang="ts">
	import { ZButton, ZInput, ZPagination, ZProvider, ZStack, ZText, ZTextarea } from '@zadmin/zui';
	import {
		auroraLight,
		highContrastDark,
		highContrastLight,
		midnightDark
	} from '@zadmin/zui/themes';

	let colorScheme = $state<'dark' | 'light'>('light');
	let contrast = $state<'high' | 'normal'>('normal');
	let density = $state<'compact' | 'comfortable' | 'spacious'>('compact');
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let motion = $state<'full' | 'reduced'>('full');
	const theme = $derived(
		contrast === 'high'
			? colorScheme === 'dark'
				? highContrastDark
				: highContrastLight
			: colorScheme === 'dark'
				? midnightDark
				: auroraLight
	);

	function cycleDensity(): void {
		switch (density) {
			case 'compact':
				density = 'comfortable';
				break;
			case 'comfortable':
				density = 'spacious';
				break;
			case 'spacious':
				density = 'compact';
		}
	}
</script>

<ZStack gap="medium">
	<ZText weight="semibold">动态Provider偏好轴</ZText>
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton
			size="small"
			variant="secondary"
			onclick={() => (colorScheme = colorScheme === 'light' ? 'dark' : 'light')}
		>
			明暗：{colorScheme}
		</ZButton>
		<ZButton
			size="small"
			variant="secondary"
			onclick={() => (contrast = contrast === 'normal' ? 'high' : 'normal')}
		>
			对比度：{contrast}
		</ZButton>
		<ZButton size="small" variant="secondary" onclick={cycleDensity}>
			密度：{density}
		</ZButton>
		<ZButton
			size="small"
			variant="secondary"
			onclick={() => (direction = direction === 'ltr' ? 'rtl' : 'ltr')}
		>
			方向：{direction}
		</ZButton>
		<ZButton
			size="small"
			variant="secondary"
			onclick={() => (motion = motion === 'full' ? 'reduced' : 'full')}
		>
			动画：{motion}
		</ZButton>
	</ZStack>

	<ZProvider {colorScheme} {contrast} {density} {direction} {motion} {theme}>
		<ZStack gap="medium">
			<ZText weight="semibold">当前子树即时消费最近的Provider与解析后Theme</ZText>
			<ZText tone="muted">
				未传size的控件继承{density}密度；显式size始终优先。Pagination箭头响应{direction}方向。
			</ZText>
			<ZStack direction="row" gap="small" wrap>
				<ZButton data-testid="provider-density-button">继承当前密度</ZButton>
				<ZButton data-testid="provider-explicit-button" size="large" variant="secondary"
					>显式大按钮
				</ZButton>
			</ZStack>
			<ZInput
				aria-label="继承Provider密度的输入框"
				data-testid="provider-density-input"
				placeholder="继承当前Provider密度"
			/>
			<ZTextarea
				aria-label="继承Provider密度的文本域"
				data-testid="provider-density-textarea"
				placeholder="Textarea与Input共享尺寸解析"
				rows={2}
			/>
			<ZPagination defaultPage={2} totalPages={5} />
		</ZStack>
	</ZProvider>
</ZStack>
