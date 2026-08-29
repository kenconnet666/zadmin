import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { format } from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const definition = JSON.parse(
	await readFile(resolve(root, 'protocol/desktop.protocol.json'), 'utf8')
);
const types = definition.types;
const methods = Object.keys(definition.methods);
const events = definition.events;
const primitiveTs = { boolean: 'boolean', integer: 'number', number: 'number', string: 'string' };
const primitiveCs = { boolean: 'bool', integer: 'int', number: 'double', string: 'string' };
const pascal = (value) =>
	value.replace(/(^|[.-])([a-z])/g, (_, _separator, letter) => letter.toUpperCase());

function optional(ref) {
	return typeof ref === 'object' && ref !== null && 'optional' in ref;
}

function valueRef(ref) {
	return optional(ref) ? ref.optional : ref;
}

function tsType(ref) {
	ref = valueRef(ref);
	if (typeof ref === 'string') return primitiveTs[ref] ?? ref;
	if ('array' in ref) return `readonly ${tsType(ref.array)}[]`;
	if ('record' in ref) return `Readonly<Record<string, ${tsType(ref.record)}>>`;
	if ('nullable' in ref) return `${tsType(ref.nullable)} | null`;
	if ('literal' in ref) return JSON.stringify(ref.literal);
	throw new TypeError(`Unsupported TypeScript protocol reference: ${JSON.stringify(ref)}`);
}

function tsDeclaration(name, schema) {
	if (schema.kind === 'void') return `export type ${name} = undefined;`;
	if (schema.kind === 'json') {
		return `export type ${name} = null | boolean | number | string | ${name}[] | { [key: string]: ${name} };`;
	}
	if (schema.kind === 'enum') {
		return `export type ${name} = ${schema.values.map(JSON.stringify).join(' | ')};`;
	}
	const entries = Object.entries(schema.properties);
	if (entries.length === 0) return `export type ${name} = Record<string, never>;`;
	const properties = entries
		.map(([property, ref]) => `\treadonly ${property}${optional(ref) ? '?' : ''}: ${tsType(ref)};`)
		.join('\n');
	const object = `{\n${properties}\n}`;
	return schema.nullable
		? `export type ${name} = ${object} | null;`
		: `export interface ${name} ${object}`;
}

function csType(ref) {
	let isOptional = optional(ref);
	ref = valueRef(ref);
	let output;
	if (typeof ref === 'string') {
		output =
			ref === 'JsonValue'
				? 'JsonNode?'
				: (primitiveCs[ref] ?? (types[ref]?.kind === 'enum' ? 'string' : ref));
	} else if ('array' in ref) {
		output = `IReadOnlyList<${csType(ref.array)}>`;
	} else if ('record' in ref) {
		output = `IReadOnlyDictionary<string, ${csType(ref.record)}>`;
	} else if ('nullable' in ref) {
		output = csType(ref.nullable);
		isOptional ||= true;
	} else if ('literal' in ref) {
		output = 'bool';
	} else {
		throw new TypeError(`Unsupported C# protocol reference: ${JSON.stringify(ref)}`);
	}
	if (isOptional && !output.endsWith('?')) output += '?';
	return output;
}

function csDeclaration(name, schema) {
	if (schema.kind === 'void' || schema.kind === 'json') return '';
	if (schema.kind === 'enum') {
		return `public static class ${name}Values\n{\n${schema.values
			.map((value) => `    public const string ${pascal(value)} = "${value}";`)
			.join('\n')}\n}`;
	}
	const entries = Object.entries(schema.properties).sort(
		([, left], [, right]) => Number(optional(left)) - Number(optional(right))
	);
	if (entries.length === 0) return `public sealed record ${name};`;
	const properties = entries
		.map(([property, ref]) => {
			const suffix = optional(ref) ? ' = null' : '';
			const required = optional(ref) ? '' : 'JsonRequired, ';
			return `    [property: ${required}JsonPropertyName("${property}")] ${csType(ref)} ${pascal(property)}${suffix}`;
		})
		.join(',\n');
	return `public sealed record ${name}(\n${properties});`;
}

function csTypeOf(name) {
	if (name === 'Void') return 'typeof(void)';
	if (name === 'JsonValue') return 'typeof(JsonNode)';
	if (types[name]?.kind === 'enum') return 'typeof(string)';
	return `typeof(${name})`;
}

const tsDeclarations = Object.entries(types)
	.map(([name, schema]) => tsDeclaration(name, schema))
	.join('\n\n');
