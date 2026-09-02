<script lang="ts">
	import { onMount } from 'svelte';
	import { ZBox, ZButton, ZStack, ZText, defaultTheme, icss } from '@zadmin/zui';
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
	<ZStack class={pageClass} gap="large" data-zadmin-webview-ready={hydrated || undefined}>
		<ZStack gap="small">
			<ZText as="strong" size="xlarge">Windows WebView2 capability lab</ZText>
			<ZText tone="muted">
				SvelteKit SPA + ZUI + typed C# WebView protocol. No production Node, SSR, sidecar or local
				HTTP backend.
			</ZText>
		</ZStack>

		<ZBox class={panelClass}>
			<SystemInfo onerror={(error) => setResult('System', { error, ok: false }, String)} />
		</ZBox>

		<ZStack class={panelClass} gap="small">
			<ZText as="strong">Safe automated probes</ZText>
			<ZStack direction="row" gap="small" wrap>
				<ZButton onclick={runtimeReport}>Runtime report</ZButton>
				<ZButton variant="secondary" onclick={typedErrorProbe}>Native guard error</ZButton>
				<ZButton variant="secondary" onclick={storeProbe}>Store roundtrip</ZButton>
				<ZButton variant="secondary" onclick={logProbe}>Write log</ZButton>
				<ZButton variant="secondary" onclick={windowStateProbe}>Save window state</ZButton>
			</ZStack>
		</ZStack>

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

		<ZBox class={panelClass} aria-live="polite"><ZText>{status}</ZText></ZBox>
	</ZStack>
</WindowFrame>
