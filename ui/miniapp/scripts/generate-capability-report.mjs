import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createCapabilityReport, serializeCapabilityReport } from '../dist/platform/report.js';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(packageRoot, '../../.docs/miniapp');
const overrides = {
	'wechat.compute.worker': {
		grade: 'device-verified',
		note: 'Two consecutive Worker message roundtrips and terminate cycles passed on Android API 35 / WeChat 8.0.76 / base library 3.17.1 with an empty device console on 2026-08-25.'
	},
	'wechat.identity.check-session': {
		grade: 'device-verified',
		note: 'checkSession returned valid without requesting a login code on Android API 35 / WeChat 8.0.76 / base library 3.17.1 with an empty device console on 2026-08-25.'
	},
	'wechat.privacy.setting': {
		grade: 'device-verified',
		note: 'Read-only getPrivacySetting returned no pending consent on Android API 35 / WeChat 8.0.76 / base library 3.17.1; no prompt and an empty device console on 2026-08-25.'
	},
	'wechat.support.can-i-use': {
		grade: 'device-verified',
		note: 'Capability support check returned available on Android API 35 / WeChat 8.0.76 / base library 3.17.1 with an empty device console on 2026-08-25.'
	},
	'wechat.support.system': {
		grade: 'device-verified',
		note: 'getSystemSetting returned a valid read-only shape without opening settings on Android API 35 / WeChat 8.0.76 / base library 3.17.1 with an empty device console on 2026-08-25.'
	},
	'wechat.system.files': {
		grade: 'device-verified',
		note: 'Sandbox file write/read/unlink and post-unlink absence verification passed on Android API 35 / WeChat 8.0.76 / base library 3.17.1 with an empty device console on 2026-08-25.'
	},
	'wechat.system.network': {
		grade: 'device-verified',
		note: 'getNetworkType returned wifi on Android API 35 / WeChat 8.0.76 / base library 3.17.1 with an empty device console on 2026-08-25.'
	},
	'wechat.system.storage': {
		grade: 'device-verified',
		note: 'Temporary value roundtrip and removal passed on Android API 35 / WeChat 8.0.76 / base library 3.17.1 with an empty device console on 2026-08-25.'
	}
};
const report = createCapabilityReport(overrides);
const rows = report.map(({ descriptor, grade, note }) =>
	[
		descriptor.id,
		descriptor.stability,
		grade,
		descriptor.realDevice,
		descriptor.requiresAccountEntitlement ? 'yes' : 'no',
		note ??
			(descriptor.realDevice === 'required' || descriptor.requiresAccountEntitlement
				? 'No unattended real-device or account entitlement evidence; see manual acceptance.'
				: '')
	]
		.map((value) => String(value).replaceAll('|', '\\|'))
		.join(' | ')
);
const markdown = `# WeChat capability verification report

Generated from the pinned official WeChat Mini Program API type catalog. Verification grades are evidence levels, not interchangeable claims. Supervised WebView device acceptance covered only the rows explicitly marked device-verified. No payment, phone-number, login-code request, subscription, permission prompt, upload, cloud write, merchant flow, or hardware session was triggered.

| Capability | Stability | Highest grade | Real device | Account entitlement | Evidence / limit |
| --- | --- | --- | --- | --- | --- |
${rows.map((row) => `| ${row} |`).join('\n')}

The machine-readable companion is \`wechat-capability-report.json\`. Hardware-, merchant-, category-, template-, and privacy-backend-dependent entries remain contract/mock verified unless their row explicitly says otherwise.
`;

await mkdir(outputRoot, { recursive: true });
await Promise.all([
	writeFile(
		resolve(outputRoot, 'wechat-capability-report.json'),
		serializeCapabilityReport(report)
	),
	writeFile(resolve(outputRoot, 'wechat-capability-report.md'), markdown)
]);
console.log(`Generated ${report.length} capability records without sensitive runtime data.`);
