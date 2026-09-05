<script lang="ts">
	import {
		ZCombobox,
		ZComboboxContent,
		ZComboboxInput,
		ZComboboxItem,
		ZMenu,
		ZMenuCheckboxItem,
		ZMenuItem,
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectItem,
		ZMultiSelectTrigger,
		ZProvider,
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger,
		defineTheme,
		defaultTheme
	} from '../src/entrypoints/index.js';
	import { neonDark } from '../src/entrypoints/themes.js';

	const customTheme = defineTheme({
		...defaultTheme,
		color: {
			...defaultTheme.color,
			primarySubtle: '#102030',
			primarySubtleHover: '#203040',
			surfaceHover: '#304050'
		}
	});
</script>

<ZProvider colorScheme="dark" theme={neonDark} density="comfortable">
	<div data-testid="default-dark">
		<ZMenu>
			<ZMenuItem data-testid="default-menu-item" value="plain">Plain</ZMenuItem>
			<ZMenuCheckboxItem checked data-testid="default-menu-selected" value="selected">
				Selected
			</ZMenuCheckboxItem>
		</ZMenu>
	</div>
</ZProvider>

<ZProvider theme={customTheme} colorScheme="light">
	<div data-testid="custom-theme">
		<ZSelect defaultOpen defaultValue="selected" open>
			<ZSelectTrigger aria-label="Custom select" />
			<ZSelectContent>
				<ZSelectItem data-testid="select-selected" value="selected">Selected</ZSelectItem>
				<ZSelectItem data-testid="select-plain" value="plain">Plain</ZSelectItem>
			</ZSelectContent>
		</ZSelect>

		<ZMultiSelect defaultOpen defaultValue={['selected']} open>
			<ZMultiSelectTrigger aria-label="Custom multi" />
			<ZMultiSelectContent>
				<ZMultiSelectItem data-testid="multi-selected" value="selected">Selected</ZMultiSelectItem>
				<ZMultiSelectItem data-testid="multi-plain" value="plain">Plain</ZMultiSelectItem>
			</ZMultiSelectContent>
		</ZMultiSelect>

		<ZCombobox defaultOpen defaultValue="selected" open shouldFilter={false}>
			<ZComboboxInput aria-label="Custom combo" />
			<ZComboboxContent>
				<ZComboboxItem data-testid="combo-selected" value="selected">Selected</ZComboboxItem>
				<ZComboboxItem data-testid="combo-plain" value="plain">Plain</ZComboboxItem>
			</ZComboboxContent>
		</ZCombobox>

		<ZMenu>
			<ZMenuItem data-testid="menu-selected" checked value="selected">Selected</ZMenuItem>
			<ZMenuItem data-testid="menu-plain" value="plain">Plain</ZMenuItem>
		</ZMenu>
	</div>
</ZProvider>
