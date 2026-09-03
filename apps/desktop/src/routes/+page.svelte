<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ZBox,
		ZButton,
		ZAccordion,
		ZAccordionContent,
		ZAccordionItem,
		ZAccordionTrigger,
		ZAlert,
		ZAspectRatio,
		ZCheckbox,
		ZContainer,
		ZDialog,
		ZDialogClose,
		ZDialogContent,
		ZDialogDescription,
		ZDialogOverlay,
		ZDialogTitle,
		ZDialogTrigger,
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZProvider,
		ZForm,
		ZFormField,
		ZInput,
		ZIcon,
		ZKbd,
		ZLink,
		ZRadioGroup,
		ZRadioGroupItem,
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger,
		ZSeparator,
		ZSpinner,
		ZStack,
		ZSwitch,
		ZTabs,
		ZTabsList,
		ZTabsPanel,
		ZTabsTrigger,
		ZTooltip,
		ZTooltipContent,
		ZTooltipTrigger,
		ZText,
		ZVisuallyHidden,
		ZHeading,
		defaultTheme,
		icss
	} from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import type { DesktopResult } from '@zadmin/webview/platform';
	import {
		ClipboardButton,
		ExternalLink,
		FilePickerButton,
		NotificationButton,
		SystemInfo,
		WindowFrame,
		useDesktopPlatform
	} from '@zadmin/webview/svelte';

	import { resultMessage } from '$lib/runtime.js';

	const desktop = useDesktopPlatform();
	let hydrated = $state(false);
	let status = $state('Ready. Choose a capability probe.');
	let selectedPath = $state<string>();
	let componentEvidenceRuns = $state(0);
	let primitiveLinkActivations = $state(0);
	let componentFormSubmits = $state(0);
	const pageClass = icss(defaultTheme, (s) => {
		s.padding._large;
		s.maxWidth('1100px');
		s.margin('0 auto');
	});
	const panelClass = icss(defaultTheme, (s) => {
		s.padding._large;
		s.borderWidth._hairline;
		s.borderStyle.solid;
		s.borderColor._border;
		s.borderRadius._large;
		s.backgroundColor._surface;
	});

	function setResult<T>(label: string, result: DesktopResult<T>, format: (value: T) => string) {
		status = `${label}: ${resultMessage(result, format)}`;
	}

	function recordComponentEvidence(): void {
		componentEvidenceRuns += 1;
		status = `Desktop component evidence ${componentEvidenceRuns}: ZButton click handled.`;
	}

	function recordPrimitiveLinkActivation(event: MouseEvent): void {
		event.preventDefault();
		primitiveLinkActivations += 1;
	}

	async function runtimeReport(): Promise<void> {
		const environment = desktop.environment.snapshot();
		const [app, os, window] = await Promise.all([
			desktop.app.snapshot(),
			desktop.os.snapshot(),
			desktop.window.snapshot()
		]);
		if (!app.ok) return setResult('Runtime', app, String);
		if (!os.ok) return setResult('Runtime', os, String);
		if (!window.ok) return setResult('Runtime', window, String);
		status = `Protocol ${environment.protocolVersion} · ${environment.runtime} · ${app.value.webviewVersion} · ${os.value.arch} · ${window.value.width}×${window.value.height}`;
	}

	async function typedErrorProbe(): Promise<void> {
		setResult(
			'Native guard',
			await desktop.opener.openUrl('https://not-allowed.example'),
			() => 'unexpected'
		);
	}

	async function storeProbe(): Promise<void> {
		const key = 'capability-probe';
		const written = await desktop.store.set(key, { ready: true, schema: 1 });
		if (!written.ok) return setResult('Store', written, () => 'written');
		await desktop.store.save();
		const value = await desktop.store.get(key);
		await desktop.store.delete(key);
		await desktop.store.save();
		setResult('Store', value, (item) => JSON.stringify(item));
	}

	async function logProbe(): Promise<void> {
		setResult(
			'Log',
			await desktop.log.write({
				fields: { source: 'capability-lab' },
				level: 'info',
				message: 'ZAdmin WebView log probe'
			}),
			() => 'written'
		);
	}

	async function fileReadProbe(): Promise<void> {
		if (!selectedPath) {
			status = 'File: select a text file first.';
			return;
		}
		const result = await desktop.filesystem.readText(selectedPath);
		setResult('File', result, (text) => `${text.length} chars · ${text.slice(0, 80)}`);
	}

	async function windowStateProbe(): Promise<void> {
		setResult('Window state', await desktop.windowState.save(), () => 'saved');
	}

	async function requestExit(relaunch: boolean): Promise<void> {
		if (!globalThis.confirm(relaunch ? 'Relaunch ZAdmin now?' : 'Exit ZAdmin now?')) return;
		const result = relaunch
			? await desktop.process.relaunch({ confirmed: true })
			: await desktop.process.exit({ confirmed: true });
		setResult(relaunch ? 'Relaunch' : 'Exit', result, () => 'requested');
	}

	onMount(() => {
		hydrated = true;
		let active = true;
		let dispose = () => Promise.resolve();
		void desktop.window
			.listen((snapshot) => {
				if (active)
					status = `Window event: ${snapshot.width}×${snapshot.height}; maximized=${snapshot.maximized}`;
			})
			.then((result) => {
				if (result.ok) dispose = () => result.value.dispose();
			});
		return () => {
			active = false;
			hydrated = false;
			void dispose();
		};
	});
