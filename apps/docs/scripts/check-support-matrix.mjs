import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
const root = fileURLToPath(new URL('../../..', import.meta.url));
const read = (p) => readFile(resolve(root, p), 'utf8');
const supportedBrowserNames = ['chromium', 'firefox', 'webkit'];

function configuredBrowserProjects(source) {
	return [...source.matchAll(/\{\s*name:\s*['"]([^'"]+)['"]/gu)].map(([, name]) => name);
}

function installedPlaywrightBrowsers(source) {
	return source
		.split(/\r?\n/u)
		.filter((line) => /\bplaywright\s+install\b/u.test(line))
		.flatMap((line) =>
			supportedBrowserNames.filter((name) => new RegExp(`\\b${name}\\b`, 'u').test(line))
		);
}

function docsE2eBrowserMatrix(source) {
	const job = /\n {2}docs-e2e:\n(?<body>[\s\S]*?)(?=\n {2}[a-z][a-z0-9-]*:\n)/u.exec(source)?.groups
		?.body;
	const values = job?.match(/\n\s+browser:\s*\[([^\]]+)\]/u)?.[1];
	return values?.split(',').map((value) => value.trim()) ?? [];
}

function sameValues(left, right) {
	return JSON.stringify([...new Set(left)].sort()) === JSON.stringify([...new Set(right)].sort());
}

const pkg = JSON.parse(await read('ui/zui/package.json'));
const ci = await read('.github/workflows/ci.yml');
const pw = await read('apps/docs/playwright.config.ts');
const browsers = configuredBrowserProjects(pw);
const installedBrowsers = installedPlaywrightBrowsers(ci);
const docsE2eBrowsers = docsE2eBrowserMatrix(ci);
const docsE2eStep = ci.includes(
	'pnpm --filter @zadmin/docs test:e2e --project=${{ matrix.browser }}'
);
const exists = async (p) => Boolean(await read(p).catch(() => null));
if (process.argv.includes('--self-test')) {
	const fixtureProjects = configuredBrowserProjects(
		"projects: [{ name: 'chromium' }, { name: 'firefox' }, { name: 'webkit' }]"
	);
	const fixtureInstall = installedPlaywrightBrowsers(
		'run: pnpm exec playwright install --with-deps chromium firefox webkit'
	);
	const fixtureMatrix = docsE2eBrowserMatrix(
		'\n  docs-e2e:\n    strategy:\n      matrix:\n        browser: [chromium, firefox, webkit]\n  build:\n'
	);
	if (
		!sameValues(fixtureProjects, supportedBrowserNames) ||
		!sameValues(fixtureInstall, supportedBrowserNames) ||
		!sameValues(fixtureMatrix, supportedBrowserNames) ||
		!sameValues(browsers, installedBrowsers) ||
		!sameValues(browsers, docsE2eBrowsers) ||
		!docsE2eStep ||
		pkg.peerDependenciesMeta?.shiki?.optional !== true
	)
		throw new Error('support parser self-test failed');
	console.log('Support matrix self-test passed.');
	process.exit(0);
}
if (
	!sameValues(installedBrowsers, browsers) ||
	!sameValues(docsE2eBrowsers, browsers) ||
	!docsE2eStep
)
	throw new Error(
		'CI Playwright install projects and docs E2E step do not match configured projects.'
	);
if (pkg.peerDependenciesMeta?.shiki?.optional !== true)
	throw new Error('The Shiki peer dependency must remain explicitly optional.');
