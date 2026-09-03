import { pathToFileURL } from 'node:url';

const revisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const componentSource = 'apps/desktop/src/routes/+page.svelte';
const noSideEffects = Object.freeze({
	bridge: 'none',
	filesystem: 'none',
	network: 'none',
	window: 'none'
});
export const desktopComponentContracts = Object.freeze([
	{
		id: 'box',
		name: 'ZBox',
		marker: 'ZBox-status',
		native: { tag: 'DIV', ariaLive: 'polite' }
	},
	{ id: 'stack', name: 'ZStack', marker: 'ZStack', native: { tag: 'DIV' } },
	{
		id: 'text',
		name: 'ZText',
		marker: 'ZText',
		native: { tag: 'STRONG', text: 'Windows WebView2 capability lab' }
	},
	{
		id: 'button',
		name: 'ZButton',
		marker: 'ZButton-component-action',
		native: { tag: 'BUTTON', type: 'button', disabled: false, text: 'Verify component' },
		interaction: {
			id: 'activate-once',
			action: 'click',
			target: 'root',
			observations: [
				{
					id: 'runs-delta',
					kind: 'state',
					target: 'data-desktop-evidence-runs',
					expected: 1,
					read: (raw) => raw.page.componentActionDelta
				}
			]
		}
	},
	{
		id: 'form',
		name: 'ZForm',
		marker: 'ZForm-contract',
		native: { tag: 'FORM', noValidate: true },
		interaction: {
			id: 'submit-valid-form',
			action: 'submit',
			target: 'root',
			observations: [
				{
					id: 'submitted',
					kind: 'state',
					target: 'data-submitted',
					expected: true,
					read: (raw) => raw.formInteraction.formSubmitted
				},
				{
					id: 'submit-count',
					kind: 'count',
					target: 'onValidSubmit',
					expected: 1,
					read: (raw) => raw.formInteraction.submitCount
				},
				{
					id: 'form-data-email',
					kind: 'form-data',
					target: 'email',
					expected: 'desktop-value',
					read: (raw) => raw.formInteraction.formDataEmail
				},
				{
					id: 'form-data-enabled',
					kind: 'form-data',
					target: 'enabled',
					expected: 'enabled',
					read: (raw) => raw.formInteraction.formDataEnabled
				}
			]
		}
	},
	{
		id: 'form-field',
		name: 'ZFormField',
		marker: 'ZFormField-email',
		native: { tag: 'DIV' },
		interaction: {
			id: 'observe-input-state',
			action: 'fill-and-blur',
			target: 'descendant:ZInput',
			observations: [
				{
					id: 'dirty',
					kind: 'state',
					target: 'data-dirty',
					expected: true,
					read: (raw) => raw.formInteraction.fieldDirty
				},
				{
					id: 'touched',
					kind: 'state',
					target: 'data-touched',
					expected: true,
					read: (raw) => raw.formInteraction.fieldTouched
				}
			]
		}
	},
	{
		id: 'input',
		name: 'ZInput',
		marker: 'ZInput-email',
		native: {
			tag: 'INPUT',
			type: 'text',
			disabled: false,
			name: 'email',
			value: '',
			required: true,
			readOnly: false
		},
		interaction: {
			id: 'fill-email',
			action: 'fill',
			target: 'root',
			observations: [
				{
					id: 'value',
					kind: 'state',
					target: 'value',
					expected: 'desktop-value',
					read: (raw) => raw.formInteraction.inputValue
				},
				{
					id: 'label-relation',
					kind: 'relationship',
					target: 'labels',
					expected: true,
					read: (raw) => raw.formInteraction.inputLabelled
				},
				{
					id: 'description-relation',
					kind: 'relationship',
					target: 'aria-describedby',
					expected: true,
					read: (raw) => raw.formInteraction.inputDescriptionResolved
				}
			]
		}
	},
	{
		id: 'checkbox',
		name: 'ZCheckbox',
		marker: 'ZCheckbox-enabled',
		native: {
			tag: 'INPUT',
			type: 'checkbox',
			disabled: false,
			name: 'enabled',
			value: 'enabled',
			checked: false,
			dataState: 'unchecked'
		},
		interaction: {
			id: 'check-enabled',
			action: 'click',
			target: 'root',
			observations: [
				{
					id: 'checked',
					kind: 'state',
					target: 'checked',
					expected: true,
					read: (raw) => raw.formInteraction.checkboxChecked
				},
				{
					id: 'data-state',
					kind: 'state',
					target: 'data-state',
					expected: 'checked',
					read: (raw) => raw.formInteraction.checkboxState
				},
				{
					id: 'label-relation',
					kind: 'relationship',
					target: 'labels',
					expected: true,
					read: (raw) => raw.formInteraction.checkboxLabelled
				}
			]
		}
	},
	{
		id: 'switch',
		name: 'ZSwitch',
		marker: 'ZSwitch-enabled',
		native: {
			tag: 'INPUT',
			type: 'checkbox',
			role: 'switch',
			disabled: false,
			name: 'switchEnabled',
			value: 'enabled',
			checked: false,
			ariaChecked: 'false',
			dataState: 'unchecked'
		},
		interaction: {
			id: 'toggle-switch',
			action: 'click',
			target: 'root',
			observations: [
				{
					id: 'checked',
					kind: 'state',
					target: 'checked',
					expected: true,
					read: (raw) => raw.choiceInteraction.switchChecked
				},
				{
					id: 'data-state',
					kind: 'state',
					target: 'data-state',
					expected: 'checked',
					read: (raw) => raw.choiceInteraction.switchState
				},
				{
					id: 'aria-checked',
					kind: 'aria',
					target: 'aria-checked',
					expected: 'true',
					read: (raw) => raw.choiceInteraction.switchAriaChecked
				},
				{
					id: 'label-relation',
					kind: 'relationship',
					target: 'labels',
					expected: true,
					read: (raw) => raw.choiceInteraction.switchLabelled
				},
				{
					id: 'form-data',
					kind: 'form-data',
					target: 'switchEnabled',
					expected: 'enabled',
					read: (raw) => raw.choiceInteraction.switchFormData
				}
			]
		}
	},
	{
		id: 'radio-group',
		name: 'ZRadioGroup',
		marker: 'ZRadioGroup-mode',
		native: { tag: 'DIV', role: 'radiogroup', ariaOrientation: 'vertical' },
		interaction: {
			id: 'arrow-select',
			action: 'key:ArrowDown',
			target: 'descendant:value=standard',
			observations: [
				{
					id: 'selected-value',
					kind: 'form-data',
					target: 'mode',
					expected: 'advanced',
					read: (raw) => raw.choiceInteraction.radioValue
				},
				{
					id: 'disabled-skipped',
					kind: 'state',
					target: 'disabled-option',
					expected: true,
					read: (raw) => raw.choiceInteraction.disabledSkipped
				},
				{
					id: 'focus-moved',
					kind: 'relationship',
					target: 'activeElement',
					expected: true,
					read: (raw) => raw.choiceInteraction.advancedFocused
				}
			]
		}
	},
	{
		id: 'radio-group-item',
		name: 'ZRadioGroupItem',
		marker: 'ZRadioGroupItem-advanced',
		native: {
			tag: 'INPUT',
			type: 'radio',
			disabled: false,
			name: 'mode',
			value: 'advanced',
			checked: false,
			ariaChecked: 'false',
			tabIndex: -1,
			dataState: 'unchecked'
		},
		interaction: {
			id: 'receive-group-selection',
			action: 'keyboard-selection',
			target: 'root',
			observations: [
				{
					id: 'checked',
					kind: 'state',
					target: 'checked',
					expected: true,
					read: (raw) => raw.choiceInteraction.advancedChecked
				},
				{
					id: 'data-state',
					kind: 'state',
					target: 'data-state',
					expected: 'checked',
					read: (raw) => raw.choiceInteraction.advancedState
				},
				{
					id: 'aria-checked',
					kind: 'aria',
					target: 'aria-checked',
					expected: 'true',
					read: (raw) => raw.choiceInteraction.advancedAriaChecked
				},
				{
					id: 'focused',
					kind: 'relationship',
					target: 'activeElement',
					expected: true,
					read: (raw) => raw.choiceInteraction.advancedFocused
				}
			]
		}
	}
]);
const contractsByName = new Map(
	desktopComponentContracts.map((contract) => [contract.name, contract])
);
const isMain = process.argv[1] ? pathToFileURL(process.argv[1]).href === import.meta.url : false;

