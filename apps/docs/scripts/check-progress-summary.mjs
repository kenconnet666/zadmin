import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const jsonPath = resolve(root, '.docs/zui/progress.json');
const markdownPath = resolve(root, '.docs/zui/progress.md');
const modulePath = resolve(root, 'apps/docs/src/framework/progress.generated.ts');
const write = process.argv.includes('--write');

async function readJson(path) {
	return JSON.parse(await readFile(resolve(root, path), 'utf8'));
}

export function createProgressSummary({
	api,
	maturity,
	release,
	stability,
	support,
	versionedDocs
}) {
	const componentCount = api?.totals?.components;
	if (!Number.isInteger(componentCount) || componentCount < 1)
		throw new Error('Progress summary requires API component totals.');
	if (
		maturity?.schemaVersion !== 3 ||
		stability?.schemaVersion !== 2 ||
		maturity?.source?.metadataComponents !== componentCount ||
		stability?.components?.length !== componentCount
	)
		throw new Error('Progress summary component sources disagree.');
	const statusCounts = Object.fromEntries(
		Object.entries(
			maturity.components.reduce((counts, component) => {
				counts[component.status] = (counts[component.status] ?? 0) + 1;
				return counts;
			}, {})
		).sort(([left], [right]) => left.localeCompare(right))
	);
	const stableCount = statusCounts.stable ?? 0;
	if (
		stableCount !==
		stability.summary.stableCompliant +
			stability.summary.stablePendingExecution +
			stability.summary.stableViolations
	)
		throw new Error('Progress summary stable status and policy totals disagree.');
	const releaseChecks = Object.values(release.checks);
	const releasePassed = releaseChecks.filter(Boolean).length;
	const browsers = [...support.ci.browsers];
	if (
		browsers.join('\n') !== support.ci.docsE2eBrowsers.join('\n') ||
		browsers.join('\n') !== versionedDocs.supportMatrix.browsers.join('\n')
	)
		throw new Error('Progress summary browser matrices disagree.');
	const currentRevisionVerified = maturity.components.filter(
		(component) =>
			component.executionStages?.BrowserBehaviorVerified === true &&
			component.executionStages?.ProductionVerified === true
	).length;
	return {
		schemaVersion: 2,
		package: versionedDocs.package,
		api: {
			components: componentCount,
			declaredProps: api.totals.declaredProps,
			metadataGapProps: api.totals.metadataGapProps,
			fallbackProps: api.totals.fallbackProps
		},
		maturity: {
			...maturity.summary,
			execution: maturity.executionSummary,
			executionStatus: maturity.execution,
			currentRevisionVerified,
			statuses: statusCounts
		},
		stability: stability.summary,
		docs: {
			routes: versionedDocs.routeManifest,
			deployed: versionedDocs.deployment.deployed
		},
		support: {
			node: support.ci.node,
			pnpm: support.ci.pnpm,
			browsers,
			ssrCsp: support.acceptance.ssrCsp.tested,
			webview: support.acceptance.webview.tested,
			miniapp: support.acceptance.miniapp.tested
		},
		release: {
			status: release.status,
			passedChecks: releasePassed,
			totalChecks: releaseChecks.length,
			blocked: release.blocked
		},
		nextPriorities: [
			{
				id: 'production-contract-assets',
				remaining: componentCount - maturity.summary.ProductionContractsDeclared,
				description: '为缺少production browser/SSR合同资产的组件补明确测试。'
			},
			{
				id: 'current-revision-execution',
				remaining: componentCount - currentRevisionVerified,
				description:
					'用现有revision-bound执行制品证明当前commit的browser与production合同真实通过；无制品保持pending。'
			},
			{
				id: 'visual-contract-assets',
				remaining: componentCount - maturity.summary.VisualContractsDeclared,
				description: '补齐组件级几何、computed style或截图合同资产；资产存在不等于视觉执行通过。'
			},
			{
				id: 'stable-promotion',
				remaining: stability.summary.promotionEligibleExperimental,
				description: '逐项审查已满足门禁的experimental组件；禁止自动批量晋级。'
			},
			{
				id: 'desktop-evidence',
				remaining: componentCount - maturity.executionSummary.DesktopVerified,
				description: '建立组件级WebView2/Desktop证据后再提升DesktopVerified。'
			},
			{
				id: 'release-boundary',
				remaining: release.blocked.length,
				description: '完成真实publish/OIDC/tag/registry smoke与版本化Docs部署边界。'
			}
		]
	};
}

