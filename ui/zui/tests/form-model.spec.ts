import { describe, expect, it, vi } from 'vitest';
import { createFormArray } from '../src/runtime/form/form-array.svelte.js';
import {
	clearFormErrorLayers,
	createFormErrorLayers,
	mergeFormErrorLayers,
	setFormErrorLayer
} from '../src/runtime/form/form-errors.js';
import {
	createFormModel,
	getFormValue,
	setFormValue
} from '../src/runtime/form/form-model.svelte.js';

describe('FormModel', () => {
	it('uses immutable paths, recomputes dirty against baseline and batches one notification', () => {
		const change = vi.fn();
		const pathChange = vi.fn();
		const initial = { account: { name: 'Ada', tags: ['admin'] }, enabled: true };
		const model = createFormModel({ defaultValues: initial, onValuesChange: change });
		model.subscribeValue(['account', 'name'], pathChange);
		model.setField(['account', 'name'], 'Grace', 'user');
		expect(model.dirty).toBe(true);
		expect(model.get(['account', 'name'])).toBe('Grace');
		expect(pathChange).toHaveBeenCalledOnce();
		expect(change.mock.calls[0]?.[0].reason).toBe('user');
		expect(Object.isFrozen(model.values)).toBe(true);
		expect(Object.isFrozen((model.values as typeof initial).account)).toBe(true);
		model.setField(['account', 'name'], 'Ada');
		expect(model.dirty).toBe(false);

		change.mockClear();
		model.setFields([
			{ path: ['account', 'name'], value: 'Lin' },
			{ path: ['account', 'tags', 0], value: 'owner' }
		]);
		expect(change).toHaveBeenCalledOnce();
		expect(change.mock.calls[0]?.[0].changedPaths).toHaveLength(2);
		expect(initial.account.name).toBe('Ada');
		const accountChange = vi.fn();
		model.subscribeValue('account', accountChange);
		model.setField(['account', 'name'], 'Mina');
		expect(accountChange).toHaveBeenCalledOnce();
		model.setField(['account', 'name'], 'Mina');
		expect(accountChange).toHaveBeenCalledOnce();
	});

	it('filters noop batch paths and keeps silent path subscribers current', () => {
		const action = vi.fn();
		const value = vi.fn();
		const model = createFormModel({
			defaultValues: { account: { name: 'Ada', role: 'admin' } },
			onValuesChange: action
		});
		model.subscribeValue(['account', 'name'], value);
		model.setFields([
			{ path: ['account', 'name'], value: 'Ada' },
			{ path: ['account', 'role'], value: 'owner' }
		]);
		expect(action.mock.calls[0]?.[0].changedPaths).toEqual([['account', 'role']]);
		model.initialize({ account: { name: 'Lin', role: 'owner' } });
		expect(value).toHaveBeenLastCalledWith('Lin');
		action.mockClear();
		model.setField(['account', 'name'], 'Mina');
		model.resetField(['account', 'name']);
		expect(value).toHaveBeenLastCalledWith('Lin');
		model.setField(['account', 'name'], 'Mina');
		model.reset();
		expect(value).toHaveBeenLastCalledWith('Lin');
	});

	it('preserves null initial values and deletes object paths absent from baseline', () => {
		const nullable = createFormModel<{ value: string } | null>({
			defaultValues: { value: 'fallback' },
			values: null
		});
		expect(nullable.values).toBeNull();
		const model = createFormModel({ defaultValues: { account: {} as { nickname?: string } } });
		model.setField(['account', 'nickname'], 'Ace');
		model.resetField(['account', 'nickname']);
		expect(model.values).toEqual({ account: {} });
		expect(model.dirty).toBe(false);
		expect(() => model.resetField(['rows', 0])).toThrow(/array path/u);
	});

	it('keeps external synchronization silent and controlled owners authoritative', () => {
		let owner = { count: 1 };
		const write = vi.fn();
		const change = vi.fn();
		const controlled = createFormModel({
			defaultValues: owner,
			onValuesChange: change,
			read: () => owner,
			write
		});
		controlled.setField('count', 2);
		expect(write).toHaveBeenCalledWith({ count: 2 });
		expect(controlled.values).toEqual({ count: 1 });
		expect(controlled.dirty).toBe(false);
		owner = { count: 2 };
		expect(controlled.values).toEqual({ count: 2 });
		expect(controlled.dirty).toBe(true);
		expect(() => controlled.syncExternal({ count: 3 })).toThrow(/read owner/u);

		const uncontrolled = createFormModel({ defaultValues: { count: 1 }, onValuesChange: change });
		change.mockClear();
		uncontrolled.syncExternal({ count: 3 });
		expect(uncontrolled.values).toEqual({ count: 3 });
		expect(uncontrolled.dirty).toBe(true);
		expect(change).not.toHaveBeenCalled();
		uncontrolled.initialize({ count: 4 });
		expect(uncontrolled.dirty).toBe(false);
		uncontrolled.setField('count', 5);
		uncontrolled.reset();
		expect(uncontrolled.values).toEqual({ count: 4 });
	});

	it('preserves opaque values and rejects prototype paths', () => {
		const date = new Date();
		const value = setFormValue({ files: [date] }, ['files', 0], date);
		expect(getFormValue(value, ['files', 0])).toBe(date);
		expect(() => setFormValue({}, ['__proto__', 'polluted'], true)).toThrow(/prototype/u);
		expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
	});

	it('observes mutable controlled owners deeply while keeping equal snapshots referentially stable', () => {
		const owner = { account: { name: 'Ada' }, rows: [{ id: 1 }] };
		const model = createFormModel({ defaultValues: owner, read: () => owner });
		const first = model.values;
		expect(model.values).toBe(first);
		owner.account.name = 'Bob';
		const second = model.values;
		expect(second).not.toBe(first);
		expect(second.account.name).toBe('Bob');
		expect(model.values).toBe(second);
		owner.rows.push({ id: 2 });
		expect(model.values.rows.map((row) => row.id)).toEqual([1, 2]);
	});
});

