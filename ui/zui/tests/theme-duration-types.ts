import type { DeepPartial, ZuiTheme } from '../src/entrypoints/index.js';

const valid: DeepPartial<ZuiTheme> = {
	duration: { normal: '0.2s' }
};
void valid;

// @ts-expect-error Duration tokens intentionally reject calc() and var() expressions.
const invalid: DeepPartial<ZuiTheme> = { duration: { normal: 'calc(100ms + 20ms)' } };
void invalid;
