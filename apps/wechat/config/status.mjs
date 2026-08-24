import { appendFile, mkdir, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * @typedef {object} BuildState
 * @property {string | null} buildId
 * @property {number | null} durationMs
 * @property {string | null} endedAt
 * @property {string | null} error
 * @property {string} phase
 * @property {string | null} restartReason
 * @property {string | null} source
 * @property {string | null} startedAt
 * @property {boolean | null} success
 * @property {number} watcherCount
 */

export class BuildStatusStore {
	/** @type {Promise<void>} */
	#pending = Promise.resolve();
	#sequence = 0;
	/** @type {BuildState} */
	#state = {
		buildId: null,
		durationMs: null,
		endedAt: null,
		error: null,
		phase: 'starting',
		restartReason: null,
		source: null,
		startedAt: null,
		success: null,
		watcherCount: 0
	};
	/** @type {string} */
	#directory;
	/** @type {string} */
	#eventsPath;
	/** @type {() => Date} */
	#now;
	/** @type {string} */
	#statusPath;

	/**
	 * @param {string} appRoot
	 * @param {() => Date} [now]
	 */
	constructor(appRoot, now = () => new Date()) {
		this.#directory = resolve(appRoot, '.wechat');
		this.#eventsPath = resolve(this.#directory, 'build-events.jsonl');
		this.#statusPath = resolve(this.#directory, 'build-status.json');
		this.#now = now;
	}

	get snapshot() {
		return Object.freeze({ ...this.#state });
	}

	/** @param {number} watcherCount */
	async initialize(watcherCount) {
		await mkdir(this.#directory, { recursive: true });
		await this.update({ phase: 'ready', watcherCount });
	}

	/** @param {string} source */
	async begin(source) {
		await this.update({
			durationMs: null,
			endedAt: null,
			error: null,
			phase: 'building',
			source,
			startedAt: this.#now().toISOString(),
			success: null
		});
	}

	/** @param {string} buildId */
	async success(buildId) {
		const endedAt = this.#now();
		const startedAt = this.#state.startedAt === null ? endedAt : new Date(this.#state.startedAt);
		await this.update({
			buildId,
			durationMs: Math.max(0, endedAt.getTime() - startedAt.getTime()),
			endedAt: endedAt.toISOString(),
			error: null,
			phase: 'ready',
			success: true
		});
	}

	/** @param {unknown} error */
	async failure(error) {
		const endedAt = this.#now();
		const startedAt = this.#state.startedAt === null ? endedAt : new Date(this.#state.startedAt);
		await this.update({
			durationMs: Math.max(0, endedAt.getTime() - startedAt.getTime()),
			endedAt: endedAt.toISOString(),
			error: error instanceof Error ? error.message : String(error),
			phase: 'failed',
			success: false
		});
	}

	/** @param {string} reason */
	async restart(reason) {
		await this.update({ phase: 'restarting', restartReason: reason });
	}

	/**
	 * @param {string} type
	 * @param {Record<string, unknown>} [details]
	 */
	async record(type, details = {}) {
		await mkdir(this.#directory, { recursive: true });
		await appendFile(
			this.#eventsPath,
			`${JSON.stringify({ at: this.#now().toISOString(), details, type })}\n`,
			'utf8'
		);
	}

	/** @param {Partial<BuildState>} patch */
	async update(patch) {
		this.#pending = this.#pending.then(async () => {
			this.#state = { ...this.#state, ...patch };
			await mkdir(this.#directory, { recursive: true });
			const temporary = `${this.#statusPath}.${process.pid}.${++this.#sequence}.tmp`;
			await writeFile(temporary, `${JSON.stringify(this.#state, null, '\t')}\n`, 'utf8');
			await rename(temporary, this.#statusPath);
			await this.record('status', patch);
		});
		await this.#pending;
	}
}
