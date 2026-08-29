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
	readonly title: string;
	readonly wechatType: string;
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

type WeChatApi = WechatMiniprogram.Wx;
type AnyFunction = (...args: never[]) => unknown;

export type WeChatMethodName = {
	[TKey in keyof WeChatApi]: WeChatApi[TKey] extends AnyFunction ? TKey : never;
}[keyof WeChatApi] &
	string;

export type WeChatMethodParameters<TKey extends WeChatMethodName> = WeChatApi[TKey] extends (
	...args: infer TArgs
) => unknown
	? TArgs
	: never;

type FirstParameter<TKey extends WeChatMethodName> = WeChatMethodParameters<TKey>[0];

export type WeChatMethodResult<TKey extends WeChatMethodName> =
	FirstParameter<TKey> extends {
		readonly success?: (result: infer TResult) => void;
	}
		? TResult
		: WeChatApi[TKey] extends (...args: never[]) => infer TResult
			? Awaited<TResult>
			: unknown;

export type WeChatMethodReturn<TKey extends WeChatMethodName> = WeChatApi[TKey] extends (
	...args: never[]
) => infer TResult
	? TResult
	: unknown;

export interface PlatformDriverEnvironment {
	readonly baseLibraryVersion?: string;
	readonly client?: CapabilityClient;
	readonly realDevice: boolean;
	readonly renderer?: CapabilityRenderer;
}

export interface PlatformDriver {
	readonly environment: PlatformDriverEnvironment;
	readonly raw: WeChatApi;
	call<TKey extends WeChatMethodName>(
		method: TKey,
		...args: WeChatMethodParameters<TKey>
	): Promise<WeChatMethodResult<TKey>>;
	canIUse(schema: string): boolean;
	create<TKey extends WeChatMethodName>(
		method: TKey,
		...args: WeChatMethodParameters<TKey>
	): WeChatMethodReturn<TKey>;
	listen<TValue>(
		onMethod: WeChatMethodName,
		offMethod: WeChatMethodName,
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
