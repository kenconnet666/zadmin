import type {
	AppSnapshot,
	ConfirmedAction,
	DesktopError,
	JsonValue,
	LogRecord,
	NotificationOptions,
	NotificationPermissionValue,
	OpenDialogOptions,
	OsSnapshot,
	SaveDialogOptions,
	UpdateInfo,
	WindowSnapshot
} from '../generated/protocol.js';

export type {
	AppSnapshot,
	BooleanValue,
	ConfirmedAction,
	ConfirmedPath,
	DesktopError,
	DesktopErrorCode,
	DesktopLogLevel,
	Empty,
	ExitOptions,
	JsonValue,
	KeyValue,
	LogRecord,
	NotificationOptions,
	NotificationPermissionValue,
	NullablePath,
	OpenDialogOptions,
	OsSnapshot,
	PathSelection,
	PathValue,
	SaveDialogOptions,
	StoreSetOptions,
	StringList,
	TextValue,
	UpdateInfo,
	UrlValue,
	Void,
	WindowSnapshot,
	WriteTextOptions
} from '../generated/protocol.js';

export type DesktopRuntime = 'browser' | 'fake' | 'webview';

export type DesktopResult<T> =
	{ readonly ok: true; readonly value: T } | { readonly error: DesktopError; readonly ok: false };

export interface DesktopAvailability {
	readonly available: boolean;
	readonly reason?: string;
	readonly runtime: DesktopRuntime;
}

export interface DesktopEnvironmentSnapshot {
	readonly availability: DesktopAvailability;
	readonly origin: string | null;
	readonly protocolVersion: number;
	readonly runtime: DesktopRuntime;
}

export interface DesktopResourceHandle {
	readonly disposed: boolean;
	dispose(): Promise<void>;
}

export interface DesktopPlatform {
	readonly app: {
		readonly availability: DesktopAvailability;
		snapshot(): Promise<DesktopResult<AppSnapshot>>;
	};
	readonly clipboard: {
		readonly availability: DesktopAvailability;
		clear(): Promise<DesktopResult<void>>;
		readText(): Promise<DesktopResult<string>>;
		writeText(text: string): Promise<DesktopResult<void>>;
	};
	readonly dialog: {
		readonly availability: DesktopAvailability;
		open(options?: OpenDialogOptions): Promise<DesktopResult<readonly string[]>>;
		save(options?: SaveDialogOptions): Promise<DesktopResult<string | null>>;
	};
	readonly environment: { snapshot(): DesktopEnvironmentSnapshot };
	readonly filesystem: {
		readonly availability: DesktopAvailability;
		exists(path: string): Promise<DesktopResult<boolean>>;
		readText(path: string): Promise<DesktopResult<string>>;
		remove(path: string, action: ConfirmedAction): Promise<DesktopResult<void>>;
		writeText(path: string, contents: string): Promise<DesktopResult<void>>;
	};
	readonly log: {
		readonly availability: DesktopAvailability;
		write(record: LogRecord): Promise<DesktopResult<void>>;
	};
	readonly notification: {
		readonly availability: DesktopAvailability;
		permission(): Promise<DesktopResult<NotificationPermissionValue>>;
		requestPermission(): Promise<DesktopResult<NotificationPermissionValue>>;
		send(options: NotificationOptions): Promise<DesktopResult<void>>;
	};
	readonly opener: {
		readonly availability: DesktopAvailability;
		readonly allowedOrigins: readonly string[];
		openUrl(value: string | URL): Promise<DesktopResult<void>>;
	};
	readonly os: {
		readonly availability: DesktopAvailability;
		snapshot(): Promise<DesktopResult<OsSnapshot>>;
	};
	readonly process: {
		readonly availability: DesktopAvailability;
		exit(action: ConfirmedAction, code?: number): Promise<DesktopResult<void>>;
		relaunch(action: ConfirmedAction): Promise<DesktopResult<void>>;
	};
	readonly store: {
		readonly availability: DesktopAvailability;
		clear(): Promise<DesktopResult<void>>;
		delete(key: string): Promise<DesktopResult<boolean>>;
		get(key: string): Promise<DesktopResult<JsonValue>>;
		keys(): Promise<DesktopResult<readonly string[]>>;
		save(): Promise<DesktopResult<void>>;
		set(key: string, value: JsonValue): Promise<DesktopResult<void>>;
	};
	readonly updater: {
		readonly availability: DesktopAvailability;
		check(): Promise<DesktopResult<UpdateInfo>>;
	};
	readonly window: {
		readonly availability: DesktopAvailability;
		close(): Promise<DesktopResult<void>>;
		listen(
			listener: (snapshot: WindowSnapshot) => void
		): Promise<DesktopResult<DesktopResourceHandle>>;
		maximize(): Promise<DesktopResult<void>>;
		minimize(): Promise<DesktopResult<void>>;
		restore(): Promise<DesktopResult<void>>;
		snapshot(): Promise<DesktopResult<WindowSnapshot>>;
		startDragging(): Promise<DesktopResult<void>>;
		toggleMaximize(): Promise<DesktopResult<void>>;
	};
	readonly windowState: {
		readonly availability: DesktopAvailability;
		restore(): Promise<DesktopResult<void>>;
		save(): Promise<DesktopResult<void>>;
	};
	forScope(scope: DesktopResourceScope): DesktopPlatform;
}

export interface DesktopResourceScope {
	readonly disposed: boolean;
	add(handle: DesktopResourceHandle): DesktopResourceHandle;
	dispose(): Promise<void>;
}
