import type { LoginCode, PhoneNumberCode, WeChatPlatform } from '../src/platform/index.ts';

declare const loginCode: LoginCode;
declare const phoneCode: PhoneNumberCode;

const loginAsString: string = loginCode;
const phoneAsString: string = phoneCode;

// @ts-expect-error A wx.login code must never be sent to the phone-number exchange endpoint.
const phoneFromLogin: PhoneNumberCode = loginCode;
// @ts-expect-error A phone-number code must never be sent to code2Session.
const loginFromPhone: LoginCode = phoneCode;

void [loginAsString, phoneAsString, phoneFromLogin, loginFromPhone];

declare const platform: WeChatPlatform;

const navigation = platform.navigation.navigateTo({
	events: { ready: (value: unknown) => value },
	url: '/pages/detail/index?id=1'
});
void navigation.then(({ eventChannel }) => eventChannel.emit('ready', { accepted: true }));

// @ts-expect-error Promise-first navigation does not accept callback-style handlers.
void platform.navigation.navigateTo({ success: () => undefined, url: '/pages/detail/index' });
