<script lang="ts">
	import {
		ZButton,
		ZPopconfirm,
		ZPopconfirmAction,
		ZPopconfirmCancel,
		ZPopconfirmContent,
		ZPopconfirmDescription,
		ZPopconfirmTitle,
		ZPopconfirmTrigger,
		ZStack,
		ZTooltip,
		ZTooltipContent,
		ZTooltipGroup,
		ZTooltipTrigger
	} from '../src/entrypoints/index.js';

	let { mode = 'deferred' }: { mode?: 'deferred' | 'reject' | 'resolve' } = $props();
	let complete = $state<(() => void) | undefined>();
	let confirmCalls = $state(0);
	let confirmErrors = $state(0);
	let delayedChanges = $state(0);
	let delayedDisabled = $state(false);
	let delayedOpen = $state(false);
	let disabledPointerCalls = $state(0);
	let open = $state(false);

	async function confirm(): Promise<void> {
		confirmCalls += 1;
		if (mode === 'reject') {
			await Promise.resolve();
			throw new Error('private failure detail');
		}
		if (mode === 'resolve') return;
		await new Promise<void>((resolve) => {
			complete = () => {
				complete = undefined;
				resolve();
			};
		});
	}
</script>

<ZPopconfirm
	bind:open
	formatConfirmError={() => 'Safe confirmation error'}
	onConfirm={confirm}
	onConfirmError={() => (confirmErrors += 1)}
>
	<ZPopconfirmTrigger data-testid="confirm-trigger" variant="danger">Delete</ZPopconfirmTrigger>
	<ZPopconfirmContent data-testid="confirm-content">
		<ZPopconfirmTitle>Delete deployment?</ZPopconfirmTitle>
		<ZPopconfirmDescription>This action is short and contextual.</ZPopconfirmDescription>
		<ZStack direction="row" gap="small">
			<ZPopconfirmCancel data-testid="confirm-cancel">Cancel</ZPopconfirmCancel>
			<ZPopconfirmAction data-testid="confirm-action">Confirm</ZPopconfirmAction>
		</ZStack>
	</ZPopconfirmContent>
</ZPopconfirm>
<ZButton data-testid="confirm-resolve" disabled={!complete} onclick={() => complete?.()}>
	Resolve deferred
</ZButton>
<ZButton data-testid="confirm-external-open" onclick={() => (open = true)}>External open</ZButton>
<ZButton data-testid="confirm-external-close" onclick={() => (open = false)}>External close</ZButton
>
<output data-testid="confirm-output">{open}:{confirmCalls}:{confirmErrors}</output>

<ZTooltipGroup closeDelay={20} delay={40} skipDelayDuration={120}>
	<ZTooltip>
		<ZTooltipTrigger data-testid="tooltip-first">First</ZTooltipTrigger>
		<ZTooltipContent data-testid="tooltip-first-content">First description</ZTooltipContent>
	</ZTooltip>
	<ZTooltip>
		<ZTooltipTrigger data-testid="tooltip-second">Second</ZTooltipTrigger>
		<ZTooltipContent data-testid="tooltip-second-content">Second description</ZTooltipContent>
	</ZTooltip>
	<ZTooltip delay={0}>
		<ZTooltipTrigger
			data-testid="tooltip-disabled"
			disabled
			onpointerenter={() => (disabledPointerCalls += 1)}>Disabled</ZTooltipTrigger
		>
		<ZTooltipContent data-testid="tooltip-disabled-content">Disabled reason</ZTooltipContent>
	</ZTooltip>
	<ZTooltip closeDelay={40} delay={0} hoverable>
		<ZTooltipTrigger data-testid="tooltip-hoverable">Hoverable</ZTooltipTrigger>
		<ZTooltipContent data-testid="tooltip-hoverable-content">
			Non-interactive hoverable description
		</ZTooltipContent>
	</ZTooltip>
</ZTooltipGroup>
<ZTooltip
	bind:open={delayedOpen}
	delay={40}
	disabled={delayedDisabled}
	onOpenChange={() => (delayedChanges += 1)}
>
	<ZTooltipTrigger data-testid="tooltip-delayed">Delayed</ZTooltipTrigger>
	<ZTooltipContent data-testid="tooltip-delayed-content">Delayed description</ZTooltipContent>
</ZTooltip>
<ZButton data-testid="tooltip-disable-delayed" onclick={() => (delayedDisabled = true)}>
	Disable delayed tooltip
</ZButton>
<output data-testid="tooltip-output">
	{delayedOpen}:{delayedDisabled}:{delayedChanges}:{disabledPointerCalls}
</output>
