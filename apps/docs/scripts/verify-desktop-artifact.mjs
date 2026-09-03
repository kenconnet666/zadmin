import { readFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
	desktopComponentContracts,
	validateDesktopEvidenceArtifact
} from '../../../ui/webview/scripts/desktop-evidence.mjs';

const workspaceRoot = fileURLToPath(new URL('../../..', import.meta.url));
const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;

function argument(name, argv) {
	return argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
}

function fail(message) {
	throw new Error(`Desktop artifact verification failed: ${message}`);
}

function stableJson(value) {
	if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
	if (value && typeof value === 'object') {
		return `{${Object.keys(value)
			.sort()
			.map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
			.join(',')}}`;
	}
	return JSON.stringify(value);
}

export function verifyDesktopArtifact({ evidence, maturity, baseMaturity, expectedRevision }) {
	if (typeof expectedRevision !== 'string' || !/^[a-f0-9]{40}$/u.test(expectedRevision))
		fail('expected revision must be a full SHA.');
	const normalized = validateDesktopEvidenceArtifact(evidence, { expectedRevision });
	if (maturity?.schemaVersion !== 1 || maturity.status !== 'passed')
		fail('runtime maturity identity is invalid.');
	if (
		!Array.isArray(maturity.components) ||
		!maturity.summary ||
		typeof maturity.summary !== 'object'
	)
		fail('runtime maturity components or summary are invalid.');
	if (maturity.revision !== expectedRevision || maturity.target !== 'windows-x64')
		fail('runtime maturity revision or target is not bound to the CI SHA.');
	if (
		maturity.host?.runtime !== normalized.host.runtime ||
		maturity.host?.implementation !== normalized.host.implementation ||
		maturity.host?.webViewVersion !== normalized.host.webViewVersion ||
		maturity.host?.origin !== normalized.host.origin
	)
		fail('runtime maturity host does not match normalized desktop evidence.');
	if (stableJson(maturity.host) !== stableJson(normalized.host))
		fail('runtime maturity host differs from normalized host.');
	if (stableJson(maturity.bridgeRoundTrip) !== stableJson(normalized.bridgeRoundTrip))
		fail('runtime maturity bridge round trip differs from normalized evidence.');
	if (!baseMaturity?.source || !Array.isArray(baseMaturity.components))
		fail('base maturity matrix is invalid.');
	if (
		maturity.base?.componentCount !== baseMaturity.components.length ||
		maturity.base?.path !== '.docs/zui/component-maturity.json'
	)
		fail('runtime maturity base component count changed.');
	const baseById = new Map(baseMaturity.components.map((row) => [row.id, row]));
	if (
		baseById.size !== baseMaturity.components.length ||
		new Set((maturity.components ?? []).map((row) => row.id)).size !== maturity.components.length
	)
		fail('base/runtime component ids are not exact and unique.');
	const evidenceIds = new Set(normalized.components.map((component) => component.id));
	if (evidenceIds.size !== normalized.components.length)
		fail('desktop evidence component ids are duplicated.');
	for (const row of maturity.components ?? []) {
		const base = baseById.get(row.id);
		if (!base || row.name !== base.name) fail(`base component identity changed: ${row.id}.`);
		const withoutDesktop = (value) => {
			const copy = structuredClone(value);
			if (copy.stages) copy.stages.DesktopVerified = base.stages?.DesktopVerified;
			if (copy.evidence) copy.evidence.DesktopVerified = base.evidence?.DesktopVerified;
			return copy;
		};
		if (stableJson(withoutDesktop(row)) !== stableJson(withoutDesktop(base)))
			fail(`runtime maturity baseline was modified: ${row.id}.`);
	}
	if (maturity.components.length !== baseMaturity.components.length)
		fail('runtime maturity component count does not match base matrix.');
	const desktopVerified = maturity.components.filter((row) => row.stages?.DesktopVerified === true);
	if (desktopVerified.length !== normalized.components.length)
		fail('DesktopVerified count does not match evidence component count.');
	if (maturity.summary?.DesktopVerified !== desktopVerified.length)
		fail('maturity summary DesktopVerified count is invalid.');
	const baseSummary = { ...baseMaturity.summary, DesktopVerified: desktopVerified.length };
	if (stableJson(maturity.summary) !== stableJson(baseSummary))
		fail('maturity summary baseline was modified.');
	for (const component of normalized.components) {
		const row = maturity.components.find((candidate) => candidate.id === component.id);
		if (!row || row.stages?.DesktopVerified !== true)
			fail(`missing DesktopVerified row: ${component.id}.`);
		const records = row.evidence?.DesktopVerified;
		if (
			!Array.isArray(records) ||
			records.length !== 1 ||
			records[0]?.path !== 'apps/desktop/dist/desktop/windows-x64/desktop-evidence.json' ||
			!records[0]?.detail?.includes(component.evidenceId)
		)
			fail(`missing DesktopVerified evidence record: ${component.id}.`);
	}
	return {
		revision: expectedRevision,
		target: maturity.target,
		desktopVerified: desktopVerified.length
	};
}

