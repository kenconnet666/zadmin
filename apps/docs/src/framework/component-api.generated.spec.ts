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
});
