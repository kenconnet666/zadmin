declare global {
	var __ZADMIN_BUILD_ID__: string | undefined;
}

export function getDevelopmentBuildId(): string | undefined {
	return globalThis.__ZADMIN_BUILD_ID__;
}
