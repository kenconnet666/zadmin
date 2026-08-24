# WeChat capability verification report

Generated from the fixed Taro 4.2.1 capability catalog on 2026-08-25. Verification grades are evidence levels, not interchangeable claims. No payment, phone-number, subscription, permission prompt, upload, cloud write, or real-hardware action was triggered during unattended acceptance.

| Capability                     | Stability   | Highest grade      | Real device | Account entitlement | Evidence / limit                                                                  |
| ------------------------------ | ----------- | ------------------ | ----------- | ------------------- | --------------------------------------------------------------------------------- |
| wechat.commerce.payment        | provisional | mock-verified      | no          | yes                 | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.compute.worker          | raw         | contract-tested    | no          | no                  |                                                                                   |
| wechat.compute.experimental    | raw         | contract-tested    | required    | yes                 | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.hardware.beacon         | provisional | contract-tested    | required    | no                  | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.hardware.bluetooth      | provisional | mock-verified      | required    | no                  | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.hardware.ble-connection | provisional | mock-verified      | required    | no                  | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.hardware.nfc            | provisional | mock-verified      | required    | no                  | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.hardware.sensors        | provisional | mock-verified      | required    | no                  | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.hardware.wifi           | provisional | mock-verified      | required    | no                  | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.identity.check-session  | stable      | mock-verified      | no          | no                  |                                                                                   |
| wechat.identity.login          | stable      | mock-verified      | no          | no                  |                                                                                   |
| wechat.identity.phone-number   | provisional | mock-verified      | no          | yes                 | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.identity.soter          | provisional | mock-verified      | required    | no                  | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.location.background     | provisional | mock-verified      | required    | yes                 | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.location.current        | provisional | mock-verified      | recommended | no                  |                                                                                   |
| wechat.location.foreground     | provisional | mock-verified      | recommended | no                  |                                                                                   |
| wechat.media.camera            | provisional | mock-verified      | recommended | no                  |                                                                                   |
| wechat.media.choose            | stable      | mock-verified      | recommended | no                  |                                                                                   |
| wechat.media.scan              | provisional | mock-verified      | required    | no                  | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.messaging.share         | stable      | contract-tested    | no          | no                  |                                                                                   |
| wechat.messaging.subscribe     | provisional | mock-verified      | no          | yes                 | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.network.mdns            | provisional | mock-verified      | required    | no                  | No unattended real-device or account entitlement evidence; see manual acceptance. |
| wechat.network.tcp             | provisional | mock-verified      | recommended | no                  |                                                                                   |
| wechat.network.udp             | provisional | mock-verified      | recommended | no                  |                                                                                   |
| wechat.network.websocket       | stable      | mock-verified      | no          | no                  |                                                                                   |
| wechat.privacy.permission      | stable      | mock-verified      | no          | no                  |                                                                                   |
| wechat.privacy.setting         | stable      | simulator-verified | no          | no                  | Read-only getPrivacySetting probe passed in WeChat DevTools on 2026-08-25.        |
| wechat.support.can-i-use       | stable      | mock-verified      | no          | no                  |                                                                                   |
| wechat.support.system          | stable      | mock-verified      | no          | no                  |                                                                                   |
| wechat.system.files            | stable      | mock-verified      | no          | no                  |                                                                                   |
| wechat.system.network          | stable      | simulator-verified | no          | no                  | getNetworkType returned wifi in WeChat DevTools on 2026-08-25.                    |
| wechat.system.storage          | stable      | simulator-verified | no          | no                  | Temporary value roundtrip and cleanup passed in WeChat DevTools on 2026-08-25.    |

The machine-readable companion is `wechat-capability-report.json`. Hardware-, merchant-, category-, template-, and privacy-backend-dependent entries remain contract/mock verified unless their row explicitly says otherwise.
