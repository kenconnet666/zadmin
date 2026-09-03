import { pathToFileURL } from 'node:url';

const revisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const expectedNames = Object.freeze(['ZBox', 'ZStack', 'ZText', 'ZButton']);
const expectedMarkers = Object.freeze({
	ZBox: 'ZBox-status',
	ZStack: 'ZStack',
	ZText: 'ZText',
	ZButton: 'ZButton-runtime-report'
});
const expectedIds = Object.freeze({
	ZBox: 'box',
	ZStack: 'stack',
	ZText: 'text',
	ZButton: 'button'
});
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

export function validateDesktopEvidence(raw, { expectedRevision } = {}) {
	if (!raw || raw.navigation !== true || raw.bridgeRequest !== true)
		fail('host handshake is incomplete.');
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
	if (!String(raw.page.statusAfter ?? '').startsWith('Protocol '))
		fail('runtime report status is missing.');
	if (!Array.isArray(raw.components) || raw.components.length !== expectedNames.length)
		fail('component set must contain exactly four records.');
	const byName = new Map();
	for (const item of raw.components) {
		if (!expectedNames.includes(item?.name) || byName.has(item.name))
			fail('component names are not exact and unique.');
		if (item.present !== true || typeof item.marker !== 'string' || item.marker.length === 0)
			fail(`component ${item?.name ?? '<unknown>'} is not rendered with a marker.`);
		if (item.marker !== expectedMarkers[item.name])
			fail(`component ${item.name} marker is invalid.`);
		if (!item.native || typeof item.native !== 'object')
			fail(`component ${item.name} has no native evidence.`);
		byName.set(item.name, item);
	}
	if (expectedNames.some((name) => !byName.has(name))) fail('component set is incomplete.');
	const expectedNative = {
		ZBox: (native) => native.tag === 'DIV' && native.ariaLive === 'polite',
		ZStack: (native) => native.tag === 'DIV',
		ZText: (native) => native.tag === 'STRONG' && native.text === 'Windows WebView2 capability lab',
		ZButton: (native) =>
			native.tag === 'BUTTON' &&
			native.type === 'button' &&
			native.disabled === false &&
			native.text === 'Runtime report'
	};
	for (const name of expectedNames)
		if (!expectedNative[name](byName.get(name).native))
			fail(`native ${name} semantics are invalid.`);
	return validateDesktopEvidenceArtifact(
		{
			schemaVersion: 1,
			status: 'passed',
			revision: raw.revision,
			target: raw.target,
			host: raw.host,
			components: expectedNames.map((name) => {
				const item = byName.get(name);
				return {
					id: expectedIds[name],
					name,
					source: 'apps/desktop/src/routes/+page.svelte',
					evidenceId: item.marker,
					rendered: item.present,
					assertions: Object.entries(item.native).map(([key, value]) => `${key}=${String(value)}`),
					interactions:
						name === 'ZButton'
							? ['click:Runtime report', 'bridge:app.snapshot', 'live-status:Protocol']
							: [],
					passed: true
				};
			})
		},
		{ expectedRevision }
	);
}

export function validateDesktopEvidenceArtifact(evidence, { expectedRevision } = {}) {
	if (
		evidence?.schemaVersion !== 1 ||
		evidence.status !== 'passed' ||
		evidence.target !== 'windows-x64' ||
		(!revisionPattern.test(evidence.revision ?? '') &&
			!(expectedRevision === undefined && evidence.revision === 'local')) ||
		(expectedRevision !== undefined && evidence.revision !== expectedRevision)
	)
		fail('normalized identity is invalid.');
	if (
		evidence.host?.runtime !== 'WebView2' ||
		evidence.host?.implementation !== 'WebViewHost' ||
		evidence.host?.origin !== 'https://app.zadmin.local' ||
		evidence.host?.protocolVersion !== 1 ||
		evidence.host?.navigation !== true ||
		evidence.host?.hydrated !== true ||
		evidence.host?.bridge !== true ||
		!Array.isArray(evidence.host?.pageErrors) ||
		evidence.host.pageErrors.length !== 0 ||
		typeof evidence.host.webViewVersion !== 'string' ||
		evidence.host.webViewVersion.length === 0 ||
		!productionSource(evidence.host.source)
	)
		fail('normalized host is invalid.');
	if (!Array.isArray(evidence.components) || evidence.components.length !== expectedNames.length)
		fail('normalized component set is invalid.');
	const expectedByName = new Map(expectedNames.map((name) => [name, expectedIds[name]]));
	for (const component of evidence.components) {
		if (
			expectedByName.get(component?.name) !== component?.id ||
			component.source !== 'apps/desktop/src/routes/+page.svelte' ||
			component.evidenceId !== expectedMarkers[component.name] ||
			component.rendered !== true ||
			component.passed !== true ||
			!Array.isArray(component.assertions) ||
			component.assertions.length === 0 ||
			!Array.isArray(component.interactions)
		)
			fail(`normalized component ${component?.name ?? '<unknown>'} is invalid.`);
		expectedByName.delete(component.name);
	}
	if (expectedByName.size !== 0) fail('normalized component identities are not exact and unique.');
	const button = evidence.components.find(({ name }) => name === 'ZButton');
	if (!button?.interactions.includes('click:Runtime report'))
		fail('normalized ZButton interaction is missing.');
	return evidence;
}

if (isMain && process.argv.includes('--self-test')) {
	const sample = {
		navigation: true,
		bridgeRequest: true,
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
			statusAfter: 'Protocol 1 · WebView2'
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
				marker: 'ZButton-runtime-report',
				present: true,
				native: { tag: 'BUTTON', type: 'button', disabled: false, text: 'Runtime report' }
			}
		]
	};
	const normalized = validateDesktopEvidence(sample, { expectedRevision: sample.revision });
	if (normalized.components.length !== 4 || normalized.status !== 'passed')
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
		'incomplete component set',
		{ ...sample, components: sample.components.slice(0, 3) },
		'exactly four'
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
		{ ...sample, components: [...sample.components.slice(0, 3), sample.components[0]] },
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
		if (!String(error).includes('normalized ZButton interaction')) throw error;
	}
	console.log(JSON.stringify({ status: 'passed', components: normalized.components.length }));
}