function fail(message) {
	throw new Error(`Desktop evidence validation failed: ${message}`);
}

function productionSource(value) {
	try {
		return new URL(value).origin === 'https://app.zadmin.local';
	} catch {
		return false;
	}
}

function nativeKind(property) {
	return property.startsWith('aria') ? 'aria' : 'native';
}

function normalizeComponent(contract, item, raw) {
	const native = Object.fromEntries(
		Object.keys(contract.native).map((property) => [property, item.native[property]])
	);
	const assertions = [
		{
			id: 'rendered',
			kind: 'state',
			target: 'root',
			expected: true,
			actual: item.present,
			passed: true
		},
		...Object.entries(contract.native).map(([property, expected]) => ({
			id: `native.${property}`,
			kind: nativeKind(property),
			target: property,
			expected,
			actual: item.native[property],
			passed: true
		}))
	];
	const interactions = contract.interaction
		? [
				{
					id: contract.interaction.id,
					action: contract.interaction.action,
					target: contract.interaction.target,
					observations: contract.interaction.observations.map((observation) => ({
						id: observation.id,
						kind: observation.kind,
						target: observation.target,
						expected: observation.expected,
						actual: observation.read(raw),
						passed: true
					})),
					passed: true
				}
			]
		: [];
	return {
		id: contract.id,
		name: contract.name,
		source: componentSource,
		evidenceId: contract.marker,
		locator: {
			kind: 'data-attribute',
			attribute: 'data-desktop-evidence',
			value: contract.marker
		},
		sideEffects: { ...noSideEffects },
		rendered: item.present,
		native,
		assertions,
		interactions,
		passed: true
	};
}

