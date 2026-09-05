<script module lang="ts">
	import { defineRecipe } from '../src/entrypoints/index.js';
	const responsiveRecipe = defineRecipe({
		base: (s) => {
			s.width.px(120);
			s._media({ max: 'small' }, (small) => small.width.px(240));
			s.backgroundColor._canvas;
		},
		variants: {}
	});
	const systemRecipe = defineRecipe({
		base: (s) => {
			s.color.canvasText;
			s.backgroundColor.canvas;
		},
		variants: {}
	});
</script>

<script lang="ts">
	import {
		defaultTheme,
		extendTheme,
		useZui,
		ZButton,
		ZProvider
	} from '../src/entrypoints/index.js';
	const theme = extendTheme(defaultTheme, {
		breakpoint: { small: '2000px' },
		focusOffset: { outer: 5 },
		easing: { standard: 'linear' },
		color: { canvas: '#112233' }
	});
	const zui = useZui();
	const responsiveClass = zui.runtime.recipe(theme, responsiveRecipe);
	const systemClass = zui.runtime.recipe(theme, systemRecipe);
</script>

<div class={responsiveClass} data-testid="responsive">Theme breakpoint</div>
<div class={systemClass} data-testid="system">System colors</div>
<div style="color: CanvasText; background-color: Canvas;" data-testid="system-reference">
	Reference
</div>
<ZProvider {theme}><ZButton data-testid="focus">Theme focus and easing</ZButton></ZProvider>
