import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
	Reporter,
	SerializedError,
	TestCase,
	TestModule,
	TestRunEndReason
} from 'vitest/node';

export type ExecutionStatus = 'passed' | 'failed' | 'skipped' | 'todo' | 'pending' | 'cancelled';

export interface ExecutionBrowserIdentity {
	readonly name: string;
	readonly provider: string;
}

export interface ExecutionError {
	readonly name?: string;
	readonly message: string;
	readonly stack?: string;
}

export interface ExecutionTestInput {
	readonly id: string;
	readonly fullName: string;
	readonly line?: number;
	readonly column?: number;
	readonly status: Exclude<ExecutionStatus, 'cancelled'>;
	readonly retryCount: number;
	readonly repeatCount: number;
	readonly expectedFailure?: boolean;
	readonly durationMs?: number;
	readonly skipNote?: string;
	readonly errors: readonly ExecutionError[];
}

export interface ExecutionModuleInput {
	readonly project: string;
	readonly kind: 'unit' | 'browser';
	readonly browser: ExecutionBrowserIdentity | null;
	readonly pool: string;
	readonly absoluteFilePath: string;
	readonly status: 'passed' | 'failed' | 'skipped' | 'pending' | 'queued';
	readonly durationMs: number;
	readonly errors: readonly ExecutionError[];
	readonly tests: readonly ExecutionTestInput[];
}

export interface ExecutionSpecificationInput {
	readonly project: string;
	readonly pool: string;
	readonly absoluteFilePath: string;
}

export interface ExecutionReportInput {
	readonly packageRoot: string;
	readonly revision: string;
	readonly runId: string;
	readonly runAttempt: number;
	readonly runnerName: string;
	readonly runnerVersion: string;
	readonly startedAt: string;
	readonly endedAt: string;
	readonly endReason: TestRunEndReason | 'timeout';
	readonly specifications: readonly ExecutionSpecificationInput[];
	readonly modules: readonly ExecutionModuleInput[];
	readonly unhandledErrors: readonly ExecutionError[];
}

export interface ComponentExecutionReport {
	readonly schemaVersion: 1;
	readonly run: {
		readonly revision: string;
		readonly id: string;
		readonly attempt: number;
		readonly runner: { readonly name: string; readonly version: string };
		readonly startedAt: string;
		readonly endedAt: string;
		readonly endReason: TestRunEndReason | 'timeout';
		readonly specificationCount: number;
		readonly inputHash: string;
	};
	readonly summary: Readonly<Record<ExecutionStatus, number>>;
	readonly modules: readonly {
		readonly project: string;
		readonly kind: 'unit' | 'browser';
		readonly browser: ExecutionBrowserIdentity | null;
		readonly pool: string;
		readonly file: string;
		readonly status: ExecutionStatus;
		readonly durationMs: number;
		readonly errors: readonly ExecutionError[];
		readonly tests: readonly {
			readonly id: string;
			readonly fullName: string;
			readonly location: { readonly line: number; readonly column: number } | null;
			readonly status: ExecutionStatus;
			readonly attempt: number;
			readonly retryCount: number;
			readonly repeatCount: number;
			readonly expectedFailure: boolean;
			readonly flaky: boolean;
			readonly durationMs: number | null;
			readonly skipNote?: string;
			readonly errors: readonly ExecutionError[];
		}[];
	}[];
	readonly specifications: readonly {
		readonly project: string;
		readonly pool: string;
		readonly file: string;
	}[];
	readonly unhandledErrors: readonly ExecutionError[];
}

export interface ComponentExecutionReporterOptions {
	readonly packageRoot: string;
	readonly outputFile: string;
	readonly revision: string;
	readonly runId: string;
	readonly runAttempt: number;
}

const SHA_PATTERN = /^[0-9a-f]{40}$/i;

function assertNonEmpty(value: string, label: string): void {
	if (value.trim().length === 0) throw new TypeError(`${label} must not be empty.`);
}

function assertNonNegativeInteger(value: number, label: string): void {
	if (!Number.isInteger(value) || value < 0)
		throw new TypeError(`${label} must be a non-negative integer.`);
}

function assertNonNegativeNumber(value: number, label: string): void {
	if (!Number.isFinite(value) || value < 0)
		throw new TypeError(`${label} must be a finite non-negative number.`);
}

function assertPositiveInteger(value: number, label: string): void {
	if (!Number.isInteger(value) || value < 1)
		throw new TypeError(`${label} must be a positive integer.`);
}

