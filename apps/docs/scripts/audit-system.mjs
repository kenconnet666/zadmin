import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'svelte/compiler';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(docsRoot, '../..');
const componentsRoot = resolve(workspaceRoot, 'ui/zui/src/components');
const docsComponentsRoot = resolve(docsRoot, 'src/content/components');
const docsSourceRoot = resolve(docsRoot, 'src');
const zuiTestsRoot = resolve(workspaceRoot, 'ui/zui/tests');
const portable = (path) => path.replaceAll('\\', '/');
const ignoredDirectories = new Set([
	'.svelte-kit',
	'.vite',
	'build',
	'bin',
	'coverage',
	'dist',
	'node_modules',
	'obj',
	'playwright-report',
	'test-results'
]);

async function filesUnder(root, extensions) {
	const entries = await readdir(root, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(root, entry.name);
		if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
			files.push(...(await filesUnder(path, extensions)));
		} else if (entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension))) {
			files.push(path);
		}
	}
	return files.sort();
}

function fail(message) {
	throw new Error(message);
}

function auditTabOrder(source, filename) {
	if (/tabindex\s*=\s*(?:["'][1-9]\d*["']|\{[1-9]\d*\})/u.test(source)) {
		fail(`${filename} contains a positive tabindex.`);
	}
	for (const match of source.matchAll(
		/<(?:a|button|input|select|textarea)\b[^>]*aria-hidden=["']true["'][^>]*>/gu
	)) {
		if (!/tabindex\s*=\s*(?:["']-1["']|\{-1\})/u.test(match[0])) {
			fail(`${filename} contains an aria-hidden interactive element in the tab order.`);
		}
	}
}

function auditSvelte5(source, filename) {
	if (/\son:[a-z][\w-]*\s*=/u.test(source)) {
		fail(`${filename} uses a legacy Svelte event directive.`);
	}
	if (/\bcreateEventDispatcher\b/u.test(source)) {
		fail(`${filename} uses createEventDispatcher instead of callback props.`);
	}
	if (/<svelte:component\b/u.test(source)) {
		fail(`${filename} uses the legacy dynamic component element.`);
	}
	if (/@ts-(?:ignore|nocheck)\b|\bas\s+any\b|:\s*any\b|<any>/u.test(source)) {
		fail(`${filename} bypasses TypeScript with an unsafe escape hatch.`);
	}
	if (
		/\{@html\}|\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write)\b|\beval\s*\(|new\s+Function\b|createElement\(\s*["']script["']|(?:href|src)\s*=\s*["']javascript:/u.test(
			source
		)
	) {
		fail(`${filename} contains a dangerous dynamic DOM sink.`);
	}
	if (/\.textAlign\.(?:left|right)\b/u.test(source)) {
		fail(`${filename} uses physical text alignment instead of start or end.`);
	}
	if (/inert=\{![^}]+\}[\s\S]{0,200}aria-hidden=\{!/u.test(source)) {
		fail(`${filename} combines inert with eager aria-hidden during exit.`);
	}
}

function auditResourceLifecycle(source, filename) {
	const pairs = [
		['addEventListener(', 'removeEventListener('],
		['setTimeout(', 'clearTimeout('],
		['setInterval(', 'clearInterval('],
		['requestAnimationFrame(', 'cancelAnimationFrame('],
		['new ResizeObserver', '.disconnect('],
		['new MutationObserver', '.disconnect('],
		['new IntersectionObserver', '.disconnect(']
	];
	for (const [create, cleanup] of pairs) {
		if (source.includes(create) && !source.includes(cleanup)) {
			fail(`${filename} creates ${create} without ${cleanup}.`);
		}
	}
}

function auditBindableControllerIdentity(source, filename) {
	if (/\bcontroller\s*===\s*publicController\b/u.test(source)) {
		fail(
			`${filename} compares a bindable controller proxy with its raw public object; capture the published binding identity instead.`
		);
	}
	if (
		source.includes('controller = publicController') &&
		(!source.includes('const publishedController = untrack(() => controller)') ||
			!source.includes('if (untrack(() => controller) === publishedController)'))
	) {
		fail(
			`${filename} must capture and compare bindable controller identities outside reactive tracking.`
		);
	}
}

function auditLucideImports(source, filename) {
	for (const line of source.split(/\r?\n/u)) {
		if (/^\s*import\s+(?!type\b).*from\s+['"]@lucide\/svelte['"]/u.test(line)) {
			fail(`${filename} imports Lucide values from the package root instead of an icon subpath.`);
		}
	}
}

const sizeAwareLayoutComponents = new Set([
	'ZButton',
	'ZCheckbox',
	'ZCombobox',
	'ZDateField',
	'ZInput',
	'ZNumberField',
	'ZPagination',
	'ZRadioGroupItem',
	'ZSelect',
	'ZSegmented',
	'ZSlider',
	'ZSwitch',
	'ZTagsInput',
	'ZTextarea',
	'ZTimeField',
	'ZToggleButton'
]);

function attribute(node, name) {
	return node.attributes?.find((item) => item.type === 'Attribute' && item.name === name);
}

function literalAttribute(node, name) {
	const item = attribute(node, name);
	if (!item || item.value == null) return undefined;
	if (typeof item.value === 'string') return item.value;
	if (item.value.length === 1 && item.value[0]?.type === 'Text') return item.value[0].raw;
	return undefined;
}

function auditDocsLayout(source, filename) {
	let ast;
	try {
		ast = parse(source, { modern: true });
	} catch (error) {
		fail(`${filename} cannot be parsed for layout auditing: ${error.message}`);
	}
	const walk = (node) => {
		if (!node || typeof node !== 'object') return;
		if (
			node.type === 'Component' &&
			node.name === 'ZStack' &&
			literalAttribute(node, 'direction') === 'row'
		) {
			const controls = (node.fragment?.nodes ?? []).filter(
				(child) => child.type === 'Component' && sizeAwareLayoutComponents.has(child.name)
			);
			const sizes = controls.map((control) => literalAttribute(control, 'size'));
			const explicitSizes = sizes.filter((size) => size !== undefined);
			const hasMixedExplicitSizes = new Set(explicitSizes).size > 1;
			const hasExplicitAndDefault = explicitSizes.length > 0 && explicitSizes.length < sizes.length;
			if ((hasMixedExplicitSizes || hasExplicitAndDefault) && !attribute(node, 'align')) {
				const line = source.slice(0, node.start).split(/\r?\n/u).length;
				fail(
					`${filename}:${line} has a row ZStack with mixed control sizes (${sizes.join(', ')}); set an explicit align (usually align="center") to avoid stretch distortion.`
				);
			}
		}
		for (const value of Object.values(node)) {
			if (Array.isArray(value)) value.forEach(walk);
			else if (value && typeof value === 'object' && value.type) walk(value);
		}
	};
	walk(ast.fragment);
}

try {
	auditDocsLayout(
		'<ZStack direction="row"><ZButton size="small"/><ZButton size="large"/></ZStack>',
		'layout-audit-self-test.svelte'
	);
	fail('Docs layout audit self-test accepted an implicit mixed-size row alignment.');
} catch (error) {
	if (!String(error).includes('has a row ZStack with mixed control sizes')) throw error;
}
auditDocsLayout(
	'<ZStack align="center" direction="row"><ZButton size="small"/><ZButton size="large"/></ZStack>',
	'layout-audit-valid-self-test.svelte'
);

const zuiSourceFiles = await filesUnder(resolve(workspaceRoot, 'ui/zui/src'), ['.svelte', '.ts']);
for (const path of zuiSourceFiles) {
	const source = await readFile(path, 'utf8');
	const filename = portable(relative(workspaceRoot, path));
	auditResourceLifecycle(source, filename);
	auditBindableControllerIdentity(source, filename);
}
const componentFiles = await filesUnder(componentsRoot, ['.svelte']);
const metadata = [];
const internalComponents = [];
const transitionFiles = [];
const rawButtonFiles = [];
const rawControlFiles = [];
const formResetActionFiles = [];
const longEventKeyChains = [];
for (const path of componentFiles) {
	const source = await readFile(path, 'utf8');
	const filename = portable(relative(workspaceRoot, path));
	auditTabOrder(source, filename);
	auditSvelte5(source, filename);
	auditLucideImports(source, filename);
	if (/<button\b/u.test(source)) {
		rawButtonFiles.push(filename);
		const hasFocusContract =
			/styleInternalAction|styleInternalFocusRing|_focusVisible|&:focus-within/u.test(source) ||
			(filename === 'ui/zui/src/components/overlay/ZTour.svelte' &&
				/aria-hidden=["']true["'][\s\S]*?tabindex=["']-1["']/u.test(source));
		if (!hasFocusContract) fail(`${filename} has a raw button without a focus contract.`);
		for (const match of source.matchAll(/<button\b[^>]*>/gu)) {
			if (!/(?:\btype\s*=|\{type\})/u.test(match[0])) {
				fail(`${filename} has a raw button without an explicit type.`);
			}
		}
		for (const match of source.matchAll(/<button\b[^>]*>\s*<[A-Z][A-Za-z0-9]*/gu)) {
			if (!/aria-(?:label|labelledby)\s*=/u.test(match[0])) {
				fail(`${filename} has an icon-only raw button without an accessible name.`);
			}
		}
	}
	const hasVisibleRawControl =
		/<(?:input|textarea)\b(?![^>]*(?:\shidden(?:\s|=|>)|\stype\s*=\s*["']hidden["']))[^>]*>/u.test(
			source
		);
	if (hasVisibleRawControl) rawControlFiles.push(filename);
	if (hasVisibleRawControl && !/styleInternalFocus|_focusVisible|&:focus-within/u.test(source)) {
		fail(`${filename} has a visible raw input without a focus contract.`);
	}
	const eventKeyBranches = [...source.matchAll(/(?:if|else if)\s*\(event\.key\b/gu)].length;
	if (eventKeyBranches >= 3) longEventKeyChains.push(filename);
	if (/use:form(?:Element)?Reset\b/u.test(source)) formResetActionFiles.push(filename);
	if (/\blisten(?:For|To)FormReset\b/u.test(source)) {
		fail(`${filename} bypasses the node form reset action.`);
	}
	const id = source.match(
		/export const zuiMetadata\s*=\s*\{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/u
	)?.[1];
	if (id) metadata.push({ id, source: filename });
	else internalComponents.push(filename);
	if (/transition(?:Property|Duration)|transition:/u.test(source)) {
		transitionFiles.push(filename);
		if (!/\bmotion\b/u.test(source))
			fail(`${filename} defines a transition without a motion contract.`);
	}
}
if (longEventKeyChains.length > 0) {
	fail(
		`Long event.key if/else chains must use a switch or shared intent: ${longEventKeyChains.join(', ')}.`
	);
}

if (new Set(metadata.map(({ id }) => id)).size !== metadata.length) {
	fail('ZUI component metadata ids must be globally unique.');
}
const expectedInternal = [
	'ui/zui/src/components/feedback/QueuedToast.svelte',
	'ui/zui/src/components/input/CascaderColumn.svelte',
	'ui/zui/src/components/input/TransferPane.svelte',
	'ui/zui/src/components/input/ZMentionEditor.svelte'
];
if (JSON.stringify(internalComponents) !== JSON.stringify(expectedInternal)) {
	fail(`Unexpected internal component set: ${internalComponents.join(', ') || 'none'}.`);
}

const stableNativeIdSources = [
	'ui/zui/src/components/input/ZInput.svelte',
	'ui/zui/src/components/input/ZTextarea.svelte',
	'ui/zui/src/components/input/ZCheckbox.svelte',
	'ui/zui/src/components/input/ZSwitch.svelte',
	'ui/zui/src/components/input/ZSlider.svelte',
	'ui/zui/src/components/compound/radio-group/ZRadioGroupItem.svelte'
];
for (const filename of stableNativeIdSources) {
	const source = await readFile(resolve(workspaceRoot, filename), 'utf8');
	if (!/createZuiId/u.test(source) || !/id=\{[^}]*\?\?[^}]*generatedId\}/u.test(source)) {
		fail(`${filename} must preserve its generated native control id fallback.`);
	}
}
const dataTableSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/data-display/ZDataTable.svelte'),
	'utf8'
);
if (
	!dataTableSource.includes('id={`${selectionName}-all`}') ||
	!dataTableSource.includes('id={`${selectionName}-row-${entry.index}`}')
) {
	fail('ZDataTable must preserve scoped ids for its native selection controls.');
}
const formControlSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/runtime/form/form-control.svelte.ts'),
	'utf8'
);
const formResetSignalSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/runtime/form/FormResetSignal.svelte'),
	'utf8'
);
const buttonSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/gene/ZButton.svelte'),
	'utf8'
);
const formSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/ZForm.svelte'),
	'utf8'
);
const inputSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/ZInput.svelte'),
	'utf8'
);
const textareaSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/ZTextarea.svelte'),
	'utf8'
);
const comboboxInputSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/compound/combobox/ZComboboxInput.svelte'),
	'utf8'
);
const comboboxSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/compound/combobox/ZCombobox.svelte'),
	'utf8'
);
const comboboxContextSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/compound/combobox/context.svelte.ts'),
	'utf8'
);
const mentionEditorSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/ZMentionEditor.svelte'),
	'utf8'
);
const transferSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/ZTransfer.svelte'),
	'utf8'
);
const transferPaneSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/TransferPane.svelte'),
	'utf8'
);
const calendarSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/ZCalendar.svelte'),
	'utf8'
);
const commandSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/navigation/ZCommand.svelte'),
	'utf8'
);
const treeSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/compound/tree/ZTree.svelte'),
	'utf8'
);
const pinInputSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/ZPinInput.svelte'),
	'utf8'
);
const dateFieldSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/ZDateField.svelte'),
	'utf8'
);
const timeFieldSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/ZTimeField.svelte'),
	'utf8'
);
const cascaderSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/ZCascader.svelte'),
	'utf8'
);
const cascaderColumnSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/input/CascaderColumn.svelte'),
	'utf8'
);
if (!inputSource.includes('s.boxSizing.borderBox')) {
	fail(
		'ZInput must preserve border-box sizing so width and inline-size include its padding and border.'
	);
}
const formResetSignalTag = formResetSignalSource.match(/<input\b[\s\S]*?\/>/u)?.[0] ?? '';
if (
	!buttonSource.includes("'aria-busy': ariaBusy") ||
	!buttonSource.includes('aria-busy={loading ? true : ariaBusy}') ||
	!formSource.includes("'aria-busy': ariaBusy") ||
	!formSource.includes('aria-busy={validating ? true : ariaBusy}')
) {
	fail('ZButton and ZForm must preserve native aria-busy unless internal state owns it.');
}
if (
	!formControlSource.includes('queueMicrotask(refreshAssociation)') ||
	!formControlSource.includes(
		'const MutationObserverConstructor = control.ownerDocument.defaultView?.MutationObserver'
	) ||
	!formControlSource.includes('new MutationObserverConstructor(scheduleAssociationRefresh)') ||
	!formControlSource.includes(
		'mountObserver.observe(control.ownerDocument, { childList: true, subtree: true })'
	) ||
	!formControlSource.includes('next.associatedForm !== association.associatedForm') ||
	!formControlSource.includes('next.root !== association.root') ||
	!/scheduleAssociationRefresh\(\);\s*\}/u.test(formControlSource) ||
	!formControlSource.includes('const ticket = (generation += 1)') ||
	!formControlSource.includes('ticket !== generation') ||
	!formControlSource.includes('let cancelPending: (() => void) | undefined') ||
	!formControlSource.includes('const scheduleAfterDefault =') ||
	!formControlSource.includes('ownerWindow.setTimeout(callback, 0)') ||
	!formControlSource.includes('ownerWindow.clearTimeout(timer)') ||
	!formControlSource.includes('cancelPending?.()') ||
	!formControlSource.includes('if (active && !event.defaultPrevented) reset()') ||
	formControlSource.includes('flushSync') ||
	formControlSource.includes('pendingReset')
) {
	fail(
		'The form reset action must preserve its association and cancelable post-default task contracts.'
	);
}
if (
	!formResetSignalSource.includes(
		'let action = formElementReset(current.owner, () => current.reset())'
	) ||
	!formResetSignalSource.includes('const ownerChanged = current.owner !== next.owner') ||
	!formResetSignalSource.includes(
		'action = formElementReset(current.owner, () => current.reset())'
	) ||
	!formResetSignalSource.includes('action.update(() => current.reset())') ||
	!formResetSignalTag.includes('type="hidden"') ||
	!formResetSignalTag.includes('hidden') ||
	!formResetSignalTag.includes('disabled') ||
	!formResetSignalTag.includes('aria-hidden="true"') ||
	!formResetSignalTag.includes('tabindex="-1"') ||
	!formResetSignalTag.includes('data-zui-form-reset-signal=""') ||
	!formResetSignalSource.includes('const associationKey = association') ||
	!formResetSignalSource.includes('resetOwner = directOwner ?? associatedControl?.form ?? null') ||
	!formResetSignalSource.includes(
		'new MutationObserverConstructor(() => queueMicrotask(updateOwner))'
	) ||
	!formResetSignalSource.includes("attributeFilter: ['id']") ||
	!formResetSignalSource.includes('observer?.disconnect()') ||
	!formResetSignalSource.includes('{#if resetOwner}') ||
	!formResetSignalSource.includes('use:portal={{ target: resetOwner }}') ||
	/\b(?:id|name)\s*=/u.test(formResetSignalTag) ||
	!formResetSignalSource.includes('use:signalFormReset={{ owner: resetOwner, reset: onReset }}') ||
	!formSource.includes('<FormResetSignal onReset={resetFromForm} owner={ref}') ||
	!inputSource.includes('<FormResetSignal association={form} control={ref} onReset={resetFromForm}')
) {
	fail('The dedicated form reset signal contract changed.');
}
if (
	![inputSource, textareaSource].every(
		(source) =>
			source.includes('readonly resetOnForm?: boolean') &&
			source.includes('resetOnForm = true') &&
			source.includes('if (resetOnForm) state.reset()')
	) ||
	!inputSource.includes('{#if resetOnForm || onFormReset}') ||
	!comboboxInputSource.includes('defaultValue={combo.inputDefaultValue}') ||
	!comboboxInputSource.includes('resetOnForm={false}') ||
	!comboboxSource.includes('const readDefaultInputValue = () =>') ||
	!comboboxContextSource.includes('readonly inputDefaultValue: string') ||
	!mentionEditorSource.includes('resetOnForm={false}') ||
	(transferSource.match(/<TransferPane\b/gu)?.length ?? 0) !== 2 ||
	(transferPaneSource.match(/resetOnForm=\{false\}/gu)?.length ?? 0) !== 1 ||
	!transferSource.includes('<FormValueBridge') ||
	!transferSource.includes('onReset={resetFromForm}')
) {
	fail(
		'Compound editors must delegate form reset ownership without resetting their leaf controls twice.'
	);
}
if (
	!calendarSource.includes('switch (event.key)') ||
	!calendarSource.includes("case 'PageDown':") ||
	!calendarSource.includes("case 'PageUp':") ||
	!/case 'Enter':\s*case ' '/u.test(calendarSource)
) {
	fail('ZCalendar must preserve its explicit keyboard state switch.');
}
if (
	!commandSource.includes('activeDescendant.handleKey(event)') ||
	!commandSource.includes('switch (event.key)') ||
	!treeSource.includes("const intent = navigationIntent(event.key, 'vertical')") ||
	!treeSource.includes('function move(intent: NavigationIntent') ||
	!treeSource.includes('switch (event.key)')
) {
	fail(
		'ZCommand and ZTree must delegate vertical movement to ActiveDescendant or shared navigation intents before their local key switch.'
	);
}
if (
	!pinInputSource.includes('switch (event.key)') ||
	!pinInputSource.includes("case 'Backspace':") ||
	!pinInputSource.includes("case 'Delete':") ||
	!pinInputSource.includes("case 'ArrowLeft':") ||
	!pinInputSource.includes("case 'ArrowRight':")
) {
	fail('ZPinInput must preserve its explicit navigation and deletion key switch.');
}
if (
	![dateFieldSource, timeFieldSource].every((source) => {
		const normalized = source.replace(/\r\n?/gu, '\n');
		return (
			normalized.includes(
				"const intent = navigationIntent(event.key, 'horizontal', zui.direction)"
			) &&
			normalized.includes('const target = moveIndex(') &&
			normalized.includes('intent, false)') &&
			normalized.includes("case 'ArrowUp':\n\t\t\tcase 'ArrowDown':")
		);
	})
) {
	fail('ZDateField and ZTimeField must share non-looping horizontal segment navigation.');
}
if (
	!cascaderSource.includes('const tree = $derived(new LogicalTree<TKey>(nodes))') ||
	!cascaderSource.includes('<CascaderColumn') ||
	!cascaderSource.includes('<FormValueBridge') ||
	!cascaderColumnSource.includes('if (active.handleKey(event)) return') ||
	!cascaderColumnSource.includes("const expandKey = zui.direction === 'rtl'") ||
	!cascaderColumnSource.includes("const collapseKey = zui.direction === 'rtl'") ||
	!cascaderColumnSource.includes('const typeahead = new Typeahead<TKey>')
) {
	fail(
		'ZCascader columns must delegate vertical movement to ActiveDescendant before their RTL-aware cross-column keys.'
	);
}
const focusScopeSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/runtime/layer/focus-scope.ts'),
	'utf8'
);
const popoverContentSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/compound/popover/ZPopoverContent.svelte'),
	'utf8'
);
const popoverContextSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/compound/popover/context.svelte.ts'),
	'utf8'
);
const popoverTriggerSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/compound/popover/ZPopoverTrigger.svelte'),
	'utf8'
);
const contextMenuTriggerSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/compound/context-menu/ZContextMenuTrigger.svelte'),
	'utf8'
);
const dialogContentSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/compound/dialog/ZDialogContent.svelte'),
	'utf8'
);
if (
	!focusScopeSource.includes('restoreTarget?: () => HTMLElement | null') ||
	!focusScopeSource.includes('this.#options.restoreTarget?.() ?? this.#previousFocus') ||
	!focusScopeSource.includes('this.#previousFocus !== restoreTarget') ||
	!focusScopeSource.includes('this.#previousFocus.focus({ preventScroll: true })') ||
	!popoverContextSource.includes('readonly restoreTarget: HTMLElement | null') ||
	!popoverContextSource.includes('setRestoreTarget(target: HTMLElement | null): void') ||
	!popoverTriggerSource.includes('popover.setTrigger(ref)') ||
	!popoverTriggerSource.includes('popover.setRestoreTarget(ref)') ||
	!contextMenuTriggerSource.includes('popover.setTrigger(anchor)') ||
	!contextMenuTriggerSource.includes('popover.setRestoreTarget(ref)') ||
	!popoverContentSource.includes('restoreTarget: restoreTarget ?? (() => popover.restoreTarget)') ||
	!popoverContentSource.includes('restoreFocus,') ||
	!popoverContentSource.includes(
		"aria-modal={popover.modal && role === 'dialog' ? 'true' : undefined}"
	) ||
	!dialogContentSource.includes('restoreTarget: restoreTarget ?? (() => dialog.trigger)') ||
	!dialogContentSource.includes('restoreFocus,')
) {
	fail('Layer focus scopes and modal semantics must preserve their current compound contracts.');
}
const tooltipContentSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/compound/tooltip/ZTooltipContent.svelte'),
	'utf8'
);
if (
	!tooltipContentSource.includes("'button'") ||
	!tooltipContentSource.includes('\'[role="button"]\'') ||
	!tooltipContentSource.includes("'audio[controls]'") ||
	!tooltipContentSource.includes('content.querySelector(interactiveSelector)') ||
	!tooltipContentSource.includes('interactive or focusable content; use ZPopover')
) {
	fail('ZTooltipContent must preserve its final-DOM non-interactive runtime guard.');
}

