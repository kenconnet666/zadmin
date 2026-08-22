import { defineModule, provideFactory, token } from '@zadmin/core/di';

export interface OssOptions {
	readonly endpoint?: string;
}

export const OSS = token<OssService>('@zadmin/oss');

export function createOssModule(options: OssOptions = {}) {
	return defineModule({
		id: OSS.id,
		primary: OSS,
		exports: [OSS],
		providers: [
			provideFactory({
				token: OSS,
				create: () => createOss(options)
			})
		]
	});
}

export const ossModule = createOssModule();

export interface OssService {
	readonly protocol: 's3';
	readonly options: OssOptions;
}

export function createOss(options: OssOptions = {}): OssService {
	return Object.freeze({ protocol: 's3', options: Object.freeze({ ...options }) });
}