function assertionMatches(assertion, { id, kind, target, expected, actual }) {
	return (
		assertion?.id === id &&
		assertion.kind === kind &&
		assertion.target === target &&
		assertion.expected === expected &&
		assertion.actual === actual &&
		assertion.passed === true
	);
}

function validateNormalizedComponent(component, contract) {
	if (
		component?.id !== contract.id ||
		component.name !== contract.name ||
		component.source !== componentSource ||
		component.evidenceId !== contract.marker ||
		component.rendered !== true ||
		component.passed !== true ||
		component.locator?.kind !== 'data-attribute' ||
		component.locator.attribute !== 'data-desktop-evidence' ||
		component.locator.value !== contract.marker
	)
		fail(`normalized component ${contract.name} identity is invalid.`);
	if (
		!component.sideEffects ||
		Object.keys(component.sideEffects).length !== Object.keys(noSideEffects).length ||
		Object.entries(noSideEffects).some(([key, value]) => component.sideEffects[key] !== value)
	)
		fail(`normalized component ${contract.name} side-effect policy is invalid.`);
	if (
		!component.native ||
		Object.keys(component.native).length !== Object.keys(contract.native).length ||
		Object.entries(contract.native).some(([key, value]) => component.native[key] !== value)
	)
		fail(`normalized component ${contract.name} native snapshot is invalid.`);
	if (!Array.isArray(component.assertions))
		fail(`normalized component ${contract.name} assertions are invalid.`);
	const assertionsById = new Map(
		component.assertions.map((assertion) => [assertion?.id, assertion])
	);
	if (
		assertionsById.size !== component.assertions.length ||
		component.assertions.length !== Object.keys(contract.native).length + 1 ||
		!assertionMatches(assertionsById.get('rendered'), {
			id: 'rendered',
			kind: 'state',
			target: 'root',
			expected: true,
			actual: true
		})
	)
		fail(`normalized component ${contract.name} rendered assertion is invalid.`);
	for (const [property, expected] of Object.entries(contract.native))
		if (
			!assertionMatches(assertionsById.get(`native.${property}`), {
				id: `native.${property}`,
				kind: nativeKind(property),
				target: property,
				expected,
				actual: expected
			})
		)
			fail(`normalized component ${contract.name} ${property} assertion is invalid.`);
	if (!Array.isArray(component.interactions))
		fail(`normalized component ${contract.name} interactions are invalid.`);
	if (!contract.interaction) {
		if (component.interactions.length !== 0)
			fail(`normalized component ${contract.name} has undeclared interactions.`);
		return;
	}
	const interaction = component.interactions[0];
	if (
		component.interactions.length !== 1 ||
		interaction?.id !== contract.interaction.id ||
		interaction.action !== contract.interaction.action ||
		interaction.target !== contract.interaction.target ||
		interaction.passed !== true ||
		!Array.isArray(interaction.observations) ||
		interaction.observations.length !== contract.interaction.observations.length
	)
		fail(`normalized component ${contract.name} interaction is invalid.`);
	const observationsById = new Map(
		interaction.observations.map((observation) => [observation?.id, observation])
	);
	if (observationsById.size !== interaction.observations.length)
		fail(`normalized component ${contract.name} interaction observations are duplicated.`);
	for (const observation of contract.interaction.observations)
		if (
			!assertionMatches(observationsById.get(observation.id), {
				id: observation.id,
				kind: observation.kind,
				target: observation.target,
				expected: observation.expected,
				actual: observation.expected
			})
		)
			fail(`normalized component ${contract.name} ${observation.id} observation is invalid.`);
}

