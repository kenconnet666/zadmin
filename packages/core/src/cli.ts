#!/usr/bin/env node
import { resolve } from 'node:path';
import { packPluginArtifact } from './installed.ts';

const [command, source, destination] = process.argv.slice(2);

if (command !== 'pack' || !source || !destination) {
	console.error('Usage: zadmin-plugin pack <artifact-directory> <output.zplugin>');
	process.exitCode = 2;
} else {
	await packPluginArtifact(resolve(source), resolve(destination));
	console.log(resolve(destination));
}