</script>

<WindowFrame
	title="ZAdmin WebView capability lab"
	onerror={(error) => setResult('Window', { error, ok: false }, String)}
>
	<ZStack
		class={pageClass}
		gap="large"
		data-zadmin-webview-ready={hydrated || undefined}
		data-desktop-component="ZStack"
		data-desktop-evidence="ZStack"
	>
		<ZStack gap="small">
			<ZText as="strong" size="xlarge" data-desktop-component="ZText" data-desktop-evidence="ZText"
				>Windows WebView2 capability lab</ZText
			>
			<ZText tone="muted">
				SvelteKit SPA + ZUI + typed C# WebView protocol. No production Node, SSR, sidecar or local
				HTTP backend.
			</ZText>
		</ZStack>

		<ZBox class={panelClass}>
			<SystemInfo onerror={(error) => setResult('System', { error, ok: false }, String)} />
		</ZBox>

		<ZProvider motion="reduced">
			<ZBox class={panelClass} data-desktop-evidence="ZPopover-background-sibling">
				<ZText as="strong">Popover desktop contract</ZText>
				<ZPopover modal={false}>
					<ZPopoverTrigger
						data-desktop-component="ZPopoverTrigger"
						data-desktop-evidence="ZPopoverTrigger-settings">Open details</ZPopoverTrigger
					>
					<ZPopoverContent
						data-desktop-component="ZPopoverContent"
						data-desktop-evidence="ZPopoverContent-settings"
					>
						<h2>Details</h2>
						<p>Non-modal popover content.</p>
					</ZPopoverContent>
				</ZPopover>
			</ZBox>
		</ZProvider>

		<ZProvider motion="reduced">
			<ZBox class={panelClass} data-desktop-evidence="ZTooltip-background-sibling">
				<ZText as="strong">Tooltip desktop contract</ZText>
				<ZTooltip delay={0} closeDelay={0}>
					<ZTooltipTrigger
						data-desktop-component="ZTooltipTrigger"
						data-desktop-evidence="ZTooltipTrigger-settings">Focus for help</ZTooltipTrigger
					>
					<ZTooltipContent
						data-desktop-component="ZTooltipContent"
						data-desktop-evidence="ZTooltipContent-settings"
						>Desktop tooltip description</ZTooltipContent
					>
				</ZTooltip>
				<ZButton data-desktop-evidence="ZTooltip-outside-focus">Outside focus</ZButton>
			</ZBox>
		</ZProvider>

		<ZStack class={panelClass} gap="small">
			<ZText as="strong">Safe automated probes</ZText>
			<ZStack direction="row" gap="small" wrap>
				<ZButton
					data-desktop-component="ZButton"
					data-desktop-evidence="ZButton-component-action"
					data-desktop-evidence-runs={componentEvidenceRuns}
					onclick={recordComponentEvidence}>Verify component</ZButton
				>
				<ZButton variant="secondary" onclick={runtimeReport}>Runtime report</ZButton>
				<ZButton variant="secondary" onclick={typedErrorProbe}>Native guard error</ZButton>
				<ZButton variant="secondary" onclick={storeProbe}>Store roundtrip</ZButton>
				<ZButton variant="secondary" onclick={logProbe}>Write log</ZButton>
				<ZButton variant="secondary" onclick={windowStateProbe}>Save window state</ZButton>
			</ZStack>
		</ZStack>

		<ZForm
			class={panelClass}
			data-desktop-component="ZForm"
			data-desktop-evidence="ZForm-contract"
			data-desktop-submit-count={componentFormSubmits}
			onValidSubmit={() => (componentFormSubmits += 1)}
		>
			<ZStack gap="small">
				<ZText as="strong">Web component contracts</ZText>
				<ZFormField
					data-desktop-component="ZFormField"
					data-desktop-evidence="ZFormField-email"
					name="email"
					label="Desktop email"
					description="In-memory evidence only"
					required
				>
					<ZInput data-desktop-component="ZInput" data-desktop-evidence="ZInput-email" />
				</ZFormField>
				<label>
					<ZCheckbox
						data-desktop-component="ZCheckbox"
						data-desktop-evidence="ZCheckbox-enabled"
						name="enabled"
						value="enabled"
					/>
					Enable desktop evidence
				</label>
				<label>
					<ZSwitch
						data-desktop-component="ZSwitch"
						data-desktop-evidence="ZSwitch-enabled"
						name="switchEnabled"
						value="enabled"
					/>
					Enable switch evidence
				</label>
				<ZRadioGroup
					aria-label="Desktop mode"
					data-desktop-component="ZRadioGroup"
					data-desktop-evidence="ZRadioGroup-mode"
					defaultValue="standard"
					name="mode"
				>
					<label><ZRadioGroupItem value="standard" />Standard</label>
					<label><ZRadioGroupItem value="disabled" disabled />Disabled</label>
					<label>
						<ZRadioGroupItem
							data-desktop-component="ZRadioGroupItem"
							data-desktop-evidence="ZRadioGroupItem-advanced"
							value="advanced"
						/>
						Advanced
					</label>
				</ZRadioGroup>
				<ZSelect name="country">
					<ZSelectTrigger
						data-desktop-component="ZSelectTrigger"
						data-desktop-evidence="ZSelectTrigger-country"
					>
						Choose country
					</ZSelectTrigger>
					<ZSelectContent
						data-desktop-component="ZSelectContent"
						data-desktop-evidence="ZSelectContent-country"
					>
						<ZSelectItem data-desktop-option="disabled" value="disabled" disabled>
							Disabled
						</ZSelectItem>
						<ZSelectItem
							data-desktop-component="ZSelectItem"
							data-desktop-evidence="ZSelectItem-country-cn"
							data-desktop-option="cn"
							value="cn"
						>
							China
						</ZSelectItem>
						<ZSelectItem data-desktop-option="us" value="us">United States</ZSelectItem>
					</ZSelectContent>
				</ZSelect>
			</ZStack>
		</ZForm>

		<ZProvider motion="reduced">
			<ZBox class={panelClass} data-desktop-evidence="ZDialog-background-sibling">
				<ZText as="strong">Dialog desktop contract</ZText>
				<ZDialog>
					<ZDialogTrigger
						data-desktop-component="ZDialogTrigger"
						data-desktop-evidence="ZDialogTrigger-settings"
					>
						Open settings
					</ZDialogTrigger>
					<ZDialogOverlay
						data-desktop-component="ZDialogOverlay"
						data-desktop-evidence="ZDialogOverlay-settings"
					/>
					<ZDialogContent
						data-desktop-component="ZDialogContent"
						data-desktop-evidence="ZDialogContent-settings"
					>
						<ZDialogTitle
							data-desktop-component="ZDialogTitle"
							data-desktop-evidence="ZDialogTitle-settings"
						>
							Settings
						</ZDialogTitle>
						<ZDialogDescription
							data-desktop-component="ZDialogDescription"
							data-desktop-evidence="ZDialogDescription-settings"
						>
							In-memory desktop dialog evidence.
						</ZDialogDescription>
						<ZDialogClose
							data-desktop-component="ZDialogClose"
							data-desktop-evidence="ZDialogClose-settings"
						>
							Close settings
						</ZDialogClose>
					</ZDialogContent>
				</ZDialog>
			</ZBox>
			<ZContainer
				size="small"
				gutter="medium"
				data-desktop-component="ZContainer"
				data-desktop-evidence="ZContainer-primitives"
			>
				<ZHeading
					level={2}
					data-desktop-component="ZHeading"
					data-desktop-evidence="ZHeading-primitives">Desktop primitives</ZHeading
				>
				<ZCode
					data-desktop-component="ZCode"
					data-desktop-evidence="ZCode-primitives"
					code="const ready = true;"
				/>
				<ZIcon
					data-desktop-component="ZIcon"
					data-desktop-evidence="ZIcon-labelled"
					name="warning"
					label="Warning"
				/>
				<ZKbd data-desktop-component="ZKbd" data-desktop-evidence="ZKbd-primitives">Ctrl</ZKbd>
				<ZIcon data-desktop-evidence="ZIcon-decorative" name="check" />
				<ZLink
					data-desktop-component="ZLink"
					data-desktop-evidence="ZLink-primitives"
					href="#desktop-primitives"
					onclick={recordPrimitiveLinkActivation}>Local fragment</ZLink
				>
				<span id="desktop-primitives">Primitive target</span>
				<ZSeparator
					data-desktop-component="ZSeparator"
					data-desktop-evidence="ZSeparator-primitives"
				/>
				<ZVisuallyHidden
					data-desktop-component="ZVisuallyHidden"
					data-desktop-evidence="ZVisuallyHidden-primitives">Screen reader detail</ZVisuallyHidden
				>
				<ZAspectRatio
					data-desktop-component="ZAspectRatio"
					data-desktop-evidence="ZAspectRatio-primitives"
					ratio="16 / 9">Aspect ratio</ZAspectRatio
				>
				<ZAlert
					data-desktop-component="ZAlert"
					data-desktop-evidence="ZAlert-primitives"
					title="Desktop alert"
					live="polite">A measured alert.</ZAlert
				>
				<ZSpinner
					data-desktop-component="ZSpinner"
					data-desktop-evidence="ZSpinner-primitives"
					label="Loading desktop primitives"
				/>
				<span data-desktop-primitive-link-activations={primitiveLinkActivations}></span>
			</ZContainer>
		</ZProvider>

		<ZBox class={panelClass}>
			<ZText as="strong">Collection desktop contracts</ZText>
			<ZTabs
				data-desktop-component="ZTabs"
				data-desktop-evidence="ZTabs-settings"
				activationMode="automatic"
				defaultValue="general"
				loop
				orientation="horizontal"
				panelMount="keep-mounted"
			>
				<ZTabsList data-desktop-component="ZTabsList" data-desktop-evidence="ZTabsList-settings">
					<ZTabsTrigger
						data-desktop-component="ZTabsTrigger"
						data-desktop-evidence="ZTabsTrigger-general"
						value="general">General</ZTabsTrigger
					>
					<ZTabsTrigger data-desktop-option="disabled" disabled value="disabled"
						>Disabled</ZTabsTrigger
					>
					<ZTabsTrigger data-desktop-option="advanced" value="advanced">Advanced</ZTabsTrigger>
				</ZTabsList>
				<ZTabsPanel
					data-desktop-component="ZTabsPanel"
					data-desktop-evidence="ZTabsPanel-general"
					value="general"
				>
					General content
				</ZTabsPanel>
				<ZTabsPanel data-desktop-panel="advanced" value="advanced">Advanced content</ZTabsPanel>
			</ZTabs>

			<ZProvider motion="reduced">
				<ZAccordion
					data-desktop-component="ZAccordion"
					data-desktop-evidence="ZAccordion-settings"
					type="single"
					defaultValue="general"
					collapsible
					loop
				>
					<ZAccordionItem
						value="general"
						data-desktop-component="ZAccordionItem"
						data-desktop-evidence="ZAccordionItem-general"
					>
						<ZAccordionTrigger
							data-desktop-component="ZAccordionTrigger"
							data-desktop-evidence="ZAccordionTrigger-general"
						>
							General section
						</ZAccordionTrigger>
						<ZAccordionContent
							data-desktop-component="ZAccordionContent"
							data-desktop-evidence="ZAccordionContent-general"
						>
							General details
						</ZAccordionContent>
					</ZAccordionItem>
					<ZAccordionItem data-desktop-option="disabled" value="disabled" disabled>
						<ZAccordionTrigger>Disabled section</ZAccordionTrigger>
						<ZAccordionContent>Disabled details</ZAccordionContent>
					</ZAccordionItem>
					<ZAccordionItem data-desktop-option="advanced" value="advanced">
						<ZAccordionTrigger>Advanced section</ZAccordionTrigger>
						<ZAccordionContent>Advanced details</ZAccordionContent>
					</ZAccordionItem>
				</ZAccordion>
			</ZProvider>
		</ZBox>

		<ZStack class={panelClass} gap="small">
			<ZText as="strong">Supervised native capabilities</ZText>
			<ZStack direction="row" gap="small" wrap>
				<FilePickerButton
					onselect={(value) => {
						selectedPath = typeof value === 'string' ? value : value?.[0];
						status = selectedPath ? `Selected: ${selectedPath}` : 'Selection cancelled.';
					}}
				/>
				<ZButton variant="secondary" onclick={fileReadProbe}>Read selected text</ZButton>
				<ClipboardButton
					mode="read"
					label="Read clipboard"
					onread={(value) => (status = `Clipboard: ${value}`)}
				/>
				<ClipboardButton
					mode="write"
					text="ZAdmin WebView clipboard probe"
					label="Write clipboard"
				/>
				<NotificationButton
					notification={{ title: 'ZAdmin Desktop', body: 'WebView2 notification probe' }}
				/>
				<ExternalLink href="https://learn.microsoft.com/microsoft-edge/webview2/"
					>WebView2 docs</ExternalLink
				>
			</ZStack>
			<ZText tone="muted">{selectedPath ?? 'No native path selected.'}</ZText>
		</ZStack>

		<ZStack class={panelClass} gap="small">
			<ZText as="strong" tone="danger">Destructive process actions</ZText>
			<ZStack direction="row" gap="small">
				<ZButton tone="danger" onclick={() => requestExit(false)}>Exit</ZButton>
				<ZButton tone="danger" onclick={() => requestExit(true)}>Relaunch</ZButton>
			</ZStack>
		</ZStack>

		<ZBox
			class={panelClass}
			aria-live="polite"
			data-desktop-component="ZBox"
			data-desktop-evidence="ZBox-status"><ZText>{status}</ZText></ZBox
		>
	</ZStack>
</WindowFrame>
