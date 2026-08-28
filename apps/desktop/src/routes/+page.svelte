<script lang="ts">
	import { onMount } from 'svelte';
	import { Channel } from '@tauri-apps/api/core';
	import { ZBox, ZButton, ZStack, ZText, defaultTheme, icss } from '@zadmin/zui';
	import { BaseDirectory, type DesktopResult } from '@zadmin/tauri';
	import {
		ClipboardButton,
		ExternalLink,
		FilePickerButton,
		NotificationButton,
		SystemInfo,
		WindowFrame,
		useDesktopPlatform
	} from '@zadmin/tauri/svelte';

	import { normalizeCommandResult } from '$lib/commands.js';
	import {
		commands,
		events,
		IPC_SCHEMA_VERSION,
		type ChannelProbeEvent
	} from '$lib/generated/tauri.js';
	import { resultMessage } from '$lib/runtime.js';

	const desktop = useDesktopPlatform();
	let status = $state('Ready. Choose a capability probe.');
	let selectedPath = $state('No native path selected.');
	const pageClass = icss(defaultTheme, (css) => {
		css.padding._large;
		css.maxWidth('1100px');
		css.margin('0 auto');
	});
	const panelClass = icss(defaultTheme, (css) => {
		css.padding._large;
		css.borderWidth._hairline;
		css.borderStyle('solid');
		css.borderColor._border;
		css.borderRadius._large;
		css.backgroundColor._surface;
	});

	function setResult<T>(label: string, result: DesktopResult<T>, format: (value: T) => string) {
		status = `${label}: ${resultMessage(result, format)}`;
	}

	async function runtimeReport(): Promise<void> {
		if (!desktop.environment.snapshot().isTauri) {
			status = 'Typed IPC: unavailable outside Tauri.';
			return;
		}
		try {
			const report = await commands.desktopRuntimeReport();
			status = `Typed IPC schema ${report.schemaVersion}/${IPC_SCHEMA_VERSION}: ${report.targetOs} ${report.targetArch}; ${report.capabilities.length} capabilities; uptime ${report.uptimeMs} ms.`;
		} catch (error) {
			status = `Typed IPC transport failure: ${String(error)}`;
		}
	}

	async function typedErrorProbe(): Promise<void> {
		const generated = await commands.desktopErrorProbe({
			forceFailure: true,
			message: 'camera'
		});
		setResult('Typed error', normalizeCommandResult(generated), (value) => value.echoed);
	}

	async function channelProbe(): Promise<void> {
		const received: ChannelProbeEvent[] = [];
		const channel = new Channel<ChannelProbeEvent>((event) => received.push(event));
		const generated = await commands.desktopChannelProbe(
			{ count: 3, message: 'channel-ready' },
			channel
		);
		setResult('Typed channel', normalizeCommandResult(generated), (value) => {
			return `${value.delivered} delivered / ${received.length} received`;
		});
	}

	async function filesystemProbe(): Promise<void> {
		const directory = 'zadmin';
		const path = `${directory}/capability-probe.txt`;
		const created = await desktop.filesystem.mkdir(directory, {
			baseDir: BaseDirectory.AppData,
			recursive: true
		});
		if (!created.ok) {
			setResult('Filesystem', created, () => 'created');
			return;
		}
		const written = await desktop.filesystem.writeText(path, 'desktop-ready', {
			baseDir: BaseDirectory.AppData
		});
		if (!written.ok) {
			setResult('Filesystem', written, () => 'written');
			return;
		}
		const read = await desktop.filesystem.readText(path, { baseDir: BaseDirectory.AppData });
		const removed = await desktop.filesystem.remove(path, { baseDir: BaseDirectory.AppData });
		if (!read.ok) setResult('Filesystem', read, String);
		else if (!removed.ok) setResult('Filesystem cleanup', removed, () => 'removed');
		else status = `Filesystem: ${read.value}; roundtrip and cleanup passed.`;
	}

	async function storeProbe(): Promise<void> {
		const key = 'capability-probe';
		const set = await desktop.store.set(key, { ready: true, schema: IPC_SCHEMA_VERSION });
		if (!set.ok) {
			setResult('Store', set, () => 'saved');
			return;
		}
		const value = await desktop.store.get(key);
		await desktop.store.delete(key);
		await desktop.store.save();
		setResult('Store', value, (item) => JSON.stringify(item));
	}

	async function logProbe(): Promise<void> {
		setResult(
			'Log',
			await desktop.log.info('ZAdmin desktop log probe', {
				keyValues: { source: 'capability-lab' }
			}),
			() => 'written'
		);
	}

	async function windowStateProbe(): Promise<void> {
		const saved = await desktop.windowState.save();
		if (!saved.ok) setResult('Window state', saved, () => 'saved');
		else setResult('Window state', await desktop.windowState.filename(), String);
	}

	async function requestExit(relaunch: boolean): Promise<void> {
		const confirmed = await desktop.dialog.confirm(
			relaunch ? 'Relaunch the desktop application now?' : 'Exit the desktop application now?',
			{ kind: 'warning', title: 'Confirm process action' }
		);
		if (!confirmed.ok || !confirmed.value) {
			if (!confirmed.ok) setResult('Process confirmation', confirmed, String);
			return;
		}
		const result = relaunch
			? await desktop.process.relaunch({ confirmed: true })
			: await desktop.process.exit({ confirmed: true });
		setResult(relaunch ? 'Relaunch' : 'Exit', result, () => 'requested');
	}

	onMount(() => {
		if (!desktop.environment.snapshot().isTauri) return;
		let unlisten: (() => void) | undefined;
		void events.desktopRuntimeReady
			.listen((event) => {
				status = `Typed event: desktop runtime schema ${event.payload.schemaVersion} ready.`;
			})
			.then((dispose) => (unlisten = dispose));
		return () => unlisten?.();
	});