const docsSvelteFiles = await filesUnder(docsSourceRoot, ['.svelte']);
const docsBaseCssSource = await readFile(resolve(docsRoot, 'src/app/base.css'), 'utf8');
if (
	!docsBaseCssSource.includes('@layer docs-reset, zui;') ||
	!/@layer\s+docs-reset\s*\{/u.test(docsBaseCssSource)
) {
	fail('Docs global resets must stay in a cascade layer below the ZUI component layers.');
}
if (/(?:^|[;{\s])font\s*:/u.test(docsBaseCssSource)) {
	fail('Docs base reset must not use the font shorthand, which can override component typography.');
}
const docsViteSource = await readFile(resolve(docsRoot, 'vite.config.ts'), 'utf8');
const workspaceZuiEntrypoints = [
	'@zadmin/zui',
	'@zadmin/zui/code',
	'@zadmin/zui/compiler',
	'@zadmin/zui/metadata',
	'@zadmin/zui/themes'
];
const optimizeExclude =
	docsViteSource.match(
		/optimizeDeps:\s*\{[\s\S]*?exclude:\s*\[([\s\S]*?)\][\s\S]*?include:/u
	)?.[1] ?? '';
if (!workspaceZuiEntrypoints.every((entrypoint) => optimizeExclude.includes(`'${entrypoint}'`))) {
	fail('Docs Vite must exclude every workspace ZUI entrypoint from dependency optimization.');
}
const rawInteractive =
	/<(?:a|button|code|details|input|kbd|meter|progress|select|summary|table|textarea)\b/u;
const forbiddenGlyph = /[×‹›✓←→↑↓↕✕✖]/u;
for (const path of docsSvelteFiles) {
	const source = await readFile(path, 'utf8');
	const filename = portable(relative(workspaceRoot, path));
	auditDocsLayout(source, filename);
	auditTabOrder(source, filename);
	auditSvelte5(source, filename);
	auditLucideImports(source, filename);
	auditResourceLifecycle(source, filename);
	if (rawInteractive.test(source))
		fail(`${filename} hand-builds an interactive element instead of dogfooding ZUI.`);
	if (forbiddenGlyph.test(source))
		fail(`${filename} contains a character UI icon instead of Lucide.`);
	if (/<h[1-6]\b/u.test(source))
		fail(`${filename} hand-builds a heading instead of dogfooding ZHeading.`);
	for (const link of source.matchAll(/<ZLink\b[\s\S]*?>/gu)) {
		if (!/\bhref\s*=/u.test(link[0])) fail(`${filename} renders ZLink without its required href.`);
	}
	for (const tooltip of source.matchAll(/<ZTooltipContent\b[\s\S]*?<\/ZTooltipContent>/gu)) {
		if (
			/<Z(?:Button|Checkbox|Combobox|Input|Link|Popover|RadioGroup|Select|Slider|Switch|Textarea|ToggleButton)\b/u.test(
				tooltip[0]
			)
		) {
			fail(`${filename} places interactive content inside a tooltip.`);
		}
	}
}
const appShellSource = await readFile(resolve(docsRoot, 'src/views/AppShell.svelte'), 'utf8');
const appSource = await readFile(resolve(docsRoot, 'src/app/App.svelte'), 'utf8');
const mainSource = await readFile(resolve(docsRoot, 'src/main.ts'), 'utf8');
const routerRuntimeSource = await readFile(
	resolve(docsRoot, 'src/framework/router-runtime.svelte.ts'),
	'utf8'
);
const themeLabSource = await readFile(resolve(docsRoot, 'src/views/ThemeLabPage.svelte'), 'utf8');
const skipLinkContracts = [
	/<ZLink\b[^>]*class=\{classes\.skipLink\}[^>]*href=\{currentHref\}[^>]*onclick=\{skipToMain\}/u,
	/function skipToMain\([\s\S]*?event\.preventDefault\(\)[\s\S]*?\.focus\(/u,
	/<main\b[^>]*id=["']zui-main-content["'][^>]*tabindex=["']-1["']/u
];
if (!skipLinkContracts.every((contract) => contract.test(appShellSource))) {
	fail('Docs AppShell must preserve its hash-router-safe skip link contract.');
}
if (
	!mainSource.includes('startDocsRouter(window)') ||
	!mainSource.includes('import.meta.hot?.dispose(stopRouter)') ||
	!appShellSource.includes('const route = $derived(docsRouter.current)') ||
	!routerRuntimeSource.includes("view.addEventListener('hashchange', sync)") ||
	!routerRuntimeSource.includes("view.removeEventListener('hashchange', sync)") ||
	!routerRuntimeSource.includes('view.cancelAnimationFrame(frame)')
) {
	fail('Docs hash routing must keep one main-entry runtime owner that survives component HMR.');
}
const appHeaderSource = await readFile(resolve(docsRoot, 'src/views/AppHeader.svelte'), 'utf8');
const preferenceSources = [appSource, appShellSource, appHeaderSource, themeLabSource];
const preferenceCallbacks = [
	'onContrastChange',
	'onDensityChange',
	'onDirectionChange',
	'onMotionChange',
	'onThemeChange'
];
if (
	preferenceSources.some((source) =>
		/bind:(?:contrast|density|direction|motion|themeId)\b/u.test(source)
	) ||
	!preferenceCallbacks.every(
		(callback) => appSource.includes(callback) && appHeaderSource.includes(callback)
	) ||
	!themeLabSource.includes('onThemeChange?.(preset.id)')
) {
	fail('Docs display preferences must keep one App owner and explicit change callbacks.');
}
const appSidebarSource = await readFile(resolve(docsRoot, 'src/views/AppSidebar.svelte'), 'utf8');
const appCommandSearchSource = await readFile(
	resolve(docsRoot, 'src/views/AppCommandSearch.svelte'),
	'utf8'
);
const searchLiveContracts = [
	['header composition', /<AppCommandSearch \{docs\} \/>/u.test(appHeaderSource)],
	[
		'keyboard shortcut disclosure',
		/aria-keyshortcuts=["']\/ Control\+K Meta\+K["']/u.test(appCommandSearchSource)
	],
	[
		'visible shortcut hints',
		/data-slot=["']search-shortcuts["'][\s\S]*?<ZKbd>\/<\/ZKbd>[\s\S]*?<ZKbd>Ctrl\/⌘ K<\/ZKbd>/u.test(
			appCommandSearchSource
		)
	],
	[
		'owner-document slash listener cleanup',
		/ownerDocument\.addEventListener\(["']keydown["'], handleSlash\)[\s\S]*?ownerDocument\.removeEventListener\(["']keydown["'], handleSlash\)/u.test(
			appCommandSearchSource
		)
	],
	[
		'slash opens palette',
		/event\.key !== ["']\/["'][\s\S]*?open = true/u.test(appCommandSearchSource)
	],
	['shared search model', /createDocsCommandItems\(/u.test(appCommandSearchSource)],
	['hash navigation', /view\.location\.hash = item\.href/u.test(appCommandSearchSource)],
	[
		'command palette ownership',
		/<ZCommandPalette[\s\S]*?bind:open[\s\S]*?bind:query[\s\S]*?\{items\}[\s\S]*?listLabel=["']文档搜索结果["'][\s\S]*?onAction=\{navigate\}[\s\S]*?shortcutTarget=\{triggerRef\?\.ownerDocument\}[\s\S]*?showTrigger=\{false\}/u.test(
			appCommandSearchSource
		)
	],
	[
		'command status relationship',
		/aria-describedby=\{`\$\{idBase\}-status`\}/u.test(commandSource)
	],
	[
		'command polite status',
		/<ZVisuallyHidden[\s\S]*?aria-live=["']polite["'][\s\S]*?data-slot=["']status["'][\s\S]*?role=["']status["']/u.test(
			commandSource
		)
	],
	[
		'component navigation landmark',
		appSidebarSource.includes(
			"surface === 'drawer' ? 'zui-docs-mobile-component-nav' : 'zui-docs-component-nav'"
		) && /<nav\b[^>]*id=\{navigationId\}/u.test(appSidebarSource)
	]
];
const missingSearchContracts = searchLiveContracts
	.filter(([, valid]) => !valid)
	.map(([name]) => name);
if (missingSearchContracts.length > 0) {
	fail(
		`Docs component search must preserve its navigation and live-status relationships: ${missingSearchContracts.join(', ')}.`
	);
}
for (const path of componentFiles) {
	const source = await readFile(path, 'utf8');
	if (forbiddenGlyph.test(source)) {
		fail(
			`${portable(relative(workspaceRoot, path))} contains a character UI icon instead of Lucide.`
		);
	}
}

const svgCandidates = [
	...(await filesUnder(resolve(workspaceRoot, 'apps'), ['.svelte', '.svg'])),
	...(await filesUnder(resolve(workspaceRoot, 'packages'), ['.svelte', '.svg'])),
	...(await filesUnder(resolve(workspaceRoot, 'ui'), ['.svelte', '.svg']))
];
const inlineSvg = [];
const gradientFiles = [];
for (const path of svgCandidates) {
	const source = await readFile(path, 'utf8');
	if (/<(?:path|svg)\b/u.test(source)) {
		inlineSvg.push(portable(relative(workspaceRoot, path)));
	}
	if (/(?:linear|radial|conic)-gradient\(|<(?:linear|radial)Gradient\b/u.test(source)) {
		gradientFiles.push(portable(relative(workspaceRoot, path)));
	}
}
const allowedSvg = [
	'apps/desktop/static/zadmin-icon.svg',
	'apps/docs/static/favicon.svg',
	'ui/zui/src/components/data-display/ZProgress.svelte'
];
if (JSON.stringify(inlineSvg.sort()) !== JSON.stringify(allowedSvg.sort())) {
	fail(`Inline SVG boundary changed: ${inlineSvg.join(', ') || 'none'}.`);
}
const allowedGradients = ['apps/desktop/static/zadmin-icon.svg', 'apps/docs/static/favicon.svg'];
if (JSON.stringify(gradientFiles.sort()) !== JSON.stringify(allowedGradients.sort())) {
	fail(`Visual gradient boundary changed: ${gradientFiles.join(', ') || 'none'}.`);
}

const docFiles = await filesUnder(docsComponentsRoot, ['doc.ts']);
const demoIds = [];
for (const path of docFiles) {
	const source = await readFile(path, 'utf8');
	const ids = [...source.matchAll(/\bid:\s*['"]([^'"]+)['"]/gu)].map((match) => match[1]);
	if (ids.length < 2)
		fail(`${portable(relative(workspaceRoot, path))} defines fewer than two demos.`);
	demoIds.push(...ids);
}
if (new Set(demoIds).size !== demoIds.length)
	fail('Documentation demo ids must be globally unique.');
const siteE2eSource = await readFile(resolve(docsRoot, 'tests/site.e2e.ts'), 'utf8');
const referencedDemoIds = [
	...siteE2eSource.matchAll(/demo\(\s*page\s*,\s*['"]([^'"]+)['"]\s*\)/gu)
].map((match) => match[1]);
const missingReferencedDemoIds = [...new Set(referencedDemoIds)].filter(
	(id) => !demoIds.includes(id)
);
if (missingReferencedDemoIds.length > 0) {
	fail(`Docs E2E references missing demo ids: ${missingReferencedDemoIds.join(', ')}.`);
}
const zuiViteSource = await readFile(resolve(workspaceRoot, 'ui/zui/vite.config.ts'), 'utf8');
const browserSetupSource = await readFile(resolve(zuiTestsRoot, 'browser.setup.ts'), 'utf8');
if (
	!zuiViteSource.includes("setupFiles: ['./tests/browser.setup.ts']") ||
	!browserSetupSource.includes('cleanupDirectMounts') ||
	!browserSetupSource.includes('await cleanup()') ||
	!browserSetupSource.includes('vi.restoreAllMocks()')
) {
	fail(
		'ZUI browser tests must preserve one global cleanup owner for tracked direct mounts, rendered components, DOM state and mocks.'
	);
}
const browserSpecFiles = await filesUnder(zuiTestsRoot, ['.browser.spec.ts']);
for (const path of browserSpecFiles) {
	const source = await readFile(path, 'utf8');
	if (
		/\bafterEach\(cleanup\)|import\s*\{[^}]*\bcleanup\b[^}]*\}\s*from\s*['"]vitest-browser-svelte/u.test(
			source
		)
	) {
		fail(`${portable(relative(workspaceRoot, path))} duplicates the global browser cleanup owner.`);
	}
}
const codeSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/gene/ZCode.svelte'),
	'utf8'
);
if (
	!codeSource.includes("import('shiki/themes/github-dark-high-contrast.mjs')") ||
	!codeSource.includes("import('shiki/themes/github-light-high-contrast.mjs')") ||
	codeSource.includes("import('shiki/themes/github-dark.mjs')") ||
	codeSource.includes("import('shiki/themes/github-light.mjs')")
) {
	fail('ZCode must preserve its audited high-contrast Shiki theme boundary.');
}
const productionBoundaryDemos = [
	'accordion-runtime-mode',
	'alert-dynamic-insertion',
	'aspect-ratio-responsive',
	'avatar-image-fallback',
	'button-composition',
	'button-tone',
	'carousel-autoplay-pause',
	'cascader-lazy-retry',
	'command-external-results',
	'command-palette-external-trigger',
	'container-responsive',
	'code-scheme-embedded',
	'code-copy',
	'date-field-bounds',
	'file-upload-default-queue',
	'description-list-responsive-rtl',
	'empty-long-description',
	'list-virtual-boundary',
	'loading-bar-controller',
	'meter-custom-range',
	'mention-async',
	'popover-modal-match-width',
	'progress-motion',
	'provider-portal-boundary',
	'select-controlled-label',
	'skeleton-motion',
	'spinner-owner-boundary',
	'statistic-formatter',
	'tags-input-draft-ownership',
	'result-heading-responsive',
	'timeline-pending-reverse',
	'toggle-button-owner',
	'tree-multiple-checkbox',
	'visually-hidden-live-region'
];
for (const id of productionBoundaryDemos) {
	if (!demoIds.includes(id)) fail(`Documentation must preserve the ${id} production demo.`);
}

console.log(
	JSON.stringify({
		componentSvelteFiles: componentFiles.length,
		metadataIds: metadata.length,
		docPages: docFiles.length,
		demoIds: demoIds.length,
		docsE2eDemoReferences: new Set(referencedDemoIds).size,
		productionBoundaryDemos: productionBoundaryDemos.length,
		transitionFiles: transitionFiles.length,
		rawButtonComponentFiles: rawButtonFiles.length,
		rawControlComponentFiles: rawControlFiles.length,
		formResetActionFiles: formResetActionFiles.length,
		longEventKeyChains: 0,
		formResetSignalComponents: 2,
		delegatedResetOwnershipContracts: 4,
		calendarKeyboardSwitchContracts: 1,
		collectionKeyboardReuseContracts: 2,
		pinInputKeyboardSwitchContracts: 1,
		segmentFieldKeyboardReuseContracts: 2,
		cascaderKeyboardReuseContracts: 1,
		inlineSvgFiles: inlineSvg.length,
		brandGradientFiles: gradientFiles.length,
		docsRawInteractiveElements: 0,
		docsWorkspaceOptimizeExclusions: workspaceZuiEntrypoints.length,
		docsPreferenceOwnerContracts: preferenceCallbacks.length,
		positiveTabindexElements: 0,
		ariaHiddenTabStops: 0,
		implicitSubmitButtons: 0,
		unnamedIconButtons: 0,
		legacySvelteEvents: 0,
		legacyDynamicComponents: 0,
		physicalTextAlignments: 0,
		redundantInertAriaHidden: 0,
		typescriptEscapeHatches: 0,
		zuiSourceFiles: zuiSourceFiles.length,
		resourceLifecycleViolations: 0,
		dangerousDomSinks: 0,
		bindableControllerIdentityContracts: 5,
		docsHashRouterOwners: 1,
		skipLinkContracts: 1,
		searchLiveContracts: 1,
		nativeBusyContracts: 2,
		formResetMountRebindContracts: 1,
		formResetUpdateRebindContracts: 1,
		formResetMicrotaskContracts: 1,
		currentFocusRestoreContracts: 2,
		currentFocusFallbackContracts: 1,
		tooltipRuntimeGuardContracts: 1,
		stableNativeIdComponents: stableNativeIdSources.length + 1,
		interactiveTooltipDemos: 0
	})
);
