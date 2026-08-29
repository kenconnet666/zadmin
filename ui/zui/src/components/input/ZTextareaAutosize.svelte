<script lang="ts">
	import { TextareaAutosize } from 'runed';

	interface Props {
		readonly element: HTMLTextAreaElement | null;
		readonly input: string;
		readonly onResize?: (height: number) => void;
	}

	let { element, input, onResize }: Props = $props();
	const existingMeasurements =
		typeof document === 'undefined' ? new Set<Element>() : new Set(document.body.children);
	new TextareaAutosize({
		element: () => element ?? undefined,
		input: () => input,
		onResize: () => {
			if (element) onResize?.(element.getBoundingClientRect().height);
		}
	});
	if (typeof document !== 'undefined') {
		const measurement = [...document.body.children].find(
			(node): node is HTMLTextAreaElement =>
				node instanceof HTMLTextAreaElement && !existingMeasurements.has(node)
		);
		if (measurement) {
			// Runed owns measurement and cleanup; ZUI keeps the helper outside form and a11y tooling.
			measurement.disabled = true;
			measurement.name = 'zui-textarea-measurement';
			measurement.tabIndex = -1;
			measurement.setAttribute('aria-hidden', 'true');
			measurement.dataset.zuiTextareaMeasurement = '';
		}
	}
</script>