export function validateDesktopEvidence(raw, { expectedRevision } = {}) {
	if (!raw || raw.navigation !== true) fail('host navigation is incomplete.');
	if (
		raw.bridgeRoundTrip?.method !== 'app.snapshot' ||
		raw.bridgeRoundTrip?.requestReceived !== true ||
		raw.bridgeRoundTrip?.responseValidated !== true
	)
		fail('bridge round trip is incomplete.');
	if (
		raw.protocol !== 1 ||
		raw.target !== 'windows-x64' ||
		raw.host?.implementation !== 'WebViewHost'
	)
		fail('target or host is invalid.');
	if (
		!revisionPattern.test(raw.revision ?? '') &&
		!(expectedRevision === undefined && raw.revision === 'local')
	)
		fail('revision is invalid.');
	if (
		expectedRevision !== undefined &&
		(!revisionPattern.test(expectedRevision) || raw.revision !== expectedRevision)
	)
		fail(`revision does not match expected ${expectedRevision}.`);
	if (
		raw.page?.origin !== 'https://app.zadmin.local' ||
		raw.page?.hasBridge !== true ||
		raw.page?.hydrated !== true ||
		!Array.isArray(raw.page?.errors) ||
		raw.page.errors.length !== 0
	)
		fail('page hydration, origin, bridge or errors are invalid.');
	if (
		raw.host.runtime !== 'WebView2' ||
		typeof raw.host.webViewVersion !== 'string' ||
		raw.host.webViewVersion.length === 0 ||
		raw.host.origin !== raw.page.origin ||
		raw.host.protocolVersion !== 1 ||
		raw.host.navigation !== true ||
		raw.host.hydrated !== true ||
		raw.host.bridge !== true ||
		raw.host.bridgeResponseValidated !== true ||
		!Array.isArray(raw.host.pageErrors) ||
		raw.host.pageErrors.length !== 0 ||
		raw.host.source !== raw.source ||
		raw.host.webViewVersion !== raw.page.webViewVersion
	)
		fail('host evidence is incomplete.');
	if (typeof raw.source !== 'string' || !productionSource(raw.source))
		fail('production source is invalid.');
	if (typeof raw.page.webViewVersion !== 'string' || raw.page.webViewVersion.length === 0)
		fail('WebView2 version is missing.');
	if (
		!Number.isInteger(raw.page.componentActionRunsBefore) ||
		!Number.isInteger(raw.page.componentActionRunsAfter) ||
		raw.page.componentActionRunsAfter !== raw.page.componentActionRunsBefore + 1 ||
		raw.page.componentActionDelta !== 1
	)
		fail('component interaction did not produce exactly one observable state transition.');
	if (raw.formInteraction?.ready !== true) fail('form interaction evidence is incomplete.');
	if (raw.choiceInteraction?.ready !== true) fail('choice interaction evidence is incomplete.');
	for (const contract of desktopComponentContracts)
		for (const observation of contract.interaction?.observations ?? [])
			if (observation.read(raw) !== observation.expected)
				fail(`component ${contract.name} ${observation.id} interaction is invalid.`);
	if (!Array.isArray(raw.components) || raw.components.length !== desktopComponentContracts.length)
		fail(`component set must contain exactly ${desktopComponentContracts.length} records.`);
	const byName = new Map();
	for (const item of raw.components) {
		const contract = contractsByName.get(item?.name);
		if (!contract || byName.has(item.name)) fail('component names are not exact and unique.');
		if (item.present !== true || typeof item.marker !== 'string' || item.marker.length === 0)
			fail(`component ${item?.name ?? '<unknown>'} is not rendered with a marker.`);
		if (item.marker !== contract.marker) fail(`component ${item.name} marker is invalid.`);
		if (!item.native || typeof item.native !== 'object')
			fail(`component ${item.name} has no native evidence.`);
		for (const [property, expected] of Object.entries(contract.native))
			if (item.native[property] !== expected)
				fail(`native ${item.name} ${property} semantics are invalid.`);
		byName.set(item.name, item);
	}
	if (desktopComponentContracts.some(({ name }) => !byName.has(name)))
		fail('component set is incomplete.');
	return validateDesktopEvidenceArtifact(
		{
			schemaVersion: 3,
			evidenceFormat: 'structured',
			status: 'passed',
			revision: raw.revision,
			target: raw.target,
			host: raw.host,
			bridgeRoundTrip: raw.bridgeRoundTrip,
			components: desktopComponentContracts.map((contract) =>
				normalizeComponent(contract, byName.get(contract.name), raw)
			)
		},
		{ expectedRevision }
	);
}

