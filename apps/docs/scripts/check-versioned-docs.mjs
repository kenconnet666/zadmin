import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const docsRoot = resolve(root, 'apps/docs');
const distRoot = resolve(docsRoot, 'dist');
const emittedRoot = resolve(distRoot, 'zui-artifact');
const contractJsonPath = resolve(root, '.docs/zui/versioned-docs.json');
const contractMarkdownPath = resolve(root, '.docs/zui/versioned-docs.md');
const read = (path) => readFile(resolve(root, path), 'utf8');
const portable = (path) => path.replaceAll('\\', '/');
const comparePortable = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const bundleSha256 = (facts) =>
	sha256(facts.map(({ path, bytes, sha256: digest }) => `${path}\0${bytes}\0${digest}`).join('\n'));

function unwrapExpression(expression) {
	let current = expression;
	while (
		ts.isAsExpression(current) ||
		ts.isSatisfiesExpression(current) ||
		ts.isParenthesizedExpression(current)
	) {
		current = current.expression;
	}
	if (
		ts.isCallExpression(current) &&
		ts.isPropertyAccessExpression(current.expression) &&
		current.expression.expression.getText() === 'Object' &&
		current.expression.name.text === 'freeze' &&
		current.arguments.length === 1
	) {
		return unwrapExpression(current.arguments[0]);
	}
	return current;
}

function arrayLengthForVariable(source, fileName, variableName) {
	const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
	let initializer;
	function visit(node) {
		if (
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			node.name.text === variableName
		)
			initializer = node.initializer;
		if (!initializer) ts.forEachChild(node, visit);
	}
	visit(sourceFile);
	if (!initializer) throw new Error(`Missing ${variableName} in ${fileName}.`);
	const array = unwrapExpression(initializer);
	if (!ts.isArrayLiteralExpression(array))
		throw new Error(`${variableName} in ${fileName} must be an array literal.`);
	return array.elements.length;
}

async function filesUnder(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await filesUnder(path)));
		else if (entry.isFile()) files.push(path);
	}
	return files;
}

async function buildFacts() {
	const files = (await filesUnder(distRoot))
		.filter((path) => {
			const artifactPath = portable(relative(distRoot, path));
			return (
				!artifactPath.startsWith('zui-artifact/') &&
				!artifactPath.split('/').some((segment) => segment.startsWith('.'))
			);
		})
		.sort((left, right) =>
			comparePortable(portable(relative(distRoot, left)), portable(relative(distRoot, right)))
		);
	if (files.length === 0)
		throw new Error('Docs dist is empty. Build Docs before emitting its artifact contract.');
	const facts = [];
	for (const path of files) {
		const bytes = await readFile(path);
		facts.push({
			path: portable(relative(distRoot, path)),
			bytes: bytes.byteLength,
			sha256: sha256(bytes)
		});
	}
	return {
		fileCount: facts.length,
		bundleSha256: bundleSha256(facts),
		files: facts
	};
}

const packageJson = JSON.parse(await read('ui/zui/package.json'));
const supportSource = await read('.docs/zui/support-matrix.json');
const support = JSON.parse(supportSource);
const maturity = JSON.parse(await read('.docs/zui/component-maturity.json'));
const catalogSource = await read('apps/docs/src/framework/catalog-manifest.generated.ts');
const guidesSource = await read('apps/docs/src/content/guides.ts');
const themeLabSource = await read('apps/docs/src/views/ThemeLabPage.svelte');
const componentCount = arrayLengthForVariable(
	catalogSource,
	'catalog-manifest.generated.ts',
	'componentCatalogManifest'
);
const authoredGuideCount = arrayLengthForVariable(guidesSource, 'guides.ts', 'guideDocs');
const themeGuideCount = themeLabSource.includes('data-doc-route="guide:theme"') ? 1 : 0;
const guideCount = authoredGuideCount + themeGuideCount;
if (componentCount !== maturity.source.documentationPages)
	throw new Error(
		`Docs route/catalog mismatch: ${componentCount} component routes != ${maturity.source.documentationPages} documentation pages.`
	);
if (themeGuideCount !== 1) throw new Error('Theme Lab must expose the guide:theme route marker.');

