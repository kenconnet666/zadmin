<script lang="ts">
	import { ZCode } from '../src/entrypoints/code.js';
	import { ZProvider, defaultTheme, defineTheme } from '../src/entrypoints/index.js';
	const multilineCode = 'const first = 1;\n\nconst second = 2;';

	const customTheme = defineTheme({
		...defaultTheme,
		fontSize: { ...defaultTheme.fontSize, medium: 17 }
	});
</script>

<ZCode code="inline default" data-testid="inline-default" inline />
<ZCode code="inline medium" data-testid="inline-medium" inline size="medium" />
<ZCode code="block default" data-testid="block-default" />
<ZCode code="block small" data-testid="block-small" size="small" />
<ZCode code={multilineCode} copyable data-testid="copyable-block" wrap />

<ZProvider theme={customTheme}>
	<ZCode code="custom block medium" data-testid="custom-block-default" />
	<ZCode code="custom inline medium" data-testid="custom-inline-medium" inline size="medium" />
</ZProvider>
