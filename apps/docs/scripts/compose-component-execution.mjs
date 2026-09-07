import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createComponentTestInventory } from './component-test-inventory.mjs';

const workspaceRoot = fileURLToPath(new URL('../../..', import.meta.url));
const defaultMaturityPath = resolve(workspaceRoot, '.docs/zui/component-maturity.json');
const testResultsRoot = resolve(workspaceRoot, 'test-results');
const requiredBrowsers = ['chromium', 'firefox', 'webkit'];
const statuses = ['passed', 'failed', 'skipped', 'todo', 'pending', 'cancelled'];
const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;

const portable = (value) => value.replaceAll('\\', '/');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const stableJson = (value) => `${JSON.stringify(value, null, '\t')}\n`;

function fail(message) {
	throw new Error(`Component execution: ${message}`);
}

function object(value, label) {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		fail(`${label} must be an object.`);
	return value;
}

function string(value, label) {
	if (typeof value !== 'string' || value.length === 0) fail(`${label} must be a non-empty string.`);
	return value;
}

function integer(value, label, minimum = 0) {
	if (!Number.isInteger(value) || value < minimum)
		fail(`${label} must be an integer greater than or equal to ${minimum}.`);
	return value;
}

function array(value, label) {
	if (!Array.isArray(value)) fail(`${label} must be an array.`);
	return value;
}

function assertIdentity(value, expected, label) {
	if (String(value) !== String(expected)) fail(`${label} does not match the requested run.`);
}

function assertRelativePath(value, label, prefix) {
	string(value, label);
	if (
		value.includes('\\') ||
		isAbsolute(value) ||
		value === '..' ||
		value.startsWith('../') ||
		value.includes('/../') ||
		(prefix && !value.startsWith(prefix))
	)
		fail(`${label} is outside its allowed source tree: ${value}.`);
	return value;
}

function inside(base, target) {
	const relation = relative(resolve(base), resolve(target));
	return (
		relation === '' ||
		(!isAbsolute(relation) && relation !== '..' && !relation.startsWith(`..${sep}`))
	);
}

function artifactPath(value, label, { mustExist = true } = {}) {
	const target = resolve(workspaceRoot, value);
	if (!inside(testResultsRoot, target)) fail(`${label} must stay inside test-results/.`);
	if (!mustExist && target === testResultsRoot) fail(`${label} must name a file.`);
	return target;
}

function parseArguments(argv) {
	const values = new Map();
	const allowed = new Set([
		'revision',
		'run-id',
		'run-attempt',
		'reports',
		'gates',
		'out',
		'report'
	]);
	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (!token.startsWith('--')) fail(`unexpected argument ${token}.`);
		const equals = token.indexOf('=');
		const name = token.slice(2, equals === -1 ? undefined : equals);
		if (!allowed.has(name)) fail(`unknown argument --${name}.`);
		const value = equals === -1 ? argv[++index] : token.slice(equals + 1);
		if (!value || value.startsWith('--')) fail(`--${name} requires a value.`);
		const existing = values.get(name) ?? [];
		existing.push(value);
		values.set(name, existing);
	}
	for (const [name, entries] of values)
		if (name !== 'reports' && entries.length > 1) fail(`--${name} cannot be repeated.`);
	return {
		revision: values.get('revision')?.at(-1),
		runId: values.get('run-id')?.at(-1),
		runAttempt: Number(values.get('run-attempt')?.at(-1)),
		reports: values.get('reports') ?? [],
		gates: values.get('gates')?.at(-1),
		out: values.get('out')?.at(-1),
		report: values.get('report')?.at(-1)
	};
}

function validateIdentity({ revision, runId, runAttempt }) {
	if (!/^[0-9a-f]{40}$/u.test(revision ?? '')) fail('--revision must be a full lowercase Git SHA.');
	if (!/^\d+$/u.test(runId ?? '') || runId === '0') fail('--run-id must be a positive integer.');
	integer(runAttempt, '--run-attempt', 1);
}

function validateErrorList(value, label) {
	for (const [index, entry] of array(value, label).entries())
		string(object(entry, `${label}[${index}]`).message, `${label}[${index}].message`);
}

