import type { ComponentProps } from 'svelte';

import ZRadioGroup, {
	type ZRadioGroupProps
} from '../src/components/compound/radio-group/ZRadioGroup.svelte';
import type { ZFormProps } from '../src/components/input/ZForm.svelte';
import ZSwitch, { type ZSwitchProps } from '../src/components/input/ZSwitch.svelte';
import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

interface Values {
	readonly choice?: number;
	readonly enabled?: boolean;
}

const model = createFormModel<Values>({ defaultValues: { choice: 1, enabled: true } });
const formProps = { model } satisfies ZFormProps<undefined, Values>;
const switchProps = {
	checked: true,
	defaultChecked: false,
	onCheckedChange: (checked: boolean) => void checked,
	value: 'enabled'
} satisfies ComponentProps<typeof ZSwitch> satisfies ZSwitchProps;
const radioProps = {
	defaultValue: 1,
	onValueChange: (value: number | string) => void value,
	options: [
		{ label: 'One', value: 1 },
		{ label: 'Two', value: 2 }
	],
	value: 2
} satisfies ComponentProps<typeof ZRadioGroup> satisfies ZRadioGroupProps;

// @ts-expect-error Switch remains strictly boolean.
const invalidSwitch = { checked: 'true' } satisfies ZSwitchProps;
// @ts-expect-error RadioGroup values remain SelectionKey or undefined.
const invalidRadio = { options: [], value: { id: 1 } } satisfies ZRadioGroupProps;

void [formProps, switchProps, radioProps, invalidSwitch, invalidRadio];
