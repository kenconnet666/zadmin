import type { LoginCode, PhoneNumberCode } from '../src/platform/index.ts';

declare const loginCode: LoginCode;
declare const phoneCode: PhoneNumberCode;

const loginAsString: string = loginCode;
const phoneAsString: string = phoneCode;

// @ts-expect-error A wx.login code must never be sent to the phone-number exchange endpoint.
const phoneFromLogin: PhoneNumberCode = loginCode;
// @ts-expect-error A phone-number code must never be sent to code2Session.
const loginFromPhone: LoginCode = phoneCode;

void [loginAsString, phoneAsString, phoneFromLogin, loginFromPhone];
