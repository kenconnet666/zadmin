<script lang="ts">
	import ZResizable, {
		type ZResizableCancelDetail,
		type ZResizableHandle,
		type ZResizableHandleContext,
		type ZResizableResizeDetail,
		type ZResizableValue
	} from '../src/components/layout/ZResizable.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import type { ResizableLength } from '../src/runtime/resize.js';

	let width = $state<ResizableLength>('320px');
	let height = $state<ResizableLength>('240px');
	let changes = $state(0);
	let starts = $state(0);
	let resizes = $state(0);
	let ends = $state(0);
	let cancels = $state(0);
	let last = $state.raw<ZResizableResizeDetail | ZResizableCancelDetail | null>(null);
	let lastValue = $state.raw<ZResizableValue | null>(null);
	let resizable: { reset(): void };
	let percentWidth = $state<ResizableLength>('50%');

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;

	function remember(detail: ZResizableResizeDetail | ZResizableCancelDetail): void {
		last = detail;
	}
	function change(value: ZResizableValue): void {
		lastValue = value;
		width = value.width;
		height = value.height;
		changes += 1;
	}
	function label(handle: ZResizableHandle): string {
		return `Resize test ${handle}`;
	}

	export function setControlled(nextWidth: ResizableLength, nextHeight: ResizableLength): void {
		width = nextWidth;
		height = nextHeight;
	}
	export function resetMain(): void {
		resizable.reset();
	}
</script>

{#snippet content()}<div data-testid="resizable-content">Resizable content</div>{/snippet}
{#snippet customHandle(context: ZResizableHandleContext)}
	<span
		data-axis={context.axis}
		data-disabled={context.disabled || undefined}
		data-resizing={context.resizing || undefined}
		data-testid={`resizable-custom-${context.handle}`}>{context.handle}</span
	>
{/snippet}

<ZProvider motion="reduced">
	<div data-testid="resizable-owner" style="inline-size:640px;block-size:480px">
		<ZResizable
			bind:this={resizable}
			bind:width
			bind:height
			axis="both"
			children={content}
			data-testid="resizable-main"
			defaultHeight="240px"
			defaultWidth="320px"
			handle={customHandle}
			handleLabel={label}
			maxHeight="360px"
			maxWidth="480px"
			minHeight="120px"
			minWidth="160px"
			onResize={(detail) => {
				resizes += 1;
				remember(detail);
			}}
			onResizeCancel={(detail) => {
				cancels += 1;
				remember(detail);
			}}
			onResizeEnd={(detail) => {
				ends += 1;
				remember(detail);
			}}
			onResizeStart={(detail) => {
				starts += 1;
				remember(detail);
			}}
			onSizeChange={change}
			shiftStep={32}
			step={8}
		/>
	</div>

	<div data-testid="resizable-percent-owner" style="inline-size:400px;block-size:240px">
		<ZResizable
			bind:width={percentWidth}
			axis="inline"
			data-testid="resizable-percent"
			height="100px"
			maxWidth={75}
			minWidth={25}
			step={8}
		/>
	</div>

	<div data-testid="resizable-rtl-owner" style="inline-size:500px;block-size:180px">
		<ZResizable
			axis="both"
			data-testid="resizable-rtl"
			dir="rtl"
			handles={[
				'inline-start',
				'inline-end',
				'block-start-inline-start',
				'block-start-inline-end',
				'block-end-inline-start',
				'block-end-inline-end'
			]}
			height="100px"
			maxHeight="160px"
			maxWidth="400px"
			minHeight="60px"
			minWidth="100px"
			step={10}
			width="200px"
		/>
	</div>

	<div data-testid="resizable-disabled-owner" style="inline-size:400px;block-size:240px">
		<ZResizable
			axis="both"
			data-testid="resizable-disabled"
			disabled
			height="120px"
			width="200px"
		/>
	</div>

	<section data-testid="resizable-sizes">
		{#each sizes as size (size)}
			<div style="inline-size:160px;block-size:100px">
				<ZResizable
					axis="inline"
					data-testid={`resizable-size-${size}`}
					height="60px"
					{size}
					width="120px"
				/>
			</div>
		{/each}
	</section>
</ZProvider>

<output
	data-cancels={cancels}
	data-changes={changes}
	data-ends={ends}
	data-frozen={last ? Object.isFrozen(last) : undefined}
	data-handle={last?.handle}
	data-reason={last && 'reason' in last ? last.reason : undefined}
	data-resizes={resizes}
	data-source={last?.source}
	data-starts={starts}
	data-value-frozen={lastValue ? Object.isFrozen(lastValue) : undefined}
	data-testid="resizable-events">{String(width)}|{String(height)}</output
>
<output data-testid="resizable-percent-output">{typeof percentWidth}:{String(percentWidth)}</output>