function isInside(parent: string, candidate: string): boolean {
	const difference = relative(resolve(parent), resolve(candidate));
	return (
		difference === '' ||
		(!difference.startsWith(`..${sep}`) && difference !== '..' && !isAbsolute(difference))
	);
}

function portablePath(packageRoot: string, absoluteFilePath: string): string {
	const normalizedRoot = resolve(packageRoot);
	const normalizedFile = resolve(absoluteFilePath);
	if (!isInside(normalizedRoot, normalizedFile) || normalizedFile === normalizedRoot)
		throw new TypeError(`Test module path is outside the package root: ${absoluteFilePath}`);
	return relative(normalizedRoot, normalizedFile).split(sep).join('/');
}

function validateBrowserIdentity(module: ExecutionModuleInput): void {
	if (module.kind === 'unit') {
		if (module.browser !== null)
			throw new TypeError(
				`Unit module ${module.absoluteFilePath} cannot declare a browser identity.`
			);
		return;
	}
	if (module.browser === null)
		throw new TypeError(
			`Browser module ${module.absoluteFilePath} is missing its runtime browser identity.`
		);
	assertNonEmpty(module.browser.name, 'Browser name');
	assertNonEmpty(module.browser.provider, 'Browser provider');
	if (module.pool !== 'browser')
		throw new TypeError(`Browser module ${module.absoluteFilePath} must use the browser pool.`);
}

function interruptedStatus(
	status: ExecutionModuleInput['status'] | ExecutionTestInput['status'],
	endReason: ExecutionReportInput['endReason']
): ExecutionStatus {
	if (endReason === 'interrupted' || endReason === 'timeout') {
		if (status === 'pending' || status === 'queued') return 'cancelled';
	}
	return status === 'queued' ? 'pending' : status;
}

export function serializeComponentExecutionReport(
	input: ExecutionReportInput
): ComponentExecutionReport {
	if (!SHA_PATTERN.test(input.revision))
		throw new TypeError('GITHUB_SHA must be a complete 40-character hexadecimal revision.');
	if (!/^\d+$/.test(input.runId) || input.runId === '0')
		throw new TypeError('GITHUB_RUN_ID must be a positive integer string.');
	assertPositiveInteger(input.runAttempt, 'GITHUB_RUN_ATTEMPT');
	assertNonEmpty(input.runnerName, 'Runner name');
	assertNonEmpty(input.runnerVersion, 'Runner version');
	if (Number.isNaN(Date.parse(input.startedAt)) || Number.isNaN(Date.parse(input.endedAt)))
		throw new TypeError('Run timestamps must be valid ISO timestamps.');
	if (Date.parse(input.endedAt) < Date.parse(input.startedAt))
		throw new TypeError('Run end timestamp cannot precede its start timestamp.');

	const summary: Record<ExecutionStatus, number> = {
		passed: 0,
		failed: 0,
		skipped: 0,
		todo: 0,
		pending: 0,
		cancelled: 0
	};
	const seenTests = new Set<string>();
	const seenSpecifications = new Set<string>();
	const specifications = input.specifications
		.map((specification) => {
			assertNonEmpty(specification.project, 'Specification project');
			assertNonEmpty(specification.pool, 'Specification pool');
			const normalized = {
				project: specification.project,
				pool: specification.pool,
				file: portablePath(input.packageRoot, specification.absoluteFilePath)
			};
			const key = JSON.stringify(normalized);
			if (seenSpecifications.has(key))
				throw new TypeError(
					`Duplicate test specification: ${normalized.project}:${normalized.pool}:${normalized.file}`
				);
			seenSpecifications.add(key);
			return normalized;
		})
		.sort((left, right) => {
			const leftKey = `${left.project}\u0000${left.pool}\u0000${left.file}`;
			const rightKey = `${right.project}\u0000${right.pool}\u0000${right.file}`;
			return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
		});
	const inputHash = createHash('sha256').update(JSON.stringify(specifications)).digest('hex');
	const modules = input.modules.map((module) => {
		assertNonEmpty(module.project, 'Project name');
		assertNonEmpty(module.pool, 'Pool');
		assertNonNegativeNumber(module.durationMs, 'Module duration');
		validateBrowserIdentity(module);
		const file = portablePath(input.packageRoot, module.absoluteFilePath);
		const browserKey =
			module.browser === null ? '' : `${module.browser.provider}:${module.browser.name}`;
		const tests = module.tests.map((test) => {
			assertNonEmpty(test.id, 'Test id');
			assertNonEmpty(test.fullName, 'Test full name');
			assertNonNegativeInteger(test.retryCount, 'Retry count');
			assertNonNegativeInteger(test.repeatCount, 'Repeat count');
			if (test.line !== undefined) assertPositiveInteger(test.line, 'Test line');
			if (test.column !== undefined) assertPositiveInteger(test.column, 'Test column');
			if (test.durationMs !== undefined) assertNonNegativeNumber(test.durationMs, 'Test duration');
			const duplicateKey = JSON.stringify([
				module.project,
				browserKey,
				file,
				test.line ?? '',
				test.fullName
			]);
			if (seenTests.has(duplicateKey))
				throw new TypeError(
					`Duplicate test execution record: ${file}:${test.line ?? '?'} ${test.fullName}`
				);
			seenTests.add(duplicateKey);
			const status = interruptedStatus(test.status, input.endReason);
			summary[status] += 1;
			return {
				id: test.id,
				fullName: test.fullName,
				location: test.line === undefined ? null : { line: test.line, column: test.column ?? 1 },
				status,
				attempt: test.retryCount + 1,
				retryCount: test.retryCount,
				repeatCount: test.repeatCount,
				expectedFailure: test.expectedFailure === true,
				flaky: status === 'passed' && test.retryCount > 0,
				durationMs: test.durationMs ?? null,
				...(test.skipNote === undefined ? {} : { skipNote: test.skipNote }),
				errors: test.errors
			};
		});
		return {
			project: module.project,
			kind: module.kind,
			browser: module.browser,
			pool: module.pool,
			file,
			status: interruptedStatus(module.status, input.endReason),
			durationMs: module.durationMs,
			errors: module.errors,
			tests
		};
	});

	return {
		schemaVersion: 1,
		run: {
			revision: input.revision.toLowerCase(),
			id: input.runId,
			attempt: input.runAttempt,
			runner: { name: input.runnerName, version: input.runnerVersion },
			startedAt: new Date(input.startedAt).toISOString(),
			endedAt: new Date(input.endedAt).toISOString(),
			endReason: input.endReason,
			specificationCount: specifications.length,
			inputHash
		},
		summary,
		modules,
		specifications,
		unhandledErrors: input.unhandledErrors
	};
}

