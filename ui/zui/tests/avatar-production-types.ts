import type { ComponentProps } from 'svelte';

import ZAvatar, {
	type AvatarImageEvent,
	type ZAvatarProps
} from '../src/components/data-display/ZAvatar.svelte';

const props = {
	alt: 'Typed image',
	crossorigin: 'anonymous',
	decoding: 'async',
	draggable: false,
	loading: 'lazy',
	onImageError(event: AvatarImageEvent) {
		const image: HTMLImageElement = event.currentTarget;
		void image;
	},
	referrerpolicy: 'no-referrer',
	sizes: '48px',
	src: '/avatar.png',
	srcset: '/avatar.png 1x, /avatar@2x.png 2x'
} satisfies ComponentProps<typeof ZAvatar> satisfies ZAvatarProps;

void props;
