import { createRawSnippet, type ComponentProps } from 'svelte';

import ZNativeSelect, {
	type ZNativeSelectProps
} from '../src/components/input/ZNativeSelect.svelte';
import ZPasswordInput, {
	type ZPasswordInputProps,
	type ZPasswordInputToggleContext
} from '../src/components/input/ZPasswordInput.svelte';

const toggle = createRawSnippet<[ZPasswordInputToggleContext]>(() => ({
	render: () => '<span>Toggle</span>'
}));

const password = {
	autocomplete: 'new-password',
	defaultValue: 'secret',
	defaultVisible: false,
	onValueChange: (value: string) => void value,
	onVisibleChange: (visible: boolean) => void visible,
	size: 'large',
	toggle: toggle,
	toggleLabel: (visible: boolean) => (visible ? 'Hide' : 'Show'),
	value: 'secret',
	visible: true
} satisfies ComponentProps<typeof ZPasswordInput> satisfies ZPasswordInputProps;
void password;

const invalidPasswordType = {
	// @ts-expect-error PasswordInput exclusively owns password/text type switching.
	type: 'email'
} satisfies ZPasswordInputProps;
void invalidPasswordType;

const invalidPasswordVisible = {
	// @ts-expect-error visible is a boolean UI state.
	visible: 'yes'
} satisfies ZPasswordInputProps;
void invalidPasswordVisible;

const single = {
	defaultValue: 'a',
	items: [{ value: 'a', label: 'Alpha' }],
	onValueChange: (value: string) => void value,
	placeholder: 'Choose',
	value: 'a'
} satisfies ComponentProps<typeof ZNativeSelect> satisfies ZNativeSelectProps;
void single;

const multiple = {
	defaultValue: ['a'] as readonly string[],
	items: [{ value: 'a', label: 'Alpha' }],
	multiple: true,
	nativeSize: 4,
	onValueChange: (value: readonly string[]) => void value,
	size: 'small',
	value: ['a'] as readonly string[]
} satisfies ComponentProps<typeof ZNativeSelect> satisfies ZNativeSelectProps;
void multiple;

// @ts-expect-error single mode owns one native string value.
const invalidSingleValue: ZNativeSelectProps = {
	items: [{ value: 'a', label: 'Alpha' }],
	value: ['a']
};
void invalidSingleValue;

// @ts-expect-error multiple mode owns a readonly string array.
const invalidMultipleValue: ZNativeSelectProps = {
	items: [{ value: 'a', label: 'Alpha' }],
	multiple: true,
	value: 'a'
};
void invalidMultipleValue;

// @ts-expect-error placeholder belongs only to the single-select contract.
const invalidMultiplePlaceholder: ZNativeSelectProps = {
	items: [{ value: 'a', label: 'Alpha' }],
	multiple: true,
	placeholder: 'Choose'
};
void invalidMultiplePlaceholder;

// @ts-expect-error items and children are exclusive source owners.
const invalidSources: ZNativeSelectProps = {
	children: createRawSnippet(() => ({ render: () => '<option>Alpha</option>' })),
	items: [{ value: 'a', label: 'Alpha' }]
};
void invalidSources;

const invalidOptionValue = {
	items: [
		{
			label: 'Numeric',
			// @ts-expect-error native option values are strings.
			value: 1
		}
	]
} satisfies ZNativeSelectProps;
void invalidOptionValue;

const invalidNativeSize = {
	items: [{ value: 'a', label: 'Alpha' }],
	// @ts-expect-error nativeSize is the numeric HTML row count.
	nativeSize: '4'
} satisfies ZNativeSelectProps;
void invalidNativeSize;

const invalidVisualSize = {
	items: [{ value: 'a', label: 'Alpha' }],
	// @ts-expect-error size is the five-value visual control scale.
	size: 4
} satisfies ZNativeSelectProps;
void invalidVisualSize;