export function resolveExecutionReportOutput(packageRoot: string, requestedPath: string): string {
	assertNonEmpty(requestedPath, 'ZUI_EXECUTION_REPORT');
	const normalizedRoot = resolve(packageRoot);
	const outputFile = resolve(normalizedRoot, requestedPath);
	const ignoredResultsRoot = resolve(normalizedRoot, 'test-results');
	if (!isInside(ignoredResultsRoot, outputFile))
		throw new TypeError(
			'ZUI_EXECUTION_REPORT must stay under the package test-results/ directory.'
		);
	if (outputFile === ignoredResultsRoot)
		throw new TypeError(
			'ZUI_EXECUTION_REPORT must name a JSON file, not the test-results directory.'
		);
	if (!outputFile.toLowerCase().endsWith('.json'))
		throw new TypeError('ZUI_EXECUTION_REPORT must name a .json file.');
	return outputFile;
}

function normalizedError(error: unknown): ExecutionError {
	if (typeof error !== 'object' || error === null) return { message: String(error) };
	const record = error as Record<string, unknown>;
	const message = typeof record.message === 'string' ? record.message : String(error);
	return {
		...(typeof record.name === 'string' ? { name: record.name } : {}),
		message,
		...(typeof record.stack === 'string' ? { stack: record.stack } : {})
	};
}

function testInput(test: TestCase): ExecutionTestInput {
	const result = test.result();
	const diagnostic = test.diagnostic();
	return {
		id: test.id,
		fullName: test.fullName,
		line: test.location?.line,
		column: test.location?.column,
		status: result.state === 'skipped' && test.options.mode === 'todo' ? 'todo' : result.state,
		retryCount: diagnostic?.retryCount ?? 0,
		repeatCount: diagnostic?.repeatCount ?? 0,
		expectedFailure: test.options.fails === true,
		durationMs: diagnostic?.duration,
		...(result.state === 'skipped' && result.note !== undefined ? { skipNote: result.note } : {}),
		errors: (result.errors ?? []).map(normalizedError)
	};
}

