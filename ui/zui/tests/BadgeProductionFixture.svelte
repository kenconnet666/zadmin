<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import {
		defaultTheme,
		extendTheme,
		ZAvatar,
		ZBadge,
		ZButton,
		ZProvider,
		ZStack,
		type DurationTokenValue
	} from '../src/entrypoints/index.js';

	let { duration, easing }: { duration?: DurationTokenValue; easing?: string } = $props();
	let count = $state(100);
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let invisible = $state(false);
	let reduced = $state(false);
	const theme = $derived(
		extendTheme(defaultTheme, {
			duration: { fast: duration ?? defaultTheme.duration.fast },
			easing: { enter: easing ?? defaultTheme.easing.enter }
		})
	);
</script>

<ZProvider motion={reduced ? 'reduced' : 'full'} {direction} {theme}>
	<ZStack direction="row" gap="large">
		<ZBadge
			{count}
			{invisible}
			data-testid="badge-production-anchor"
			max={99}
			offset={[3, 2]}
			overlap="circular"
			placement="top-start"
			tone="danger"
		>
			<ZButton aria-label={`通知中心有${count}条消息`} shape="square" variant="outline">
				<Bell aria-hidden="true" size={16} />
			</ZButton>
		</ZBadge>
		<ZBadge count={0} data-testid="badge-production-zero-hidden" />
		<ZBadge count={0} data-testid="badge-production-zero-visible" showZero />
		<ZBadge data-testid="badge-production-dot-decorative" dot>
			<ZAvatar alt="Decorative status" fallbackText="D" />
		</ZBadge>
		<ZBadge data-testid="badge-production-dot-named" dot label="服务在线" tone="success">
			<ZAvatar alt="Production service" fallbackText="P" />
		</ZBadge>
	</ZStack>
</ZProvider>
<ZProvider motion="reduced">
	<ZBadge {count} data-testid="badge-production-reduced" />
</ZProvider>
<ZButton data-testid="badge-production-increment" onclick={() => (count += 1)}>Increment</ZButton>
<ZButton
	data-testid="badge-production-toggle-direction"
	onclick={() => (direction = direction === 'ltr' ? 'rtl' : 'ltr')}
	>Toggle direction
</ZButton>
<ZButton data-testid="badge-production-toggle-visible" onclick={() => (invisible = !invisible)}
	>Toggle visible
</ZButton>
<ZButton data-testid="badge-production-toggle-motion" onclick={() => (reduced = !reduced)}
	>Toggle motion
</ZButton>
<output data-testid="badge-production-output">{count}:{direction}:{invisible}</output>