function validateVitestReport(report, identity) {
	object(report, 'Vitest report');
	if (report.schemaVersion !== 1) fail('Vitest report schemaVersion must be 1.');
	const run = object(report.run, 'Vitest report run');
	assertIdentity(run.revision, identity.revision, 'Vitest revision');
	assertIdentity(run.id, identity.runId, 'Vitest run id');
	assertIdentity(run.attempt, identity.runAttempt, 'Vitest run attempt');
	const runner = object(run.runner, 'Vitest runner');
	if (string(runner.name, 'Vitest runner name') !== 'vitest')
		fail('Vitest runner name is invalid.');
	string(runner.version, 'Vitest runner version');
	if (!['passed', 'failed', 'interrupted', 'timeout'].includes(run.endReason))
		fail('Vitest run end reason is invalid.');
	validateErrorList(report.unhandledErrors, 'Vitest unhandledErrors');

	const specificationKeys = new Set();
	const specifications = array(report.specifications, 'Vitest specifications').map(
		(specification, index) => {
			object(specification, `Vitest specifications[${index}]`);
			const normalized = {
				project: string(specification.project, `Vitest specifications[${index}].project`),
				pool: string(specification.pool, `Vitest specifications[${index}].pool`),
				file: assertRelativePath(
					specification.file,
					`Vitest specifications[${index}].file`,
					'tests/'
				)
			};
			const key = JSON.stringify(normalized);
			if (specificationKeys.has(key)) fail(`duplicate Vitest specification ${key}.`);
			specificationKeys.add(key);
			return normalized;
		}
	);
	const sortedSpecifications = [...specifications].sort((left, right) => {
		const leftKey = `${left.project}\0${left.pool}\0${left.file}`;
		const rightKey = `${right.project}\0${right.pool}\0${right.file}`;
		return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
	});
	assertIdentity(run.specificationCount, sortedSpecifications.length, 'Vitest specification count');
	assertIdentity(
		run.inputHash,
		sha256(JSON.stringify(sortedSpecifications)),
		'Vitest specification input hash'
	);

	const summary = Object.fromEntries(statuses.map((status) => [status, 0]));
	const moduleKeys = new Set();
	const observedSpecificationKeys = new Set();
	const testKeys = new Set();
	const modules = array(report.modules, 'Vitest modules').map((module, moduleIndex) => {
		object(module, `Vitest modules[${moduleIndex}]`);
		const project = string(module.project, `Vitest modules[${moduleIndex}].project`);
		const pool = string(module.pool, `Vitest modules[${moduleIndex}].pool`);
		const file = assertRelativePath(module.file, `Vitest modules[${moduleIndex}].file`, 'tests/');
		const kind = module.kind;
		if (kind !== 'unit' && kind !== 'browser') fail(`Vitest module ${file} has invalid kind.`);
		if (!statuses.includes(module.status)) fail(`Vitest module ${file} has invalid status.`);
		if (
			typeof module.durationMs !== 'number' ||
			!Number.isFinite(module.durationMs) ||
			module.durationMs < 0
		)
			fail(`Vitest module ${file} has invalid duration.`);
		validateErrorList(module.errors, `Vitest module ${file} errors`);
		let browser = null;
		if (kind === 'browser') {
			if (pool !== 'browser') fail(`Vitest browser module ${file} is not in the browser pool.`);
			browser = object(module.browser, `Vitest browser module ${file} identity`);
			browser = {
				name: string(browser.name, `Vitest browser module ${file} name`),
				provider: string(browser.provider, `Vitest browser module ${file} provider`)
			};
		} else if (module.browser !== null) fail(`Vitest unit module ${file} declares a browser.`);
		const specificationKey = JSON.stringify({ project, pool, file });
		if (!specificationKeys.has(specificationKey))
			fail(`Vitest module has no input specification: ${file}.`);
		if (observedSpecificationKeys.has(specificationKey))
			fail(`Vitest specification produced duplicate modules: ${file}.`);
		observedSpecificationKeys.add(specificationKey);
		const moduleKey = JSON.stringify([project, pool, file, browser?.provider, browser?.name]);
		if (moduleKeys.has(moduleKey)) fail(`duplicate Vitest module ${moduleKey}.`);
		moduleKeys.add(moduleKey);
		const tests = array(module.tests, `Vitest module ${file} tests`).map((test, testIndex) => {
			object(test, `Vitest module ${file} tests[${testIndex}]`);
			const status = test.status;
			if (!statuses.includes(status)) fail(`Vitest test in ${file} has invalid status.`);
			const fullName = string(test.fullName, `Vitest test in ${file} fullName`);
			string(test.id, `Vitest test in ${file} id`);
			const location =
				test.location === null
					? null
					: {
							line: integer(
								object(test.location, 'Vitest test location').line,
								'Vitest test line',
								1
							),
							column: integer(test.location.column, 'Vitest test column', 1)
						};
			integer(test.attempt, 'Vitest test attempt', 1);
			integer(test.retryCount, 'Vitest test retry count');
			integer(test.repeatCount, 'Vitest test repeat count');
			if (test.attempt !== test.retryCount + 1)
				fail(`Vitest test ${fullName} attempt is inconsistent.`);
			if (
				typeof test.flaky !== 'boolean' ||
				test.flaky !== (status === 'passed' && test.retryCount > 0)
			)
				fail(`Vitest test ${fullName} flaky state is inconsistent.`);
			if (typeof test.expectedFailure !== 'boolean')
				fail(`Vitest test ${fullName} expectedFailure is missing.`);
			validateErrorList(test.errors, `Vitest test ${fullName} errors`);
			const testKey = JSON.stringify([
				project,
				browser?.provider,
				browser?.name,
				file,
				location?.line,
				fullName
			]);
			if (testKeys.has(testKey)) fail(`duplicate Vitest test record ${testKey}.`);
			testKeys.add(testKey);
			summary[status] += 1;
			return { ...test, fullName, location, status };
		});
		return { ...module, project, pool, file: `ui/zui/${file}`, kind, browser, tests };
	});
	if (JSON.stringify(report.summary) !== JSON.stringify(summary))
		fail('Vitest summary is inconsistent.');
	const complete =
		report.unhandledErrors.length === 0 &&
		observedSpecificationKeys.size === specificationKeys.size &&
		run.endReason !== 'interrupted' &&
		run.endReason !== 'timeout';
	return {
		runner: { name: runner.name, version: runner.version },
		complete,
		clean:
			complete &&
			run.endReason === 'passed' &&
			modules.every(
				(module) =>
					module.status === 'passed' &&
					module.errors.length === 0 &&
					module.tests.every((test) => observedStatus(test) === 'verified')
			),
		modules,
		missingSpecificationCount: specificationKeys.size - observedSpecificationKeys.size
	};
}

