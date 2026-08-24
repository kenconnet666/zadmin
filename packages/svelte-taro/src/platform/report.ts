import { allWechatCapabilities } from './catalog.ts';
import type { CapabilityReportEntry, VerificationGrade } from './types.ts';

const MOCK_VERIFIED = new Set([
	'wechat.support.can-i-use',
	'wechat.support.system',
	'wechat.privacy.permission',
	'wechat.privacy.setting',
	'wechat.identity.login',
	'wechat.identity.check-session',
	'wechat.identity.phone-number',
	'wechat.identity.soter',
	'wechat.commerce.payment',
	'wechat.media.choose',
	'wechat.media.scan',
	'wechat.media.camera',
	'wechat.location.current',
	'wechat.location.foreground',
	'wechat.location.background',
	'wechat.hardware.bluetooth',
	'wechat.hardware.ble-connection',
	'wechat.hardware.nfc',
	'wechat.hardware.wifi',
	'wechat.hardware.sensors',
	'wechat.system.network',
	'wechat.system.storage',
	'wechat.system.files',
	'wechat.network.websocket',
	'wechat.network.tcp',
	'wechat.network.udp',
	'wechat.network.mdns',
	'wechat.messaging.subscribe'
]);

function gradeFor(id: string): VerificationGrade {
	return MOCK_VERIFIED.has(id) ? 'mock-verified' : 'contract-tested';
}

export function createCapabilityReport(
	overrides: Readonly<Record<string, Pick<CapabilityReportEntry, 'grade' | 'note'>>> = {}
): readonly CapabilityReportEntry[] {
	return allWechatCapabilities.map((descriptor) => {
		const override = overrides[descriptor.id];
		return {
			descriptor,
			grade: override?.grade ?? gradeFor(descriptor.id),
			...(override?.note === undefined ? {} : { note: override.note })
		};
	});
}

export function serializeCapabilityReport(entries = createCapabilityReport()): string {
	return `${JSON.stringify(entries, null, '\t')}\n`;
}
