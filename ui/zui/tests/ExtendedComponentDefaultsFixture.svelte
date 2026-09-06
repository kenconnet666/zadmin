<script lang="ts">
	import {
		ZProvider,
		ZText,
		ZHeading,
		ZIcon,
		ZSpinner,
		ZButton,
		ZToggleButton,
		ZLink,
		ZTag,
		ZBadge,
		ZAvatar,
		ZDialog,
		ZDialogTrigger,
		ZDialogContent,
		ZDialogTitle,
		ZTooltip,
		ZTooltipTrigger,
		ZTooltipContent,
		type ZControlSize
	} from '../src/entrypoints/index.js';
	import type { ZuiComponentDefaults } from '../src/runtime/foundation/component-defaults.js';
	import { defaultTheme } from '../src/theme/default.js';
	import { extendTheme } from '../src/theme/define.js';

	let { explicitOverlaySize }: { explicitOverlaySize?: ZControlSize } = $props();
	const theme = extendTheme(defaultTheme, {
		color: { info: '#123456', success: '#236734', warning: '#885500', danger: '#990033' }
	});
	let defaults = $state<ZuiComponentDefaults>({
		text: { size: 'large', weight: 'semibold', tone: 'info', lineHeight: 'relaxed' },
		heading: {
			size: 'xxxlarge',
			weight: 'medium',
			tone: 'success',
			lineHeight: 'normal',
			wrap: 'wrap'
		},
		icon: { size: 22, strokeWidth: 1.5 },
		spinner: { size: 'xlarge', tone: 'muted' },
		button: { size: 'large', tone: 'info', variant: 'outline', fullWidth: true },
		toggleButton: { size: 'small', tone: 'success', variant: 'ghost', fullWidth: false },
		link: { appearance: 'button', tone: 'warning', underline: 'hover' },
		tag: { size: 'xlarge', tone: 'success' },
		badge: { size: 'small', tone: 'warning', placement: 'bottom-start', overlap: 'circular' },
		avatar: { size: 'large', shape: 'square' },
		dialog: { size: 'small' },
		tooltip: { size: 'large' }
	});
	let buttonClicks = $state(0);
	let pressed = $state(false);
	let pressedChanges = $state(0);
	let surface = $state<'none' | 'dialog' | 'tooltip'>('none');

	export function showSurface(next: 'none' | 'dialog' | 'tooltip'): void {
		surface = next;
	}
	export function changeDefaults(): void {
		defaults = {
			...defaults,
			text: { size: 'small', tone: 'danger' },
			button: { size: 'xsmall', tone: 'danger', variant: 'solid' },
			toggleButton: null,
			link: null,
			badge: { size: 'xlarge', tone: 'info' },
			dialog: { size: 'xlarge' },
			tooltip: { size: 'xsmall' }
		};
	}
</script>

<ZProvider {theme} componentDefaults={defaults} motion="reduced">
	<div style="width:250px;">
		<ZText data-testid="defaults-text">Text</ZText>
		<ZText data-testid="explicit-text" size="medium" tone="neutral" weight="normal">Explicit</ZText>
		<ZHeading data-testid="defaults-heading" level={3}>Heading</ZHeading>
		<ZIcon data-testid="defaults-icon" name="check" />
		<ZIcon data-testid="explicit-icon" name="check" size={12} strokeWidth={2} />
		<ZSpinner data-testid="defaults-spinner" />
		<ZButton data-testid="defaults-button" onclick={() => (buttonClicks += 1)}>Button</ZButton>
		<ZButton data-testid="explicit-button" size="small" fullWidth={false}>Explicit button</ZButton>
		<ZButton data-testid="busy-button" loading>Saving</ZButton>
		<ZToggleButton
			data-testid="defaults-toggle"
			bind:pressed
			onPressedChange={() => (pressedChanges += 1)}>Toggle</ZToggleButton
		>
		<ZLink data-testid="defaults-link" href="#native-target">Link</ZLink>
		<ZLink
			data-testid="explicit-text-link"
			href="#native-target"
			appearance="text"
			underline="always"
			tone="primary">Text link</ZLink
		>
		<ZLink data-testid="navigation-link" href="#native-target" appearance="navigation"
			>Navigation</ZLink
		>
		<ZTag data-testid="defaults-tag">Tag</ZTag>
		<ZBadge data-testid="defaults-badge" count={7} />
		<ZAvatar data-testid="defaults-avatar" alt="Mina" />
		<ZProvider componentDefaults={{ text: { tone: 'danger' }, icon: null }}>
			<ZText data-testid="nested-text">Nested text</ZText>
			<ZIcon data-testid="nested-icon" name="check" />
		</ZProvider>
		<ZProvider componentDefaults={{ text: null }}>
			<ZText data-testid="text-null">Text defaults stopped</ZText>
			<ZBadge data-testid="other-default-retained" count={4} />
		</ZProvider>
		<ZProvider componentDefaults={null}>
			<ZText data-testid="axis-null-text">All defaults stopped</ZText>
			<ZToggleButton data-testid="axis-null-toggle">Built-in toggle</ZToggleButton>
		</ZProvider>
		<output data-testid="defaults-events">{buttonClicks}:{pressed}:{pressedChanges}</output>
	</div>
	<ZDialog open={surface === 'dialog'}>
		<ZDialogTrigger>Open dialog</ZDialogTrigger>
		<ZDialogContent data-testid="defaults-dialog" size={explicitOverlaySize}>
			<ZDialogTitle>Defaults dialog</ZDialogTitle>
		</ZDialogContent>
	</ZDialog>
	<ZTooltip open={surface === 'tooltip'}>
		<ZTooltipTrigger>Open tooltip</ZTooltipTrigger>
		<ZTooltipContent data-testid="defaults-tooltip" size={explicitOverlaySize}>Tip</ZTooltipContent>
	</ZTooltip>
</ZProvider>
