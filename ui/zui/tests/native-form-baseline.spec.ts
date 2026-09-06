import { expect, it } from 'vitest';
import { NativeFormBaseline } from '../src/runtime/form/native-form-baseline.js';

it('keeps the first ordered successful-control snapshot until explicit reset or unmount', () => {
	const baseline = new NativeFormBaseline();
	const initial = new FormData();
	initial.append('roles', 'read');
	initial.append('roles', 'write');
	baseline.capture('roles-path', 'roles', initial);
	const changed = new FormData();
	changed.append('roles', 'write');
	changed.append('roles', 'read');
	expect(baseline.isDirty('roles-path', 'roles', changed)).toBe(true);
	baseline.capture('roles-path', 'roles', changed);
	expect(baseline.isDirty('roles-path', 'roles', initial)).toBe(false);
	baseline.forget('roles-path');
	baseline.capture('roles-path', 'roles', changed);
	expect(baseline.isDirty('roles-path', 'roles', initial)).toBe(true);
});

it('retains selected File identity and treats fresh empty-file placeholders as empty', () => {
	const baseline = new NativeFormBaseline();
	const file = new File(['first'], 'same.txt', { lastModified: 1 });
	const initial = new FormData();
	initial.append('asset', file);
	baseline.capture('file', 'asset', initial);
	const identical = new FormData();
	identical.append('asset', file);
	expect(baseline.isDirty('file', 'asset', identical)).toBe(false);
	const replaced = new FormData();
	replaced.append('asset', new File(['other'], 'same.txt', { lastModified: 1 }));
	expect(baseline.isDirty('file', 'asset', replaced)).toBe(true);
	const empty = new FormData();
	empty.append('asset', new File([], '', { type: 'application/octet-stream' }));
	baseline.clear();
	baseline.capture('file', 'asset', empty);
	const nextEmpty = new FormData();
	nextEmpty.append('asset', new File([], '', { type: 'application/octet-stream' }));
	expect(baseline.isDirty('file', 'asset', nextEmpty)).toBe(false);
});