</script>

<WindowFrame
	title="ZAdmin Desktop capability lab"
	onerror={(error) => setResult('Window', { error, ok: false }, String)}
>
	<ZStack class={pageClass} gap="large">
		<ZStack gap="small">
			<ZText as="strong" size="xlarge">Windows 11 capability lab</ZText>
			<ZText tone="muted">
				SvelteKit SPA + ZUI Svelte + typed Tauri system APIs. No production Node or local HTTP
				backend.
			</ZText>
		</ZStack>

		<ZBox class={panelClass}>
			<SystemInfo onerror={(error) => setResult('System', { error, ok: false }, String)} />
		</ZBox>

		<ZStack class={panelClass} gap="small">
			<ZText as="strong">Safe automated probes</ZText>
			<ZStack direction="row" gap="small">
				<ZButton onclick={runtimeReport}>Typed runtime report</ZButton>
				<ZButton variant="secondary" onclick={typedErrorProbe}>Typed error</ZButton>
				<ZButton variant="secondary" onclick={channelProbe}>Typed channel</ZButton>
				<ZButton variant="secondary" onclick={filesystemProbe}>AppData roundtrip</ZButton>
				<ZButton variant="secondary" onclick={storeProbe}>Store roundtrip</ZButton>
				<ZButton variant="secondary" onclick={logProbe}>Write log</ZButton>
				<ZButton variant="secondary" onclick={windowStateProbe}>Save window state</ZButton>
			</ZStack>
		</ZStack>

		<ZStack class={panelClass} gap="small">
			<ZText as="strong">Supervised native capabilities</ZText>
			<ZStack direction="row" gap="small">
				<FilePickerButton onselect={(value) => (selectedPath = JSON.stringify(value))} />
				<ClipboardButton
					mode="read"
					label="Read clipboard"
					onread={(value) => (status = `Clipboard: ${value}`)}
				/>
				<ClipboardButton
					mode="write"
					text="ZAdmin desktop clipboard probe"
					label="Write clipboard"
				/>
				<NotificationButton
					notification={{ title: 'ZAdmin Desktop', body: 'Notification probe' }}
				/>
				<ExternalLink href="https://v2.tauri.app/plugin/">Tauri plugin docs</ExternalLink>
			</ZStack>
			<ZText tone="muted">{selectedPath}</ZText>
		</ZStack>

		<ZStack class={panelClass} gap="small">
			<ZText as="strong" tone="danger">Destructive process actions</ZText>
			<ZStack direction="row" gap="small">
				<ZButton variant="danger" onclick={() => requestExit(false)}>Exit</ZButton>
				<ZButton variant="danger" onclick={() => requestExit(true)}>Relaunch</ZButton>
			</ZStack>
		</ZStack>

		<ZBox class={panelClass} aria-live="polite">
			<ZText>{status}</ZText>
		</ZBox>
	</ZStack>
</WindowFrame>
