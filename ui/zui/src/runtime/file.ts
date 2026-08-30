export type FileRejectionReason = 'duplicate' | 'max-files' | 'size' | 'type';

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

export function matchesFileAccept(file: FileLike, accept?: string): boolean {
	const rules = accept
		?.split(',')
		.map((rule) => rule.trim().toLocaleLowerCase())
		.filter(Boolean);
	if (!rules || rules.length === 0) return true;
	const name = file.name.toLocaleLowerCase();
	const type = file.type.toLocaleLowerCase();
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
