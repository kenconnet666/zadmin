import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(appRoot, 'dist/wechat');
const [appConfigText, worker] = await Promise.all([
	readFile(resolve(outputRoot, 'app.json'), 'utf8'),
	readFile(resolve(outputRoot, 'workers/safe-probe.js'), 'utf8')
]);
/** @type {{ workers?: string }} */
const appConfig = JSON.parse(appConfigText);

if (appConfig.workers !== 'workers') {
	throw new Error('Production app.json does not declare the safe-probe worker directory.');
}
if (!worker.includes('worker.onMessage') || !worker.includes('worker.postMessage')) {
	throw new Error('Production safe-probe worker output is incomplete.');
}

console.log('[wechat] Verified production Worker declaration and output.');
