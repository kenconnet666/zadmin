import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const child = spawn(
	'dotnet',
	[
		'run',
		'--project',
		resolve(root, 'dotnet/ZAdmin.WebView.Core.Tests/ZAdmin.WebView.Core.Tests.csproj'),
		'--configuration',
		'Release'
	],
	{
		cwd: root,
		env: { ...process.env, DOTNET_ROLL_FORWARD: 'Major' },
		stdio: 'inherit',
		windowsHide: true
	}
);
child.once('error', (error) => {
	console.error(error);
	process.exitCode = 1;
});
child.once('exit', (code) => {
	process.exitCode = code ?? 1;
});
