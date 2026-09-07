import { readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import prettier from 'prettier';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const { values: options } = parseArgs({
	options: {
		write: { type: 'boolean', default: false },
		maturity: { type: 'string' },
		out: { type: 'string' },
		revision: { type: 'string' }
	}
});
const runtimeInput = options.maturity !== undefined;
if (
	runtimeInput !== (options.out !== undefined) ||
	runtimeInput !== (options.revision !== undefined)
)
	throw new Error('Runtime stability requires --maturity, --revision and a separate --out prefix.');
const outputPrefix = resolve(root, options.out ?? '.docs/zui/stability-candidates');
const outputRelative = relative(root, outputPrefix);
if (
	runtimeInput &&
	(isAbsolute(outputRelative) ||
		outputRelative.replaceAll('\\', '/').split('/')[0] === '..' ||
		!outputRelative
			.replaceAll('\\', '/')
			.split('/')
			.some((segment) => segment === 'test-results' || segment === 'artifacts'))
)
	throw new Error('Runtime stability output must stay in an artifacts or test-results directory.');
const matrix = JSON.parse(
	await readFile(resolve(root, options.maturity ?? '.docs/zui/component-maturity.json'), 'utf8')
);
if (matrix.schemaVersion !== 3)
	throw new Error('Stability policy requires component maturity schemaVersion 3.');
if (
	runtimeInput &&
	(!/^[a-f0-9]{40}$/u.test(options.revision) || matrix.execution?.revision !== options.revision)
)
	throw new Error('Runtime maturity must match the requested complete commit revision.');
const outputPath = `${outputPrefix}.md`;
const jsonOutputPath = `${outputPrefix}.json`;
const docsById = new Map(
	matrix.components.filter(({ docs }) => docs).map(({ id, docs }) => [id, docs])
);
const staticRequired = [
	'MetadataDeclared',
	'PublicExportPresent',
	'ApiContractDeclared',
	'RuntimeImplemented',
	'BrowserBehaviorContractsDeclared',
	'ProductionContractsDeclared'
];
const executionRequired = ['BrowserBehaviorVerified', 'ProductionVerified'];
const baseRows = matrix.components.map((component) => {
	const staticBlockers = staticRequired
		.filter((stage) => !component.stages[stage])
		.map((stage) => `${stage} missing`);
	const executionBlockers = executionRequired
		.filter(
			(stage) =>
				!component.executionStages?.[stage] ||
				(runtimeInput && component.executionResults?.[stage]?.status !== 'verified')
		)
		.map((stage) => `${stage} pending for current revision`);
	const familyDocs = component.family ? docsById.get(component.family) : undefined;
	const resolvedDocs = component.docs ?? familyDocs;
	if (!resolvedDocs) staticBlockers.push('Docs missing');
	if (component.stages.ApiContractDeclared && !component.stages.SsrContractsDeclared)
		staticBlockers.push('SsrContractsDeclared missing');
	if (!component.apiDocumentation) staticBlockers.push('Teaching coverage missing');
	else {
		if (component.apiDocumentation.metadataGapPropCount > 0)
			staticBlockers.push(`Metadata gaps (${component.apiDocumentation.metadataGapPropCount})`);
		if (component.apiDocumentation.teachingFallbackPropCount > 0)
			staticBlockers.push(
				`Teaching fallback (${component.apiDocumentation.teachingFallbackPropCount})`
			);
	}
	return {
		...component,
		staticBlockers,
		executionBlockers,
		resolvedDocs,
		usesFamilyDocs: !component.docs && Boolean(familyDocs)
	};
});
const rowsByFamily = new Map();
for (const row of baseRows) {
	if (!row.family) continue;
	const familyRows = rowsByFamily.get(row.family) ?? [];
	familyRows.push(row);
	rowsByFamily.set(row.family, familyRows);
}
const rows = baseRows.map((row) => {
	if (!row.family) return row;
	const familyRows = rowsByFamily.get(row.family) ?? [row];
	const staticUnreadyMembers = familyRows.filter(({ staticBlockers }) => staticBlockers.length > 0);
	const executionPendingMembers = familyRows.filter(
		({ executionBlockers }) => executionBlockers.length > 0
	);
	const unstableMembers = familyRows.filter(({ status }) => status !== 'stable');
	const staticBlockers = [...row.staticBlockers];
	const executionBlockers = [...row.executionBlockers];
	if (staticUnreadyMembers.length > 0 && row.staticBlockers.length === 0)
		staticBlockers.push(
			`Family static readiness (${staticUnreadyMembers.map(({ name }) => name).join(', ')})`
		);
	if (executionPendingMembers.length > 0 && row.executionBlockers.length === 0)
		executionBlockers.push(
			`Family execution readiness (${executionPendingMembers.map(({ name }) => name).join(', ')})`
		);
	if (row.status === 'stable' && unstableMembers.length > 0)
		staticBlockers.push(`Family status (${unstableMembers.map(({ name }) => name).join(', ')})`);
	return { ...row, staticBlockers, executionBlockers };
});
const stableViolations = rows.filter(
	({ status, staticBlockers }) => status === 'stable' && staticBlockers.length > 0
);
const stablePendingExecution = rows.filter(
	({ status, staticBlockers, executionBlockers }) =>
		status === 'stable' && staticBlockers.length === 0 && executionBlockers.length > 0
);
const stableCompliant = rows.filter(
	({ status, staticBlockers, executionBlockers }) =>
		status === 'stable' && staticBlockers.length === 0 && executionBlockers.length === 0
);
const promotionEligibleExperimental = rows.filter(
	({ status, staticBlockers, executionBlockers }) =>
		status === 'experimental' && staticBlockers.length === 0 && executionBlockers.length === 0
);
const classification = ({ status, staticBlockers, executionBlockers }) =>
	status === 'stable'
		? staticBlockers.length
			? 'stableViolations'
			: executionBlockers.length
				? 'stablePendingExecution'
				: 'stableCompliant'
		: staticBlockers.length || executionBlockers.length
			? 'experimental'
			: 'promotionEligibleExperimental';
const jsonOutput = {
	schemaVersion: 2,
	...(runtimeInput ? { execution: matrix.execution } : {}),
	summary: {
		stableCompliant: stableCompliant.length,
		stablePendingExecution: stablePendingExecution.length,
		stableViolations: stableViolations.length,
		promotionEligibleExperimental: promotionEligibleExperimental.length
	},
	components: rows.map((row) => ({
		id: row.id,
		name: row.name,
		family: row.family,
		status: row.status,
		classification: classification(row),
		staticBlockers: row.staticBlockers,
		executionBlockers: row.executionBlockers,
		docs: row.resolvedDocs?.path ?? null,
		ssrContractCount: row.ssrContracts.length
	}))
};
const lines = [
	'# ZUI stability policy candidates',
	'',
	'本文件由 `scripts/check-stability-policy.mjs` 生成；不会修改组件 status。compound member 可继承同 family root 的 Docs 页面。',
	'',
	...(runtimeInput ? [`当前执行提交：\`${options.revision}\`。`, ''] : []),
	`stableCompliant：${stableCompliant.length}；stablePendingExecution：${stablePendingExecution.length}；stableViolations：${stableViolations.length}；promotionEligibleExperimental：${promotionEligibleExperimental.length}。`,
	'',
	'| Component | Metadata status | Classification | Static blockers | Current-revision execution | Docs | SSR contracts |',
	'|---|---|---|---|---|---|---:|',
	...rows.map(
		({
			name,
			status,
			staticBlockers,
			executionBlockers,
			resolvedDocs,
			usesFamilyDocs,
			ssrContracts
		}) =>
			`| ${name} | ${status} | ${classification({ status, staticBlockers, executionBlockers })} | ${staticBlockers.length ? staticBlockers.join(', ') : '—'} | ${executionBlockers.length ? executionBlockers.join(', ') : 'verified for current revision'} | ${resolvedDocs ? `${resolvedDocs.path}${usesFamilyDocs ? ' (family root)' : ''}` : '—'} | ${ssrContracts.length} |`
	),
	'',
	'## 晋级规则',
	'',
	'- metadata status=stable 与验收证据分开。静态门槛要求 MetadataDeclared、PublicExportPresent、ApiContractDeclared、RuntimeImplemented、BrowserBehaviorContractsDeclared、ProductionContractsDeclared、Docs、适用 SsrContractsDeclared、source metadata gap=0 和 teaching fallback=0。',
	'- stableCompliant 还必须有绑定当前revision的 BrowserBehaviorVerified 与 ProductionVerified 执行证据；缺失时归入 stablePendingExecution，不把测试资产存在写成 verified。VisuallyVerified 只接受独立真实视觉执行证据。',
	'- compound member 不要求独立文档页；拥有同 family root 文档页即可满足 Docs。',
	'- compound family 原子晋级：任一成员仍有 blocker，整个 family 都不是候选；stable family 不允许混合 status。',
	'- experimental 只报告 promotionEligibleExperimental，不自动修改 status。'
];
const formatted = await prettier.format(`${lines.join('\n')}\n`, {
	...((await prettier.resolveConfig(outputPath)) ?? {}),
	filepath: outputPath
});
const formattedJson = await prettier.format(`${JSON.stringify(jsonOutput, null, '\t')}\n`, {
	...((await prettier.resolveConfig(jsonOutputPath)) ?? {}),
	filepath: jsonOutputPath
});
if (options.write) {
	await Promise.all([
		writeFile(outputPath, formatted, 'utf8'),
		writeFile(jsonOutputPath, formattedJson, 'utf8')
	]);
} else {
	const [currentMarkdown, currentJson] = await Promise.all([
		readFile(outputPath, 'utf8').catch(() => ''),
		readFile(jsonOutputPath, 'utf8').catch(() => '')
	]);
	if (currentMarkdown !== formatted || currentJson !== formattedJson)
		throw new Error('Stability candidate artifacts are stale. Run stability:update.');
}
console.log(
	JSON.stringify({
		outputs: [jsonOutputPath, outputPath].map((path) => relative(root, path).replaceAll('\\', '/')),
		stableCompliant: stableCompliant.length,
		stablePendingExecution: stablePendingExecution.length,
		stableViolations: stableViolations.length,
		promotionEligibleExperimental: promotionEligibleExperimental.length
	})
);
if (!options.write && stableViolations.length > 0) process.exitCode = 1;
