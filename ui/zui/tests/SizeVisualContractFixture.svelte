<script lang="ts">
	import {
		ZButton,
		ZCheckbox,
		ZAvatar,
		ZBadge,
		ZInput,
		ZNumberField,
		ZPinInput,
		ZSlider,
		ZSpinner,
		ZSwitch,
		ZTextarea,
		ZTag,
		ZIcon,
		ZText,
		ZHeading,
		ZContainer,
		ZForm,
		ZFormField,
		ZInputGroup
	} from '../src/entrypoints/index.js';
</script>

<div data-testid="size-visual-contract">
	<div data-testid="size-buttons">
		<ZButton data-testid="button-small" size="small">Small</ZButton>
		<ZButton data-testid="button-medium" size="medium">Medium</ZButton>
		<ZButton data-testid="button-large" size="large">Large</ZButton>
	</div>
	<div data-testid="size-inputs">
		<ZInput aria-label="small input" data-testid="input-small" size="small" />
		<ZInput aria-label="medium input" data-testid="input-medium" size="medium" />
		<ZInput aria-label="large input" data-testid="input-large" size="large" />
		<ZTextarea aria-label="small textarea" data-testid="textarea-small" size="small" />
		<ZTextarea aria-label="medium textarea" data-testid="textarea-medium" size="medium" />
		<ZTextarea aria-label="large textarea" data-testid="textarea-large" size="large" />
	</div>
	<div data-testid="size-native-controls">
		<ZCheckbox aria-label="small checkbox" data-testid="checkbox-small" size="small" />
		<ZCheckbox aria-label="medium checkbox" data-testid="checkbox-medium" size="medium" />
		<ZCheckbox aria-label="large checkbox" data-testid="checkbox-large" size="large" />
		<ZSwitch aria-label="small switch" data-testid="switch-small" size="small" />
		<ZSwitch aria-label="medium switch" data-testid="switch-medium" size="medium" />
		<ZSwitch aria-label="large switch" data-testid="switch-large" size="large" />
		<ZSlider aria-label="small slider" data-testid="slider-small" size="small" />
		<ZSlider aria-label="medium slider" data-testid="slider-medium" size="medium" />
		<ZSlider aria-label="large slider" data-testid="slider-large" size="large" />
	</div>
	<div data-testid="size-composites">
		<ZNumberField aria-label="small number" data-testid="number-small" size="small" />
		<ZNumberField aria-label="medium number" data-testid="number-medium" size="medium" />
		<ZNumberField aria-label="large number" data-testid="number-large" size="large" />
		<ZPinInput aria-label="small pin" data-testid="pin-small" size="small" />
		<ZPinInput aria-label="medium pin" data-testid="pin-medium" size="medium" />
		<ZPinInput aria-label="large pin" data-testid="pin-large" size="large" />
	</div>
	<div data-testid="size-display">
		<ZTag data-testid="tag-small" size="small">Small tag</ZTag>
		<ZTag data-testid="tag-medium" size="medium">Medium tag</ZTag>
		<ZBadge data-testid="badge-small" count={3} size="small" />
		<ZBadge data-testid="badge-medium" count={3} size="medium" />
		<ZAvatar alt="small avatar" data-testid="avatar-small" fallbackText="S" size="small" />
		<ZAvatar alt="medium avatar" data-testid="avatar-medium" fallbackText="M" size="medium" />
		<ZAvatar alt="large avatar" data-testid="avatar-large" fallbackText="L" size="large" />
		<ZSpinner aria-label="small spinner" data-testid="spinner-small" size="small" />
		<ZSpinner aria-label="medium spinner" data-testid="spinner-medium" size="medium" />
		<ZSpinner aria-label="large spinner" data-testid="spinner-large" size="large" />
		<ZIcon data-testid="icon-small" name="check" size="small" />
		<ZIcon data-testid="icon-medium" name="check" size="medium" />
		<ZIcon data-testid="icon-large" name="check" size="large" />
	</div>
	<div data-testid="size-typography">
		<ZText data-testid="text-small" size="small">Small text</ZText>
		<ZText data-testid="text-medium" size="medium">Medium text</ZText>
		<ZText data-testid="text-large" size="large">Large text</ZText>
		<ZHeading data-testid="heading-small" level={3} size="small">Small heading</ZHeading>
		<ZHeading data-testid="heading-medium" level={3} size="medium">Medium heading</ZHeading>
		<ZHeading data-testid="heading-large" level={3} size="large">Large heading</ZHeading>
	</div>
	<div data-testid="size-surface">
		<ZContainer data-testid="container-small" size="small">Small container</ZContainer>
		<ZContainer data-testid="container-medium" size="medium">Medium container</ZContainer>
		<ZContainer data-testid="container-large" size="large">Large container</ZContainer>
	</div>
	<div data-testid="size-form-family">
		<ZForm data-testid="form-large" size="large">
			<ZInput aria-label="form inherited input" data-testid="form-input" />
			<ZFormField label="Managed input" name="managed-input">
				<ZInput aria-label="form field inherited input" data-testid="form-field-input" />
			</ZFormField>
		</ZForm>
		<ZInputGroup aria-label="group small" data-testid="group-small" size="small">
			<ZInput aria-label="group input" data-testid="group-input" />
		</ZInputGroup>
	</div>
</div>
