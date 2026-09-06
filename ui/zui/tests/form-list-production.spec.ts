import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import ZFormList from '../src/components/input/ZFormList.svelte';
import FormListFixture from './FormListFixture.svelte';
describe('ZFormList server contract', () => {
	it('renders keyed model rows without browser globals', () => {
		const body = render(FormListFixture).body;
		expect(body.match(/data-row-id=/gu)).toHaveLength(2);
		expect(body.match(/type="text"/gu)).toHaveLength(2);
	});
	it('rejects use outside a model Form while body is read', () => {
		expect(
			() =>
				render(ZFormList, { props: { name: 'users', children: (() => undefined) as never } }).body
		).toThrow(/requires a ZForm model/u);
	});
});
