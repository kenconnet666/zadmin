import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [appConfig, worker] = await Promise.all([
	readFile(resolve(appRoot, 'dist/app.json'), 'utf8').then(JSON.parse),
	readFile(resolve(appRoot, 'dist/workers/safe-probe.js'), 'utf8')
]);

if (appConfig.workers !== 'workers') {
	throw new Error('Production app.json does not declare the safe-probe worker directory.');
}
if (!worker.includes('worker.onMessage') || !worker.includes('worker.postMessage')) {
	throw new Error('Production safe-probe worker output is incomplete.');
}

console.log('[wechat] Verified production Worker declaration and output.');
