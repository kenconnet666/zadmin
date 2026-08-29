export type DesktopRuntime = 'browser' | 'fake' | 'webview';
export type JsonValue =
	null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export type Empty = Record<string, never>;
export type Void = undefined;
export interface TextValue {
	readonly text: string;
}
export interface PathValue {
	readonly path: string;
}
export interface ConfirmedPath extends PathValue {
	readonly confirmed: true;
}
export interface BooleanValue {
	readonly value: boolean;
}
export interface KeyValue {
	readonly key: string;
}
export interface UrlValue {
	readonly url: string;
}
export interface StringList {
	readonly values: readonly string[];
}
export interface NullablePath {
	readonly path: string | null;
}
export interface PathSelection {
	readonly paths: readonly string[];
}
export interface ConfirmedAction {
	readonly confirmed: true;
}
export interface ExitOptions extends ConfirmedAction {
	readonly code: number;
}
export interface WriteTextOptions extends PathValue {
	readonly contents: string;
}
export interface StoreSetOptions extends KeyValue {
	readonly value: JsonValue;
}

export interface AppSnapshot {
	readonly environment: string;
	readonly name: string;
	readonly version: string;
	readonly webviewVersion: string;
}

export interface OsSnapshot {
	readonly arch: string;
	readonly locale: string;
	readonly platform: string;
	readonly version: string;
}

export interface WindowSnapshot {
	readonly focused: boolean;
	readonly height: number;
	readonly maximized: boolean;
	readonly minimized: boolean;
	readonly scaleFactor: number;
	readonly visible: boolean;
	readonly width: number;
}

export interface OpenDialogOptions {
	readonly directory?: boolean;
	readonly filters?: Readonly<Record<string, readonly string[]>>;
	readonly multiple?: boolean;
	readonly title?: string;
}

export interface SaveDialogOptions {
	readonly defaultPath?: string;
	readonly filters?: Readonly<Record<string, readonly string[]>>;
	readonly title?: string;
}

export type DesktopLogLevel = 'debug' | 'error' | 'info' | 'trace' | 'warn';
export interface LogRecord {
	readonly fields?: Readonly<Record<string, JsonValue>>;
	readonly level: DesktopLogLevel;
	readonly message: string;
}

export type NotificationPermissionValue = 'default' | 'denied' | 'granted';
export interface NotificationOptions {
	readonly body?: string;
	readonly icon?: string;
	readonly title: string;
}

export type UpdateInfo = null | {
	readonly body?: string;
	readonly currentVersion: string;
	readonly date?: string;
	readonly version: string;
};

export type DesktopErrorCode =
	| 'cancelled'
	| 'disposed'
	| 'invalid-input'
	| 'permission-denied'
	| 'protocol-error'
	| 'system-error'
	| 'timeout'
	| 'transport-error'
	| 'unsupported';

export interface DesktopError {
	readonly code: DesktopErrorCode;
	readonly message: string;
	readonly operation: string;
	readonly retryable: boolean;
}

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
