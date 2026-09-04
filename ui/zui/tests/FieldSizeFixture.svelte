<script lang="ts">
	import {
		ZCheckbox,
		ZField,
		ZInput,
		ZProvider,
		ZSlider,
		ZSwitch,
		ZTextarea
	} from '../src/entrypoints/index.js';
</script>

<ZProvider density="compact">
	<ZField data-testid="field-owner-provider" label="Provider fallback">
		<ZInput data-testid="field-size-provider" />
	</ZField>
	<ZField data-testid="field-owner-large" label="Explicit control" size="large">
		<ZInput data-testid="field-size-explicit" size="small" />
	</ZField>
	<ZField label="Textarea" size="large">
		<ZTextarea data-testid="field-size-textarea" />
	</ZField>
	<ZField label="Switch" size="large">
		<ZSwitch data-testid="field-size-switch" />
	</ZField>
	<ZField label="Checkbox" size="large">
		<ZCheckbox data-testid="field-size-checkbox" />
	</ZField>
	<ZField label="Slider" size="large">
		<ZSlider data-testid="field-size-slider" />
	</ZField>
</ZProvider>
