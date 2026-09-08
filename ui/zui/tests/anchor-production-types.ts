import type { ZAnchorProps } from '../src/components/navigation/ZAnchor.svelte';
import type { AnchorItem } from '../src/runtime/navigation-anchor.js';
const items = [
	{ key: 'alpha', label: 'A', href: '#a' }
] as const satisfies readonly AnchorItem<'alpha'>[];
const props = {
	items,
	activeKey: 'alpha',
	onActiveKeyChange: (key: 'alpha' | null) => void key,
	history: false,
	behavior: false,
	orientation: 'horizontal',
	getTarget: (item: AnchorItem<'alpha'>) => {
		void item;
		return null;
	}
} satisfies ZAnchorProps<'alpha'>;
// @ts-expect-error Active keys belong to the declared item domain.
const wrongKey = { items, activeKey: 'beta' } satisfies ZAnchorProps<'alpha'>;
// @ts-expect-error Every item retains a real navigation destination.
const missingHref: AnchorItem = { key: 'a', label: 'A' };
// @ts-expect-error Only native scroll behavior or disabled enhancement is supported.
const behavior = { items, behavior: 'animated' } satisfies ZAnchorProps;
// @ts-expect-error History is an explicit false/push/replace policy.
const history = { items, history: true } satisfies ZAnchorProps;
void [props, wrongKey, missingHref, behavior, history];
