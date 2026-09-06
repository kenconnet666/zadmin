import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

/** Avoid needless HMR/indexing and tolerate short Windows IDE/antivirus sharing locks. */
export async function writeGeneratedFile(path, content) {
	try {
		if ((await readFile(path, 'utf8')) === content) return;
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
	for (let attempt = 0; ; attempt += 1) {
		try {
			await writeFile(path, content, 'utf8');
			return;
		} catch (error) {
			if (
				process.platform !== 'win32' ||
				attempt >= 4 ||
				!['EBUSY', 'EPERM', 'UNKNOWN'].includes(error.code)
			)
				throw error;
			await setTimeout(50 * 2 ** attempt);
		}
	}
}