function playwrightTests(report) {
	const tests = [];
	function visit(suite) {
		object(suite, 'Playwright suite');
		for (const child of array(suite.suites ?? [], 'Playwright child suites')) visit(child);
		for (const spec of array(suite.specs ?? [], 'Playwright specs')) {
			object(spec, 'Playwright spec');
			for (const test of array(spec.tests, 'Playwright spec tests')) tests.push({ spec, test });
		}
	}
	for (const suite of array(report.suites, 'Playwright suites')) visit(suite);
	return tests;
}

function validatePlaywrightReport(report, identity, expectedBrowser) {
	object(report, `Playwright ${expectedBrowser} report`);
	const config = object(report.config, `Playwright ${expectedBrowser} config`);
	string(config.version, `Playwright ${expectedBrowser} runner version`);
	const metadata = object(
		object(config.metadata, `Playwright ${expectedBrowser} metadata`).zuiExecution,
		`Playwright ${expectedBrowser} zuiExecution metadata`
	);
	assertIdentity(metadata.revision, identity.revision, `Playwright ${expectedBrowser} revision`);
	assertIdentity(metadata.runId, identity.runId, `Playwright ${expectedBrowser} run id`);
	assertIdentity(
		metadata.runAttempt,
		identity.runAttempt,
		`Playwright ${expectedBrowser} run attempt`
	);
	assertIdentity(metadata.browser, expectedBrowser, `Playwright ${expectedBrowser} browser`);
	const projects = array(config.projects, `Playwright ${expectedBrowser} projects`);
	if (!projects.some((project) => project?.name === expectedBrowser))
		fail(`Playwright ${expectedBrowser} config does not contain its project.`);
	const tests = playwrightTests(report);
	const results = [];
	for (const { spec, test } of tests) {
		object(test, `Playwright ${expectedBrowser} test`);
		assertIdentity(test.projectName, expectedBrowser, `Playwright test projectName`);
		const attempts = array(test.results, `Playwright ${expectedBrowser} test results`);
		for (const attempt of attempts) {
			object(attempt, 'Playwright test result');
			integer(attempt.retry, 'Playwright retry count');
			string(attempt.status, 'Playwright result status');
		}
		results.push({
			clean:
				spec.ok === true &&
				test.expectedStatus === 'passed' &&
				attempts.length === 1 &&
				attempts[0].retry === 0 &&
				attempts[0].status === 'passed'
		});
	}
	array(report.errors, `Playwright ${expectedBrowser} errors`);
	const stats = object(report.stats, `Playwright ${expectedBrowser} stats`);
	for (const key of ['expected', 'unexpected', 'flaky', 'skipped'])
		integer(stats[key], `Playwright ${expectedBrowser} stats.${key}`);
	return {
		browser: expectedBrowser,
		runner: { name: 'playwright', version: config.version },
		testCount: tests.length,
		clean:
			tests.length > 0 &&
			results.every((result) => result.clean) &&
			report.errors.length === 0 &&
			stats.expected === tests.length &&
			stats.unexpected === 0 &&
			stats.flaky === 0 &&
			stats.skipped === 0
	};
}

function validateGates(gates) {
	object(gates, 'CI needs JSON');
	for (const [name, gate] of Object.entries(gates)) {
		object(gate, `CI gate ${name}`);
		if (!['success', 'failure', 'cancelled', 'skipped'].includes(gate.result))
			fail(`CI gate ${name} has invalid result.`);
		object(gate.outputs, `CI gate ${name} outputs`);
	}
	return gates;
}

function observedStatus(test) {
	if (!test) return 'missing';
	if (test.status === 'failed') return 'failed';
	if (test.expectedFailure) return 'blocked';
	if (test.flaky || test.retryCount > 0) return 'flaky';
	if (test.status === 'todo' || test.status === 'skipped') return 'skipped';
	if (test.status === 'pending' || test.status === 'cancelled') return 'cancelled';
	return test.status === 'passed' ? 'verified' : 'failed';
}

function combinedStatus(values, sharedFile = false) {
	if (values.length > 0 && values.every((value) => value === 'verified')) return 'verified';
	for (const status of ['failed', 'flaky', 'skipped', 'cancelled', 'missing', 'blocked'])
		if (values.includes(status)) return sharedFile && status === 'failed' ? 'blocked' : status;
	return 'missing';
}

function moduleIsClean(module) {
	return (
		module.status === 'passed' &&
		module.errors.length === 0 &&
		module.tests.length > 0 &&
		module.tests.every((test) => observedStatus(test) === 'verified')
	);
}

function environmentModules(contract, vitest) {
	const browserContract =
		contract.kind === 'browser' ||
		contract.kind === 'visual' ||
		(contract.kind === 'production' && contract.file.endsWith('.browser.spec.ts'));
	if (!vitest)
		return {
			browserContract,
			expected: browserContract ? requiredBrowsers : ['unit'],
			modules: []
		};
	const candidates = vitest.modules.filter(
		(module) =>
			module.file === contract.file && module.kind === (browserContract ? 'browser' : 'unit')
	);
	return {
		browserContract,
		expected: browserContract ? requiredBrowsers : ['unit'],
		modules: candidates
	};
}

