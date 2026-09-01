export type FileRejectionReason = 'duplicate' | 'max-files' | 'size' | 'type';
export type FileUploadStatus = 'aborted' | 'error' | 'queued' | 'success' | 'uploading';

export interface FileLike {
	readonly lastModified?: number;
	readonly name: string;
	readonly size: number;
	readonly type: string;
}

export interface FileRejection<TFile extends FileLike = FileLike> {
	readonly file: TFile;
	readonly reason: FileRejectionReason;
}

export interface FileUploadItem<TFile extends File = File> {
	/** Stable application or component-issued identity. Never derived from the file name alone. */
	readonly id: string;
	/** The browser File submitted through FormData. Transport response data stays in application state. */
	readonly file: TFile;
	/** Human-readable failure detail. Present only for the error state. */
	readonly error?: string;
	/** Determinate progress in the inclusive 0–100 range. */
	readonly progress: number;
	readonly status: FileUploadStatus;
}

export interface CreateFileUploadItemOptions {
	readonly error?: string;
	readonly progress?: number;
	readonly status?: FileUploadStatus;
}

const FILE_UPLOAD_STATUSES = new Set<FileUploadStatus>([
	'aborted',
	'error',
	'queued',
	'success',
	'uploading'
]);

export function normalizeFileUploadProgress(value: number): number {
	if (!Number.isFinite(value)) throw new TypeError('File upload progress must be finite.');
	return Math.min(100, Math.max(0, value));
}

export function createFileUploadItem<TFile extends File>(
	id: string,
	file: TFile,
	options: CreateFileUploadItemOptions = {}
): FileUploadItem<TFile> {
	if (id.length === 0) throw new TypeError('File upload item id must not be empty.');
	const status = options.status ?? 'queued';
	if (!FILE_UPLOAD_STATUSES.has(status)) {
		throw new TypeError(`Unsupported file upload status: ${String(status)}.`);
	}
	const progress = normalizeFileUploadProgress(
		options.progress ?? (status === 'success' ? 100 : 0)
	);
	if (status === 'success' && progress !== 100) {
		throw new TypeError('Successful file upload items must have progress 100.');
	}
	if (status === 'error' && options.error?.trim().length === 0) {
		throw new TypeError('File upload error text must not be empty.');
	}
	return Object.freeze({
		...(status === 'error' && options.error ? { error: options.error } : {}),
		file,
		id,
		progress,
		status
	});
}

export function normalizeFileUploadItems<TFile extends File>(
	items: readonly FileUploadItem<TFile>[],
	name = 'File upload items'
): readonly FileUploadItem<TFile>[] {
	const identities = new Set<string>();
	return Object.freeze(
		items.map((item) => {
			if (identities.has(item.id)) throw new TypeError(`${name} must have unique ids.`);
			identities.add(item.id);
			return createFileUploadItem(item.id, item.file, item);
		})
	);
}

export function matchesFileAccept(file: FileLike, accept?: string): boolean {
	const rules = accept
		?.split(',')
		.map((rule) => rule.trim().toLowerCase())
		.filter(Boolean);
	if (!rules || rules.length === 0) return true;
	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	return rules.some((rule) => {
		if (rule.startsWith('.')) return name.endsWith(rule);
		if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
		return type === rule;
	});
}

export function fileIdentity(file: FileLike): string {
	return `${file.name}\u0000${file.size}\u0000${file.lastModified ?? 0}\u0000${file.type}`;
}

export function validateFileQueue<TFile extends FileLike>(
	existing: readonly TFile[],
	candidates: readonly TFile[],
	options: {
		readonly accept?: string;
		readonly maxFiles: number;
		readonly maxSize?: number;
		readonly multiple: boolean;
	}
): { readonly accepted: readonly TFile[]; readonly rejected: readonly FileRejection<TFile>[] } {
	const accepted = [...existing];
	const rejected: FileRejection<TFile>[] = [];
	const identities = new Set(existing.map(fileIdentity));
	for (const file of candidates) {
		if (!matchesFileAccept(file, options.accept)) {
			rejected.push({ file, reason: 'type' });
			continue;
		}
		if (options.maxSize !== undefined && file.size > options.maxSize) {
			rejected.push({ file, reason: 'size' });
			continue;
		}
		if (identities.has(fileIdentity(file))) {
			rejected.push({ file, reason: 'duplicate' });
			continue;
		}
		if (accepted.length >= options.maxFiles || (!options.multiple && accepted.length >= 1)) {
			rejected.push({ file, reason: 'max-files' });
			continue;
		}
		accepted.push(file);
		identities.add(fileIdentity(file));
	}
	return Object.freeze({ accepted: Object.freeze(accepted), rejected: Object.freeze(rejected) });
}
