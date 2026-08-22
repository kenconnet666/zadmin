import { homedir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';

export function resolvePluginDataRoot(environment: NodeJS.ProcessEnv = process.env): string {
	const configured = environment.ZADMIN_DATA_DIR;
	if (configured) {
		if (!isAbsolute(configured)) throw new Error('ZADMIN_DATA_DIR must be an absolute path.');
		return join(resolve(configured), 'apps', 'admin', 'plugins');
	}
	const base =
		process.platform === 'win32'
			? (environment.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'))
			: (environment.XDG_DATA_HOME ?? join(homedir(), '.local', 'share'));
	return join(base, 'ZAdmin', 'apps', 'admin', 'plugins');
}
