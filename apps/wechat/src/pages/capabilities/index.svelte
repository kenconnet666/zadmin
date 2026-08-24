<script lang="ts">
	import {
		allWechatCapabilities,
		createCapabilityReport,
		getWeChatPlatform
	} from '@zadmin/svelte-taro/platform';
	import { Box, Button, Stack, Text, ZuiProvider } from '@zadmin/zui-taro';

	const platform = getWeChatPlatform();
	const report = createCapabilityReport();
	let result = $state('No probe has run. Sensitive capabilities stay manual.');
	let busy = $state(false);

	async function runProbe(name: 'network' | 'privacy' | 'storage'): Promise<void> {
		if (busy) return;
		busy = true;
		try {
			switch (name) {
				case 'network': {
					const network = await platform.system.network.current();
					result = `Network probe: ${network.networkType}`;
					break;
				}
				case 'privacy': {
					const privacy = await platform.privacy.setting();
					result = privacy.needAuthorization
						? 'Privacy probe: consent may be required.'
						: 'Privacy probe: no pending consent reported.';
					break;
				}
				case 'storage': {
					const key = '__zadmin_platform_probe__';
					await platform.system.storage.set(key, { ready: true });
					const value = await platform.system.storage.get<{ ready: boolean }>(key);
					await platform.system.storage.remove(key);
					result = `Storage probe: ${value.ready ? 'roundtrip and cleanup passed' : 'unexpected value'}.`;
				}
			}
		} catch (error) {
			result = error instanceof Error ? error.message : 'Probe failed with an unknown error.';
		} finally {
			busy = false;
		}
	}
</script>

<ZuiProvider>
	<Box style={{ minHeight: '100vh', padding: '20px 16px' }}>
		<Stack gap="large">
			<Text size="xlarge" weight="bold">WeChat platform capability lab</Text>
			<Text color="textMuted">
				{allWechatCapabilities.length} descriptors · {report.filter(
					(entry) => entry.grade === 'mock-verified'
				).length}
				mock-verified
			</Text>
			<Stack direction="row" gap="small">
				<Button id="probe-network" size="small" disabled={busy} onclick={() => runProbe('network')}>
					Network
				</Button>
				<Button id="probe-storage" size="small" disabled={busy} onclick={() => runProbe('storage')}>
					Storage
				</Button>
				<Button id="probe-privacy" size="small" disabled={busy} onclick={() => runProbe('privacy')}>
					Privacy (read-only)
				</Button>
			</Stack>
			<Text id="probe-result">{result}</Text>
			<Stack gap="small">
				{#each report as entry (entry.descriptor.id)}
					<Box style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 0' }}>
						<Text weight="semibold">{entry.descriptor.title}</Text>
						<Text color="textMuted" size="small">
							{entry.descriptor.id} · {entry.descriptor.stability} · {entry.grade}
						</Text>
					</Box>
				{/each}
			</Stack>
		</Stack>
	</Box>
</ZuiProvider>