describe('FormArrayController', () => {
	it('keeps row identity through move and changes values immutably', () => {
		const model = createFormModel({ defaultValues: { users: [{ id: 'a' }, { id: 'b' }] } });
		const array = createFormArray<{ id: string }, typeof model.values>(model, 'users', {
			getRowKey: (row) => row.id
		});
		const ids = array.rows.map((row) => row.id);
		array.move(0, 1);
		expect(array.rows.map((row) => row.value.id)).toEqual(['b', 'a']);
		expect(array.rows.map((row) => row.id)).toEqual([ids[1], ids[0]]);
		expect(array.rows[1]?.path).toEqual(['users', 1]);
		array.remove(0);
		expect(array.rows).toHaveLength(1);
		expect(array.rows[0]?.id).toBe(ids[0]);
	});

	it('reconciles keyed external replacement and rejects duplicate keys', () => {
		const model = createFormModel({ defaultValues: { rows: [{ key: 1 }, { key: 2 }] } });
		const array = createFormArray<{ key: number }, typeof model.values>(model, 'rows', {
			getRowKey: (row) => row.key
		});
		const ids = new Map(array.rows.map((row) => [row.value.key, row.id]));
		model.syncExternal({ rows: [{ key: 2 }, { key: 1 }] });
		expect(array.rows.map((row) => row.id)).toEqual([ids.get(2), ids.get(1)]);
		expect(() => model.syncExternal({ rows: [{ key: 1 }, { key: 1 }] })).not.toThrow();
		expect(() => array.rows).toThrow(/unique/u);
	});

	it('does not corrupt row identity when keys or a controlled owner reject an operation', () => {
		let owner = { rows: [{ key: 1 }, { key: 2 }] };
		const model = createFormModel({
			defaultValues: owner,
			read: () => owner,
			write: () => undefined
		});
		const array = createFormArray<{ key: number }, typeof owner>(model, 'rows', {
			getRowKey: (row) => row.key
		});
		const before = array.rows.map((row) => row.id);
		array.move(0, 1);
		expect(array.rows.map((row) => row.id)).toEqual(before);
		expect(owner.rows.map((row) => row.key)).toEqual([1, 2]);
		expect(() => array.replace(0, { key: 2 })).toThrow(/unique/u);
		expect(array.rows.map((row) => row.id)).toEqual(before);
	});
});

describe('Form error layers', () => {
	it('replaces layers by path and merges immutable messages without duplicates', () => {
		let layers = createFormErrorLayers({
			schema: { email: ['Invalid', 'Invalid'] },
			server: { email: ['Taken'] },
			manual: { email: ['Invalid'], name: ['Required'] }
		});
		expect(mergeFormErrorLayers(layers)).toEqual({
			email: ['Invalid', 'Taken'],
			name: ['Required']
		});
		layers = setFormErrorLayer(layers, 'server', { email: ['Offline'] }, ['email']);
		expect(mergeFormErrorLayers(layers).email).toEqual(['Invalid', 'Offline']);
		layers = clearFormErrorLayers(layers, { layers: ['schema', 'server'], paths: ['email'] });
		expect(mergeFormErrorLayers(layers)).toEqual({ email: ['Invalid'], name: ['Required'] });
		expect(Object.isFrozen(mergeFormErrorLayers(layers))).toBe(true);
	});
});
