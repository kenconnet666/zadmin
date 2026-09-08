import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import TransferRequestFixture from './TransferRequestFixture.svelte';
import { mount, unmount } from './browser-lifecycle.js';
import { resetForm } from './form-reset.js';

function root(target: HTMLElement, testId: string): HTMLElement {
	return target.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function list(root: HTMLElement, label: string): HTMLElement {
	return root.querySelector<HTMLElement>(`[role="listbox"][aria-label="${label}"]`)!;
}

function option(listbox: HTMLElement, label: string): HTMLElement {
	return [...listbox.querySelectorAll<HTMLElement>('[role="option"]')].find(
		(candidate) => candidate.textContent?.trim() === label
	)!;
}

function paneHeader(listbox: HTMLElement): HTMLElement {
	return listbox.closest<HTMLElement>('[data-slot="panel"]')!.querySelector('header')!;
}

async function select(listbox: HTMLElement, label: string): Promise<void> {
	await userEvent.click(option(listbox, label));
}

async function deselectIfSelected(listbox: HTMLElement, label: string): Promise<void> {
	if (option(listbox, label).dataset.state === 'selected') await select(listbox, label);
}

async function beginRequest(target: HTMLElement, label = 'Alpha'): Promise<HTMLElement> {
	const request = root(target, 'transfer-request');
	const source = list(request, 'Request source');
	if (option(source, label).dataset.state !== 'selected') await select(source, label);
	request.querySelector<HTMLButtonElement>('[aria-label="Request move to target"]')!.click();
	await expect.poll(() => request.dataset.state).toBe('pending');
	return request;
}

describe('ZTransfer request move contract', () => {
	it('keeps immediate value/FormData/reset behavior and disabled, readonly, RTL virtual boundaries', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferRequestFixture, { target });
		try {
			const immediate = root(target, 'transfer-immediate');
			await select(list(immediate, 'Immediate source'), 'Alpha');
			immediate
				.querySelector<HTMLButtonElement>('[aria-label="Immediate move to target"]')!
				.click();
			await expect.poll(() => list(immediate, 'Immediate target').textContent).toContain('Alpha');
			const form = target.querySelector<HTMLFormElement>(
				'[data-testid="transfer-immediate-form"]'
			)!;
			expect(new FormData(form).getAll('immediate')).toEqual(['alpha', 'target']);
			await resetForm(form);
			await expect.poll(() => new FormData(form).getAll('immediate')).toEqual(['target']);

			const disabled = root(target, 'transfer-disabled');
			const readonly = root(target, 'transfer-readonly');
			expect(list(disabled, 'Disabled source').tabIndex).toBe(-1);
			expect(
				disabled.querySelector<HTMLButtonElement>('[aria-label="Move selected to target"]')
					?.disabled
			).toBe(true);
			expect(list(readonly, 'Readonly source').getAttribute('aria-readonly')).toBe('true');
			expect(
				readonly.querySelector<HTMLButtonElement>('[aria-label="Move selected to target"]')
					?.disabled
			).toBe(true);

			const virtual = root(target, 'transfer-rtl-virtual');
			expect(list(virtual, 'RTL source').getAttribute('role')).toBe('listbox');
			expect(virtual.querySelector('[role="option"]')).not.toBeNull();
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('waits for exact external echo, clears only source checks and does not steal a new user focus', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferRequestFixture, { target });
		try {
			const request = root(target, 'transfer-request');
			const source = list(request, 'Request source');
			const selected = list(request, 'Request target');
			await select(selected, 'Target');
			await select(source, 'Alpha');
			request.querySelector<HTMLButtonElement>('[aria-label="Request move to target"]')!.click();
			await expect.poll(() => request.dataset.state).toBe('pending');
			expect(request.getAttribute('aria-busy')).toBe('true');
			expect(app.lastRequest()?.movingKeys).toEqual(['alpha']);
			expect(app.lastRequest()?.source).toBe('action');
			expect(option(source, 'Alpha').dataset.state).toBe('selected');
			request.querySelector<HTMLButtonElement>('[aria-label="Request move to target"]')!.click();
			await tick();
			expect(app.lastRequest()?.signal.aborted).toBe(false);
			expect(target.querySelector('[data-testid="transfer-request-state"]')?.textContent).toContain(
				'requests=1'
			);

			app.echoNextValue();
			await tick();
			expect(request.dataset.state).toBe('pending');
			expect(paneHeader(list(request, 'Request source')).textContent).toContain('0 / 2');
			expect(option(list(request, 'Request target'), 'Alpha').getAttribute('aria-selected')).toBe(
				'false'
			);
			const userFocus = target.querySelector<HTMLButtonElement>(
				'[data-testid="request-user-focus"]'
			)!;
			userFocus.focus();
			app.resolveRequest(true);
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(app.lastEnd()?.result).toBe('accepted');
			expect(document.activeElement).toBe(userFocus);
			expect(option(list(request, 'Request target'), 'Target').dataset.state).toBe('selected');
			expect(option(list(request, 'Request target'), 'Alpha').dataset.state).toBe('unselected');
			expect(
				new FormData(
					target.querySelector<HTMLFormElement>('[data-testid="transfer-request-form"]')!
				).getAll('request')
			).toEqual(['alpha', 'target']);
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('preserves checked state for rejected/error terminals and aborts stale external snapshots exactly once', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferRequestFixture, { target });
		try {
			let request = await beginRequest(target, 'Alpha');
			app.resolveRequest(false);
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(app.lastEnd()?.result).toBe('rejected');
			expect(option(list(request, 'Request source'), 'Alpha').dataset.state).toBe('selected');
			await select(list(request, 'Request source'), 'Alpha');
			request = await beginRequest(target, 'Beta');
			app.resolveRequest(true);
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(app.lastEnd()?.result).toBe('rejected');
			expect(option(list(request, 'Request source'), 'Beta').dataset.state).toBe('selected');
			await select(list(request, 'Request source'), 'Beta');

			request = await beginRequest(target, 'Alpha');
			const cancelledByDisabled = app.lastRequest()!;
			app.setRequestDisabled(true);
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(cancelledByDisabled.signal.aborted).toBe(true);
			expect(app.lastEnd()?.result).toBe('cancelled');
			app.setRequestDisabled(false);
			await deselectIfSelected(list(request, 'Request source'), 'Alpha');

			request = await beginRequest(target, 'Alpha');
			const cancelledByReadonly = app.lastRequest()!;
			app.setRequestReadonly(true);
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(cancelledByReadonly.signal.aborted).toBe(true);
			expect(app.lastEnd()?.result).toBe('cancelled');
			app.setRequestReadonly(false);
			await deselectIfSelected(list(request, 'Request source'), 'Alpha');

			request = await beginRequest(target, 'Beta');
			const ownerError = new Error('Owner failed exactly once.');
			app.rejectRequest(ownerError);
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(app.lastEnd()?.result).toBe('error');
			expect(app.lastEnd()?.error).toBe(ownerError);
			expect(option(list(request, 'Request source'), 'Beta').dataset.state).toBe('selected');
			await select(list(request, 'Request source'), 'Beta');

			request = await beginRequest(target, 'Alpha');
			const stale = app.lastRequest()!;
			app.replaceValue();
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(stale.signal.aborted).toBe(true);
			expect(app.lastEnd()?.result).toBe('stale');
			expect(app.endResults().filter((result) => result === 'stale')).toHaveLength(1);

			request = await beginRequest(target, 'Alpha');
			const replacedItems = app.lastRequest()!;
			app.replaceItems();
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(replacedItems.signal.aborted).toBe(true);
			expect(app.lastEnd()?.result).toBe('stale');
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('restores an accepted move to the destination listbox active descendant rather than focusing an option', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferRequestFixture, { target });
		try {
			const request = await beginRequest(target, 'Alpha');
			app.echoNextValue();
			app.resolveRequest(true);
			await expect.poll(() => request.dataset.state).toBe('idle');
			const destination = list(request, 'Request target');
			const alpha = option(destination, 'Alpha');
			await expect.poll(() => document.activeElement).toBe(destination);
			expect(destination.getAttribute('aria-activedescendant')).toBe(alpha.id);
			expect(document.activeElement).not.toBe(alpha);
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('keeps label-only item updates pending but aborts disabled, key and order snapshot changes plus reset/unmount', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		let app = mount(TransferRequestFixture, { target });
		try {
			let request = await beginRequest(target, 'Alpha');
			app.renameAlpha();
			await tick();
			expect(request.dataset.state).toBe('pending');
			app.echoNextValue();
			app.resolveRequest(true);
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(app.lastEnd()?.result).toBe('accepted');

			request = await beginRequest(target, 'Beta');
			const disabled = app.lastRequest()!;
			app.disableAlpha();
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(disabled.signal.aborted).toBe(true);
			expect(app.lastEnd()?.result).toBe('stale');

			request = await beginRequest(target, 'Beta');
			const reordered = app.lastRequest()!;
			app.reorderItems();
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(reordered.signal.aborted).toBe(true);
			expect(app.lastEnd()?.result).toBe('stale');

			request = await beginRequest(target, 'Beta');
			const changedKey = app.lastRequest()!;
			app.changeAlphaKey();
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(changedKey.signal.aborted).toBe(true);
			expect(app.lastEnd()?.result).toBe('stale');

			request = await beginRequest(target, 'Beta');
			const resetPending = app.lastRequest()!;
			target
				.querySelector<HTMLButtonElement>(
					'[data-testid="transfer-request-form"] button[type="reset"]'
				)!
				.click();
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(resetPending.signal.aborted).toBe(true);
			expect(app.lastEnd()?.result).toBe('cancelled');
		} finally {
			await unmount(app);
			target.remove();
		}

		const unmountTarget = document.createElement('div');
		document.body.append(unmountTarget);
		app = mount(TransferRequestFixture, { target: unmountTarget });
		await beginRequest(unmountTarget, 'Alpha');
		const pending = app.lastRequest()!;
		await unmount(app);
		expect(pending.signal.aborted).toBe(true);
		app.resolveRequest(true);
		await tick();
		expect(app.endResults()).toEqual([]);
		unmountTarget.remove();
	});

	it('builds request movingKeys from only checked enabled source items after a same-frame disabled change', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferRequestFixture, { target });
		try {
			const request = root(target, 'transfer-request');
			const source = list(request, 'Request source');
			await select(source, 'Alpha');
			await select(source, 'Beta');
			app.disableAlpha();
			request.querySelector<HTMLButtonElement>('[aria-label="Request move to target"]')!.click();
			await expect.poll(() => request.dataset.state).toBe('pending');
			expect(app.lastRequest()?.movingKeys).toEqual(['beta']);
			app.resolveRequest(false);
			await expect.poll(() => request.dataset.state).toBe('idle');
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('cancels a pending request when the owner switches to immediate mode without replaying its late settlement', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferRequestFixture, { target });
		try {
			const request = await beginRequest(target, 'Alpha');
			const pending = app.lastRequest()!;
			const userFocus = target.querySelector<HTMLButtonElement>(
				'[data-testid="request-user-focus"]'
			)!;
			userFocus.focus();
			const beforeEnds = app.endResults().length;
			app.setRequestMoveMode('immediate');
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(pending.signal.aborted).toBe(true);
			expect(app.lastEnd()?.result).toBe('cancelled');
			expect(document.activeElement).toBe(userFocus);
			app.resolveRequest(true);
			await tick();
			expect(app.endResults()).toHaveLength(beforeEnds + 1);
		} finally {
			await unmount(app);
			target.remove();
		}
	});

	it('rejects a duplicate external echo and lets an onMoveEnd callback begin a new request without stale focus restoration', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferRequestFixture, { target });
		try {
			let request = await beginRequest(target, 'Alpha');
			const duplicate = app.lastRequest()!;
			app.echoDuplicateNextValue();
			app.resolveRequest(true);
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(duplicate.signal.aborted).toBe(true);
			expect(app.lastEnd()?.result).toBe('stale');
			target
				.querySelector<HTMLButtonElement>(
					'[data-testid="transfer-request-form"] button[type="reset"]'
				)!
				.click();
			await expect.poll(() => request.dataset.state).toBe('idle');

			app.setReentrantEnd(true);
			request = root(target, 'transfer-request');
			await select(list(request, 'Request target'), 'Target');
			request = await beginRequest(target, 'Alpha');
			app.echoNextValue();
			app.resolveRequest(true);
			await expect
				.poll(() => target.querySelector('[data-testid="transfer-request-state"]')?.textContent)
				.toContain('requests=3');
			expect(app.lastRequest()).toMatchObject({
				destination: 'source',
				movingKeys: ['target'],
				nextValue: ['alpha'],
				value: ['alpha', 'target']
			});
			expect(app.lastEnd()?.result).toBe('accepted');
			await expect.poll(() => request.dataset.state).toBe('pending');
			const userFocus = target.querySelector<HTMLButtonElement>(
				'[data-testid="request-user-focus"]'
			)!;
			userFocus.focus();
			app.echoNextValue();
			app.resolveRequest(true);
			await expect.poll(() => request.dataset.state).toBe('idle');
			expect(app.endResults().slice(-2)).toEqual(['accepted', 'accepted']);
			expect(document.activeElement).toBe(userFocus);
		} finally {
			await unmount(app);
			target.remove();
		}
	});
});
