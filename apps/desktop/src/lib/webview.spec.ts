import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const appRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const workspaceRoot = resolve(appRoot, '../..');
const read = (path: string) => readFile(resolve(appRoot, path), 'utf8');

describe('C# WebView2 desktop host', () => {
	it('uses the WebView package without Tauri runtime dependencies', async () => {
		const packageJson = JSON.parse(await read('package.json'));
		expect(packageJson.dependencies).toHaveProperty('@zadmin/webview');
		expect(JSON.stringify(packageJson)).not.toMatch(/@tauri|rust:|tauri:/iu);
		expect(await read('src/routes/+layout.svelte')).toContain('@zadmin/webview');
		expect(await read('src/routes/+page.svelte')).not.toMatch(/@tauri|\bTauri\b/u);
	});

	it('locks Windows App SDK, WebView2 and ordinary-user execution', async () => {
		const project = await readFile(
			resolve(workspaceRoot, 'ui/webview/targets/windows/dotnet/ZAdmin.WebView.Windows.csproj'),
			'utf8'
		);
		const manifest = await readFile(
			resolve(workspaceRoot, 'ui/webview/targets/windows/dotnet/app.manifest'),
			'utf8'
		);
		expect(project).toContain('Microsoft.WindowsAppSDK" Version="2.4.0"');
		expect(project).toContain('Microsoft.Web.WebView2" Version="1.0.4129.50"');
		expect(manifest).toContain('level="asInvoker"');
	});

	it('uses hexadecimal asset hashes and one explicit Windows target', async () => {
		expect(await read('vite.config.ts')).toContain("hashCharacters: 'hex'");
		const config = await read('webview.config.ts');
		expect(config).toContain("'windows-x64'");
		expect(config).not.toContain('macos');
		expect(config).not.toContain('linux');
	});
});
