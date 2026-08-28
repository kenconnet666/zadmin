<script lang="ts" generics="TTheme extends ThemeSchema = DefaultTheme">
	import { defaultTheme, type DefaultTheme, type ThemeSchema } from '@zadmin/zui/core';

	import { provideZuiTaroTheme } from '../runtime/index.ts';
	import type { ProviderProps } from './types.ts';

	let { children, theme }: ProviderProps<TTheme> = $props();
	const resolvedTheme = $derived(theme ?? (defaultTheme as unknown as TTheme));
	provideZuiTaroTheme(() => resolvedTheme);
</script>

{@render children?.()}
