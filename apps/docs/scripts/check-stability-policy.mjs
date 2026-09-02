import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const matrix = JSON.parse(
	await readFile(resolve(root, '.docs/zui/component-maturity.json'), 'utf8')
);
const teaching = JSON.parse(
	await readFile(resolve(root, '.docs/zui/api-teaching-coverage.json'), 'utf8')
);
const outputPath = resolve(root, '.docs/zui/stability-candidates.md');
const teachingById = new Map(teaching.components.map((item) => [item.id, item]));
const docsById = new Map(
	matrix.components.filter(({ docs }) => docs).map(({ id, docs }) => [id, docs])
);
const required = [
	'ContractVerified',
	'RuntimeImplemented',
	'VisuallyVerified',
	'ProductionVerified'
];
const baseRows = matrix.components.map((component) => {
	const teachingFact = teachingById.get(component.id);
	const blockers = required.filter((stage) => !component.stages[stage]);
	const familyDocs = teachingFact?.family ? docsById.get(teachingFact.family) : undefined;
	const resolvedDocs = component.docs ?? familyDocs;
	if (!resolvedDocs) blockers.push('Docs');
	if (component.stages.ContractVerified && component.ssrEvidence.length === 0) blockers.push('SSR');
	if (!teachingFact) blockers.push('Teaching coverage missing');
	else if (teachingFact.fallbackPropCount > 0)
		blockers.push(`Teaching fallback (${teachingFact.fallbackPropCount})`);
	return {
		...component,
		blockers,
		family: teachingFact?.family,
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
			`| ${name} | ${status} | ${status === 'stable' ? (blockers.length ? 'stableViolations' : 'stableCompliant') : blockers.length ? 'experimental' : 'promotionEligibleExperimental'} | ${blockers.length ? blockers.join(', ') : '—'} | ${resolvedDocs ? `${resolvedDocs.path}${usesFamilyDocs ? ' (family root)' : ''}` : '—'} | ${ssrEvidence.length} |`
	),
	'',
	'## 晋级规则',
	'',
	'- stable 必须满足 ContractVerified、RuntimeImplemented、VisuallyVerified、ProductionVerified、Docs、适用 SSR 和 teaching fallback=0。',
	'- compound member 不要求独立文档页；拥有同 family root 文档页即可满足 Docs。',
	'- compound family 原子晋级：任一成员仍有 blocker，整个 family 都不是候选；stable family 不允许混合 status。',
	'- experimental 只报告 promotionEligibleExperimental，不自动修改 status。'
];
const formatted = await prettier.format(`${lines.join('\n')}\n`, {
	...((await prettier.resolveConfig(outputPath)) ?? {}),
	filepath: outputPath
});
if (process.argv.includes('--write')) await writeFile(outputPath, formatted, 'utf8');
else if ((await readFile(outputPath, 'utf8').catch(() => '')) !== formatted)
	throw new Error('Stability candidates are stale. Run stability:update.');
console.log(
	JSON.stringify({
		output: '.docs/zui/stability-candidates.md',
		stableCompliant: stableCompliant.length,
		stableViolations: stableViolations.length,
		promotionEligibleExperimental: promotionEligibleExperimental.length
	})
);
if (!process.argv.includes('--write') && stableViolations.length > 0) process.exitCode = 1;
