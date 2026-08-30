import type { StandardSchemaV1 } from '@standard-schema/spec';

export type FormErrors = Readonly<Record<string, readonly string[]>>;

function pathKey(issue: StandardSchemaV1.Issue): string {
	const segment = issue.path?.[0];
	if (segment === undefined) return '';
	return String(
		typeof segment === 'object' && segment !== null && 'key' in segment ? segment.key : segment
	);
}

export function issuesToFormErrors(issues: readonly StandardSchemaV1.Issue[]): FormErrors {
	const grouped = new Map<string, string[]>();
	for (const issue of issues) {
		const key = pathKey(issue);
		const messages = grouped.get(key) ?? [];
		if (!messages.includes(issue.message)) messages.push(issue.message);
		grouped.set(key, messages);
	}
	return Object.freeze(
		Object.fromEntries([...grouped].map(([key, messages]) => [key, Object.freeze(messages)]))
	);
}

export function formDataToObject(
	formData: FormData
): Readonly<Record<string, FormDataEntryValue | readonly FormDataEntryValue[]>> {
	const result: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
	for (const [name, value] of formData) {
		const current = result[name];
		if (current === undefined) result[name] = value;
		else if (Array.isArray(current)) current.push(value);
		else result[name] = [current, value];
	}
	return Object.freeze(
		Object.fromEntries(
			Object.entries(result).map(([name, value]) => [
				name,
				Array.isArray(value) ? Object.freeze([...value]) : value
			])
		)
	);
}

export function errorsToMap(errors: FormErrors): ReadonlyMap<string, readonly string[]> {
	return new Map(Object.entries(errors));
}
