import type { IcssCompilerDiagnostic } from './types.ts';

export function createDiagnostic(
	code: IcssCompilerDiagnostic['code'],
	message: string,
	start: number,
	end: number,
	filename?: string
): IcssCompilerDiagnostic {
	return { code, end, filename, message, start };
}