const acceptance = {
	ssrCsp: {
		tested:
			ci.includes('pnpm --filter @zadmin/sveltekit test:zui-package') &&
			(await exists('ui/sveltekit/scripts/accept-zui-package.mjs')),
		evidence: ['ui/sveltekit/scripts/accept-zui-package.mjs', '.github/workflows/ci.yml'],
		promise: '已测试 external SSR/critical CSS/CSP；未承诺任意 SvelteKit 版本。'
	},
	webview: {
		tested:
			ci.includes('pnpm --filter @zadmin/webview test:package') &&
			(await exists('ui/webview/scripts/accept-package.mjs')),
		evidence: ['ui/webview/scripts/accept-package.mjs', '.github/workflows/ci.yml'],
		promise: '已测试 WebView2 facade/package；不扩展为所有 Windows/WebView2 版本。'
	},
	miniapp: {
		tested:
			ci.includes('pnpm --filter @zadmin/miniapp test:package') &&
			(await exists('ui/miniapp/scripts/accept-package.mjs')),
		evidence: ['ui/miniapp/scripts/accept-package.mjs', '.github/workflows/ci.yml'],
		promise: '已测试 Miniapp package；真机/授权/支付/硬件需单独验收。'
	}
};
const matrix = {
	package: {
		name: pkg.name,
		engines: pkg.engines,
		peerDependencies: pkg.peerDependencies,
		peerDependenciesMeta: pkg.peerDependenciesMeta,
		contract:
			'engines/peerDependencies 是承诺声明，不等于全环境已测试；Shiki 是 ZCode 按需高亮使用的 optional peer。'
	},
	ci: {
		node: ci.match(/NODE_VERSION:\s*'([^']+)'/u)?.[1] ?? null,
		pnpm: ci.match(/PNPM_VERSION:\s*'([^']+)'/u)?.[1] ?? null,
		browsers,
		docsE2eBrowsers,
		evidence:
			'浏览器列表来自 playwright.config.ts，并与 CI install、Docs matrix 和按项目 E2E 命令交叉校验。'
	},
	acceptance
};
const jsonPath = resolve(root, '.docs/zui/support-matrix.json');
const mdPath = resolve(root, '.docs/zui/support-matrix.md');
const md = `# ZUI 支持矩阵\n\n区分已测试证据与承诺支持范围，不编造浏览器最低版本。\n\n## Package\n\n- ${pkg.name}\n- Node engine：${pkg.engines.node}\n- Svelte peer：${pkg.peerDependencies.svelte}\n- Lucide peer：${pkg.peerDependencies['@lucide/svelte']}\n- Shiki peer：${pkg.peerDependencies.shiki}（optional，仅 ZCode 高亮路径需要）\n\n## CI tested\n\n| Runtime | Value |\n|---|---|\n| Node | ${matrix.ci.node} |\n| pnpm | ${matrix.ci.pnpm} |\n| Browsers | ${browsers.join(' / ')} |\n\n## Acceptance\n\n| Surface | Tested | Evidence | Boundary |\n|---|---:|---|---|\n| SvelteKit SSR/CSP | ${acceptance.ssrCsp.tested ? 'Y' : '—'} | ${acceptance.ssrCsp.evidence.join(', ')} | ${acceptance.ssrCsp.promise} |\n| Windows WebView2 | ${acceptance.webview.tested ? 'Y' : '—'} | ${acceptance.webview.evidence.join(', ')} | ${acceptance.webview.promise} |\n| WeChat Miniapp/WebView | ${acceptance.miniapp.tested ? 'Y' : '—'} | ${acceptance.miniapp.evidence.join(', ')} | ${acceptance.miniapp.promise} |\n\nPackage declarations are compatibility promises; CI rows are tested baselines only.\n`;
const cfg = (await prettier.resolveConfig(mdPath)) ?? {};
const formattedMd = await prettier.format(md, { ...cfg, filepath: mdPath });
const formattedJson = await prettier.format(`${JSON.stringify(matrix, null, '\t')}\n`, {
	...cfg,
	filepath: jsonPath
});
if (process.argv.includes('--write')) {
	await writeFile(jsonPath, formattedJson, 'utf8');
	await writeFile(mdPath, formattedMd, 'utf8');
} else {
	const [j, m] = await Promise.all([
		read('.docs/zui/support-matrix.json').catch(() => ''),
		read('.docs/zui/support-matrix.md').catch(() => '')
	]);
	if (j !== formattedJson || m !== formattedMd)
		throw new Error('Support matrix is stale. Run support:update.');
}
console.log(
	JSON.stringify({
		json: '.docs/zui/support-matrix.json',
		markdown: '.docs/zui/support-matrix.md',
		browsers,
		acceptance: Object.fromEntries(Object.entries(acceptance).map(([k, v]) => [k, v.tested]))
	})
);