function evaluateContract(contract, vitest, reportPath) {
	const { browserContract, expected, modules } = environmentModules(contract, vitest);
	const observations = [];
	for (const environment of expected) {
		const matches = modules.filter((module) =>
			browserContract ? module.browser?.name === environment : true
		);
		if (matches.length > 1)
			fail(
				`contract ${contract.file}:${contract.line ?? '?'} has duplicate ${environment} modules.`
			);
		const module = matches[0];
		if (!module) {
			observations.push({ environment, status: 'missing', evidence: null });
			continue;
		}
		if (contract.scope === 'shared-file') {
			observations.push({
				environment,
				status: moduleIsClean(module) ? 'verified' : 'blocked',
				evidence: moduleIsClean(module)
					? {
							browser: module.browser,
							file: module.file,
							project: module.project,
							report: reportPath
						}
					: null
			});
			continue;
		}
		const tests = module.tests.filter(
			(test) =>
				(contract.line === null || test.location?.line === contract.line) &&
				(contract.title === null || test.fullName === contract.title)
		);
		if (tests.length > 1 && contract.title !== null)
			fail(`contract ${contract.file}:${contract.line ?? '?'} is ambiguous in ${environment}.`);
		const status = combinedStatus(tests.length === 0 ? ['missing'] : tests.map(observedStatus));
		observations.push({
			environment,
			status,
			evidence:
				tests.length === 0
					? null
					: tests.map((test) => ({
							attempt: test.attempt,
							browser: module.browser,
							file: module.file,
							fullName: test.fullName,
							location: test.location,
							project: module.project,
							report: reportPath
						}))
		});
	}
	const status = combinedStatus(
		observations.map((item) => item.status),
		contract.scope === 'shared-file'
	);
	return { ...contract, status, observations };
}

function stageResult(contracts, gatesPassed, staticStagePassed) {
	if (contracts.length === 0) return { status: 'pending', verified: false };
	if (!gatesPassed || !staticStagePassed) return { status: 'blocked', verified: false };
	if (contracts.every((contract) => contract.status === 'verified'))
		return { status: 'verified', verified: true };
	return { status: combinedStatus(contracts.map((contract) => contract.status)), verified: false };
}

function validateInventoryContract(contract, componentId) {
	object(contract, `inventory ${componentId} contract`);
	if (!['browser', 'visual', 'production', 'ssr'].includes(contract.kind))
		fail(`inventory ${componentId} contract kind is invalid.`);
	assertRelativePath(contract.file, `inventory ${componentId} contract file`, 'ui/zui/tests/');
	if (contract.scope !== 'test-block' && contract.scope !== 'shared-file')
		fail(`inventory ${componentId} contract scope is invalid.`);
	if (contract.kind === 'visual' && contract.scope === 'shared-file')
		fail(`inventory ${componentId} visual contract cannot use shared-file scope.`);
	if (contract.scope === 'shared-file') {
		if (contract.line !== null || contract.title !== null)
			fail(`inventory ${componentId} shared-file contract cannot claim a test location.`);
	} else {
		if (contract.line !== null) integer(contract.line, `inventory ${componentId} contract line`, 1);
		if (contract.title !== null) string(contract.title, `inventory ${componentId} contract title`);
		if (contract.line === null && contract.title === null)
			fail(`inventory ${componentId} test-block contract needs a line or title.`);
	}
	return contract;
}

function evidenceRecords(stage, result, executionPath, contracts, detailSuffix = '') {
	if (!result.verified) return [];
	return [
		{
			path: executionPath,
			detail: `${stage}: ${contracts.length} mapped contract${contracts.length === 1 ? '' : 's'} passed without retries or skips${detailSuffix}`
		}
	];
}

function validateInputDescriptors(reportInputs, gatesInput) {
	const paths = new Set();
	const reports = array(reportInputs, 'report inputs').map((input, index) => {
		object(input, `report inputs[${index}]`);
		const path = assertRelativePath(input.path, `report inputs[${index}].path`, 'test-results/');
		if (paths.has(path)) fail(`duplicate report input path ${path}.`);
		paths.add(path);
		if (!/^[0-9a-f]{64}$/u.test(input.sha256)) fail(`report input ${path} has an invalid SHA-256.`);
		return { path, sha256: input.sha256 };
	});
	object(gatesInput, 'gates input');
	const gatesPath = assertRelativePath(gatesInput.path, 'gates input path', 'test-results/');
	if (!/^[0-9a-f]{64}$/u.test(gatesInput.sha256)) fail('gates input has an invalid SHA-256.');
	return { reports, gates: { path: gatesPath, sha256: gatesInput.sha256 } };
}

