import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { mount, unmount } from './browser-lifecycle.js';
import FormNestedListFixture from './FormNestedListFixture.svelte';
import { resetForm } from './form-reset.js';

function host(): HTMLDivElement {
	const target = document.createElement('div');
	document.body.append(target);
	return target;
}

function group(target: HTMLElement, key: string): HTMLElement {
	return target.querySelector<HTMLElement>(`[data-group-key="${key}"]`)!;
}

function memberRows(groupNode: HTMLElement): HTMLElement[] {
	return [...groupNode.querySelectorAll<HTMLElement>('[data-main-member-id]')];
}

function memberIds(groupNode: HTMLElement): (string | undefined)[] {
	return memberRows(groupNode).map((row) => row.dataset.mainMemberId);
}

function nestedIdentity(target: HTMLElement): {
	readonly groupIds: readonly (string | undefined)[];
	readonly memberIdsByGroup: Readonly<Record<string, readonly (string | undefined)[]>>;
} {
	const groups = [...target.querySelectorAll<HTMLElement>('[data-main-group-id]')];
	return {
		groupIds: groups.map((row) => row.dataset.mainGroupId),
		memberIdsByGroup: Object.fromEntries(
			groups.map((row) => [row.dataset.groupKey!, memberIds(row)])
		)
	};
}