if (process.argv.includes('--self-test')) {
	const arrayFixture = "const fixture = Object.freeze([{ id: 'a' }, { id: 'b' }] as const);";
	if (arrayLengthForVariable(arrayFixture, 'fixture.ts', 'fixture') !== 2)
		throw new Error('Versioned Docs AST self-test failed.');
	const digestFixture = [{ path: 'index.html', bytes: 3, sha256: 'a'.repeat(64) }];
	if (
		bundleSha256(digestFixture) !== bundleSha256([...digestFixture]) ||
		bundleSha256(digestFixture) === bundleSha256([{ ...digestFixture[0], bytes: 4 }])
	)
		throw new Error('Versioned Docs bundle digest self-test failed.');
	console.log(JSON.stringify({ componentCount, guideCount, status: 'passed' }));
	process.exit(0);
}

const emit = process.argv.includes('--emit');
const revision = emit
	? (process.env.GITHUB_SHA ??
		execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim())
	: 'SOURCE_REVISION';
if (emit && !/^[a-f0-9]{40}$/u.test(revision))
	throw new Error(`Docs artifact revision must be a full Git SHA: ${revision}.`);
const build = emit
	? await buildFacts()
	: { bundleSha256: 'BUILD_SHA256', fileCount: 'BUILD_FILE_COUNT', files: [] };
const supportMatrixSha256 = sha256(supportSource);
const artifact = {
	schemaVersion: 1,
	package: { name: packageJson.name, version: packageJson.version },
	revision,
	routeManifest: {
		componentCount,
		guideCount,
		totalCount: componentCount + guideCount + 1
	},
	build,
	supportMatrix: {
		sourcePath: '.docs/zui/support-matrix.json',
		artifactPath: 'zui-artifact/support-matrix.json',
		sha256: supportMatrixSha256,
		browsers: support.ci.browsers
	},
	deployment: {
		deployed: false,
		provider: null,
		note: 'Versioned build artifact only; no external deployment is claimed.'
	}
};
const prettierConfig = (await prettier.resolveConfig(contractJsonPath)) ?? {};
const json = await prettier.format(JSON.stringify(artifact), {
	...prettierConfig,
	filepath: contractJsonPath,
	parser: 'json'
});
const markdown = await prettier.format(
	`# Versioned Docs artifact contract\n\n- Package: ${packageJson.name}\n- Version: ${packageJson.version}\n- Revision: ${revision}\n- Component routes: ${componentCount}\n- Guide routes: ${guideCount}\n- Total routes including home: ${artifact.routeManifest.totalCount}\n- Build files: ${build.fileCount}\n- Build SHA-256: ${build.bundleSha256}\n- Support matrix SHA-256: ${supportMatrixSha256}\n- Tested browsers: ${support.ci.browsers.join(', ')}\n- Deployment: **not deployed**\n\nThe tracked file is a deterministic contract. CI replaces the revision and build placeholders only inside the uploaded Docs dist artifact; it does not claim Pages, OIDC, tags, registry publication, or external deployment.\n`,
	{ ...prettierConfig, filepath: contractMarkdownPath, parser: 'markdown' }
);

if (emit) {
	await mkdir(emittedRoot, { recursive: true });
	await Promise.all([
		writeFile(resolve(emittedRoot, 'version-manifest.json'), json, 'utf8'),
		writeFile(resolve(emittedRoot, 'support-matrix.json'), supportSource, 'utf8')
	]);
} else if (process.argv.includes('--write')) {
	await Promise.all([
		writeFile(contractJsonPath, json, 'utf8'),
		writeFile(contractMarkdownPath, markdown, 'utf8')
	]);
} else {
	const [currentJson, currentMarkdown] = await Promise.all([
		readFile(contractJsonPath, 'utf8').catch(() => ''),
		readFile(contractMarkdownPath, 'utf8').catch(() => '')
	]);
	if (currentJson !== json || currentMarkdown !== markdown)
		throw new Error('Versioned Docs artifacts are stale. Run docs:versioned:update.');
}

console.log(
	JSON.stringify({
		componentCount,
		guideCount,
		revision,
		buildFileCount: build.fileCount,
		bundleSha256: build.bundleSha256,
		deployed: false,
		supportMatrixSha256
	})
);
