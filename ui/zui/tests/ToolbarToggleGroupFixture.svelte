<script lang="ts">
	import {
		ZButton,
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZProvider,
		ZToggleGroup,
		ZToolbar,
		ZToolbarItem
	} from '../src/entrypoints/index.js';

	type ToggleKey = 1 | '1';

	const items = [
		{ value: 1, label: 'Number one' },
		{ value: '1', label: 'String one' }
	] as const satisfies readonly { value: ToggleKey; label: string }[];
	let editableValue = $state<readonly ToggleKey[]>([1]);
	let editableChanges = $state(0);
	let readonlyValue = $state<readonly ToggleKey[]>([1]);
	let readonlyChanges = $state(0);
	let portalValue = $state<readonly ToggleKey[]>([1]);
	let portalChanges = $state(0);

	function format(value: readonly ToggleKey[]): string {
		return value.map((key) => `${typeof key}:${String(key)}`).join(',');
	}
</script>

<ZProvider motion="reduced">
	<ZToolbar aria-label="Formatting toolbar" size="large">
		<ZToolbarItem value="before">
			{#snippet children(props)}
				<ZButton {...props} data-testid="toolbar-toggle-before">Before</ZButton>
			{/snippet}
		</ZToolbarItem>

		<ZToggleGroup
			bind:value={editableValue}
			aria-label="Editable formatting"
			data-testid="toolbar-toggle-editable"
			{items}
			selectionMode="multiple"
			onValueChange={() => (editableChanges += 1)}
		/>

		<ZToggleGroup
			bind:value={readonlyValue}
			aria-label="Readonly formatting"
			data-testid="toolbar-toggle-readonly"
			{items}
			readonly
			selectionMode="multiple"
			size="small"
			onValueChange={() => (readonlyChanges += 1)}
		/>

		<ZPopover placement="bottom-start">
			<ZToolbarItem value="portal-trigger">
				{#snippet children(props)}
					<ZPopoverTrigger {...props} data-testid="toolbar-toggle-popover-trigger"
						>More</ZPopoverTrigger
					>
				{/snippet}
			</ZToolbarItem>
			<ZPopoverContent
				aria-label="Portal formatting choices"
				ariaLabelledBy={null}
				data-testid="toolbar-toggle-popover-content"
			>
				<ZToggleGroup
					bind:value={portalValue}
					aria-label="Portal formatting"
					data-testid="toolbar-toggle-portal"
					{items}
					selectionMode="multiple"
					onValueChange={() => (portalChanges += 1)}
				/>
			</ZPopoverContent>
		</ZPopover>

		<ZToolbarItem value="after">
			{#snippet children(props)}
				<ZButton {...props} data-testid="toolbar-toggle-after" size="xsmall">After</ZButton>
			{/snippet}
		</ZToolbarItem>
	</ZToolbar>
</ZProvider>

<output data-testid="toolbar-toggle-editable-output"
	>{format(editableValue)}:{editableChanges}</output
>
<output data-testid="toolbar-toggle-readonly-output"
	>{format(readonlyValue)}:{readonlyChanges}</output
>
<output data-testid="toolbar-toggle-portal-output">{format(portalValue)}:{portalChanges}</output>