function moduleInput(module: TestModule): ExecutionModuleInput {
	const project = module.project;
	const pool = module.toTestSpecification().pool;
	const projectBrowser = project.browser;
	const browser =
		pool === 'browser' && projectBrowser
			? {
					name: project.config.browser.name,
					provider: projectBrowser.provider.name
				}
			: null;
	return {
		project: project.name,
		kind: pool === 'browser' ? 'browser' : 'unit',
		browser,
		pool,
		absoluteFilePath: module.moduleId.startsWith('file:')
			? fileURLToPath(module.moduleId)
			: module.moduleId,
		status: module.state(),
		durationMs: module.diagnostic().duration,
		errors: module.errors().map(normalizedError),
		tests: Array.from(module.children.allTests(), testInput)
	};
}

async function writeAtomically(
	outputFile: string,
	report: ComponentExecutionReport
): Promise<void> {
	await mkdir(dirname(outputFile), { recursive: true });
	const temporaryFile = `${outputFile}.${process.pid}.tmp`;
	try {
		await writeFile(temporaryFile, `${JSON.stringify(report, null, '\t')}\n`, 'utf8');
		await rename(temporaryFile, outputFile);
	} finally {
		await rm(temporaryFile, { force: true });
	}
}

export function createComponentExecutionReporter(
	options: ComponentExecutionReporterOptions
): Reporter {
	const outputFile = resolveExecutionReportOutput(options.packageRoot, options.outputFile);
	if (!SHA_PATTERN.test(options.revision))
		throw new TypeError(
			'GITHUB_SHA must be set to a complete revision when execution reporting is enabled.'
		);
	if (!/^\d+$/.test(options.runId) || options.runId === '0')
		throw new TypeError('GITHUB_RUN_ID must be set when execution reporting is enabled.');
	assertPositiveInteger(options.runAttempt, 'GITHUB_RUN_ATTEMPT');
	let startedAt = new Date().toISOString();
	let specifications: ExecutionSpecificationInput[] = [];
	let runnerVersion = '';
	let timedOut = false;

	return {
		onInit(vitest) {
			runnerVersion = vitest.version;
		},
		onTestRunStart(nextSpecifications) {
			startedAt = new Date().toISOString();
			specifications = nextSpecifications.map((specification) => ({
				project: specification.project.name,
				pool: specification.pool,
				absoluteFilePath: specification.moduleId.startsWith('file:')
					? fileURLToPath(specification.moduleId)
					: specification.moduleId
			}));
			timedOut = false;
		},
		onProcessTimeout() {
			timedOut = true;
		},
		async onTestRunEnd(
			modules: readonly TestModule[],
			unhandledErrors: readonly SerializedError[],
			reason: TestRunEndReason
		) {
			const report = serializeComponentExecutionReport({
				packageRoot: options.packageRoot,
				revision: options.revision,
				runId: options.runId,
				runAttempt: options.runAttempt,
				runnerName: 'vitest',
				runnerVersion,
				startedAt,
				endedAt: new Date().toISOString(),
				endReason: timedOut ? 'timeout' : reason,
				specifications,
				modules: modules.map(moduleInput),
				unhandledErrors: unhandledErrors.map(normalizedError)
			});
			await writeAtomically(outputFile, report);
		}
	};
}

function expectFailure(action: () => unknown, description: string): void {
	try {
		action();
	} catch {
		return;
	}
	throw new Error(`Self-test expected failure: ${description}`);
}

