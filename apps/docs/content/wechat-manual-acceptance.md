# WeChat manual device and account acceptance

This checklist is intentionally not executed by unattended automation. Use it only with an authorized non-production test account, test merchant order, disposable device data, and explicit user gestures. Never paste AppSecret, session_key, merchant private keys, paySign source material, login/phone codes, precise location, or hardware payloads into screenshots, issues, or repository files.

## Common evidence

For every run record date, package commit, DevTools/base-library version, device model/OS/WeChat version, renderer, AppID category (without secret material), capability ID, expected result, actual result, cleanup result, and sanitized console/network evidence. A simulator result cannot be labeled device-verified; a payment client callback cannot be labeled account-verified until the server confirms the order.

## Renderer

1. Build the default WebView project and verify index/capability pages, counter, theme, if, keyed list, navigation, and no application console errors.
2. In a temporary branch set PageConfig `renderer: 'skyline'`, `componentFramework: 'glass-easel'`, and `navigationStyle: 'custom'`; retain AppConfig `lazyCodeLoading: 'requiredComponents'` plus `rendererOptions.skyline.defaultDisplayBlock/defaultContentBox`; rebuild and repeat visual/interaction checks on supported devices.
3. Restore WebView unless Skyline is explicitly approved as a release target.
4. Do not promote Skyline while the current Taro/DevTools combination renders the control fixture as a black surface or while automator fails to resolve the current Skyline page. Re-run both the Svelte app and a same-version official-framework control after toolchain upgrades.

## Identity and privacy

1. Read privacy/settings without prompting and confirm the UI explains unavailable/required states.
2. From an explicit button, test first permission request, denial, open-setting return, and already-granted paths; unload the page and confirm listeners/scopes return to baseline.
3. Call login from a user-initiated flow, send the one-time branded code directly to a test backend over HTTPS, exchange with code2Session server-side, and confirm neither code nor session_key is logged or returned to the client.
4. Click `PhoneNumberButton`, send its distinct one-time code to the backend `phonenumber.getPhoneNumber` flow, verify replay rejection, and confirm the component never displays/logs the code or raw phone data.
5. For SOTER, generate challenge server-side, test supported/unsupported/cancel paths, and verify the signature on the server.

## Payment and messaging

1. Create and sign a minimal-value test order on the backend; the client only receives prepared payment fields.
2. Test user cancellation and success. Do not fulfill from the client callback; verify fulfillment only after signed callback or server-side query.
3. Verify duplicate callback/idempotency, timeout, pending order, refund, and reconciliation in the payment business package—not in `svelte-taro`.
4. Request one to three test subscription templates from an explicit button; record accept/reject/ban without assuming a message was sent. Verify sending and tracking server-side.

## Media and location

1. On iOS and Android, test chooseMedia, scan cancellation/success, camera context creation failure, one-camera-per-page ownership, and page-unload cleanup.
2. Test location prompt/denial/grant, foreground updates, background mode declaration, App hide/show policy, throttling, and final stop. Store only coarse/sanitized evidence.
3. Verify WebView and approved Skyline differences separately.

## Bluetooth, NFC, Wi-Fi, beacon, and sensors

1. Bluetooth: system disabled, adapter open/close, discovery start/stop, duplicate close, BLE connect/disconnect, service/characteristic discovery, read/write/notify, MTU/fragmentation in the device-protocol package, and abrupt peripheral loss.
2. NFC: unsupported iOS path, Android system-disabled path, discovery start/stop, tag loss, each required tag technology, timeout, and idempotent close.
3. Wi-Fi: unsupported OS, module start/stop, list/connected network, user cancellation, invalid credentials using an isolated test network, and no password logging.
4. Beacon/sensors: start/stop pairing, event throttle, App background behavior, last-subscriber cleanup, and battery impact sampling.
5. After 100 open/close or page mount/unmount cycles, listener/session/connection counts must return to the recorded baseline.

## Network, files, and storage

1. Test offline/online transition, weak network, timeout, TLS/domain rejection, WebSocket open/message/error/close, TCP/UDP/mDNS availability, and page-unload close.
2. Test storage quota/error, schema migration, temporary file cleanup, missing files, and recovery after interrupted writes. Local storage must not be treated as a trusted credential store.

## Grade promotion

- Promote to `device-verified` only with named device/OS evidence and successful cleanup.
- Promote to `account-verified` only with the relevant verified主体/merchant/template/category/backend end-to-end evidence.
- Never promote a whole domain because one method passed; update only the tested descriptor rows in `wechat-capability-report.json` and regenerate the Markdown report.

## Executed supervised WebView record — 2026-08-25

- Build/package checkpoint: `b75e46f`; Taro 4.2.1; WebView; authorized developer test project with AppID omitted.
- Device: Xiaomi 22081212C, arm64-v8a, Android API 35; WeChat 8.0.76; base library 3.17.1; Wi-Fi real-device debugger.
- Homepage rendering was confirmed by the user. The debugger WXML tree changed from `pages/index/index` to `pages/capabilities/index` after the typed navigation action.
- `wechat.system.network`: `Network probe: wifi`.
- `wechat.system.storage`: `Storage probe: roundtrip and cleanup passed.` The probe key was read and removed by the tested flow.
- `wechat.privacy.setting`: `Privacy probe: no pending consent reported.` The call was read-only and did not open a consent prompt.
- The real-device Console was empty before navigation and after each probe. Service status stayed normal; debugger waiting-send and unacknowledged counts stayed at zero. Observed round-trip latency ranged from roughly 240–386 ms.
- No login, phone-number, payment, subscription, permission prompt, upload, location, media, Bluetooth, NFC, Wi-Fi-session, sensor, socket, cloud, or merchant action was executed. No broader descriptor or renderer grade is implied.