export function composeComponentExecution({
	baseMaturity,
	inventory,
	identity,
	vitestReport,
	vitestPath,
	docsReports,
	reportInputs,
	gates,
	gatesInput,
	executionPath = 'test-results/component-execution/component-execution.json'
}) {
	validateIdentity(identity);
	if (baseMaturity?.schemaVersion !== 3 || !Array.isArray(baseMaturity.components))
		fail('base maturity must use schemaVersion 3 with components.');
	if (
		baseMaturity.components.length === 0 ||
		baseMaturity.source?.metadataComponents !== baseMaturity.components.length
	)
		fail('base maturity component count is invalid.');
	if (inventory?.schemaVersion !== 1 || !Array.isArray(inventory.components))
		fail('component test inventory must use schemaVersion 1 with components.');
	if (inventory.components.length !== baseMaturity.components.length)
		fail('component test inventory does not cover the full base maturity matrix.');
	const validGates = validateGates(gates);
	const descriptors = validateInputDescriptors(reportInputs, gatesInput);
	const normalizedVitest = vitestReport ? validateVitestReport(vitestReport, identity) : null;
	const normalizedDocs = new Map();
	for (const browser of requiredBrowsers) {
		const entry = docsReports.get(browser);
		if (entry)
			normalizedDocs.set(browser, validatePlaywrightReport(entry.report, identity, browser));
	}
	const workspaceGatePassed = validGates['workspace-tests']?.result === 'success';
	const docsGatePassed = validGates['docs-e2e']?.result === 'success';
	if (workspaceGatePassed && normalizedVitest === null)
		fail('workspace-tests succeeded but its Vitest execution report is missing.');
	if (docsGatePassed) {
		const missingDocs = requiredBrowsers.filter((browser) => !normalizedDocs.has(browser));
		if (missingDocs.length > 0)
			fail(`docs-e2e succeeded but execution reports are missing for ${missingDocs.join(', ')}.`);
	}
	const docsClean =
		docsGatePassed &&
		requiredBrowsers.every((browser) => normalizedDocs.get(browser)?.clean === true);
	const components = inventory.components.map((item, index) => {
		const base = baseMaturity.components[index];
		if (item.id !== base?.id || item.name !== base?.name)
			fail(`inventory/base component identity differs at index ${index}.`);
		const contracts = array(item.contracts, `inventory ${item.id} contracts`).map((contract) =>
			evaluateContract(validateInventoryContract(contract, item.id), normalizedVitest, vitestPath)
		);
		const browserContracts = contracts.filter((contract) => contract.kind === 'browser');
		const visualContracts = contracts.filter((contract) => contract.kind === 'visual');
		const productionContracts = contracts.filter(
			(contract) => contract.kind === 'production' || contract.kind === 'ssr'
		);
		const baseCoreStagesPassed = [
			'MetadataDeclared',
			'PublicExportPresent',
			'ApiContractDeclared',
			'RuntimeImplemented'
		].every((stage) => base.stages?.[stage] === true);
		const browser = stageResult(
			browserContracts,
			workspaceGatePassed && normalizedVitest?.complete === true,
			baseCoreStagesPassed && base.stages?.BrowserBehaviorContractsDeclared === true
		);
		const visual = stageResult(
			visualContracts,
			workspaceGatePassed && normalizedVitest?.complete === true,
			baseCoreStagesPassed && base.stages?.VisualContractsDeclared === true
		);
		const productionGatesPassed =
			workspaceGatePassed &&
			normalizedVitest?.complete === true &&
			docsClean &&
			['static', 'build', 'coverage', 'packages'].every(
				(gate) => validGates[gate]?.result === 'success'
			);
		const production = stageResult(
			productionContracts,
			productionGatesPassed,
			baseCoreStagesPassed &&
				base.stages?.ProductionContractsDeclared === true &&
				base.stages?.SsrContractsDeclared === true
		);
		return {
			id: item.id,
			name: item.name,
			executionStages: {
				BrowserBehaviorVerified: browser.verified,
				VisuallyVerified: visual.verified,
				ProductionVerified: production.verified
			},
			executionResults: {
				BrowserBehaviorVerified: { status: browser.status, contracts: browserContracts },
				VisuallyVerified: { status: visual.status, contracts: visualContracts },
				ProductionVerified: { status: production.status, contracts: productionContracts }
			}
		};
	});
	const stageNames = ['BrowserBehaviorVerified', 'VisuallyVerified', 'ProductionVerified'];
	const summary = Object.fromEntries(
		stageNames.map((stage) => [
			stage,
			components.filter((component) => component.executionStages[stage]).length
		])
	);
	const input = {
		baseMaturityHash: sha256(stableJson(baseMaturity)),
		gates: { ...descriptors.gates, value: validGates },
		inventoryHash: sha256(stableJson(inventory)),
		reports: descriptors.reports.sort((left, right) =>
			left.path < right.path ? -1 : left.path > right.path ? 1 : 0
		)
	};
	const inputHash = sha256(stableJson({ identity, input }));
	const output = {
		schemaVersion: 1,
		status: components.every(
			(component) =>
				component.executionStages.BrowserBehaviorVerified &&
				component.executionStages.ProductionVerified &&
				(component.executionResults.VisuallyVerified.contracts.length === 0 ||
					component.executionStages.VisuallyVerified)
		)
			? 'passed'
			: 'partial',
		revision: identity.revision,
		run: { id: identity.runId, attempt: identity.runAttempt },
		integrity: { algorithm: 'sha256', inputHash },
		input,
		globalGates: {
			workspaceTests: {
				result: validGates['workspace-tests']?.result ?? 'missing',
				vitestComplete: normalizedVitest?.complete === true,
				vitestClean: normalizedVitest?.clean === true
			},
			productionPrerequisites: Object.fromEntries(
				['static', 'build', 'coverage', 'packages'].map((gate) => [
					gate,
					validGates[gate]?.result ?? 'missing'
				])
			),
			docsProduction: {
				result: validGates['docs-e2e']?.result ?? 'missing',
				clean: docsClean,
				environments: requiredBrowsers.map((browser) => ({
					browser,
					clean: normalizedDocs.get(browser)?.clean === true,
					testCount: normalizedDocs.get(browser)?.testCount ?? 0
				}))
			}
		},
		runners: [
			...(normalizedVitest ? [normalizedVitest.runner] : []),
			...requiredBrowsers.flatMap((browser) => {
				const report = normalizedDocs.get(browser);
				return report ? [{ ...report.runner, browser }] : [];
			})
		],
		summary,
		components
	};
	return output;
}