const csDeclarations = Object.entries(types)
	.map(([name, schema]) => csDeclaration(name, schema))
	.filter(Boolean)
	.join('\n\n');

const ts = await format(
	`// Generated from protocol/desktop.protocol.json. Do not edit.

${tsDeclarations}

export const WEBVIEW_PROTOCOL_VERSION = ${definition.version} as const;
export const WEBVIEW_MAX_MESSAGE_BYTES = ${definition.maxMessageBytes} as const;
export const webviewProtocolMethods = ${JSON.stringify(methods, null, '\t')} as const;
export const webviewProtocolEvents = ${JSON.stringify(events, null, '\t')} as const;

export type WebviewMethod = (typeof webviewProtocolMethods)[number];
export type WebviewEventTopic = (typeof webviewProtocolEvents)[number];

export interface WebviewMethodMap {
${methods.map((method) => `\t'${method}': { params: ${definition.methods[method].params}; result: ${definition.methods[method].result} };`).join('\n')}
}

export type WebviewRequest = {
	v: typeof WEBVIEW_PROTOCOL_VERSION;
	kind: 'request';
	id: string;
	method: WebviewMethod;
	params: unknown;
};
export type WebviewResponse =
	| { v: typeof WEBVIEW_PROTOCOL_VERSION; kind: 'response'; id: string; ok: true; result: unknown }
	| { v: typeof WEBVIEW_PROTOCOL_VERSION; kind: 'response'; id: string; ok: false; error: DesktopError };
export type WebviewEvent = {
	v: typeof WEBVIEW_PROTOCOL_VERSION;
	kind: 'event';
	topic: WebviewEventTopic;
	payload: unknown;
};
export type WebviewCancel = { v: typeof WEBVIEW_PROTOCOL_VERSION; kind: 'cancel'; id: string };
export type WebviewDispose = { v: typeof WEBVIEW_PROTOCOL_VERSION; kind: 'dispose'; handle: string };
export type WebviewMessage = WebviewRequest | WebviewResponse | WebviewEvent | WebviewCancel | WebviewDispose;
`,
	{ parser: 'typescript', printWidth: 100, singleQuote: true, trailingComma: 'none', useTabs: true }
);

const cs = `// <auto-generated />
#nullable enable
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace ZAdmin.WebView.Core.Generated;

${csDeclarations}

public sealed record ProtocolMethodDescriptor(string Name, Type ParamsType, Type ResultType);

public static class WebViewProtocol
{
    public const int Version = ${definition.version};
    public const int MaxMessageBytes = ${definition.maxMessageBytes};
${methods.map((method) => `    public const string ${pascal(method)} = "${method}";`).join('\n')}
    public static readonly IReadOnlyDictionary<string, ProtocolMethodDescriptor> Descriptors =
        new Dictionary<string, ProtocolMethodDescriptor>(StringComparer.Ordinal)
        {
${methods
	.map(
		(method) =>
			`            [${pascal(method)}] = new(${pascal(method)}, ${csTypeOf(definition.methods[method].params)}, ${csTypeOf(definition.methods[method].result)}),`
	)
	.join('\n')}
        };
    public static readonly IReadOnlySet<string> Methods =
        Descriptors.Keys.ToHashSet(StringComparer.Ordinal);
}

public sealed record ProtocolRequest(
    [property: JsonPropertyName("v")] int Version,
    [property: JsonPropertyName("kind")] string Kind,
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("method")] string Method,
    [property: JsonPropertyName("params")] JsonNode? Params);
`;

const outputs = [
	[resolve(root, 'src/generated/protocol.ts'), ts],
	[resolve(root, 'dotnet/ZAdmin.WebView.Core/Protocol.g.cs'), cs]
];
const check = process.argv.includes('--check');
let stale = false;
for (const [path, content] of outputs) {
	if (check) {
		const current = await readFile(path, 'utf8').catch(() => '');
		if (current.replaceAll('\r\n', '\n') !== content.replaceAll('\r\n', '\n')) {
			console.error(`Generated protocol is stale: ${path}`);
			stale = true;
		}
	} else {
		await mkdir(dirname(path), { recursive: true });
		await writeFile(path, content, 'utf8');
	}
}
if (stale) process.exitCode = 1;
else {
	console.log(
		`${check ? 'Verified' : 'Generated'} ${methods.length} WebView methods and ${Object.keys(types).length} DTO types.`
	);
}
