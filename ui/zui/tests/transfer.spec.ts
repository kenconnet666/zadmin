import { describe, expect, it } from 'vitest';

import {
	createTransferMoveCandidate,
	matchesTransferValueEcho,
	matchesTransferItemsSnapshot,
	matchesTransferSnapshot,
	matchesTransferValueSnapshot,
	type TransferItemInput,
	type TransferMoveCandidateInput
} from '../src/runtime/collection/transfer.js';

type Key = 0 | '0' | 'a' | 'b' | 'locked' | 'missing' | 'orphan-a' | 'orphan-b';

const items: readonly TransferItemInput<Key>[] = [
	{ key: 'b' },
	{ key: 0 },
	{ key: 'locked', disabled: true },
	{ key: '0' },
	{ key: 'a' }
];

describe('Transfer move candidate', () => {
	it('captures each getter once so the stored item is the item that was validated', () => {
		let keyReads = 0;
		let disabledReads = 0;
		const item: TransferItemInput<Key> = {
			get key() {
				return ++keyReads === 1 ? 0 : '0';
			},
			get disabled() {
				return ++disabledReads > 1;
			}
		};
		const candidate = createTransferMoveCandidate<Key>({
			items: [item],
			value: [],
			movingKeys: [0],
			destination: 'target'
		});
		expect(candidate.items).toEqual([{ key: 0, disabled: false }]);
		expect(candidate.nextValue).toEqual([0]);
		expect([keyReads, disabledReads]).toEqual([1, 1]);
	});
	it('adds only loaded enabled keys in item order and preserves orphan value order', () => {
		const candidate = createTransferMoveCandidate<Key>({
			destination: 'target',
			items,
			movingKeys: ['0', 'b', 'locked', 'missing'],
			value: [0, 'orphan-b', 'locked', 'orphan-a']
		});

		expect(candidate.nextValue).toEqual(['b', 0, 'locked', '0', 'orphan-b', 'orphan-a']);
		expect(candidate.movingKeys).toEqual(['0', 'b', 'locked', 'missing']);
		expect(candidate.items).toEqual([
			{ key: 'b', disabled: false },
			{ key: 0, disabled: false },
			{ key: 'locked', disabled: true },
			{ key: '0', disabled: false },
			{ key: 'a', disabled: false }
		]);
		expect(Object.isFrozen(candidate)).toBe(true);
		expect(Object.isFrozen(candidate.items)).toBe(true);
		expect(candidate.items.every(Object.isFrozen)).toBe(true);
		expect(Object.isFrozen(candidate.value)).toBe(true);
		expect(Object.isFrozen(candidate.movingKeys)).toBe(true);
		expect(Object.isFrozen(candidate.nextValue)).toBe(true);
	});

	it('removes only loaded enabled keys while retaining disabled and orphan membership', () => {
		const candidate = createTransferMoveCandidate<Key>({
			destination: 'source',
			items,
			movingKeys: ['b', 'locked', 'orphan-b', 'missing'],
			value: ['orphan-b', 'b', 0, 'locked', 'orphan-a']
		});

		expect(candidate.nextValue).toEqual([0, 'locked', 'orphan-b', 'orphan-a']);
		expect(candidate.value).toEqual(['orphan-b', 'b', 0, 'locked', 'orphan-a']);
	});

	it('matches only item key/disabled order and the exact canonical value snapshot', () => {
		const candidate = createTransferMoveCandidate<Key>({
			destination: 'target',
			items,
			movingKeys: ['a'],
			value: [0, 'orphan-a']
		});

		expect(
			matchesTransferSnapshot(
				items.map((item) => ({ ...item, label: String(item.key) })),
				[0, 'orphan-a'],
				candidate
			)
		).toBe(true);
		expect(matchesTransferSnapshot([...items].reverse(), [0, 'orphan-a'], candidate)).toBe(false);
		expect(
			matchesTransferSnapshot(
				items.map((item) => (item.key === 'locked' ? { ...item, disabled: false } : item)),
				[0, 'orphan-a'],
				candidate
			)
		).toBe(false);
		expect(matchesTransferSnapshot(items, ['orphan-a', 0], candidate)).toBe(false);
		expect(matchesTransferItemsSnapshot(items, candidate)).toBe(true);
		expect(matchesTransferValueSnapshot(candidate.nextValue, candidate.nextValue)).toBe(true);
		expect(matchesTransferValueSnapshot(candidate.value, candidate.nextValue)).toBe(false);
		expect(matchesTransferValueEcho(candidate.nextValue, candidate.nextValue)).toBe(true);
		expect(
			matchesTransferValueEcho(
				[...candidate.nextValue, candidate.nextValue[0]],
				candidate.nextValue
			)
		).toBe(false);
		expect(matchesTransferValueEcho(Array(candidate.nextValue.length), candidate.nextValue)).toBe(
			false
		);
		const partial = [...candidate.nextValue];
		delete partial[0];
		expect(matchesTransferValueEcho(partial, candidate.nextValue)).toBe(false);
		expect(matchesTransferValueEcho([undefined], [0])).toBe(false);
		expect(matchesTransferValueEcho([Number.NaN], [0])).toBe(false);
		expect(matchesTransferValueEcho([-0], [0])).toBe(false);
	});

	it('copies mutable item metadata into an immutable snapshot', () => {
		const mutable = [{ key: 'a' as const, disabled: false }];
		const candidate = createTransferMoveCandidate({
			destination: 'target',
			items: mutable,
			movingKeys: ['a'],
			value: []
		});
		mutable[0]!.disabled = true;

		expect(candidate.items).toEqual([{ key: 'a', disabled: false }]);
		expect(candidate.nextValue).toEqual(['a']);
	});

	it('rejects duplicate, invalid, sparse and malformed snapshots', () => {
		const create = (input: TransferMoveCandidateInput<Key>) => createTransferMoveCandidate(input);
		const valid: TransferMoveCandidateInput<Key> = {
			destination: 'target',
			items,
			movingKeys: ['a'],
			value: [0]
		};
		const sparse = Array<Key>(1);

		expect(() => create({ ...valid, items: [{ key: 'a' }, { key: 'a' }] })).toThrow(
			/Transfer items.*unique/u
		);
		expect(() => create({ ...valid, value: [0, 0] })).toThrow(/Transfer value.*unique/u);
		expect(() => create({ ...valid, movingKeys: ['a', 'a'] })).toThrow(
			/Transfer movingKeys.*unique/u
		);
		expect(() =>
			createTransferMoveCandidate<string | number>({ ...valid, items: [{ key: Number.NaN }] })
		).toThrow(/finite numbers/u);
		expect(() => createTransferMoveCandidate<string | number>({ ...valid, value: [-0] })).toThrow(
			/other than -0/u
		);
		expect(() =>
			createTransferMoveCandidate<string | number>({
				...valid,
				movingKeys: [Number.NaN]
			})
		).toThrow(/finite numbers/u);
		expect(() => createTransferMoveCandidate({ ...valid, movingKeys: sparse })).toThrow(
			/strings or finite numbers/u
		);
		expect(() => createTransferMoveCandidate({ ...valid, destination: 'other' as never })).toThrow(
			/destination/u
		);
		expect(() =>
			createTransferMoveCandidate({ ...valid, items: [null] as unknown as typeof items })
		).toThrow(/entries must be objects/u);
		expect(() =>
			createTransferMoveCandidate({
				...valid,
				items: [{ key: 'a', disabled: 'yes' }] as unknown as typeof items
			})
		).toThrow(/disabled values/u);
		expect(() =>
			createTransferMoveCandidate({ ...valid, movingKeys: 'a' as unknown as readonly Key[] })
		).toThrow(/must be an array/u);
	});
});
