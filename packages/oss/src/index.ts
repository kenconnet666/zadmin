export interface OssOptions {
	readonly endpoint?: string;
}

export interface OssService {
	readonly protocol: 's3';
	readonly options: OssOptions;
}

export function createOss(options: OssOptions = {}): OssService {
	return Object.freeze({ protocol: 's3', options: Object.freeze({ ...options }) });
}
