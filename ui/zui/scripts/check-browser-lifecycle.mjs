import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import ts from 'typescript';

function auditLifecycleSource(source) {
	const ast = ts.createSourceFile('browser.spec.ts', source, ts.ScriptTarget.Latest, true);
	const tracked = new Set();
	const svelteNamespaces = new Set();
	let directImport = false;
	let untrackedCall = false;
	for (const statement of ast.statements) {
		if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
			continue;
		const module = statement.moduleSpecifier.text;
		const bindings = statement.importClause?.namedBindings;
		if (!bindings) continue;
		if (module === 'svelte' && ts.isNamespaceImport(bindings))
			svelteNamespaces.add(bindings.name.text);
		if (!ts.isNamedImports(bindings)) continue;
		for (const binding of bindings.elements) {
			if (!['mount', 'unmount'].includes((binding.propertyName ?? binding.name).text)) continue;
			if (module === 'svelte' && !binding.isTypeOnly && !statement.importClause?.isTypeOnly)
				directImport = true;
			if (module === './browser-lifecycle.js') tracked.add(binding.name.text);
		}
	}
	function visit(node) {
		if (ts.isCallExpression(node)) {
			const callee = node.expression;
			if (
				ts.isIdentifier(callee) &&
				['mount', 'unmount'].includes(callee.text) &&
				!tracked.has(callee.text)
			)
				untrackedCall = true;
			if (
				ts.isPropertyAccessExpression(callee) &&
				ts.isIdentifier(callee.expression) &&
				svelteNamespaces.has(callee.expression.text) &&
				['mount', 'unmount'].includes(callee.name.text)
			)
				untrackedCall = true;
		}
		ts.forEachChild(node, visit);
	}
	visit(ast);
	return { directImport, untrackedCall };
}

if (process.argv.includes('--self-test')) {
	assert.deepEqual(auditLifecycleSource('registry.mount(key, element); registry.unmount(key);'), {
		directImport: false,
		untrackedCall: false
	});
	assert.deepEqual(
		auditLifecycleSource(
			"import { mount, unmount as dispose } from './browser-lifecycle.js'; mount(Component, {}); dispose(instance);"
		),
		{ directImport: false, untrackedCall: false }
	);
	assert.equal(
		auditLifecycleSource("import { mount as create } from 'svelte'; create(Component, {});")
			.directImport,
		true
	);
	assert.equal(
		auditLifecycleSource("import * as Svelte from 'svelte'; Svelte.mount(Component, {});")
			.untrackedCall,
		true
	);
	assert.equal(auditLifecycleSource('mount(Component, {});').untrackedCall, true);
	assert.deepEqual(
		auditLifecycleSource("// mount(Component)\nconst example = 'unmount(instance)';"),
		{ directImport: false, untrackedCall: false }
	);
	console.log('Browser lifecycle audit self-test passed.');
	process.exit(0);
}

const packageRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const testsRoot = join(packageRoot, 'tests');
const failures = [];

for (const entry of readdirSync(testsRoot, { withFileTypes: true })) {
	if (!entry.isFile() || !entry.name.endsWith('.browser.spec.ts')) continue;
	const path = join(testsRoot, entry.name);
	const source = readFileSync(path, 'utf8');
	const { directImport, untrackedCall } = auditLifecycleSource(source);
	if (directImport) {
		failures.push(`${entry.name} imports imperative lifecycle functions directly from svelte.`);
	}
	if (untrackedCall) {
		failures.push(
			`${entry.name} uses imperative mount/unmount without the tracked lifecycle adapter.`
		);
	}
}

const setupPath = join(testsRoot, 'browser.setup.ts');
const setup = readFileSync(setupPath, 'utf8');
for (const required of ['cleanupDirectMounts', 'cleanup()', 'vi.restoreAllMocks()']) {
	if (!setup.includes(required)) failures.push(`browser.setup.ts does not invoke ${required}.`);
}

if (failures.length > 0) {
	throw new Error(
		`Browser lifecycle audit failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`
	);
}

console.log(
	`Browser lifecycle audit passed (${relative(packageRoot, testsRoot).replaceAll('\\', '/')} imperative mounts are tracked).`
);
