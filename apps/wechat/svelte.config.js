/** @type {import('svelte/compiler').ModuleCompileOptions} */
const compilerOptions = {
	dev: process.env.NODE_ENV !== 'production',
	generate: 'client',
	runes: true
};

export default { compilerOptions };
