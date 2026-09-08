import { readdir } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import AllDocsExamplesSsrFixture, { docsSsrExamples } from './AllDocsExamplesSsrFixture.svelte';

const docsComponentsRoot = resolve(
	dirname(fileURLToPath(import.meta.url)),
	'../../../apps/docs/src/content/components'
);

async function physicalDocsExamplePaths(
	directory = docsComponentsRoot
): Promise<readonly string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const paths = await Promise.all(
		entries.map(async (entry) => {
			const path = resolve(directory, entry.name);
			if (entry.isDirectory()) return physicalDocsExamplePaths(path);
			return entry.isFile() && entry.name.endsWith('.svelte') ? [path] : [];
		})
	);
	return paths.flat();
}

function relativeDocsPath(path: string): string {
	return relative(docsComponentsRoot, path).replaceAll('\\', '/');
}

function globDocsPath(path: string): string {
	const normalized = path.replaceAll('\\', '/');
	const marker = 'apps/docs/src/content/components/';
	const index = normalized.lastIndexOf(marker);
	if (index < 0) throw new Error(`Docs glob escaped its component root: ${path}`);
	return normalized.slice(index + marker.length);
}

describe('documentation example SSR matrix', () => {
	it('matches the complete physical docs example set before rendering', async () => {
		expect(typeof window).toBe('undefined');
		expect(typeof document).toBe('undefined');
		const globPaths = docsSsrExamples.map((example) => globDocsPath(example.path)).sort();
		const physicalPaths = (await physicalDocsExamplePaths()).map(relativeDocsPath).sort();
		expect(globPaths.length).toBeGreaterThanOrEqual(156);
		expect(new Set(globPaths).size).toBe(globPaths.length);
		expect(globPaths).toEqual(physicalPaths);
	});

	for (const example of docsSsrExamples) {
		it(`server-renders ${example.path} without browser globals`, () => {
			const body = render(AllDocsExamplesSsrFixture, {
				props: { examplePath: example.path }
			}).body;
			expect(body).toContain('data-docs-example=');
			expect(body).toContain(example.path);
		});
	}
});
