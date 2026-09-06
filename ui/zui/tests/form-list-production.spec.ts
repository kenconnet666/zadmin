import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import ZFormList from '../src/components/input/ZFormList.svelte';
import FormListFixture from './FormListFixture.svelte';
describe('ZFormList server contract', () => {
	it('renders keyed model rows without browser globals', () => {
		const body = render(FormListFixture).body;
		expect(body.match(/data-row-id=/gu)).toHaveLength(2);
		expect(body.match(/type="text"/gu)).toHaveLength(5);
		expect(body).toContain('name="preserved"');
	});
	it('rejects use outside a parent Form while body is read', () => {
		expect(
			() =>
				render(ZFormList, { props: { name: 'users', children: (() => undefined) as never } }).body
		).toThrow(/ZFormList requires a parent ZForm/u);
	});
	it('rejects a parent Form without a model', () => {
		expect(() => render(FormListFixture, { props: { native: true } }).body).toThrow(
			/requires a ZForm model/u
		);
	});
});