function runSelfTest(): void {
	const packageRoot = fileURLToPath(new URL('..', import.meta.url));
	const base: ExecutionReportInput = {
		packageRoot,
		revision: '0123456789abcdef0123456789abcdef01234567',
		runId: '12345',
		runAttempt: 2,
		runnerName: 'vitest',
		runnerVersion: 'self-test',
		startedAt: '2026-09-07T00:00:00.000Z',
		endedAt: '2026-09-07T00:00:01.000Z',
		endReason: 'interrupted',
		specifications: [
			{
				project: 'unit',
				pool: 'forks',
				absoluteFilePath: resolve(packageRoot, 'tests/example.spec.ts')
			},
			{
				project: 'browser',
				pool: 'browser',
				absoluteFilePath: resolve(packageRoot, 'tests/example.browser.spec.ts')
			}
		],
		modules: [
			{
				project: 'unit',
				kind: 'unit',
				browser: null,
				pool: 'forks',
				absoluteFilePath: resolve(packageRoot, 'tests/example.spec.ts'),
				status: 'passed',
				durationMs: 3,
				errors: [],
				tests: [
					{
						id: 'unit-pass',
						fullName: 'unit > passes',
						line: 4,
						status: 'passed',
						retryCount: 0,
						repeatCount: 0,
						durationMs: 2,
						errors: []
					}
				]
			},
			{
				project: 'browser',
				kind: 'browser',
				browser: { name: 'webkit', provider: 'playwright' },
				pool: 'browser',
				absoluteFilePath: resolve(packageRoot, 'tests/example.browser.spec.ts'),
				status: 'pending',
				durationMs: 12,
				errors: [],
				tests: [
					{
						id: 'flaky',
						fullName: 'browser > retries once',
						line: 10,
						column: 2,
						status: 'passed',
						retryCount: 1,
						repeatCount: 0,
						durationMs: 5,
						errors: [{ message: 'first attempt failed' }]
					},
					{
						id: 'cancelled',
						fullName: 'browser > was cancelled',
						line: 20,
						status: 'pending',
						retryCount: 0,
						repeatCount: 0,
						errors: []
					},
					{
						id: 'skipped',
						fullName: 'browser > is skipped',
						line: 30,
						status: 'skipped',
						retryCount: 0,
						repeatCount: 0,
						errors: []
					},
					{
						id: 'todo',
						fullName: 'browser > is todo',
						line: 31,
						status: 'todo',
						retryCount: 0,
						repeatCount: 0,
						errors: []
					},
					{
						id: 'failed',
						fullName: 'browser > fails after retries',
						line: 40,
						status: 'failed',
						retryCount: 2,
						repeatCount: 0,
						errors: [{ name: 'Error', message: 'still failed' }]
					},
					{
						id: 'expected-failure',
						fullName: 'browser > expects failure',
						line: 50,
						status: 'passed',
						retryCount: 0,
						repeatCount: 0,
						expectedFailure: true,
						errors: []
					}
				]
			}
		],
		unhandledErrors: [{ name: 'Error', message: 'unhandled teardown' }]
	};
	const report = serializeComponentExecutionReport(base);
	if (!/^[0-9a-f]{64}$/u.test(report.run.inputHash))
		throw new Error('Specification input hash was not generated.');
	if (report.modules[0]?.kind !== 'unit' || report.modules[0]?.browser !== null)
		throw new Error('Unit identity was not preserved.');
	if (report.modules[1]?.browser?.name !== 'webkit') throw new Error('Browser identity was lost.');
	if (report.modules[1]?.tests[0]?.attempt !== 2 || !report.modules[1]?.tests[0]?.flaky)
		throw new Error('Retry did not produce a flaky second attempt.');
	if (report.modules[1]?.tests[1]?.status !== 'cancelled')
		throw new Error('Interrupted pending test was not cancelled.');
	if (report.modules[1]?.tests[2]?.status !== 'skipped')
		throw new Error('Skipped test status was not preserved.');
	if (report.modules[1]?.tests[3]?.status !== 'todo')
		throw new Error('Todo test status was not preserved.');
	if (
		report.modules[1]?.tests[4]?.status !== 'failed' ||
		report.modules[1]?.tests[4]?.attempt !== 3 ||
		report.modules[1]?.tests[4]?.flaky
	)
		throw new Error('Failed retry semantics were not preserved.');
	if (!report.modules[1]?.tests[5]?.expectedFailure)
		throw new Error('Expected-failure semantics were not preserved.');
	if (report.unhandledErrors[0]?.message !== 'unhandled teardown')
		throw new Error('Unhandled error was not preserved.');
	expectFailure(
		() => serializeComponentExecutionReport({ ...base, revision: '' }),
		'missing revision'
	);
	expectFailure(
		() =>
			serializeComponentExecutionReport({
				...base,
				modules: [
					{ ...base.modules[1]!, absoluteFilePath: resolve(packageRoot, '..', 'escape.ts') }
				]
			}),
		'path outside package root'
	);
	expectFailure(
		() =>
			serializeComponentExecutionReport({
				...base,
				modules: [base.modules[1]!, base.modules[1]!]
			}),
		'duplicate record'
	);
	expectFailure(
		() =>
			serializeComponentExecutionReport({
				...base,
				modules: [{ ...base.modules[1]!, browser: null }]
			}),
		'missing browser identity'
	);
	expectFailure(
		() => resolveExecutionReportOutput(packageRoot, 'scripts/tracked.json'),
		'tracked output path'
	);
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	if (process.argv.includes('--self-test')) runSelfTest();
}
