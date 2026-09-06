import type {
	ZuiComponentDefaults,
	TextComponentDefaults,
	IconComponentDefaults
} from '../src/runtime/foundation/component-defaults.js';

const visualDefaults = {
	text: { size: 'xxxxlarge', tone: 'warning', lineHeight: 'relaxed', weight: 'medium' },
	heading: { size: 'xxxlarge', wrap: 'balance' },
	icon: { size: 22, strokeWidth: 1.5 },
	spinner: { size: 'small', tone: 'inherit' },
	toggleButton: { variant: 'ghost', fullWidth: false },
	link: { appearance: 'button', tone: 'info', underline: 'hover' },
	badge: { placement: 'bottom-start', overlap: 'circular', tone: 'danger' },
	avatar: { size: 'large', shape: 'rounded' },
	dialog: { size: 'xlarge' },
	tooltip: { size: 'small' }
} satisfies ZuiComponentDefaults;
const textDefaults: TextComponentDefaults = visualDefaults.text;
const iconDefaults: IconComponentDefaults = visualDefaults.icon;
// @ts-expect-error Unknown typography sizes are rejected by the rule-derived public type.
const badText: ZuiComponentDefaults = { text: { size: 'giant' } };
// @ts-expect-error A heading's semantic level cannot be a visual default.
const semanticLevel: ZuiComponentDefaults = { heading: { level: 1 } };
// @ts-expect-error Business state is not part of Dialog visual defaults.
const openDialog: ZuiComponentDefaults = { dialog: { open: true } };
// @ts-expect-error Indicator-only Spinner tones exclude business success state.
const successSpinner: ZuiComponentDefaults = { spinner: { tone: 'success' } };
// @ts-expect-error Global link destinations are not visual defaults.
const linkDestination: ZuiComponentDefaults = { link: { href: '/route' } };
void [
	textDefaults,
	iconDefaults,
	badText,
	semanticLevel,
	openDialog,
	successSpinner,
	linkDestination
];
