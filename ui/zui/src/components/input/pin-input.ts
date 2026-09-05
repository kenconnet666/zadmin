type GraphemeSegment = { readonly segment: string };
type GraphemeSegmenter = {
	segment(source: string): Iterable<GraphemeSegment>;
};
type IntlWithSegmenter = {
	Segmenter?: new (
		locales?: string | string[],
		options?: { readonly granularity: 'grapheme' }
	) => GraphemeSegmenter;
};

export function splitPinInputGraphemes(
	source: string,
	ownerIntl: IntlWithSegmenter = Intl
): string[] {
	if (typeof ownerIntl.Segmenter === 'function') {
		const segmenter = new ownerIntl.Segmenter(undefined, { granularity: 'grapheme' });
		return Array.from(segmenter.segment(source), ({ segment }) => segment);
	}
	// Do not maintain a partial UAX #29 implementation here. Array.from keeps
	// surrogate pairs intact while making the unsupported-runtime downgrade
	// explicit; modern supported browsers use Intl.Segmenter above.
	return Array.from(source);
}
