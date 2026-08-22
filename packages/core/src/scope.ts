import { ServiceScope } from './container/context.ts';

export * from './container/context.ts';

/** Compatibility scope for manually owned contributions and focused tests. */
export class PluginScope extends ServiceScope<undefined> {
	constructor(id: string) {
		super({ moduleId: id, generation: 'manual', kind: 'plugin', config: undefined });
	}
}
