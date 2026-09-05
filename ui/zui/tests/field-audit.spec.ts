import { render } from 'svelte/server';
import { expect, it } from 'vitest';
import ZField from '../src/components/input/ZField.svelte';

it.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY])(
	'rejects invalid feedbackMinLines %s',
	(feedbackMinLines) => {
		expect(() => render(ZField, { props: { label: 'Field', feedbackMinLines } }).body).toThrow(
			/non-negative safe integer/u
		);
	}
);
