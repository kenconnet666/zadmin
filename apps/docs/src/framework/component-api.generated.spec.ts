import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import type { ComponentApiFacts } from './component-api.js';
import * as generatedFacts from './component-api.generated.js';

describe('generated component API facts', () => {
	it('keeps every displayed prop type syntactically valid TypeScript', () => {
		for (const fact of Object.values(generatedFacts) as ComponentApiFacts[]) {
			for (const prop of fact.props) {
				const result = ts.transpileModule(`type GeneratedProp = ${prop.type};`, {
					compilerOptions: { target: ts.ScriptTarget.Latest },
					fileName: `${fact.id}-${prop.name}.ts`,
					reportDiagnostics: true
				});
				const errors = (result.diagnostics ?? []).filter(
					(diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
				);
				expect(errors, `${fact.name}.${prop.name}: ${prop.type}`).toEqual([]);
			}
		}
	});

	it('attaches acyclic member facts only to compound family roots', () => {
		for (const fact of Object.values(generatedFacts) as ComponentApiFacts[]) {
			const members = fact.members?.() ?? [];
			if (members.length === 0) continue;
			const directory = fact.source.slice(0, fact.source.lastIndexOf('/'));
			expect(fact.id).toBe(directory.slice(directory.lastIndexOf('/') + 1));
			expect(new Set(members.map(({ id }) => id)).size).toBe(members.length);
			for (const member of members) {
				expect(member.id).not.toBe(fact.id);
				expect(member.source.slice(0, member.source.lastIndexOf('/'))).toBe(directory);
				expect(member.members).toBeUndefined();
			}
		}
	});
});
