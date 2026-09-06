import { createRawSnippet, type ComponentProps } from 'svelte';
import ZRating, {
	type ZRatingItemContext,
	type ZRatingProps
} from '../src/components/input/ZRating.svelte';

const item = createRawSnippet<[ZRatingItemContext]>((getContext) => ({
	render: () => {
		const context = getContext();
		// @ts-expect-error Snippet contexts are immutable snapshots.
		context.value = 2;
		return '<span>Star</span>';
	}
}));
const valid = {
	clearable: false,
	count: 10,
	defaultValue: 7.5,
	disabled: false,
	form: 'review',
	fractions: 2,
	invalid: false,
	item,
	itemLabel: (value: number) => String(value),
	label: 'Rating',
	name: 'rating',
	onFormReset: () => undefined,
	onHoverChange: (value: number) => void value,
	onValueChange: (value: number) => void value,
	readonly: true,
	required: true,
	size: 'xlarge',
	tone: 'warning',
	value: 8
} satisfies ComponentProps<typeof ZRating> satisfies ZRatingProps;
void valid;
const invalidValue = {
	label: 'Rating',
	// @ts-expect-error Rating values are numeric.
	value: 'five'
} satisfies ZRatingProps;
void invalidValue;
const invalidTone = {
	label: 'Rating',
	// @ts-expect-error Tone is a closed brand and semantic union.
	tone: 'purple'
} satisfies ZRatingProps;
void invalidTone;
const invalidItemLabel = {
	// @ts-expect-error Item labels must return strings.
	itemLabel: (value: number) => value,
	label: 'Rating'
} satisfies ZRatingProps;
void invalidItemLabel;
