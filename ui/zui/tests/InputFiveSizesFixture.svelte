<script lang="ts">
	import { CalendarDate, Time } from '@internationalized/date';
	import {
		ZCalendar,
		ZDateField,
		ZDatePicker,
		ZDateRangePicker,
		ZFileUpload,
		ZInput,
		ZInputGroup,
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectTrigger,
		ZNumberField,
		ZPinInput,
		ZProvider,
		ZSwitch,
		ZTagsInput,
		ZTimeField,
		ZTransfer,
		ZTreeSelect,
		createFileUploadItem
	} from '../src/entrypoints/index.js';

	let { mode = 'controls' }: { mode?: 'controls' | 'switch' | 'virtual-tree' } = $props();
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const options = [
		{ value: 'alpha', label: 'Alpha' },
		{ value: 'beta', label: 'Beta' }
	];
	const items = [
		{ key: 'alpha', label: 'Alpha' },
		{ key: 'beta', label: 'Beta' }
	];
	const files = [createFileUploadItem('sizing', new File(['sizing'], 'sizing.txt'))];
	const date = new CalendarDate(2026, 9, 6);
	const range = { start: date, end: date.add({ days: 3 }) };
	const nodes = [
		{ key: 'root', label: 'Root' },
		...Array.from({ length: 1000 }, (_, index) => ({
			key: `item-${index}`,
			label: `Item ${index}`,
			parentKey: 'root'
		}))
	];
</script>

{#if mode === 'switch'}
	{#each ['ltr', 'rtl'] as direction (direction)}
		<div dir={direction}>
			<ZProvider direction={direction as 'ltr' | 'rtl'} motion="reduced">
				{#each sizes as size (size)}
					{#each [false, true] as checked (checked)}
						<ZSwitch
							aria-label={`${direction} ${size} ${checked}`}
							data-testid={`switch-${direction}-${size}-${checked}`}
							{size}
							{checked}
						/>
					{/each}
				{/each}
			</ZProvider>
		</div>
	{/each}
{:else if mode === 'virtual-tree'}
	<ZProvider motion="reduced">
		<ZTreeSelect
			aria-label="Sized virtual tree"
			{nodes}
			defaultExpandedKeys={['root']}
			defaultOpen
			virtual
			virtualHeight={144}
			virtualItemSize={36}
			virtualOverscan={2}
		/>
	</ZProvider>
{:else}
	<ZProvider motion="reduced">
		{#each sizes as size (size)}
			<section data-testid={`size-${size}`}>
				<ZInput data-testid="input" aria-label={`Input ${size}`} {size} />
				<ZInputGroup data-testid="group" {size}><ZInput aria-label={`Group ${size}`} /></ZInputGroup
				>
				<ZNumberField data-testid="number" aria-label={`Number ${size}`} {size} defaultValue={42} />
				<ZDateField data-testid="date" aria-label={`Date ${size}`} {size} defaultValue={date} />
				<ZTimeField
					data-testid="time"
					aria-label={`Time ${size}`}
					{size}
					defaultValue={new Time(9, 30)}
					hourCycle={12}
				/>
				<ZDatePicker
					data-testid="picker"
					aria-label={`Picker ${size}`}
					{size}
					defaultValue={date}
				/>
				<ZDateRangePicker
					data-testid="range"
					aria-label={`Range ${size}`}
					{size}
					defaultValue={range}
				/>
				<ZPinInput data-testid="pin" aria-label={`Pin ${size}`} {size} defaultValue="123456" />
				<ZTagsInput
					data-testid="tags"
					aria-label={`Tags ${size}`}
					{size}
					defaultValue={['Alpha', 'Beta']}
					maxVisibleTags={1}
					editable
				/>
				<ZMultiSelect {options} {size} defaultValue={['alpha', 'beta']} maxTagCount={1}>
					<ZMultiSelectTrigger data-testid="multi" aria-label={`Multi ${size}`} />
					<ZMultiSelectContent />
				</ZMultiSelect>
				<ZCalendar data-testid="calendar" {size} defaultValue={date} />
				<ZFileUpload data-testid="upload" {size} defaultFiles={files} />
				<ZTransfer data-testid="transfer" {size} {items} defaultValue={['alpha']} />
			</section>
		{/each}
	</ZProvider>
{/if}