describe('nested ZFormList production contract', () => {
	it('keeps nested keyed DOM, row ids, input focus and selection through an outer swap', async () => {
		const target = host();
		const component = mount(FormNestedListFixture, { target });
		try {
			await tick();
			const groupA = group(target, 'a');
			const groupB = group(target, 'b');
			const members = memberRows(groupA);
			const ids = memberIds(groupA);
			const input = members[0]!.querySelector<HTMLInputElement>('input')!;
			input.focus();
			input.setSelectionRange(1, 4);

			target.querySelector<HTMLButtonElement>('[data-testid="outer-swap"]')!.click();
			await tick();

			expect([...target.querySelectorAll('[data-main-group-id]')]).toEqual([groupB, groupA]);
			expect(memberRows(groupA)).toEqual(members);
			expect(memberIds(groupA)).toEqual(ids);
			expect(document.activeElement).toBe(input);
			expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4]);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('uses the stable parent baseline when resetField follows outer and inner moves', async () => {
		const target = host();
		const component = mount(FormNestedListFixture, { target });
		try {
			await tick();
			expect(component.setMemberName(0, 0, 'edited-a-one')).toBe(true);
			target.querySelector<HTMLButtonElement>('[data-testid="outer-swap"]')!.click();
			await tick();
			group(target, 'a').querySelector<HTMLButtonElement>('[data-inner-move="a"]')!.click();
			await tick();

			expect(component.fieldValue(1, 1)).toBe('edited-a-one');
			expect(component.fieldState(1, 1)?.dirty).toBe(true);
			component.resetMember(1, 1);
			await tick();

			expect(component.fieldValue(1, 1)).toBe('a-one');
			expect(component.fieldState(1, 1)?.dirty).toBe(false);
			expect(
				memberRows(group(target, 'a'))[1]?.querySelector<HTMLInputElement>('input')?.value
			).toBe('a-one');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('remaps server and manual errors exactly once across both list levels', async () => {
		const target = host();
		const component = mount(FormNestedListFixture, { target });
		try {
			await tick();
			component.seedNestedErrors();
			target.querySelector<HTMLButtonElement>('[data-testid="outer-swap"]')!.click();
			await tick();
			group(target, 'a').querySelector<HTMLButtonElement>('[data-inner-move="a"]')!.click();
			await tick();

			expect(component.fieldState(1, 1)?.errors).toEqual(['Server a-one', 'Manual a-one']);
			expect(component.fieldState(1, 1)?.warnings).toEqual(['Manual warning a-one']);
			expect(component.fieldState(0, 0)?.errors).toEqual([]);
			expect(component.fieldState(1, 0)?.errors).toEqual([]);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('makes a late schema result outdated when its outer row is removed', async () => {
		const target = host();
		const component = mount(FormNestedListFixture, { target });
		try {
			await tick();
			component.startValidation();
			await component.waitValidationStarted();
			group(target, 'a').querySelector<HTMLButtonElement>('[data-outer-remove="a"]')!.click();
			await tick();
			const result = await component.finishValidation();

			expect(result?.outdated).toBe(true);
			expect(component.fieldState(0, 0)?.errors).not.toContain('Late removed member error');
			expect(target.querySelector('[data-group-key="a"]')).toBeNull();
			expect(target.querySelector('[data-group-key="b"]')).not.toBeNull();
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('supports append and child reset inside a new parent row with no baseline', async () => {
		const target = host();
		const component = mount(FormNestedListFixture, { target });
		try {
			await tick();
			target.querySelector<HTMLButtonElement>('[data-testid="outer-append"]')!.click();
			await tick();
			const draft = group(target, 'draft');
			draft.querySelector<HTMLButtonElement>('[data-inner-append="draft"]')!.click();
			await tick();

			expect(component.fieldValue(2, 0)).toBe('draft-member');
			expect(component.fieldState(2, 0)?.dirty).toBe(true);
			component.resetMember(2, 0);
			await tick();

			expect(component.fieldValue(2, 0)).toBeUndefined();
			expect(component.fieldState(2, 0)?.dirty).toBe(false);
			expect(memberRows(draft)).toHaveLength(1);
			expect(draft.querySelector<HTMLInputElement>('input')?.value).toBe('');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('restores both levels of baseline row identity on form reset', async () => {
		const target = host();
		const component = mount(FormNestedListFixture, { target });
		try {
			await tick();
			const baseline = nestedIdentity(target);
			target.querySelector<HTMLButtonElement>('[data-testid="outer-swap"]')!.click();
			await tick();
			group(target, 'a').querySelector<HTMLButtonElement>('[data-inner-move="a"]')!.click();
			await tick();
			expect(nestedIdentity(target)).not.toEqual(baseline);

			await resetForm(target.querySelector<HTMLFormElement>('[data-testid="nested-list-form"]'));

			expect(nestedIdentity(target)).toEqual(baseline);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('restores both levels of row identity when initialize receives the same baseline', async () => {
		const target = host();
		const component = mount(FormNestedListFixture, { target });
		try {
			await tick();
			const baseline = nestedIdentity(target);
			target.querySelector<HTMLButtonElement>('[data-testid="outer-swap"]')!.click();
			await tick();
			group(target, 'a').querySelector<HTMLButtonElement>('[data-inner-move="a"]')!.click();
			await tick();

			component.initializeSameBaseline();
			await tick();

			expect(nestedIdentity(target)).toEqual(baseline);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('keeps DOM, values, errors and focus when a controlled owner rejects outer remove', async () => {
		const target = host();
		const component = mount(FormNestedListFixture, { target });
		try {
			await tick();
			const groups = [...target.querySelectorAll<HTMLElement>('[data-rejected-group-id]')];
			const members = [...target.querySelectorAll<HTMLElement>('[data-rejected-member-id]')];
			const input = members[0]!.querySelector<HTMLInputElement>('input')!;
			const values = target.querySelector('[data-testid="rejected-nested-values"]')?.textContent;
			component.seedRejectedErrors();
			const state = component.rejectedState();
			input.focus();
			input.setSelectionRange(2, 7);

			target.querySelector<HTMLButtonElement>('[data-testid="rejected-outer-remove"]')!.click();
			await tick();

			expect(target.querySelector('[data-testid="rejected-nested-operation"]')?.textContent).toBe(
				'false'
			);
			expect([...target.querySelectorAll('[data-rejected-group-id]')]).toEqual(groups);
			expect([...target.querySelectorAll('[data-rejected-member-id]')]).toEqual(members);
			expect(target.querySelector('[data-testid="rejected-nested-values"]')?.textContent).toBe(
				values
			);
			expect(component.rejectedState()).toEqual(state);
			expect(component.rejectedState()?.errors).toEqual(['Rejected server', 'Rejected manual']);
			expect(document.activeElement).toBe(input);
			expect([input.selectionStart, input.selectionEnd]).toEqual([2, 7]);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
