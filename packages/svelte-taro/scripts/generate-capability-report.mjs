import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createCapabilityReport, serializeCapabilityReport } from '../dist/platform/report.js';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(packageRoot, '../../apps/docs/content');
const overrides = {
	'wechat.privacy.setting': {
		grade: 'simulator-verified',
		note: 'Read-only getPrivacySetting probe passed in WeChat DevTools on 2026-08-25.'
	},
	'wechat.system.network': {
		grade: 'simulator-verified',
		note: 'getNetworkType returned wifi in WeChat DevTools on 2026-08-25.'
	},
	'wechat.system.storage': {
		grade: 'simulator-verified',
		note: 'Temporary value roundtrip and cleanup passed in WeChat DevTools on 2026-08-25.'
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

Generated from the fixed Taro 4.2.1 capability catalog on 2026-08-25. Verification grades are evidence levels, not interchangeable claims. No payment, phone-number, subscription, permission prompt, upload, cloud write, or real-hardware action was triggered during unattended acceptance.

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