export function validateDesktopEvidenceArtifact(evidence, { expectedRevision } = {}) {
	if (
		evidence?.schemaVersion !== 3 ||
		evidence.evidenceFormat !== 'structured' ||
		evidence.status !== 'passed' ||
		evidence.target !== 'windows-x64' ||
		(!revisionPattern.test(evidence.revision ?? '') &&
			!(expectedRevision === undefined && evidence.revision === 'local')) ||
		(expectedRevision !== undefined && evidence.revision !== expectedRevision)
	)
		fail('normalized identity is invalid.');
	if (
		evidence.bridgeRoundTrip?.method !== 'app.snapshot' ||
		evidence.bridgeRoundTrip?.requestReceived !== true ||
		evidence.bridgeRoundTrip?.responseValidated !== true
	)
		fail('normalized bridge round trip is invalid.');
	if (
		evidence.host?.runtime !== 'WebView2' ||
		evidence.host?.implementation !== 'WebViewHost' ||
		evidence.host?.origin !== 'https://app.zadmin.local' ||
		evidence.host?.protocolVersion !== 1 ||
		evidence.host?.navigation !== true ||
		evidence.host?.hydrated !== true ||
		evidence.host?.bridge !== true ||
		evidence.host?.bridgeResponseValidated !== true ||
		!Array.isArray(evidence.host?.pageErrors) ||
		evidence.host.pageErrors.length !== 0 ||
		typeof evidence.host.webViewVersion !== 'string' ||
		evidence.host.webViewVersion.length === 0 ||
		!productionSource(evidence.host.source)
	)
		fail('normalized host is invalid.');
	if (
		!Array.isArray(evidence.components) ||
		evidence.components.length !== desktopComponentContracts.length
	)
		fail('normalized component set is invalid.');
	const expectedByName = new Map(
		desktopComponentContracts.map((contract) => [contract.name, contract])
	);
	for (const component of evidence.components) {
		const contract = expectedByName.get(component?.name);
		if (!contract) fail(`normalized component ${component?.name ?? '<unknown>'} is invalid.`);
		validateNormalizedComponent(component, contract);
		expectedByName.delete(component.name);
	}
	if (expectedByName.size !== 0) fail('normalized component identities are not exact and unique.');
	return evidence;
}