const input = {
	api: await readJson('.docs/zui/api-teaching-coverage.json'),
	maturity: await readJson('.docs/zui/component-maturity.json'),
	release: await readJson('.docs/zui/release-readiness.json'),
	stability: await readJson('.docs/zui/stability-candidates.json'),
	support: await readJson('.docs/zui/support-matrix.json'),
	versionedDocs: await readJson('.docs/zui/versioned-docs.json')
};
const progress = createProgressSummary(input);
const json = await prettier.format(`${JSON.stringify(progress, null, '\t')}\n`, {
	...((await prettier.resolveConfig(jsonPath)) ?? {}),
	filepath: jsonPath
});
const markdownSource = `# ZUI production progress

本文件由 \`apps/docs/scripts/check-progress-summary.mjs\` 从 API、成熟度、稳定性、支持矩阵、版本化 Docs 与发布就绪事实生成；不要手工维护数字。

## 当前事实

| 维度 | 当前值 | 总量或边界 |
|---|---:|---:|
| Public component metadata | ${progress.api.components} | ${progress.api.components} |
| Declared public props | ${progress.api.declaredProps} | metadata gaps ${progress.api.metadataGapProps}; fallbacks ${progress.api.fallbackProps} |
| Metadata status stable | ${progress.maturity.statuses.stable ?? 0} | compliant ${progress.stability.stableCompliant}; pending execution ${progress.stability.stablePendingExecution}; static violations ${progress.stability.stableViolations} |
| Browser behavior contracts declared | ${progress.maturity.BrowserBehaviorContractsDeclared} | ${progress.api.components} |
| Visual contracts declared | ${progress.maturity.VisualContractsDeclared} | ${progress.api.components} |
| Production contracts declared | ${progress.maturity.ProductionContractsDeclared} | ${progress.api.components} |
| SSR contracts declared | ${progress.maturity.SsrContractsDeclared} | ${progress.api.components} |
| Current-revision browser + production verified | ${progress.maturity.currentRevisionVerified} | ${progress.api.components}; status ${progress.maturity.executionStatus.status} |
| DesktopVerified execution evidence | ${progress.maturity.execution.DesktopVerified} | ${progress.api.components} |
| Docs routes | ${progress.docs.routes.totalCount} | components ${progress.docs.routes.componentCount}; guides ${progress.docs.routes.guideCount}; deployed ${progress.docs.deployed ? 'yes' : 'no'} |
| Browser matrix | ${progress.support.browsers.join(', ')} | Node ${progress.support.node}; pnpm ${progress.support.pnpm} |
| Release checks | ${progress.release.passedChecks} | ${progress.release.totalChecks}; status ${progress.release.status} |

## 下一步优先级

${progress.nextPriorities.map((item, index) => `${index + 1}. **${item.id}** (${item.remaining} remaining): ${item.description}`).join('\n')}

## 当前外部边界

${progress.release.blocked.map((item) => `- \`${item}\``).join('\n') || '- None'}
`;
const markdown = await prettier.format(markdownSource, {
	...((await prettier.resolveConfig(markdownPath)) ?? {}),
	filepath: markdownPath
});
const moduleSource = await prettier.format(
	`// Generated by scripts/check-progress-summary.mjs. Do not edit by hand.\nexport const zuiProgress = ${JSON.stringify(progress, null, '\t')} as const;\n`,
	{
		...((await prettier.resolveConfig(modulePath)) ?? {}),
		filepath: modulePath
	}
);

if (write) {
	await Promise.all([
		writeFile(jsonPath, json, 'utf8'),
		writeFile(markdownPath, markdown, 'utf8'),
		writeFile(modulePath, moduleSource, 'utf8')
	]);
} else {
	const [currentJson, currentMarkdown, currentModule] = await Promise.all([
		readFile(jsonPath, 'utf8').catch(() => ''),
		readFile(markdownPath, 'utf8').catch(() => ''),
		readFile(modulePath, 'utf8').catch(() => '')
	]);
	if (currentJson !== json || currentMarkdown !== markdown || currentModule !== moduleSource)
		throw new Error('Progress summary artifacts are stale. Run progress:update.');
}

console.log(
	JSON.stringify({
		components: progress.api.components,
		stable: progress.maturity.statuses.stable ?? 0,
		productionContractsDeclared: progress.maturity.ProductionContractsDeclared,
		currentRevisionVerified: progress.maturity.currentRevisionVerified,
		releaseStatus: progress.release.status
	})
);
