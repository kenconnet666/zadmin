import { lstat, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
	artifactPath,
	buildRuntimeMaturity,
	composeComponentExecution,
	composeFromPaths,
	createComponentExecutionSelfTestFixture,
	parseArguments,
	stableJson,
	validateIdentity
} from './compose-component-execution.mjs';

const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;

export function verifyComponentExecution({
	execution,
	runtimeMaturity,
	expectedExecution,
	expectedRuntimeMaturity,
	identity
}) {
	validateIdentity(identity);
	if (stableJson(execution) !== stableJson(expectedExecution))
		throw new Error('Component execution report is malformed or was modified after composition.');
	if (stableJson(runtimeMaturity) !== stableJson(expectedRuntimeMaturity))
		throw new Error('Runtime maturity report is malformed or changed static baseline data.');
	return {
		revision: identity.revision,
		runId: identity.runId,
		runAttempt: identity.runAttempt,
		status: execution.status,
		summary: execution.summary
	};
}

function expectSelfTestRejection(action, label) {
	try {
		action();
	} catch {
		return;
	}
	throw new Error(`Component execution verifier self-test accepted ${label}.`);
}

export function runComponentExecutionVerifierSelfTest() {
	const fixture = createComponentExecutionSelfTestFixture();
	const expectedExecution = composeComponentExecution(fixture);
	const executionPath = 'test-results/component-execution/component-execution.json';
	const expectedRuntimeMaturity = buildRuntimeMaturity({
		baseMaturity: fixture.baseMaturity,
		execution: expectedExecution,
		executionPath
	});
	const identity = fixture.identity;
	verifyComponentExecution({
		execution: structuredClone(expectedExecution),
		expectedExecution,
		expectedRuntimeMaturity,
		identity,
		runtimeMaturity: structuredClone(expectedRuntimeMaturity)
	});
	let negativeCases = 0;
	const reject = (mutate, label) => {
		const execution = structuredClone(expectedExecution);
		const runtimeMaturity = structuredClone(expectedRuntimeMaturity);
		mutate({ execution, runtimeMaturity });
		expectSelfTestRejection(
			() =>
				verifyComponentExecution({
					execution,
					expectedExecution,
					expectedRuntimeMaturity,
					identity,
					runtimeMaturity
				}),
			label
		);
		negativeCases += 1;
	};
	reject(
		({ execution }) => (execution.summary.BrowserBehaviorVerified += 1),
		'tampered execution summary'
	);
	reject(
		({ runtimeMaturity }) => (runtimeMaturity.components[0].category = 'tampered'),
		'tampered static component data'
	);
	reject(
		({ runtimeMaturity }) => (runtimeMaturity.execution.revision = 'f'.repeat(40)),
		'tampered runtime revision'
	);
	return { negativeCases, status: 'passed' };
}

async function main(argv = process.argv.slice(2)) {
	if (argv.length === 1 && argv[0] === '--self-test') {
		console.log(JSON.stringify(runComponentExecutionVerifierSelfTest()));
		return;
	}
	const options = parseArguments(argv);
	if (!options.report) throw new Error('--report is required.');
	const reportPath = artifactPath(options.report, '--report');
	if (reportPath.split(/[\\/]/u).at(-1) !== 'component-execution.json')
		throw new Error('--report must end with component-execution.json.');
	const runtimePath = artifactPath(
		resolve(dirname(reportPath), 'component-maturity.runtime.json'),
		'runtime maturity'
	);
	if ((await lstat(reportPath)).isSymbolicLink() || (await lstat(runtimePath)).isSymbolicLink())
		throw new Error('Component execution outputs cannot be symbolic links.');
	const [
		{ execution: expectedExecution, runtimeMaturity: expectedRuntimeMaturity },
		execution,
		runtimeMaturity
	] = await Promise.all([
		composeFromPaths(options),
		readFile(reportPath, 'utf8').then(JSON.parse),
		readFile(runtimePath, 'utf8').then(JSON.parse)
	]);
	const result = verifyComponentExecution({
		execution,
		runtimeMaturity,
		expectedExecution,
		expectedRuntimeMaturity,
		identity: {
			revision: options.revision,
			runId: options.runId,
			runAttempt: options.runAttempt
		}
	});
	console.log(JSON.stringify({ status: 'passed', ...result }));
}

if (isMain) await main();