export function buildRuntimeMaturity({ baseMaturity, execution, executionPath }) {
	const results = new Map(execution.components.map((component) => [component.id, component]));
	const components = baseMaturity.components.map((base) => {
		const result = results.get(base.id);
		if (!result || result.name !== base.name) fail(`missing execution result for ${base.id}.`);
		const executionStages = { ...base.executionStages, ...result.executionStages };
		const executionEvidence = { ...base.executionEvidence };
		for (const stage of ['BrowserBehaviorVerified', 'VisuallyVerified', 'ProductionVerified']) {
			const contracts = result.executionResults[stage].contracts;
			executionEvidence[stage] = evidenceRecords(
				stage,
				{ verified: result.executionStages[stage] },
				executionPath,
				contracts,
				stage === 'ProductionVerified'
					? '; includes clean Chromium, Firefox, and WebKit Docs runs'
					: ''
			);
		}
		return {
			...base,
			executionStages,
			executionEvidence,
			executionResults: result.executionResults
		};
	});
	const executionSummary = { ...baseMaturity.executionSummary };
	for (const stage of ['BrowserBehaviorVerified', 'VisuallyVerified', 'ProductionVerified'])
		executionSummary[stage] = components.filter(
			(component) => component.executionStages[stage]
		).length;
	return {
		...baseMaturity,
		execution: {
			status: execution.status,
			revision: execution.revision,
			runId: execution.run.id,
			runAttempt: execution.run.attempt,
			source: executionPath,
			detail:
				execution.status === 'passed'
					? 'All mapped current-revision component execution contracts passed cleanly.'
					: 'Current-revision execution evidence is partial; pending and blocked results remain explicit.'
		},
		executionSummary,
		components
	};
}

function selfTestSummary(report) {
	const summary = Object.fromEntries(statuses.map((status) => [status, 0]));
	for (const module of report.modules) for (const test of module.tests) summary[test.status] += 1;
	report.summary = summary;
}

function selfTestPlaywrightReport(identity, browser) {
	return {
		config: {
			metadata: { zuiExecution: { ...identity, browser } },
			projects: [{ name: browser }],
			version: 'self-test'
		},
		errors: [],
		stats: { expected: 1, flaky: 0, skipped: 0, unexpected: 0 },
		suites: [
			{
				specs: [
					{
						ok: true,
						tests: [
							{
								expectedStatus: 'passed',
								projectName: browser,
								results: [{ retry: 0, status: 'passed' }]
							}
						]
					}
				],
				suites: []
			}
		]
	};
}

export function createComponentExecutionSelfTestFixture() {
	const identity = { revision: 'a'.repeat(40), runAttempt: 2, runId: '17' };
	const browserFile = 'tests/self-test.browser.spec.ts';
	const ssrFile = 'tests/self-test.spec.ts';
	const specifications = [
		...requiredBrowsers.map((browser) => ({
			project: `browser (${browser})`,
			pool: 'browser',
			file: browserFile
		})),
		{ project: 'unit', pool: 'forks', file: ssrFile }
	].sort((left, right) => {
		const leftKey = `${left.project}\0${left.pool}\0${left.file}`;
		const rightKey = `${right.project}\0${right.pool}\0${right.file}`;
		return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
	});
	const test = (id, fullName, line) => ({
		attempt: 1,
		durationMs: 1,
		errors: [],
		expectedFailure: false,
		flaky: false,
		fullName,
		id,
		location: { column: 1, line },
		repeatCount: 0,
		retryCount: 0,
		status: 'passed'
	});
	const modules = requiredBrowsers.map((browser) => ({
		browser: { name: browser, provider: 'playwright' },
		durationMs: 1,
		errors: [],
		file: browserFile,
		kind: 'browser',
		pool: 'browser',
		project: `browser (${browser})`,
		status: 'passed',
		tests: [test(`browser-${browser}`, 'self test > browser contract', 10)]
	}));
	modules.push({
		browser: null,
		durationMs: 1,
		errors: [],
		file: ssrFile,
		kind: 'unit',
		pool: 'forks',
		project: 'unit',
		status: 'passed',
		tests: [test('ssr', 'self test > SSR contract', 20)]
	});
	const vitestReport = {
		modules,
		run: {
			attempt: identity.runAttempt,
			endedAt: '2026-09-07T00:00:01.000Z',
			endReason: 'passed',
			id: identity.runId,
			inputHash: sha256(JSON.stringify(specifications)),
			revision: identity.revision,
			runner: { name: 'vitest', version: 'self-test' },
			specificationCount: specifications.length,
			startedAt: '2026-09-07T00:00:00.000Z'
		},
		schemaVersion: 1,
		specifications,
		summary: {},
		unhandledErrors: []
	};
	selfTestSummary(vitestReport);
	const contracts = [
		{
			file: `ui/zui/${browserFile}`,
			kind: 'browser',
			line: 10,
			scope: 'test-block',
			title: 'self test > browser contract'
		},
		{
			file: `ui/zui/${browserFile}`,
			kind: 'production',
			line: 10,
			scope: 'test-block',
			title: 'self test > browser contract'
		},
		{
			file: `ui/zui/${ssrFile}`,
			kind: 'ssr',
			line: 20,
			scope: 'test-block',
			title: 'self test > SSR contract'
		}
	];
	const stages = {
		ApiContractDeclared: true,
		BrowserBehaviorContractsDeclared: true,
		MetadataDeclared: true,
		ProductionContractsDeclared: true,
		PublicExportPresent: true,
		RuntimeImplemented: true,
		SsrContractsDeclared: true,
		VisualContractsDeclared: false
	};
	const baseMaturity = {
		components: [
			{
				category: 'self-test',
				executionEvidence: {
					BrowserBehaviorVerified: [],
					DesktopVerified: [],
					ProductionVerified: [],
					VisuallyVerified: []
				},
				executionStages: {
					BrowserBehaviorVerified: false,
					DesktopVerified: false,
					ProductionVerified: false,
					VisuallyVerified: false
				},
				id: 'self-test',
				name: 'ZSelfTest',
				source: 'ui/zui/src/components/ZSelfTest.svelte',
				stages
			}
		],
		execution: { detail: 'pending', revision: null, source: null, status: 'pending' },
		executionSummary: {
			BrowserBehaviorVerified: 0,
			DesktopVerified: 0,
			ProductionVerified: 0,
			VisuallyVerified: 0
		},
		schemaVersion: 3,
		source: { metadataComponents: 1 },
		summary: {}
	};
	const gates = Object.fromEntries(
		['build', 'coverage', 'docs-e2e', 'packages', 'static', 'workspace-tests'].map((name) => [
			name,
			{ outputs: {}, result: 'success' }
		])
	);
	const reportInputs = ['vitest', ...requiredBrowsers].map((name) => ({
		path: `test-results/component-execution/inputs/${name}.json`,
		sha256: 'b'.repeat(64)
	}));
	return {
		baseMaturity,
		docsReports: new Map(
			requiredBrowsers.map((browser) => [
				browser,
				{ report: selfTestPlaywrightReport(identity, browser) }
			])
		),
		gates,
		gatesInput: {
			path: 'test-results/component-execution/needs.json',
			sha256: 'c'.repeat(64)
		},
		identity,
		inventory: {
			components: [{ contracts, id: 'self-test', name: 'ZSelfTest' }],
			schemaVersion: 1
		},
		reportInputs,
		vitestPath: 'test-results/component-execution/inputs/vitest.json',
		vitestReport
	};
}