async function main(argv = process.argv.slice(2)) {
	if (argv.includes('--self-test')) {
		const revision = 'a'.repeat(40);
		const evidence = {
			schemaVersion: 3,
			evidenceFormat: 'structured',
			status: 'passed',
			revision,
			target: 'windows-x64',
			host: {
				runtime: 'WebView2',
				implementation: 'WebViewHost',
				webViewVersion: '1',
				origin: 'https://app.zadmin.local',
				protocolVersion: 1,
				navigation: true,
				hydrated: true,
				bridge: true,
				bridgeResponseValidated: true,
				pageErrors: [],
				source: 'https://app.zadmin.local/'
			},
			bridgeRoundTrip: { method: 'app.snapshot', requestReceived: true, responseValidated: true },
			components: desktopComponentContracts.map((contract) => ({
				id: contract.id,
				name: contract.name,
				source: 'apps/desktop/src/routes/+page.svelte',
				evidenceId: contract.marker,
				locator: {
					kind: 'data-attribute',
					attribute: 'data-desktop-evidence',
					value: contract.marker
				},
				sideEffects: { bridge: 'none', filesystem: 'none', network: 'none', window: 'none' },
				rendered: true,
				native: contract.native,
				assertions: [
					{
						id: 'rendered',
						kind: 'state',
						target: 'root',
						expected: true,
						actual: true,
						passed: true
					},
					...Object.entries(contract.native).map(([property, expected]) => ({
						id: `native.${property}`,
						kind: property.startsWith('aria') ? 'aria' : 'native',
						target: property,
						expected,
						actual: expected,
						passed: true
					}))
				],
				interactions: contract.interaction
					? [
							{
								id: contract.interaction.id,
								action: contract.interaction.action,
								target: contract.interaction.target,
								observations: contract.interaction.observations.map(
									({ read: _read, ...observation }) => {
										void _read;
										return { ...observation, actual: observation.expected, passed: true };
									}
								),
								passed: true
							}
						]
					: [],
				passed: true
			}))
		};
		const base = {
			source: { metadataComponents: desktopComponentContracts.length },
			path: '.docs/zui/component-maturity.json',
			components: desktopComponentContracts.map((contract) => ({
				id: contract.id,
				name: contract.name,
				stages: {
					Declared: true,
					Authorable: true,
					ContractVerified: true,
					RuntimeImplemented: true,
					ProductionVerified: true,
					DesktopVerified: false
				},
				evidence: { DesktopVerified: [] }
			})),
			summary: {}
		};
		const maturity = {
			schemaVersion: 1,
			status: 'passed',
			revision,
			target: 'windows-x64',
			host: evidence.host,
			bridgeRoundTrip: evidence.bridgeRoundTrip,
			base: {
				componentCount: desktopComponentContracts.length,
				path: '.docs/zui/component-maturity.json'
			},
			summary: { DesktopVerified: desktopComponentContracts.length },
			components: base.components.map((row, index) => ({
				...row,
				stages: { ...row.stages, DesktopVerified: true },
				evidence: {
					DesktopVerified: [
						{
							path: 'apps/desktop/dist/desktop/windows-x64/desktop-evidence.json',
							detail: `${desktopComponentContracts[index].name}: ${desktopComponentContracts[index].marker}`
						}
					]
				}
			}))
		};
		verifyDesktopArtifact({ evidence, maturity, baseMaturity: base, expectedRevision: revision });
		const mutations = [
			['revision', (value) => (value.revision = 'b'.repeat(40)), /revision/u],
			['host', (value) => (value.host.origin = 'https://tampered.invalid'), /host/u],
			['bridge', (value) => (value.bridgeRoundTrip.responseValidated = false), /bridge/u],
			['base path', (value) => (value.base.path = 'wrong.json'), /base component/u],
			['baseline', (value) => (value.components[0].stages.RuntimeImplemented = false), /baseline/u],
			['summary', (value) => (value.summary.DesktopVerified += 1), /summary DesktopVerified/u],
			[
				'evidence record',
				(value) => (value.components[0].evidence.DesktopVerified[0].path = 'wrong.json'),
				/evidence record/u
			],
			['duplicate id', (value) => (value.components.at(-1).id = value.components[0].id), /ids/u]
		];
		for (const [label, mutate, pattern] of mutations) {
			const changed = structuredClone(maturity);
			mutate(changed);
			try {
				verifyDesktopArtifact({
					evidence,
					maturity: changed,
					baseMaturity: base,
					expectedRevision: revision
				});
				throw new Error(`negative self-test accepted ${label}`);
			} catch (error) {
				if (!pattern.test(String(error))) throw error;
			}
		}
		console.log(JSON.stringify({ status: 'passed', negativeCases: mutations.length }));
		return;
	}
	const directory = argument('directory', argv);
	const expectedRevision = argument('revision', argv);
	if (!directory || !expectedRevision) throw new Error('--directory and --revision are required.');
	const directoryPath = resolve(workspaceRoot, directory);
	const directoryRelation = relative(workspaceRoot, directoryPath);
	if (
		isAbsolute(directoryRelation) ||
		directoryRelation === '..' ||
		directoryRelation.startsWith(`..${sep}`)
	)
		throw new Error('--directory must stay inside the workspace.');
	const read = (name) => readFile(resolve(directoryPath, name), 'utf8').then(JSON.parse);
	const [evidence, maturity, baseMaturity] = await Promise.all([
		read('windows-x64/desktop-evidence.json'),
		read('windows-x64/component-maturity.json'),
		readFile(resolve(workspaceRoot, '.docs/zui/component-maturity.json'), 'utf8').then(JSON.parse)
	]);
	console.log(
		JSON.stringify({
			status: 'passed',
			...verifyDesktopArtifact({ evidence, maturity, baseMaturity, expectedRevision })
		})
	);
}

if (isMain) await main();
