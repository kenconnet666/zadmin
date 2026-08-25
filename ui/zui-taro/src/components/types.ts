import type { ButtonProps as TaroButtonProps } from '@tarojs/components/types/Button.js';
import type { Snippet } from 'svelte';
import type {
	ButtonDesignProps,
	DefaultTheme,
	StackDesignProps,
	ThemeSchema
} from '@zadmin/zui-core';

import type { TaroStyle } from '../runtime/index.ts';

type EventOf<TKey extends keyof TaroButtonProps> = Parameters<
	NonNullable<TaroButtonProps[TKey]>
>[0];

export interface CommonComponentProps {
	children?: Snippet;
	class?: string;
	id?: string;
	style?: TaroStyle;
}

export interface ProviderProps<TTheme extends ThemeSchema = DefaultTheme> {
	children?: Snippet;
	theme?: TTheme;
}

export interface BoxProps extends CommonComponentProps {
	ariaLabel?: string;
	hidden?: boolean;
	hoverClass?: string;
}

export interface StackProps extends CommonComponentProps, StackDesignProps {}

export interface TextProps extends CommonComponentProps {
	color?: keyof DefaultTheme['color'];
	decode?: boolean;
	selectable?: boolean;
	size?: keyof DefaultTheme['fontSize'];
	space?: 'emsp' | 'ensp' | 'nbsp';
	userSelect?: boolean;
	weight?: keyof DefaultTheme['fontWeight'];
}

export interface ButtonProps extends CommonComponentProps, ButtonDesignProps {
	appParameter?: string;
	formType?: TaroButtonProps['formType'];
	hoverClass?: string;
	lang?: TaroButtonProps['lang'];
	name?: string;
	onAgreePrivacyAuthorization?: (event: EventOf<'onAgreePrivacyAuthorization'>) => void;
	onChooseAvatar?: (event: EventOf<'onChooseAvatar'>) => void;
	onContact?: (event: EventOf<'onContact'>) => void;
	onError?: (event: EventOf<'onError'>) => void;
	onGetPhoneNumber?: (event: EventOf<'onGetPhoneNumber'>) => void;
	onGetRealTimePhoneNumber?: (event: EventOf<'onGetRealTimePhoneNumber'>) => void;
	onGetUserInfo?: (event: EventOf<'onGetUserInfo'>) => void;
	onLaunchApp?: (event: EventOf<'onLaunchApp'>) => void;
	onOpenSetting?: (event: EventOf<'onOpenSetting'>) => void;
	onclick?: (event: unknown) => void;
	openType?: TaroButtonProps['openType'];
	sessionFrom?: string;
	showMessageCard?: boolean;
}

export type CapabilityAvailability =
	| 'available'
	| 'unsupported-platform'
	| 'unsupported-base-library'
	| 'privacy-required'
	| 'permission-required'
	| 'permission-denied'
	| 'user-gesture-required'
	| 'account-entitlement-required'
	| 'real-device-required'
	| 'device-disabled'
	| 'temporarily-unavailable';

export interface CapabilityGateProps {
	children?: Snippet;
	fallback?: Snippet<[CapabilityAvailability]>;
	status: CapabilityAvailability;
}

export interface PrivacyConsentProps extends Omit<
	ButtonProps,
	'onAgreePrivacyAuthorization' | 'openType'
> {
	onAgree?: (event: EventOf<'onAgreePrivacyAuthorization'>) => void;
}

declare const PHONE_NUMBER_CODE: unique symbol;
export type PhoneNumberCode = string & { readonly [PHONE_NUMBER_CODE]: true };

export interface PhoneNumberCodeEvent {
	readonly code: PhoneNumberCode;
	readonly rawEvent: EventOf<'onGetPhoneNumber'>;
}

export interface PhoneNumberButtonProps extends Omit<ButtonProps, 'onGetPhoneNumber' | 'openType'> {
	onCode?: (event: PhoneNumberCodeEvent) => void;
	onFailure?: (event: EventOf<'onGetPhoneNumber'>) => void;
}
