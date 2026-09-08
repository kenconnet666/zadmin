import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'typescript';

const RENDER_MODULES = new Set(['vitest-browser-svelte', 'vitest-browser-svelte/pure']);

function isRenderModule(moduleSpecifier) {
	return RENDER_MODULES.has(moduleSpecifier);
}

function unwrapParentheses(node) {
	let current = node;
	while (ts.isParenthesizedExpression(current)) current = current.expression;
	return current;
}

function transparentParent(node) {
	let current = node;
	while (ts.isParenthesizedExpression(current.parent)) current = current.parent;
	return current.parent;
}

function browserTestFiles(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...browserTestFiles(path));
		else if (entry.isFile() && entry.name.endsWith('.browser.spec.ts')) files.push(path);
	}
	return files;
}

function importedRenderSymbols(sourceFile, checker) {
	const named = new Set();
	const namespaces = new Set();
	for (const statement of sourceFile.statements) {
		if (
			!ts.isImportDeclaration(statement) ||
			!ts.isStringLiteral(statement.moduleSpecifier) ||
			!isRenderModule(statement.moduleSpecifier.text)
		)
			continue;
		const bindings = statement.importClause?.namedBindings;
		if (!bindings) continue;
		if (ts.isNamespaceImport(bindings)) {
			const symbol = checker.getSymbolAtLocation(bindings.name);
			if (symbol) namespaces.add(symbol);
			continue;
		}
		for (const specifier of bindings.elements) {
			if ((specifier.propertyName?.text ?? specifier.name.text) !== 'render') continue;
			const symbol = checker.getSymbolAtLocation(specifier.name);
			if (symbol) named.add(symbol);
		}
	}
	return { named, namespaces };
}

function renderImportKind(call, imports, checker) {
	if (ts.isIdentifier(call.expression))
		return imports.named.has(checker.getSymbolAtLocation(call.expression)) ? 'named' : undefined;
	if (
		ts.isPropertyAccessExpression(call.expression) &&
		call.expression.name.text === 'render' &&
		ts.isIdentifier(call.expression.expression) &&
		imports.namespaces.has(checker.getSymbolAtLocation(call.expression.expression))
	)
		return 'namespace';
	if (
		ts.isElementAccessExpression(call.expression) &&
		ts.isIdentifier(call.expression.expression) &&
		ts.isStringLiteral(call.expression.argumentExpression) &&
		call.expression.argumentExpression.text === 'render' &&
		imports.namespaces.has(checker.getSymbolAtLocation(call.expression.expression))
	)
		return 'namespace';
	return undefined;
}

function enclosingFunction(node) {
	for (let current = node.parent; current; current = current.parent) {
		if (ts.isFunctionLike(current)) return current;
	}
	return undefined;
}

function isPromiseThenCallback(functionNode) {
	if (
		!functionNode ||
		!ts.isArrowFunction(functionNode) ||
		!ts.isCallExpression(functionNode.parent)
	)
		return false;
	const chain = functionNode.parent;
	return (
		ts.isPropertyAccessExpression(chain.expression) &&
		chain.expression.name.text === 'then' &&
		chain.arguments.includes(functionNode)
	);
}

function ownership(call) {
	const parent = transparentParent(call);
	if (ts.isAwaitExpression(parent)) return 'await';
	if (ts.isReturnStatement(parent)) return 'return';
	if (ts.isArrowFunction(parent) && unwrapParentheses(parent.body) === call)
		return isPromiseThenCallback(parent) ? 'promise-chain' : 'implicit-return';
	if (ts.isVoidExpression(parent)) return 'void';
	if (ts.isExpressionStatement(parent)) return 'standalone';
	if (ts.isVariableDeclaration(parent) && unwrapParentheses(parent.initializer) === call)
		return 'variable';
	return 'other';
}

function isAllowedOwnership(kind) {
	return (
		kind === 'await' || kind === 'return' || kind === 'implicit-return' || kind === 'promise-chain'
	);
}

export function auditBrowserRenderProgram(program, sourceFiles) {
	const checker = program.getTypeChecker();
	const entries = [];
	for (const sourceFile of sourceFiles) {
		const imports = importedRenderSymbols(sourceFile, checker);
		if (imports.named.size === 0 && imports.namespaces.size === 0) continue;
		const visit = (node) => {
			if (ts.isCallExpression(node)) {
				const importKind = renderImportKind(node, imports, checker);
				if (importKind) {
					const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
					entries.push({
						call: node,
						column: position.character + 1,
						fileName: sourceFile.fileName,
						functionNode: enclosingFunction(node),
						importKind,
						line: position.line + 1,
						ownership: ownership(node)
					});
				}
			}
			ts.forEachChild(node, visit);
		};
		visit(sourceFile);
	}
	return entries;
}

export function auditBrowserRenderPromises(packageRoot) {
	const configPath = resolve(packageRoot, 'tsconfig.json');
	const config = ts.readConfigFile(configPath, ts.sys.readFile);
	if (config.error)
		throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
	const parsed = ts.parseJsonConfigFileContent(
		config.config,
		ts.sys,
		packageRoot,
		undefined,
		configPath
	);
	const files = browserTestFiles(resolve(packageRoot, 'tests'));
	const program = ts.createProgram({
		options: parsed.options,
		rootNames: [...new Set([...parsed.fileNames, ...files])]
	});
	return auditBrowserRenderProgram(
		program,
		files
			.map((file) => program.getSourceFile(file))
			.filter((sourceFile) => sourceFile !== undefined)
	);
}

export function renderPromiseViolations(entries) {
	return entries.filter((entry) => !isAllowedOwnership(entry.ownership));
}

export function createRenderAuditFixtureProgram(source) {
	const sourceFileName = '/render-audit/case.ts';
	const moduleFileName = '/render-audit/render.d.ts';
	const files = new Map([
		[sourceFileName, source],
		[moduleFileName, 'export declare function render(component: unknown): Promise<unknown>;']
	]);
	const options = {
		baseUrl: '/render-audit',
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
		paths: Object.fromEntries([...RENDER_MODULES].map((name) => [name, ['render.d.ts']])),
		target: ts.ScriptTarget.ESNext
	};
	const host = ts.createCompilerHost(options, true);
	const readFile = host.readFile.bind(host);
	const fileExists = host.fileExists.bind(host);
	host.fileExists = (fileName) => files.has(fileName) || fileExists(fileName);
	host.readFile = (fileName) => files.get(fileName) ?? readFile(fileName);
	host.getSourceFile = (fileName, languageVersion) => {
		const text = files.get(fileName);
		return text === undefined
			? undefined
			: ts.createSourceFile(fileName, text, languageVersion, true, ts.ScriptKind.TS);
	};
	const program = ts.createProgram({ options, host, rootNames: [...files.keys()] });
	return { program, sourceFile: program.getSourceFile(sourceFileName) };
}
