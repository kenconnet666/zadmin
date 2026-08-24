import type Taro from '@tarojs/taro';

export type CapabilityClient = 'android' | 'harmony' | 'ios' | 'mac' | 'windows';
export type CapabilityRenderer = 'skyline' | 'webview';
export type CapabilityStability = 'provisional' | 'raw' | 'stable' | 'unsupported';
export type VerificationGrade =
	| 'documented'
	| 'contract-tested'
	| 'mock-verified'
	| 'simulator-verified'
	| 'device-verified'
	| 'account-verified';

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

export interface CapabilityDescriptor<Id extends string = string> {
	readonly api: string;
	readonly billing: 'none' | 'possible' | 'required';
	readonly checkedAt: string;
	readonly clients?: readonly CapabilityClient[];
	readonly dataClasses: readonly (
		'device' | 'financial' | 'identity' | 'location' | 'media' | 'personal'
	)[];
	readonly id: Id;
	readonly minBaseLibrary?: string;
	readonly officialDoc: string;
	readonly officialPluginSupport: 'conditional' | 'supported' | 'unsupported';
	readonly permissionScope?: string;
	readonly realDevice: 'no' | 'recommended' | 'required';
	readonly renderers?: readonly CapabilityRenderer[];
	readonly requiredBackgroundMode?: string;
	readonly requiredPrivateInfo?: string;
	readonly requiresAccountEntitlement: boolean;
	readonly requiresBackend: boolean;
	readonly requiresPrivacyConsent: boolean;
	readonly requiresUserGesture: boolean;
	readonly resource: 'connection' | 'context' | 'listener' | 'one-shot' | 'session';
	readonly stability: CapabilityStability;
	readonly taroType: string;
	readonly title: string;
}

export interface AvailabilityOptions {
	readonly accountEntitled?: boolean;
	readonly permission?: 'denied' | 'granted' | 'prompt';
	readonly privacyConsent?: boolean;
	readonly realDevice?: boolean;
	readonly userGesture?: boolean;
}

export interface AvailabilityResult {
	readonly descriptor: CapabilityDescriptor;
	readonly reason?: string;
	readonly status: CapabilityAvailability;
}

type AnyFunction = (...args: never[]) => unknown;

export type TaroMethodName = {
	[TKey in keyof Taro.TaroStatic]: Taro.TaroStatic[TKey] extends AnyFunction ? TKey : never;
}[keyof Taro.TaroStatic] &
	string;

export type TaroMethodParameters<TKey extends TaroMethodName> = Taro.TaroStatic[TKey] extends (
	...args: infer TArgs
) => unknown
	? TArgs
	: never;

export type TaroMethodResult<TKey extends TaroMethodName> = Taro.TaroStatic[TKey] extends (
	...args: never[]
) => infer TResult
	? Awaited<TResult>
	: never;

export interface PlatformDriverEnvironment {
	readonly baseLibraryVersion?: string;
	readonly client?: CapabilityClient;
	readonly realDevice: boolean;
	readonly renderer?: CapabilityRenderer;
}

export interface PlatformDriver {
	readonly environment: PlatformDriverEnvironment;
	readonly raw: Taro.TaroStatic;
	call<TKey extends TaroMethodName>(
		method: TKey,
		...args: TaroMethodParameters<TKey>
	): Promise<TaroMethodResult<TKey>>;
	canIUse(schema: string): boolean;
	create<TKey extends TaroMethodName>(
		method: TKey,
		...args: TaroMethodParameters<TKey>
	): TaroMethodResult<TKey>;
	listen<TValue>(
		onMethod: TaroMethodName,
		offMethod: TaroMethodName,
		listener: (value: TValue) => void
	): () => void;
}

export interface DisposableHandle<TValue = undefined> {
	readonly closed: boolean;
	readonly value: TValue;
	close(): Promise<void>;
	dispose(): Promise<void>;
}

export interface CapabilityReportEntry {
	readonly descriptor: CapabilityDescriptor;
	readonly grade: VerificationGrade;
	readonly note?: string;
}
