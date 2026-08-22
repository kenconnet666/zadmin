import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import type { Plugin } from 'vite';
import { parsePluginManifest } from './manifest.ts';

const TYPESCRIPT_FILE = /\.tsx?$/;
const STANDARD_DECORATOR = /(^|[\r\n])\s*@[$A-Z_a-z][$\w]*/;

/** Lowers standard decorators until Vite's default Oxc transform can do so for Node. */
export function standardDecorators(): Plugin {
	return {
		name: 'zadmin-standard-decorators',
		enforce: 'pre',
		transform(code, id) {
			const path = id.split('?', 1)[0] ?? id;
			if (!TYPESCRIPT_FILE.test(path) || !STANDARD_DECORATOR.test(code)) return undefined;
			const result = ts.transpileModule(code, {
				fileName: path,
				compilerOptions: {
					inlineSources: true,
					jsx: ts.JsxEmit.Preserve,
					module: ts.ModuleKind.ESNext,
					moduleResolution: ts.ModuleResolutionKind.Bundler,
					sourceMap: true,
					target: ts.ScriptTarget.ES2022,
					useDefineForClassFields: true
				},
				reportDiagnostics: true
			});
			const errors = result.diagnostics?.filter(
				({ category }) => category === ts.DiagnosticCategory.Error
			);
			if (errors?.length) {
				throw new Error(
					ts.formatDiagnosticsWithColorAndContext(errors, {
						getCanonicalFileName: (fileName) => fileName,
						getCurrentDirectory: () => process.cwd(),
						getNewLine: () => '\n'
					})
				);
			}
			return {
				code: result.outputText.replace(/\n\/\/# sourceMappingURL=.*\s*$/, '\n'),
				map: result.sourceMapText ? JSON.parse(result.sourceMapText) : undefined
			};
		}
	};
}

export interface ZAdminPluginOptions {
	readonly manifest?: string;
	readonly outDir?: string;
}

/** Vite build policy shared by first-party and external ZAdmin plugins. */
export function zadminPlugin(options: ZAdminPluginOptions = {}): Plugin[] {
	const manifestPath = resolve(options.manifest ?? 'zadmin.plugin.json');
	let outDir = options.outDir ? resolve(options.outDir) : undefined;
	const readManifest = () =>
		parsePluginManifest(JSON.parse(readFileSync(manifestPath, 'utf8')), manifestPath);
	let manifest = readManifest();
	let runtimeDependencies = dependencyIds(manifest);

	return [
		standardDecorators(),
		{
			name: 'zadmin-plugin-artifact',
			configResolved(config) {
				outDir ??= resolve(config.root, config.build.outDir);
			},
			buildStart() {
				this.addWatchFile(manifestPath);
				manifest = readManifest();
				runtimeDependencies = dependencyIds(manifest);
			},
			config() {
				return {
					build: {
						rollupOptions: {
							external: (id) =>
								[...runtimeDependencies].some(
									(dependency) => id === dependency || id.startsWith(`${dependency}/`)
								)
						}
					}
				};
			},
			writeBundle(_options, bundle) {
				for (const output of Object.values(bundle)) {
					if (output.type !== 'chunk') continue;
					assertNoRuntimePluginImports(manifest.id, runtimeDependencies, [
						...output.imports,
						...output.dynamicImports
					]);
				}
				if (!outDir) throw new Error('Vite output directory was not resolved.');
				mkdirSync(outDir, { recursive: true });
				copyFileSync(manifestPath, resolve(outDir, 'zadmin.plugin.json'));
			}
		}
	];
}

function dependencyIds(manifest: ReturnType<typeof parsePluginManifest>): Set<string> {
	return new Set([...Object.keys(manifest.requires), ...Object.keys(manifest.optional)]);
}

export function assertNoRuntimePluginImports(
	pluginId: string,
	dependencies: ReadonlySet<string>,
	imports: readonly string[]
): void {
	for (const imported of imports) {
		const dependency = [...dependencies].find(
			(id) => imported === id || imported.startsWith(`${id}/`)
		);
		if (dependency) {
			throw new Error(
				`${pluginId} imports runtime code from ${dependency}; use import type and inject it through the container.`
			);
		}
	}
}
