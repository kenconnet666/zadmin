import { describe, expect, it, vi } from 'vitest';

import { FormArrayController } from '../src/runtime/form/form-array.svelte.js';
import { createFormModel } from '../src/runtime/form/form-model.svelte.js';
import { FormRegistry } from '../src/runtime/form/form-registry.svelte.js';

describe('FormArray mutation transactions', () => {
	it('preflights the complete registry candidate before writing the array owner', () => {
		const write = vi.fn();
		const model = createFormModel({
			defaultValues: { rows: [{ name: 'accepted' }] },
			write
		});
		const registry = new FormRegistry();
		registry.register({
			control: () => null,
			htmlName: 'rows[0].name',
			htmlNameFollowsPath: true,
			instanceId: 'row-name',
			path: ['rows', 0, 'name']
		});
		registry.register({
			control: () => null,
			htmlName: 'rows[1].name',
			instanceId: 'stable-name-conflict',
			path: 'summary'
		});
		registry.markTouched('row-name');
		registry.syncErrors({ 'rows[0].name': ['Keep error'] });
		const rows = new FormArrayController(model, 'rows', {}, undefined, {
			prepareList: (change) => registry.prepareList(change)
		});
		const beforeIds = rows.rows.map((row) => row.id);
		const beforeState = registry.state(['rows', 0, 'name']);

		expect(() => rows.insert(0, { name: 'rejected' })).toThrow(/HTML name/u);
		expect(write).not.toHaveBeenCalled();
		expect(model.values).toEqual({ rows: [{ name: 'accepted' }] });
		expect(rows.rows.map((row) => row.id)).toEqual(beforeIds);
		expect(registry.fieldInfo('row-name')?.path).toEqual(['rows', 0, 'name']);
		expect(registry.state(['rows', 0, 'name'])).toBe(beforeState);
		expect(registry.state(['rows', 0, 'name']).errors).toEqual(['Keep error']);
	});

	it('leaves identity and prepared registry state untouched when a controlled owner rejects', () => {
		let owned = { rows: [{ name: 'first' }, { name: 'second' }] };
		const prepared = vi.fn();
		const committed = vi.fn();
		const model = createFormModel({
			defaultValues: owned,
			read: () => owned,
			write: vi.fn()
		});
		const rows = new FormArrayController(model, 'rows', {}, undefined, {
			prepareList() {
				prepared();
				return { commit: committed };
			}
		});
		const beforeIds = rows.rows.map((row) => row.id);

		expect(rows.remove(0)).toBe(false);
		expect(prepared).toHaveBeenCalledOnce();
		expect(committed).not.toHaveBeenCalled();
		expect(model.values).toEqual(owned);
		expect(rows.rows.map((row) => row.id)).toEqual(beforeIds);

		owned = { rows: [{ name: 'second' }] };
		expect(model.values).toEqual(owned);
	});

	it('keeps accepted values, ids and registry addresses when a synchronous observer throws', () => {
		const observerError = new Error('observer failed');
		const model = createFormModel({
			defaultValues: { rows: [{ name: 'first' }, { name: 'second' }] },
			onValuesChange() {
				throw observerError;
			}
		});
		const registry = new FormRegistry();
		for (const index of [0, 1])
			registry.register({
				control: () => null,
				htmlName: `rows[${index}].name`,
				htmlNameFollowsPath: true,
				instanceId: `row-${index}`,
				path: ['rows', index, 'name']
			});
		registry.markTouched('row-0');
		const rows = new FormArrayController(model, 'rows', {}, undefined, {
			prepareList: (change) => registry.prepareList(change)
		});
		const beforeIds = rows.rows.map((row) => row.id);

		expect(() => rows.move(0, 1)).toThrow(observerError);
		expect(model.values.rows.map((row) => row.name)).toEqual(['second', 'first']);
		expect(rows.rows.map((row) => row.id)).toEqual([...beforeIds].reverse());
		expect(registry.fieldInfo('row-0')).toMatchObject({
			path: ['rows', 1, 'name'],
			htmlName: 'rows[1].name'
		});
		expect(registry.state(['rows', 1, 'name']).touched).toBe(true);
	});

	it('queues nested observer writes after the current publication while committing each identity first', () => {
		const publications: string[] = [];
		const commits: string[] = [];
		let nested = false;
		const model = createFormModel({
			defaultValues: { rows: [{ name: 'first' }, { name: 'second' }] },
			onValuesChange(detail) {
				publications.push(detail.values.rows.map((row) => row.name).join(','));
				if (nested) return;
				nested = true;
				expect(rows.move(0, 2)).toBe(true);
			}
		});
		const rows = new FormArrayController(model, 'rows', {}, undefined, {
			prepareList(change) {
				const identity = change.next.map((row) => row.id).join(',');
				return { commit: () => commits.push(identity) };
			}
		});
		const beforeIds = rows.rows.map((row) => row.id);

		expect(rows.append({ name: 'third' })).toBe(true);
		expect(publications).toEqual(['first,second,third', 'second,third,first']);
		expect(model.values.rows.map((row) => row.name)).toEqual(['second', 'third', 'first']);
		expect(rows.rows.map((row) => row.id)).toEqual([
			beforeIds[1],
			expect.stringMatching(/^row-/u),
			beforeIds[0]
		]);
		expect(commits).toHaveLength(2);
		expect(commits[1]).toBe(rows.rows.map((row) => row.id).join(','));
	});
});