if (isMain && process.argv.includes('--self-test')) {
	const sample = {
		navigation: true,
		bridgeRoundTrip: {
			method: 'app.snapshot',
			requestReceived: true,
			responseValidated: true
		},
		protocol: 1,
		source: 'https://app.zadmin.local/',
		revision: 'a'.repeat(40),
		target: 'windows-x64',
		host: {
			runtime: 'WebView2',
			implementation: 'WebViewHost',
			origin: 'https://app.zadmin.local',
			webViewVersion: '130.0.1',
			protocolVersion: 1,
			navigation: true,
			hydrated: true,
			bridge: true,
			bridgeResponseValidated: true,
			pageErrors: [],
			source: 'https://app.zadmin.local/'
		},
		page: {
			origin: 'https://app.zadmin.local',
			hasBridge: true,
			hydrated: true,
			viteClient: false,
			webViewVersion: '130.0.1',
			errors: [],
			statusAfter: 'Desktop component evidence 1: ZButton click handled.',
			componentActionRunsBefore: 0,
			componentActionRunsAfter: 1,
			componentActionDelta: 1
		},
		formInteraction: {
			ready: true,
			inputValue: 'desktop-value',
			inputLabelled: true,
			inputDescriptionResolved: true,
			checkboxChecked: true,
			checkboxState: 'checked',
			checkboxLabelled: true,
			fieldDirty: true,
			fieldTouched: true,
			formSubmitted: true,
			submitCount: 1,
			formDataEmail: 'desktop-value',
			formDataEnabled: 'enabled'
		},
		choiceInteraction: {
			ready: true,
			switchChecked: true,
			switchState: 'checked',
			switchAriaChecked: 'true',
			switchLabelled: true,
			switchFormData: 'enabled',
			radioValue: 'advanced',
			advancedChecked: true,
			advancedState: 'checked',
			advancedAriaChecked: 'true',
			advancedFocused: true,
			disabledSkipped: true
		},
		components: [
			{
				name: 'ZBox',
				marker: 'ZBox-status',
				present: true,
				native: { tag: 'DIV', ariaLive: 'polite' }
			},
			{ name: 'ZStack', marker: 'ZStack', present: true, native: { tag: 'DIV' } },
			{
				name: 'ZText',
				marker: 'ZText',
				present: true,
				native: { tag: 'STRONG', text: 'Windows WebView2 capability lab' }
			},
			{
				name: 'ZButton',
				marker: 'ZButton-component-action',
				present: true,
				native: { tag: 'BUTTON', type: 'button', disabled: false, text: 'Verify component' }
			},
			{
				name: 'ZForm',
				marker: 'ZForm-contract',
				present: true,
				native: { tag: 'FORM', noValidate: true }
			},
			{
				name: 'ZFormField',
				marker: 'ZFormField-email',
				present: true,
				native: { tag: 'DIV' }
			},
			{
				name: 'ZInput',
				marker: 'ZInput-email',
				present: true,
				native: {
					tag: 'INPUT',
					type: 'text',
					disabled: false,
					name: 'email',
					value: '',
					required: true,
					readOnly: false
				}
			},
			{
				name: 'ZCheckbox',
				marker: 'ZCheckbox-enabled',
				present: true,
				native: {
					tag: 'INPUT',
					type: 'checkbox',
					disabled: false,
					name: 'enabled',
					value: 'enabled',
					checked: false,
					dataState: 'unchecked'
				}
			},
			{
				name: 'ZSwitch',
				marker: 'ZSwitch-enabled',
				present: true,
				native: {
					tag: 'INPUT',
					type: 'checkbox',
					role: 'switch',
					disabled: false,
					name: 'switchEnabled',
					value: 'enabled',
					checked: false,
					ariaChecked: 'false',
					dataState: 'unchecked'
				}
			},
			{
				name: 'ZRadioGroup',
				marker: 'ZRadioGroup-mode',
				present: true,
				native: { tag: 'DIV', role: 'radiogroup', ariaOrientation: 'vertical' }
			},
			{
				name: 'ZRadioGroupItem',
				marker: 'ZRadioGroupItem-advanced',
				present: true,
				native: {
					tag: 'INPUT',
					type: 'radio',
					disabled: false,
					name: 'mode',
					value: 'advanced',
					checked: false,
					ariaChecked: 'false',
					tabIndex: -1,
					dataState: 'unchecked'
				}
			}
		]
	};
	const normalized = validateDesktopEvidence(sample, { expectedRevision: sample.revision });
	if (
		normalized.components.length !== desktopComponentContracts.length ||
		normalized.status !== 'passed'
	)
		fail('self-test normalization failed.');
	if (validateDesktopEvidence({ ...sample, revision: 'local' }).revision !== 'local')
		fail('self-test local normalization failed.');
	const expectFailure = (label, value, pattern, options) => {
		try {
			validateDesktopEvidence(value, options);
			fail(`self-test accepted ${label}.`);
		} catch (error) {
			if (!String(error).includes(pattern)) throw error;
		}
	};
	expectFailure(
		'bridge response failure',
		{
			...sample,
			bridgeRoundTrip: { ...sample.bridgeRoundTrip, responseValidated: false }
		},
		'bridge round trip'
	);
	expectFailure(
		'component interaction failure',
		{ ...sample, page: { ...sample.page, componentActionRunsAfter: 0, componentActionDelta: 0 } },
		'component interaction'
	);
	expectFailure(
		'choice interaction failure',
		{ ...sample, choiceInteraction: { ...sample.choiceInteraction, ready: false } },
		'choice interaction'
	);
	expectFailure(
		'incomplete component set',
		{ ...sample, components: sample.components.slice(0, 3) },
		`exactly ${desktopComponentContracts.length}`
	);
	expectFailure('revision mismatch', sample, 'revision does not match expected', {
		expectedRevision: 'b'.repeat(40)
	});
	expectFailure(
		'page error',
		{ ...sample, page: { ...sample.page, errors: ['boom'] } },
		'page hydration'
	);
	expectFailure(
		'duplicate component',
		{ ...sample, components: [...sample.components.slice(0, -1), sample.components[0]] },
		'exact and unique'
	);
	expectFailure(
		'bad marker',
		{
			...sample,
			components: sample.components.map((item) =>
				item.name === 'ZBox' ? { ...item, marker: 'wrong' } : item
			)
		},
		'marker is invalid'
	);
	expectFailure(
		'bad native',
		{
			...sample,
			components: sample.components.map((item) =>
				item.name === 'ZText' ? { ...item, native: { tag: 'P', text: 'wrong' } } : item
			)
		},
		'native ZText'
	);
	try {
		validateDesktopEvidenceArtifact({
			...normalized,
			components: normalized.components.map((component) =>
				component.name === 'ZButton' ? { ...component, interactions: [] } : component
			)
		});
		fail('self-test accepted normalized evidence without its interaction.');
	} catch (error) {
		if (!String(error).includes('normalized component ZButton interaction')) throw error;
	}
	try {
		validateDesktopEvidenceArtifact({
			...normalized,
			components: normalized.components.map((component) =>
				component.name === 'ZButton'
					? { ...component, sideEffects: { ...component.sideEffects, bridge: 'read' } }
					: component
			)
		});
		fail('self-test accepted normalized evidence with an undeclared side effect.');
	} catch (error) {
		if (!String(error).includes('side-effect policy')) throw error;
	}
	console.log(JSON.stringify({ status: 'passed', components: normalized.components.length }));
}
