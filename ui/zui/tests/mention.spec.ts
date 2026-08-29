import { describe, expect, it } from 'vitest';

import { findMentionQuery, insertMention } from '../src/runtime/mention.js';

describe('mention parser', () => {
	it('finds triggers at boundaries and preserves the caret range', () => {
		expect(findMentionQuery('Notify @ali later', 11, ['@'])).toEqual({
			end: 11,
			query: 'ali',
			start: 7,
			trigger: '@'
		});
		expect(findMentionQuery('通知：@李', 5, ['@'])).toEqual({
			end: 5,
			query: '李',
			start: 3,
			trigger: '@'
		});
	});

	it('rejects email fragments and whitespace while finding the newest valid trigger', () => {
		expect(findMentionQuery('dev@example', 11, ['@'])).toBeUndefined();
		expect(findMentionQuery('Notify @ali ce', 14, ['@'])).toBeUndefined();
		expect(findMentionQuery('Notify @ali #', 13, ['@', '#'])).toEqual({
			end: 13,
			query: '',
			start: 12,
			trigger: '#'
		});
	});

	it('prefers the longest colocated trigger and inserts without losing suffix text', () => {
		const query = findMentionQuery('Assign @@al today', 11, ['@', '@@']);
		expect(query).toEqual({ end: 11, query: 'al', start: 7, trigger: '@@' });
		expect(insertMention('Assign @@al today', query!, 'alice')).toEqual({
			caret: 15,
			value: 'Assign @@alice  today'
		});
		expect(insertMention('@al', findMentionQuery('@al', 3, ['@'])!, 'alice', false)).toEqual({
			caret: 6,
			value: '@alice'
		});
	});
});