function expectSelfTestFailure(action, pattern, label) {
	try {
		action();
	} catch (error) {
		if (pattern.test(String(error))) return;
		throw error;
	}
	throw new Error(`Component execution self-test accepted ${label}.`);
}

function selfTestComponentResult(mutate) {
	const fixture = createComponentExecutionSelfTestFixture();
	mutate(fixture);
	selfTestSummary(fixture.vitestReport);
	return composeComponentExecution(fixture).components[0];
}

export function runComponentExecutionSelfTest() {
	const cleanFixture = createComponentExecutionSelfTestFixture();
	const clean = composeComponentExecution(cleanFixture);
	if (
		clean.status !== 'passed' ||
		clean.components[0]?.executionStages.BrowserBehaviorVerified !== true ||
		clean.components[0]?.executionStages.ProductionVerified !== true
	)
		throw new Error('Component execution clean self-test fixture did not become Verified.');
	let negativeCases = 0;
	const reject = (mutate, pattern, label) => {
		const fixture = createComponentExecutionSelfTestFixture();
		mutate(fixture);
		expectSelfTestFailure(() => composeComponentExecution(fixture), pattern, label);
		negativeCases += 1;
	};
	const block = (mutate, stage, status) => {
		const result = selfTestComponentResult(mutate);
		if (result.executionStages[stage] || result.executionResults[stage].status !== status)
			throw new Error(`Component execution self-test did not preserve ${status} for ${stage}.`);
		negativeCases += 1;
	};
	reject(
		(fixture) => (fixture.vitestReport.run.revision = 'd'.repeat(40)),
		/revision/u,
		'bad revision'
	);
	reject(
		(fixture) => (fixture.vitestReport.run.inputHash = '0'.repeat(64)),
		/input hash/u,
		'bad input hash'
	);
	reject(
		(fixture) =>
			fixture.vitestReport.modules[0].tests.push(fixture.vitestReport.modules[0].tests[0]),
		/duplicate Vitest test/u,
		'duplicate test'
	);
	block(
		(fixture) => (fixture.vitestReport.modules[0].tests[0].status = 'skipped'),
		'BrowserBehaviorVerified',
		'skipped'
	);
	block(
		(fixture) => {
			fixture.vitestReport.modules[0].tests[0].status = 'failed';
			fixture.vitestReport.modules[0].status = 'failed';
			fixture.vitestReport.run.endReason = 'failed';
		},
		'BrowserBehaviorVerified',
		'failed'
	);
	block(
		(fixture) => {
			const test = fixture.vitestReport.modules[0].tests[0];
			test.attempt = 2;
			test.flaky = true;
			test.retryCount = 1;
		},
		'BrowserBehaviorVerified',
		'flaky'
	);
	block(
		(fixture) => fixture.vitestReport.modules.splice(2, 1),
		'BrowserBehaviorVerified',
		'blocked'
	);
	block(
		(fixture) => (fixture.vitestReport.modules[0].tests[0].expectedFailure = true),
		'BrowserBehaviorVerified',
		'blocked'
	);
	block(
		(fixture) => (fixture.baseMaturity.components[0].stages.RuntimeImplemented = false),
		'BrowserBehaviorVerified',
		'blocked'
	);
	block((fixture) => (fixture.gates.packages.result = 'failure'), 'ProductionVerified', 'blocked');
	reject(
		(fixture) => (fixture.vitestReport = null),
		/Vitest execution report is missing/u,
		'successful workspace producer without report'
	);
	reject(
		(fixture) => fixture.docsReports.delete('webkit'),
		/reports are missing for webkit/u,
		'successful Docs producer without report'
	);
	return {
		negativeCases,
		status: 'passed',
		verified: clean.components[0].executionStages
	};
}

