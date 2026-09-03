import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { validateDesktopEvidenceArtifact } from '../../../ui/webview/scripts/desktop-evidence.mjs';

const workspaceRoot = fileURLToPath(new URL('../../..', import.meta.url));
const defaultMaturityPath = resolve(workspaceRoot, '.docs/zui/component-maturity.json');
const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;

function portable(value) {
	return value.replaceAll('\\', '/');
}

function argument(name, argv) {
	return argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
}

function assertInside(base, target, label) {
	const relation = relative(base, target);
	if (relation === '..' || relation.startsWith(`..${sep}`) || isAbsolute(relation))
		throw new Error(`${label} must stay inside ${base}: ${target}.`);
	return target;
}

function displayEvidenceValue(value) {
	return typeof value === 'string' ? value : JSON.stringify(value);
}

function componentEvidenceDetail(component) {
	const assertions = component.assertions
		.map(({ id, actual }) => `${id}=${displayEvidenceValue(actual)}`)
		.join(', ');
	const interactions = component.interactions
		.map(
			({ action, id, observations }) =>
				`${action}:${id}(${observations.map(({ id: observationId, actual }) => `${observationId}=${displayEvidenceValue(actual)}`).join(', ')})`
		)
		.join(', ');
	return `${assertions}; ${interactions || 'render-only'}`;
}

export function composeDesktopMaturity({
	baseMaturity,
	desktopEvidence,
	expectedRevision,
	evidencePath = 'desktop-evidence.json'
}) {
	const evidence = validateDesktopEvidenceArtifact(desktopEvidence, { expectedRevision });
	if (
		!baseMaturity?.source ||
		!baseMaturity?.summary ||
		!Array.isArray(baseMaturity.components) ||
		baseMaturity.components.length !== baseMaturity.source.metadataComponents
	)
		throw new Error('Desktop maturity base matrix is invalid.');
	const rowsById = new Map();
	for (const row of baseMaturity.components) {
		if (typeof row?.id !== 'string' || rowsById.has(row.id))
			throw new Error(`Desktop maturity base component id is invalid: ${row?.id}.`);
		rowsById.set(row.id, row);
	}
	const evidenceById = new Map();
	for (const component of evidence.components) {
		const row = rowsById.get(component.id);
		if (!row || row.name !== component.name)
			throw new Error(`Desktop evidence component is not in the base matrix: ${component.id}.`);
		if (
			row.stages?.Declared !== true ||
			row.stages?.Authorable !== true ||
			row.stages?.ContractVerified !== true ||
			row.stages?.RuntimeImplemented !== true ||
			row.stages?.ProductionVerified !== true
		)
			throw new Error(`Desktop evidence component lacks base production stages: ${component.id}.`);
		evidenceById.set(component.id, component);
	}
	const components = baseMaturity.components.map((row) => {
		const component = evidenceById.get(row.id);
		if (!component) return row;
		return {
			...row,
			stages: { ...row.stages, DesktopVerified: true },
			evidence: {
				...row.evidence,
				DesktopVerified: [
					{
						path: portable(evidencePath),
						detail: `Windows WebView2 ${component.evidenceId}: ${componentEvidenceDetail(component)}`
					}
				]
			}
		};
	});
	const verified = components.filter(({ stages }) => stages.DesktopVerified === true).length;
	if (verified !== evidence.components.length)
		throw new Error(
			`Desktop maturity count mismatch: ${verified} != ${evidence.components.length}.`
		);
	return {
		schemaVersion: 1,
		status: 'passed',
		revision: evidence.revision,
		target: evidence.target,
		host: evidence.host,
		bridgeRoundTrip: evidence.bridgeRoundTrip,
		base: {
			componentCount: baseMaturity.components.length,
			path: '.docs/zui/component-maturity.json'
		},
		summary: { ...baseMaturity.summary, DesktopVerified: verified },
		components
	};
}

