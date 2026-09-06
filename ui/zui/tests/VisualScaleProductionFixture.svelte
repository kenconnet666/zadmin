<script module lang="ts">
	import { defaultTheme, extendTheme } from '../src/entrypoints/index.js';

	export const visualScaleTheme = extendTheme(defaultTheme, {
		color: {
			text: 'rgb(33, 37, 41)',
			primary: 'rgb(20, 60, 110)',
			neutral: 'rgb(55, 65, 75)',
			info: 'rgb(15, 85, 130)',
			success: 'rgb(20, 100, 60)',
			warning: 'rgb(125, 80, 15)',
			danger: 'rgb(150, 30, 55)',
			onPrimary: 'rgb(250, 250, 249)',
			onNeutral: 'rgb(250, 250, 249)',
			onInfo: 'rgb(250, 250, 249)',
			onSuccess: 'rgb(250, 250, 249)',
			onWarning: 'rgb(250, 250, 249)',
			onDanger: 'rgb(250, 250, 249)'
		}
	});
</script>

<script lang="ts">
	import {
		ZAlert,
		ZAvatar,
		ZBadge,
		ZButton,
		ZContainer,
		ZHeading,
		ZIcon,
		ZKbd,
		ZLink,
		ZProvider,
		ZResult,
		ZSpinner,
		ZStatistic,
		ZTag,
		ZText,
		ZToast,
		ZToggleButton
	} from '../src/entrypoints/index.js';
	import { ZCode } from '../src/entrypoints/code.js';
	import { semanticTones } from '../src/theme/semantics.js';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const fonts = [
		'xsmall',
		'small',
		'medium',
		'large',
		'xlarge',
		'xxlarge',
		'xxxlarge',
		'xxxxlarge'
	] as const;
	const tones = ['primary', ...semanticTones] as const;
	const variants = ['solid', 'outline', 'ghost'] as const;
</script>

<ZProvider theme={visualScaleTheme} motion="reduced">
	{#each sizes as size (size)}
		<ZButton {size} data-testid={`scale-button-${size}`}>Control</ZButton>
		<ZButton
			{size}
			shape="square"
			loading
			aria-label="Saving"
			data-testid={`scale-loading-${size}`}
		/>
		<ZLink {size} appearance="navigation" href="#scale" data-testid={`scale-navigation-${size}`}
			>Navigation</ZLink
		>
		<ZIcon {size} name="check" data-testid={`scale-icon-${size}`} />
		<ZSpinner {size} aria-hidden="true" data-testid={`scale-spinner-${size}`} />
		<ZAvatar {size} alt="Profile" fallbackText="P" data-testid={`scale-avatar-${size}`} />
		<ZTag {size} data-testid={`scale-tag-${size}`}>Tag</ZTag>
		<ZTag {size} removable data-testid={`scale-tag-remove-${size}`}>Tag</ZTag>
		<ZBadge {size} count={3} data-testid={`scale-badge-${size}`} />
		<ZBadge {size} dot label="Unread" data-testid={`scale-dot-${size}`} />
		<ZContainer {size} data-testid={`scale-container-${size}`}>Container</ZContainer>
	{/each}
	{#each fonts as size (size)}
		<ZHeading level={2} {size} data-testid={`scale-heading-${size}`}>Heading</ZHeading>
		<ZText {size} data-testid={`scale-text-${size}`}>Text</ZText>
		<ZCode {size} code="let count = 1;" data-testid={`scale-code-${size}`} />
		<ZKbd {size} data-testid={`scale-kbd-${size}`}>Ctrl</ZKbd>
	{/each}
	{#each tones as tone (tone)}
		{#each variants as variant (variant)}
			<ZButton {tone} {variant} data-testid={`tone-button-${tone}-${variant}`}>Action</ZButton>
			<ZLink
				{tone}
				{variant}
				appearance="button"
				href="#scale"
				data-testid={`tone-link-${tone}-${variant}`}
			>
				Action link
			</ZLink>
		{/each}
		<ZToggleButton {tone} variant="outline" defaultPressed data-testid={`tone-toggle-${tone}`}
			>Selected
		</ZToggleButton>
	{/each}
	{#each semanticTones as tone (tone)}
		<ZText {tone} data-testid={`tone-text-${tone}`}>Status</ZText>
		<ZTag {tone} data-testid={`tone-tag-${tone}`}>Status</ZTag>
		<ZBadge {tone} count={3} data-testid={`tone-badge-${tone}`} />
		<ZAlert {tone} title="Status" live="off" data-testid={`tone-alert-${tone}`} />
		<ZResult {tone} title="Status" data-testid={`tone-result-${tone}`} />
		<ZToast {tone} title="Status" announce={false} data-testid={`tone-toast-${tone}`} />
	{/each}
	<ZStatistic label="Raw direction" value={100} trend={5} data-testid="trend-neutral" />
	<ZStatistic
		label="Error rate"
		value={0.4}
		trend={-18}
		trendTone="success"
		valueSize="xxxlarge"
		data-testid="trend-improved"
	/>
</ZProvider>
