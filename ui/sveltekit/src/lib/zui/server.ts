import { createHash } from 'node:crypto';

function addSourceToDirective(policy: string, source: string): string {
	const directives = policy
		.split(';')
		.map((directive) => directive.trim())
		.filter(Boolean);
	const parsed = directives.map((directive) => directive.split(/\s+/u));
	let target = parsed.find((directive) => directive[0] === 'style-src-elem');
	if (target === undefined) {
		const inherited = parsed.find((directive) => directive[0] === 'style-src');
		if (inherited !== undefined) {
			target = ['style-src-elem', ...inherited.slice(1)];
			parsed.push(target);
		}
	}
	if (target === undefined) {
		const inherited = parsed.find((directive) => directive[0] === 'default-src');
		target = ['style-src-elem', ...(inherited?.slice(1) ?? [])];
		parsed.push(target);
	}
	const noneIndex = target.indexOf("'none'");
	if (noneIndex >= 0) target.splice(noneIndex, 1);
	if (!target.includes(source)) target.push(source);
	return parsed.map((directive) => directive.join(' ')).join('; ');
}

export function createStyleHash(css: string): string {
	return `'sha256-${createHash('sha256').update(css).digest('base64')}'`;
}

export function addStyleHashHeaders(response: Response, hash: string): Response {
	const headers = new Headers(response.headers);
	for (const name of ['content-security-policy', 'content-security-policy-report-only']) {
		const policy = headers.get(name);
		if (policy !== null) headers.set(name, addSourceToDirective(policy, hash));
	}
	return new Response(response.body, {
		headers,
		status: response.status,
		statusText: response.statusText
	});
}

export function injectCriticalCss(html: string, styleTag: string): string {
	if (styleTag.length === 0) return html;
	const closingHead = html.lastIndexOf('</head>');
	if (closingHead >= 0) return `${html.slice(0, closingHead)}${styleTag}${html.slice(closingHead)}`;
	return `${styleTag}${html}`;
}

export function addStyleHashMeta(html: string, hash: string): string {
	return html.replace(/<meta\b[^>]*>/giu, (tag) => {
		if (!/http-equiv=(['"])content-security-policy\1/iu.test(tag)) return tag;
		return tag.replace(/content=(['"])(.*?)\1/iu, (_match, quote: string, policy: string) => {
			return `content=${quote}${addSourceToDirective(policy, hash)}${quote}`;
		});
	});
}
