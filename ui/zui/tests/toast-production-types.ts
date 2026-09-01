import {
	createToastQueue,
	type ToastTaskOptions,
	type ToastUpdate
} from '../src/entrypoints/index.js';

const queue = createToastQueue({ maxVisible: 2 });
const update = { description: undefined, title: 'Ready', tone: 'success' } satisfies ToastUpdate;
const stages = {
	error: (error: Error) => ({ description: error.message, title: 'Failed' }),
	id: 'typed-task',
	loading: { duration: null, title: 'Loading' },
	success: (value: { version: string }) => `Released ${value.version}`
} satisfies ToastTaskOptions<{ version: string }, Error>;

const id: string = queue.task(Promise.resolve({ version: '1.0.0' }), stages);
const updated: boolean = queue.update(id, update);
void updated;
