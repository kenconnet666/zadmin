import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const STATUS = Object.freeze({
	local: 'local',
	external: 'local-external',
	unresolved: 'unresolved',
	cycle: 'cycle'
});
const RELATIVE = /^\.\.?\//u;
const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;

function within(root, target) {
	const relation = relative(root, target);
	return (
		relation === '' ||
		(!isAbsolute(relation) && relation !== '..' && !relation.startsWith(`..${sep}`))
	);
}

function moduleSource(source, path) {
	if (extname(path) !== '.svelte') return source;
	const match = /<script\s+module(?:\s+[^>]*)?>([\s\S]*?)<\/script>/u.exec(source);
	return match?.[1] ?? '';
}

function declarations(source) {
	const file = ts.createSourceFile('workspace-type-graph.ts', source, ts.ScriptTarget.Latest, true);
	const result = new Map();
	for (const statement of file.statements) {
		if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement))
			result.set(statement.name.text, statement);
	}
	return { file, declarations: result };
}

function importAliases(file) {
	const aliases = new Map();
	for (const statement of file.statements) {
		if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
			continue;
		const source = statement.moduleSpecifier.text;
		if (!statement.importClause) continue;
		if (statement.importClause.name)
			aliases.set(statement.importClause.name.text, { imported: 'default', source });
		const named = statement.importClause.namedBindings;
		if (named && ts.isNamespaceImport(named))
			aliases.set(named.name.text, { imported: '*', source });
		if (named && ts.isNamedImports(named)) {
			for (const element of named.elements)
				aliases.set(element.name.text, {
					imported: element.propertyName?.text ?? element.name.text,
					source
				});
		}
	}
	return aliases;
}

