const UNSUPPORTED_WXSS = [/@container\b/u, /:has\(/u, /position\s*:\s*sticky/iu];

export function assertWechatWxss(css: string, filename = 'style'): void {
	for (const pattern of UNSUPPORTED_WXSS) {
		if (pattern.test(css)) {
			throw new TypeError(`${filename} uses WXSS syntax unsupported by the WeChat v1 target.`);
		}
	}
}

export function mergeWechatWxss(...sources: readonly (string | undefined)[]): string {
	const css = sources.filter((source): source is string => Boolean(source?.trim())).join('\n');
	assertWechatWxss(css);
	return css;
}
