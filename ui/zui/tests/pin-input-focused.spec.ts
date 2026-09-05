import { describe, expect, it } from 'vitest';

import { splitPinInputGraphemes } from '../src/components/input/pin-input.js';

describe('ZPinInput focused grapheme contracts', () => {
	it('downgrades to code points when Intl.Segmenter is unavailable', () => {
		const withoutSegmenter = { Segmenter: undefined };

		expect(splitPinInputGraphemes('👨‍👩‍👧‍👦e\u0301', withoutSegmenter)).toEqual([
			'👨',
			'‍',
			'👩',
			'‍',
			'👧',
			'‍',
			'👦',
			'e',
			'\u0301'
		]);
	});

	it('uses Intl.Segmenter when the owner realm provides it', () => {
		const segmentCalls: string[] = [];
		const ownerIntl = {
			Segmenter: class {
				segment(source: string) {
					segmentCalls.push(source);
					return [{ segment: '🙂' }, { segment: '你' }];
				}
			}
		};

		expect(splitPinInputGraphemes('🙂你', ownerIntl)).toEqual(['🙂', '你']);
		expect(segmentCalls).toEqual(['🙂你']);
	});
});
