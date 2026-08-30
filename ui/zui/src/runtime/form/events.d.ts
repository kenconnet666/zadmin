import 'svelte/elements';

declare module 'svelte/elements' {
	interface HTMLButtonAttributes {
		onzuireset?: (event: Event & { currentTarget: EventTarget & HTMLButtonElement }) => void;
	}
}

export {};