function selfTest() {
	const componentContracts = [
		['box', 'ZBox', 'ZBox-status'],
		['stack', 'ZStack', 'ZStack'],
		['text', 'ZText', 'ZText'],
		['button', 'ZButton', 'ZButton-component-action']
	];
	const nativeByName = {
		ZBox: { tag: 'DIV', ariaLive: 'polite' },
		ZStack: { tag: 'DIV' },
		ZText: { tag: 'STRONG', text: 'Windows WebView2 capability lab' },
		ZButton: { tag: 'BUTTON', type: 'button', disabled: false, text: 'Verify component' }
	};
	const assertion = (id, kind, target, expected) => ({
		id,
		kind,
		target,
		expected,
		actual: expected,
		passed: true
	});
	const revision = 'a'.repeat(40);
	const desktopEvidence = {
		schemaVersion: 3,
		evidenceFormat: 'structured',
		status: 'passed',
		revision,
		target: 'windows-x64',
		host: {
			runtime: 'WebView2',
			implementation: 'WebViewHost',
			origin: 'https://app.zadmin.local',
			webViewVersion: '130.0.1',
			protocolVersion: 1,
			navigation: true,
			hydrated: true,
			bridge: true,
			bridgeResponseValidated: true,
			pageErrors: [],
			source: 'https://app.zadmin.local/'
		},
		bridgeRoundTrip: {
			method: 'app.snapshot',
			requestReceived: true,
			responseValidated: true
		},
		components: componentContracts.map(([id, name, evidenceId]) => {
			const native = nativeByName[name];
			return {
				id,
				name,
				source: 'apps/desktop/src/routes/+page.svelte',
				evidenceId,
				locator: {
					kind: 'data-attribute',
					attribute: 'data-desktop-evidence',
					value: evidenceId
				},
				sideEffects: { bridge: 'none', filesystem: 'none', network: 'none', window: 'none' },
				rendered: true,
				native,
				assertions: [
					assertion('rendered', 'state', 'root', true),
					...Object.entries(native).map(([property, expected]) =>
						assertion(
							`native.${property}`,
							property.startsWith('aria') ? 'aria' : 'native',
							property,
							expected
						)
					)
				],
				interactions:
					name === 'ZButton'
						? [
								{
									id: 'activate-once',
									action: 'click',
									target: 'root',
									observations: [assertion('runs-delta', 'state', 'data-desktop-evidence-runs', 1)],
									passed: true
								}
							]
						: [],
				passed: true
			};
		})
	};
	const baseMaturity = {
		source: { metadataComponents: 5 },
		summary: { DesktopVerified: 0, ProductionVerified: 5 },
		components: [
			...componentContracts.map(([id, name]) => ({
				id,
				name,
				stages: {
					Declared: true,
					Authorable: true,
					ContractVerified: true,
					RuntimeImplemented: true,
					DesktopVerified: false,
					ProductionVerified: true
				},
				evidence: { DesktopVerified: [] }
			})),
			{
				id: 'dialog',
				name: 'ZDialog',
				stages: { DesktopVerified: false, ProductionVerified: true },
				evidence: { DesktopVerified: [] }
			}
		]
	};
	const composed = composeDesktopMaturity({
		baseMaturity,
		desktopEvidence,
		expectedRevision: revision,
		evidencePath: 'apps/desktop/dist/desktop/windows-x64/desktop-evidence.json'
	});
	if (
		composed.summary.DesktopVerified !== 4 ||
		composed.components.find(({ id }) => id === 'dialog')?.stages.DesktopVerified !== false
	)
		throw new Error('Desktop maturity self-test produced the wrong verified set.');
	try {
		composeDesktopMaturity({
			baseMaturity,
			desktopEvidence: {
				...desktopEvidence,
				components: desktopEvidence.components.map((component) =>
					component.id === 'button' ? { ...component, id: 'unknown' } : component
				)
			},
			expectedRevision: revision
		});
		throw new Error('Desktop maturity self-test accepted an unknown component.');
	} catch (error) {
		if (!String(error).includes('normalized component')) throw error;
	}
	console.log(
		JSON.stringify({ desktopVerified: composed.summary.DesktopVerified, status: 'passed' })
	);
}

async function main(argv = process.argv.slice(2)) {
	if (argv.includes('--help')) {
		console.log(
			'Usage: node apps/docs/scripts/compose-desktop-maturity.mjs --evidence=<desktop-evidence.json> --revision=<full-sha> --out=<runtime-maturity.json> [--base=.docs/zui/component-maturity.json] [--force]'
		);
		return;
	}
	if (argv.includes('--self-test')) {
		selfTest();
		return;
	}
	const evidenceInput = argument('evidence', argv);
	const revision = argument('revision', argv);
	const output = argument('out', argv);
	if (!evidenceInput || !revision || !output)
		throw new Error('--evidence, --revision and --out are required.');
	const evidencePath = assertInside(
		workspaceRoot,
		resolve(workspaceRoot, evidenceInput),
		'Desktop evidence input'
	);
	const basePath = assertInside(
		workspaceRoot,
		resolve(workspaceRoot, argument('base', argv) ?? defaultMaturityPath),
		'Desktop maturity base'
	);
	const outputPath = assertInside(
		workspaceRoot,
		resolve(workspaceRoot, output),
		'Desktop maturity output'
	);
	const [desktopEvidence, baseMaturity] = await Promise.all(
		[evidencePath, basePath].map(async (path) => JSON.parse(await readFile(path, 'utf8')))
	);
	const composed = composeDesktopMaturity({
		baseMaturity,
		desktopEvidence,
		expectedRevision: revision,
		evidencePath: portable(relative(workspaceRoot, evidencePath))
	});
	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, `${JSON.stringify(composed, null, '\t')}\n`, {
		encoding: 'utf8',
		flag: argv.includes('--force') ? 'w' : 'wx'
	});
	console.log(
		JSON.stringify({
			desktopVerified: composed.summary.DesktopVerified,
			output: portable(relative(workspaceRoot, outputPath)),
			revision: composed.revision,
			status: composed.status
		})
	);
}

if (isMain) await main();