export class WorkspaceTypeGraph {
	#root;
	#cache = new Map();
	#pending = new Map();
	constructor({ workspaceRoot }) {
		this.#root = resolve(workspaceRoot);
	}
	resolvePath(path) {
		const target = isAbsolute(path) ? resolve(path) : resolve(this.#root, path);
		if (!within(this.#root, target))
			return { status: STATUS.unresolved, reason: 'outside-workspace', path: target };
		return target;
	}
	async load(path) {
		const target = this.resolvePath(path);
		if (typeof target !== 'string') return target;
		if (this.#cache.has(target)) return this.#cache.get(target);
		if (this.#pending.has(target)) return this.#pending.get(target);
		const pending = this.#loadLocal(target);
		this.#pending.set(target, pending);
		try {
			return await pending;
		} finally {
			this.#pending.delete(target);
		}
	}
	async #loadLocal(target) {
		try {
			const source = moduleSource(await readFile(target, 'utf8'), target);
			const parsed = declarations(source);
			const module = {
				status: STATUS.local,
				path: target,
				source,
				file: parsed.file,
				declarations: parsed.declarations,
				aliases: importAliases(parsed.file)
			};
			this.#cache.set(target, module);
			return module;
		} catch (error) {
			if (error?.code !== 'ENOENT') throw error;
			return { status: STATUS.unresolved, reason: 'missing', path: target };
		}
	}
	async resolveImport(importer, specifier) {
		if (!RELATIVE.test(specifier)) return { status: STATUS.external, specifier };
		const base = resolve(dirname(importer), specifier);
		const candidates = extname(base)
			? [base]
			: [base, `${base}.ts`, `${base}.svelte`, `${base}.js`];
		for (const candidate of candidates) {
			const mapped = candidate.endsWith('.js') ? `${candidate.slice(0, -3)}.ts` : candidate;
			const loaded = await this.load(mapped);
			if (loaded.status === STATUS.local) return loaded;
		}
		return { status: STATUS.unresolved, reason: 'missing-import', importer, specifier };
	}
	async resolveDeclaration(modulePath, name, typeArguments = [], stack = []) {
		const module = await this.load(modulePath);
		if (module.status !== STATUS.local) return module;
		if (stack.includes(`${module.path}#${name}`))
			return { status: STATUS.cycle, path: module.path, name };
		const local = module.declarations.get(name);
		if (local) {
			const type =
				ts.isTypeAliasDeclaration(local) &&
				ts.isTypeReferenceNode(local.type) &&
				ts.isIdentifier(local.type.typeName)
					? await this.resolveDeclaration(
							module.path,
							local.type.typeName.text,
							local.type.typeArguments ?? [],
							[...stack, `${module.path}#${name}`]
						)
					: null;
			if (type?.status === STATUS.cycle) return type;
			return {
				status: STATUS.local,
				path: module.path,
				name,
				declaration: local,
				typeParameters: [...(local.typeParameters ?? [])].map((item) => item.name.text),
				typeArguments,
				typeParameterMap: Object.fromEntries(
					[...(local.typeParameters ?? [])].map((item, index) => [
						item.name.text,
						typeArguments[index] ?? null
					])
				),
				resolvedType: type
			};
		}
		const alias = module.aliases.get(name);
		if (!alias || alias.imported === '*')
			return { status: STATUS.unresolved, reason: 'missing-declaration', path: module.path, name };
		const imported = await this.resolveImport(module.path, alias.source);
		if (imported.status !== STATUS.local) return imported;
		return this.resolveDeclaration(imported.path, alias.imported, typeArguments, [
			...stack,
			`${module.path}#${name}`
		]);
	}
}

if (isMain && process.argv.includes('--self-test')) {
	const root = await mkdtemp(resolve(tmpdir(), 'zadmin-type-graph-'));
	try {
		await mkdir(resolve(root, 'src'), { recursive: true });
		await writeFile(
			resolve(root, 'src/types.ts'),
			'export interface Item { key: string; }',
			'utf8'
		);
		await writeFile(
			resolve(root, 'src/alias.ts'),
			"import { Item as Renamed } from './types.js'; export type Alias = Renamed;",
			'utf8'
		);
		await writeFile(
			resolve(root, 'src/host.svelte'),
			'<script module lang="ts">import { Alias } from "./alias.js"; export inter' +
				'face Props { items: readonly Alias[]; }</script>',
			'utf8'
		);
		await writeFile(
			resolve(root, 'src/generic.ts'),
			'export interface Box<T> { value: T; }',
			'utf8'
		);
		await writeFile(
			resolve(root, 'src/cycle-a.ts'),
			"import { B } from './cycle-b.js'; export type A = B;",
			'utf8'
		);
		await writeFile(
			resolve(root, 'src/cycle-b.ts'),
			"import { A } from './cycle-a.js'; export type B = A;",
			'utf8'
		);
		const graph = new WorkspaceTypeGraph({ workspaceRoot: root });
		const [concurrentLeft, concurrentRight] = await Promise.all([
			graph.load(resolve(root, 'src/types.ts')),
			graph.load(resolve(root, 'src/types.ts'))
		]);
		if (concurrentLeft.status !== STATUS.local || concurrentLeft !== concurrentRight)
			throw new Error('concurrent module loading did not share its cached result');
		const host = await graph.resolveDeclaration(resolve(root, 'src/host.svelte'), 'Props');
		if (host.status !== STATUS.local) throw new Error('local Svelte declaration failed');
		const alias = await graph.resolveDeclaration(resolve(root, 'src/alias.ts'), 'Alias');
		if (alias.status !== STATUS.local || alias.name !== 'Alias')
			throw new Error('import alias failed');
		const generic = await graph.resolveDeclaration(resolve(root, 'src/generic.ts'), 'Box', ['T']);
		if (
			generic.status !== STATUS.local ||
			generic.typeParameters[0] !== 'T' ||
			generic.typeParameterMap.T !== 'T'
		)
			throw new Error('generic mapping failed');
		if (
			(await graph.resolveImport(resolve(root, 'src/host.svelte'), 'pkg')).status !==
			STATUS.external
		)
			throw new Error('external import was not rejected');
		if (
			(await graph.resolveImport(resolve(root, 'src/host.svelte'), '../../outside.ts')).status !==
			STATUS.unresolved
		)
			throw new Error('workspace escape was not rejected');
		if (
			(await graph.resolveDeclaration(resolve(root, 'src/missing.ts'), 'Missing')).status !==
			STATUS.unresolved
		)
			throw new Error('missing declaration was not rejected');
		if ((await graph.resolvePath(resolve(root, '../outside.ts'))).status !== STATUS.unresolved)
			throw new Error('workspace escape was not rejected');
		if (
			(await graph.resolveDeclaration(resolve(root, 'src/cycle-a.ts'), 'A')).status !== STATUS.cycle
		)
			throw new Error('cycle was not rejected');
		console.log(JSON.stringify({ status: 'passed', cacheEntries: 5 }));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
}
