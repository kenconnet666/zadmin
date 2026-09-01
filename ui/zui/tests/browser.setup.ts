import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from 'vitest-browser-svelte';
import { cleanupDirectMounts } from './browser-lifecycle.js';

let bodyChildren = new Set<Node>();
let bodyAttributes = new Map<string, string>();
let documentAttributes = new Map<string, string>();

function attributes(element: Element): Map<string, string> {
	return new Map([...element.attributes].map(({ name, value }) => [name, value]));
}

function restoreAttributes(element: Element, snapshot: ReadonlyMap<string, string>): void {
	for (const { name } of [...element.attributes]) {
		if (!snapshot.has(name)) element.removeAttribute(name);
	}
	for (const [name, value] of snapshot) element.setAttribute(name, value);
}

beforeEach(() => {
	bodyChildren = new Set(document.body.childNodes);
	bodyAttributes = attributes(document.body);
	documentAttributes = attributes(document.documentElement);
});

afterEach(async () => {
	const errors: unknown[] = [];
	try {
		await cleanupDirectMounts();
	} catch (error) {
		errors.push(error);
	}
	try {
		await cleanup();
	} catch (error) {
		errors.push(error);
	}
	for (const child of [...document.body.childNodes]) {
		if (!bodyChildren.has(child)) child.remove();
	}
	restoreAttributes(document.body, bodyAttributes);
	restoreAttributes(document.documentElement, documentAttributes);
	vi.restoreAllMocks();
	if (errors.length > 0) throw new AggregateError(errors, 'Browser test cleanup failed.');
});
