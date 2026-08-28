<script lang="ts">
	import {
		allWechatCapabilities,
		createCapabilityReport,
		getWeChatPlatform
	} from '@zadmin/miniapp/platform';
	import { MBox, MButton, MProvider, MStack, MText } from '@zadmin/miniapp';
	import { runSafeProbe, type SafeProbeName } from './probes.ts';

	const platform = getWeChatPlatform();
	const report = createCapabilityReport();
	let result = $state('No probe has run. Sensitive capabilities stay manual.');
	let busy = $state(false);

	type ProbeName = SafeProbeName | 'network' | 'privacy' | 'storage';

	async function runProbe(name: ProbeName): Promise<void> {
		if (busy) return;
		busy = true;
		try {
			switch (name) {
				case 'files':
				case 'session':
				case 'support':
				case 'system':
				case 'worker':
					result = await runSafeProbe(platform, name);
					break;
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

<MProvider>
	<MBox style={{ minHeight: '100vh', padding: '40rpx 32rpx' }}>
		<MStack gap="large">
			<MText size="xlarge" weight="bold">WeChat platform capability lab</MText>
			<MText tone="muted">
				{allWechatCapabilities.length} descriptors · {report.filter(
					(entry) => entry.grade === 'mock-verified'
				).length}
				mock-verified
			</MText>
			<MText weight="semibold">Safe platform probes</MText>
			<MStack direction="row" gap="small">
				<MButton
					id="probe-support"
					size="small"
					disabled={busy}
					onclick={() => runProbe('support')}
				>
					Support
				</MButton>
				<MButton id="probe-system" size="small" disabled={busy} onclick={() => runProbe('system')}>
					System
				</MButton>
				<MButton
					id="probe-session"
					size="small"
					disabled={busy}
					onclick={() => runProbe('session')}
				>
					Session
				</MButton>
			</MStack>
			<MStack direction="row" gap="small">
				<MButton id="probe-files" size="small" disabled={busy} onclick={() => runProbe('files')}>
					Files
				</MButton>
				<MButton id="probe-worker" size="small" disabled={busy} onclick={() => runProbe('worker')}>
					Worker
				</MButton>
			</MStack>
			<MText weight="semibold">Previously verified probes</MText>
			<MStack direction="row" gap="small">
				<MButton
					id="probe-network"
					size="small"
					disabled={busy}
					onclick={() => runProbe('network')}
				>
					Network
				</MButton>
				<MButton
					id="probe-storage"
					size="small"
					disabled={busy}
					onclick={() => runProbe('storage')}
				>
					Storage
				</MButton>
				<MButton
					id="probe-privacy"
					size="small"
					disabled={busy}
					onclick={() => runProbe('privacy')}
				>
					Privacy (read-only)
				</MButton>
			</MStack>
			<MText id="probe-result">{result}</MText>
			<MStack gap="small">
				{#each report as entry (entry.descriptor.id)}
					<MBox style={{ borderBottom: '2rpx solid #e2e8f0', padding: '16rpx 0' }}>
						<MText weight="semibold">{entry.descriptor.title}</MText>
						<MText tone="muted" size="small">
							{entry.descriptor.id} · {entry.descriptor.stability} · {entry.grade}
						</MText>
					</MBox>
				{/each}
			</MStack>
		</MStack>
	</MBox>
</MProvider>
