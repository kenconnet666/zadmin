import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { ZUI_PACKAGE_NAME } from '../src/entrypoints/index.js';
import {
	aspectRatioMetadata,
	boxMetadata,
	buttonMetadata,
	checkboxMetadata,
	codeMetadata,
	containerMetadata,
	fieldMetadata,
	iconMetadata,
	inputMetadata,
	kbdMetadata,
	linkMetadata,
	paginationMetadata,
	providerMetadata,
	radioGroupItemMetadata,
	radioGroupMetadata,
	separatorMetadata,
	sliderMetadata,
	stackMetadata,
	switchMetadata,
	tabsListMetadata,
	tabsMetadata,
	tabsPanelMetadata,
	tabsTriggerMetadata,
	textMetadata,
	toggleButtonMetadata,
	visuallyHiddenMetadata
} from '../src/entrypoints/metadata.js';

interface PackageManifest {
	readonly exports: Readonly<Record<string, unknown>>;
	readonly publishConfig: { readonly exports: Readonly<Record<string, unknown>> };
	readonly scripts: { readonly build: string };
}

const manifest = JSON.parse(
	readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as PackageManifest;

describe('@zadmin/zui package', () => {
	it('keeps a stable public package name', () => {
		expect(ZUI_PACKAGE_NAME).toBe('@zadmin/zui');
	});

	it('keeps source and publish exports aligned with the entrypoint directory', () => {
		expect(readdirSync(new URL('../src/entrypoints/', import.meta.url)).sort()).toEqual([
			'code.ts',
			'compiler.ts',
			'index.ts',
			'internal.ts',
			'metadata.ts',
			'runtime.ts',
			'testing.ts',
			'theme.ts',
			'themes.ts'
		]);
		expect(Object.keys(manifest.exports)).toEqual(['.', './*']);
		expect(Object.keys(manifest.publishConfig.exports)).toEqual(['.', './*']);
		expect(manifest.exports).not.toHaveProperty('./core');
		expect(manifest.scripts.build).toContain('--input src');
		expect(JSON.stringify(manifest)).not.toContain('src/lib');
	});

	it('keeps component metadata unique and colocated with public source files', () => {
		const metadata = [
			providerMetadata,
			boxMetadata,
			stackMetadata,
			textMetadata,
			iconMetadata,
			codeMetadata,
			buttonMetadata,
			radioGroupMetadata,
			radioGroupItemMetadata,
			checkboxMetadata,
			toggleButtonMetadata,
			linkMetadata,
			paginationMetadata,
			separatorMetadata,
			sliderMetadata,
			visuallyHiddenMetadata,
			kbdMetadata,
			aspectRatioMetadata,
			containerMetadata,
			inputMetadata,
			fieldMetadata,
			switchMetadata,
			tabsMetadata,
			tabsListMetadata,
			tabsTriggerMetadata,
			tabsPanelMetadata
		];
		expect(new Set(metadata.map(({ id }) => id)).size).toBe(metadata.length);
		expect(metadata.every(({ name }) => name.startsWith('Z'))).toBe(true);
		expect(metadata.every(({ name, source }) => source.endsWith(`/${name}.svelte`))).toBe(true);
	});
});
