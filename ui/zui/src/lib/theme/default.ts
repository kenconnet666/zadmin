import { defineTheme } from './define.js';
import { DEFAULT_THEME_SCHEMA } from './schema.js';

export const defaultTheme = defineTheme(DEFAULT_THEME_SCHEMA);

export type DefaultTheme = typeof defaultTheme;
