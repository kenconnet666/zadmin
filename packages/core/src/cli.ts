#!/usr/bin/env node
import { resolve } from 'node:path';
import { packPluginArtifact } from './artifact/installed.ts';
import { validatePluginPackage } from './artifact/validation.ts';

const [command, source, destination] = process.argv.slice(2);

switch (command) {
	case 'validate':
		if (!source) usage();
		await validatePluginPackage(resolve(source));
		console.log(resolve(source));
		break;
	case 'pack':
		if (!source || !destination) usage();
		await validatePluginPackage(resolve(source));
		await packPluginArtifact(resolve(source), resolve(destination));
		console.log(resolve(destination));
		break;
	default:
		usage();
}

function usage(): never {
	console.error(
		'Usage:\n  zadmin-plugin validate <artifact-directory>\n  zadmin-plugin pack <artifact-directory> <output.zplugin>'
	);
	process.exit(2);
}