async function recognizedReports(paths) {
	const files = [];
	async function visit(path) {
		const information = await lstat(path);
		if (information.isSymbolicLink()) fail(`--reports cannot contain symbolic links: ${path}.`);
		if (information.isDirectory()) {
			for (const entry of await readdir(path, { withFileTypes: true }))
				await visit(resolve(path, entry.name));
		} else if (information.isFile()) {
			const name = path.split(/[\\/]/u).at(-1);
			if (
				name === 'component-execution-vitest.json' ||
				/^component-execution-docs-(?:chromium|firefox|webkit)\.json$/u.test(name)
			)
				files.push(path);
		}
	}
	for (const value of paths) await visit(artifactPath(value, '--reports'));
	return [...new Set(files)].sort();
}

async function loadInputs(options) {
	validateIdentity(options);
	if (options.reports.length === 0 || !options.gates) fail('--reports and --gates are required.');
	const reportFiles = await recognizedReports(options.reports);
	const parsed = await Promise.all(
		reportFiles.map(async (path) => {
			const source = await readFile(path, 'utf8');
			return {
				path,
				relativePath: portable(relative(workspaceRoot, path)),
				sha256: sha256(source),
				report: JSON.parse(source)
			};
		})
	);
	const vitestEntries = parsed.filter(({ path }) =>
		path.endsWith('component-execution-vitest.json')
	);
	if (vitestEntries.length > 1) fail('multiple Vitest execution reports were supplied.');
	const docsReports = new Map();
	for (const entry of parsed.filter(({ path }) => path.includes('component-execution-docs-'))) {
		const browser = /component-execution-docs-(chromium|firefox|webkit)\.json$/u.exec(
			entry.path
		)?.[1];
		if (!browser) fail(`unrecognized Docs execution report ${entry.path}.`);
		if (docsReports.has(browser)) fail(`multiple Docs ${browser} reports were supplied.`);
		docsReports.set(browser, entry);
	}
	const gatesPath = artifactPath(options.gates, '--gates');
	if ((await lstat(gatesPath)).isSymbolicLink()) fail('--gates cannot be a symbolic link.');
	const gatesSource = await readFile(gatesPath, 'utf8');
	return {
		vitestEntry: vitestEntries[0],
		docsReports,
		reportInputs: parsed.map(({ relativePath: path, sha256: hash }) => ({ path, sha256: hash })),
		gates: JSON.parse(gatesSource),
		gatesInput: { path: portable(relative(workspaceRoot, gatesPath)), sha256: sha256(gatesSource) }
	};
}

export async function composeFromPaths(options) {
	const [baseMaturity, inputs] = await Promise.all([
		readFile(defaultMaturityPath, 'utf8').then(JSON.parse),
		loadInputs(options)
	]);
	const inventory = await createComponentTestInventory({ workspaceRoot, baseMaturity });
	const identity = {
		revision: options.revision,
		runId: options.runId,
		runAttempt: options.runAttempt
	};
	const execution = composeComponentExecution({
		baseMaturity,
		inventory,
		identity,
		vitestReport: inputs.vitestEntry?.report,
		vitestPath: inputs.vitestEntry?.relativePath ?? null,
		docsReports: new Map(
			[...inputs.docsReports].map(([browser, entry]) => [browser, { report: entry.report }])
		),
		reportInputs: inputs.reportInputs,
		gates: inputs.gates,
		gatesInput: inputs.gatesInput
	});
	const requestedOutput = options.out ?? options.report;
	if (!requestedOutput) fail('composition needs --out or --report to identify its evidence path.');
	const executionPath = portable(
		relative(
			workspaceRoot,
			artifactPath(requestedOutput, 'component execution output', { mustExist: false })
		)
	);
	const runtimeMaturity = buildRuntimeMaturity({
		baseMaturity,
		execution,
		executionPath
	});
	return { execution, runtimeMaturity };
}

async function writeAtomic(path, value) {
	await mkdir(dirname(path), { recursive: true });
	const temporary = `${path}.${process.pid}.tmp`;
	try {
		await writeFile(temporary, stableJson(value), 'utf8');
		await rename(temporary, path);
	} finally {
		await rm(temporary, { force: true });
	}
}

async function main(argv = process.argv.slice(2)) {
	if (argv.length === 1 && argv[0] === '--self-test') {
		console.log(JSON.stringify(runComponentExecutionSelfTest()));
		return;
	}
	const options = parseArguments(argv);
	if (!options.out) fail('--out is required.');
	const outputPath = artifactPath(options.out, '--out', { mustExist: false });
	if (outputPath.split(/[\\/]/u).at(-1) !== 'component-execution.json')
		fail('--out must end with component-execution.json.');
	const { execution, runtimeMaturity } = await composeFromPaths(options);
	const runtimePath = resolve(dirname(outputPath), 'component-maturity.runtime.json');
	await Promise.all([
		writeAtomic(outputPath, execution),
		writeAtomic(runtimePath, runtimeMaturity)
	]);
	console.log(
		JSON.stringify({
			status: execution.status,
			execution: portable(relative(workspaceRoot, outputPath)),
			maturity: portable(relative(workspaceRoot, runtimePath)),
			summary: execution.summary
		})
	);
}

export { artifactPath, parseArguments, stableJson, validateIdentity };

if (isMain) await main();
