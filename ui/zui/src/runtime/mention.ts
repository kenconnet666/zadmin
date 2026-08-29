export interface MentionQuery {
	readonly end: number;
	readonly query: string;
	readonly start: number;
	readonly trigger: string;
}

const isBoundary = (value: string): boolean => value.length === 0 || /[\s\p{P}\p{S}]/u.test(value);

export function findMentionQuery(
	value: string,
	caret: number,
	triggers: readonly string[]
): MentionQuery | undefined {
	const end = Math.max(0, Math.min(value.length, caret));
	const beforeCaret = value.slice(0, end);
	const matches = triggers
		.filter(Boolean)
		.map((trigger) => ({ index: beforeCaret.lastIndexOf(trigger), trigger }))
		.filter(({ index }) => index >= 0)
		.sort(
			(left, right) =>
				right.index + right.trigger.length - (left.index + left.trigger.length) ||
				right.trigger.length - left.trigger.length
		);
	for (const match of matches) {
		const preceding = Array.from(value.slice(0, match.index)).at(-1) ?? '';
		if (!isBoundary(preceding)) continue;
		const query = value.slice(match.index + match.trigger.length, end);
		if (/\s/u.test(query) || triggers.some((trigger) => trigger && query.includes(trigger)))
			continue;
		return Object.freeze({ end, query, start: match.index, trigger: match.trigger });
	}
	return undefined;
}

export function insertMention(
	value: string,
	query: MentionQuery,
	replacement: string,
	appendSpace = true
): { readonly caret: number; readonly value: string } {
	const inserted = `${query.trigger}${replacement}${appendSpace ? ' ' : ''}`;
	return Object.freeze({
		caret: query.start + inserted.length,
		value: `${value.slice(0, query.start)}${inserted}${value.slice(query.end)}`
	});
}
