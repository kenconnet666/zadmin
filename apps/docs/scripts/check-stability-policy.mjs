import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const matrix = JSON.parse(
	await readFile(resolve(root, '.docs/zui/component-maturity.json'), 'utf8')
);
const outputPath = resolve(root, '.docs/zui/stability-candidates.md');
const jsonOutputPath = resolve(root, '.docs/zui/stability-candidates.json');
const docsById = new Map(
	matrix.components.filter(({ docs }) => docs).map(({ id, docs }) => [id, docs])
);
const required = [
	'ContractVerified',
	'RuntimeImplemented',
	'BrowserBehaviorVerified',
	'ProductionVerified'
];
const baseRows = matrix.components.map((component) => {
	const blockers = required.filter((stage) => !component.stages[stage]);
	const familyDocs = component.family ? docsById.get(component.family) : undefined;
	const resolvedDocs = component.docs ?? familyDocs;
	if (!resolvedDocs) blockers.push('Docs');
	if (component.stages.ContractVerified && component.ssrEvidence.length === 0) blockers.push('SSR');
	if (!component.apiDocumentation) blockers.push('Teaching coverage missing');
	else {
		if (component.apiDocumentation.metadataGapPropCount > 0)
			blockers.push(`Metadata gaps (${component.apiDocumentation.metadataGapPropCount})`);
		if (component.apiDocumentation.teachingFallbackPropCount > 0)
			blockers.push(`Teaching fallback (${component.apiDocumentation.teachingFallbackPropCount})`);
	}
	return {
		...component,
		blockers,
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
	const unreadyMembers = familyRows.filter(({ blockers }) => blockers.length > 0);
	const unstableMembers = familyRows.filter(({ status }) => status !== 'stable');
	const blockers = [...row.blockers];
	if (unreadyMembers.length > 0 && row.blockers.length === 0)
		blockers.push(`Family readiness (${unreadyMembers.map(({ name }) => name).join(', ')})`);
	if (row.status === 'stable' && unstableMembers.length > 0)
		blockers.push(`Family status (${unstableMembers.map(({ name }) => name).join(', ')})`);
	return { ...row, blockers };
});
const stableViolations = rows.filter(
	({ status, blockers }) => status === 'stable' && blockers.length > 0
);
const stableCompliant = rows.filter(
	({ status, blockers }) => status === 'stable' && blockers.length === 0
);
const promotionEligibleExperimental = rows.filter(
	({ status, blockers }) => status === 'experimental' && blockers.length === 0
);
const classification = ({ status, blockers }) =>
	status === 'stable'
		? blockers.length
			? 'stableViolations'
			: 'stableCompliant'
		: blockers.length
			? 'experimental'
			: 'promotionEligibleExperimental';
const jsonOutput = {
	schemaVersion: 1,
	summary: {
		stableCompliant: stableCompliant.length,
		stableViolations: stableViolations.length,
		promotionEligibleExperimental: promotionEligibleExperimental.length
	},
	components: rows.map((row) => ({
		id: row.id,
		name: row.name,
		family: row.family,
		status: row.status,
		classification: classification(row),
		blockers: row.blockers,
		docs: row.resolvedDocs?.path ?? null,
		ssrEvidenceCount: row.ssrEvidence.length
	}))
};
const lines = [
	'# ZUI stability policy candidates',
	'',
	'本文件由 `scripts/check-stability-policy.mjs` 生成；不会修改组件 status。compound member 可继承同 family root 的 Docs 页面。',
	'',
	`stableCompliant：${stableCompliant.length}；stableViolations：${stableViolations.length}；promotionEligibleExperimental：${promotionEligibleExperimental.length}。`,
	'',
	'| Component | Status | Classification | Blockers | Docs | SSR |',
	'|---|---|---|---|---|---:|',
	...rows.map(
		({ name, status, blockers, resolvedDocs, usesFamilyDocs, ssrEvidence }) =>
			`| ${name} | ${status} | ${classification({ status, blockers })} | ${blockers.length ? blockers.join(', ') : '—'} | ${resolvedDocs ? `${resolvedDocs.path}${usesFamilyDocs ? ' (family root)' : ''}` : '—'} | ${ssrEvidence.length} |`
	),
	'',
	'## 晋级规则',
	'',
	'- stable API 必须满足 ContractVerified、RuntimeImplemented、BrowserBehaviorVerified、ProductionVerified、Docs、适用 SSR、source metadata gap=0 和 teaching fallback=0。VisuallyVerified 作为独立的真实视觉成熟度，不再由任意 browser expect 冒充。',
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
if (process.argv.includes('--write')) {
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
		outputs: ['.docs/zui/stability-candidates.json', '.docs/zui/stability-candidates.md'],
		stableCompliant: stableCompliant.length,
		stableViolations: stableViolations.length,
		promotionEligibleExperimental: promotionEligibleExperimental.length
	})
);
if (!process.argv.includes('--write') && stableViolations.length > 0) process.exitCode = 1;
