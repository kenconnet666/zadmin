import type { ComponentProps, Snippet } from 'svelte';

import ZInputGroup, { type ZInputGroupProps } from '../src/components/input/ZInputGroup.svelte';
import ZPinInput, {
	type PinInputLabelFormatter,
	type ZPinInputProps
} from '../src/components/input/ZPinInput.svelte';

const inputLabel: PinInputLabelFormatter = (index, length) => `${index + 1} of ${length}`;
const snippet = (() => undefined) as Snippet;

const pin = {
	autocomplete: 'one-time-code',
	form: 'verification-form',
	inputLabel,
	length: 6,
	mask: true,
	mode: 'numeric',
	name: 'otp',
	size: 'large',
	value: null
} satisfies ComponentProps<typeof ZPinInput> satisfies ZPinInputProps;

const group = {
	children: snippet,
	prefix: snippet,
	readonly: true,
	required: true,
	size: 'small',
	suffixAction: snippet
} satisfies ComponentProps<typeof ZInputGroup> satisfies ZInputGroupProps;
void pin;
void group;

// @ts-expect-error PIN value is a string or explicit null, never a number.
const invalidPinValue: ZPinInputProps = { value: 1234 };
void invalidPinValue;

// @ts-expect-error OTP autocomplete is deliberately limited to the supported security boundary.
const invalidAutocomplete: ZPinInputProps = { autocomplete: 'sms-otp' };
void invalidAutocomplete;

// @ts-expect-error InputGroup requires its one business-control snippet.
const missingGroupControl = {} satisfies ComponentProps<typeof ZInputGroup>;
void missingGroupControl;
