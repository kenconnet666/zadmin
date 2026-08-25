import assert from 'node:assert/strict';
import test from 'node:test';

test('safe probe worker echoes the request id and readiness result', async () => {
	/** @type {((event: { message: { payload: string; requestId: string } }) => void) | undefined} */
	let listener;
	/** @type {Array<{ ready: boolean; requestId: string }>} */
	const messages = [];
	Reflect.set(globalThis, 'worker', {
		/** @param {(event: { message: { payload: string; requestId: string } }) => void} callback */
		onMessage(callback) {
			listener = callback;
		},
		/** @param {{ ready: boolean; requestId: string }} message */
		postMessage(message) {
			messages.push(message);
		}
	});
	try {
		await import(new URL(`../src/workers/safe-probe.js?test=${Date.now()}`, import.meta.url).href);
		if (listener === undefined) throw new Error('Worker listener was not registered.');
		listener({ message: { payload: 'ping', requestId: 'request-1' } });
		assert.deepEqual(messages, [{ ready: true, requestId: 'request-1' }]);
	} finally {
		Reflect.deleteProperty(globalThis, 'worker');
	}
});
