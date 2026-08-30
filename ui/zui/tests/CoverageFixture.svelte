<script lang="ts">
	import { CalendarDate, Time } from '@internationalized/date';
	import {
		ZAlert,
		ZAvatar,
		ZButton,
		ZCarousel,
		ZCascader,
		ZCheckbox,
		ZDataTable,
		ZDateField,
		ZEmpty,
		ZFileUpload,
		ZInput,
		ZInputGroup,
		ZList,
		ZMention,
		ZNumberField,
		ZPinInput,
		ZProgress,
		ZProvider,
		ZResult,
		ZSkeleton,
		ZStatistic,
		ZSwitch,
		ZTimeline,
		ZTextarea,
		ZTimeField,
		ZToast,
		ZTransfer,
		ZTree,
		ZTreeSelect,
		ZVirtualList,
		type SelectionKey
	} from '../src/entrypoints/index.js';

	const listItems = [
		{ description: 'First description', id: 'one', label: 'One' },
		{ id: 'two', label: 'Two' }
	];
	const timelineItems = [
		{
			datetime: '2026-08-30T09:00:00Z',
			description: 'Completed work',
			id: 'done',
			status: 'done' as const,
			time: '09:00',
			title: 'Done'
		},
		{ id: 'queued', status: 'current' as const, title: 'Queued' },
		{ id: 'pending', title: 'Pending' }
	];
	const slides = [
		{ id: 'a', label: 'Alpha' },
		{ id: 'b', label: 'Beta' }
	];
	const tableRows = [
		{ id: 'enabled', name: 'Enabled' },
		{ id: 'other', name: 'Other' },
		{ id: 'disabled', name: 'Disabled' }
	];
	const tableColumns = [
		{
			accessor: (row: (typeof tableRows)[number]) => row.name,
			header: 'Name',
			id: 'name',
			sortable: true,
			width: 160
		}
	];
	const treeNodes = [
		{ key: 'root', label: 'Root' },
		{ disabled: true, key: 'disabled', label: 'Disabled', parentKey: 'root' }
	];
	const transferItems = [
		{ key: 'one', label: 'One' },
		{ disabled: true, key: 'two', label: 'Two' }
	];
	let carouselValue = $state<SelectionKey>('b');
	let carouselChanges = $state(0);
	let alertDismissed = $state(0);
	let toastActions = $state(0);
	let tableSelection = $state<readonly SelectionKey[]>(['enabled']);
	let emptyRange = $state('none');
</script>

<ZList items={listItems} data-testid="coverage-list" />
<ZList items={listItems} ordered data-testid="coverage-list-ordered" />
<ZList items={listItems} data-testid="coverage-list-custom">
	{#snippet item(entry)}<em>Custom {entry.label}</em>{/snippet}
</ZList>

<ZAvatar alt="Custom fallback" shape="square" size="small">
	{#snippet fallback()}<span>CF</span>{/snippet}
</ZAvatar>
<ZAvatar
	alt="Image lifecycle"
	fallbackText="IL"
	src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
	data-testid="coverage-avatar-image"
/>
<ZAvatar alt="Fallback initial" />
<ZAvatar alt="" />

<ZEmpty title="Nothing here" headingLevel={4} data-testid="coverage-empty">
	{#snippet icon()}<span>icon</span>{/snippet}
	Description
	{#snippet actions()}<ZButton>Recover</ZButton>{/snippet}
</ZEmpty>

<ZProvider motion="reduced">
	<ZButton>Reduced button</ZButton>
	<ZButton loading loadingLabel="Custom loading">
		{#snippet loadingIndicator()}<span>busy</span>{/snippet}
		Loading action
	</ZButton>
	<ZButton>
		{#snippet start()}<span>start</span>{/snippet}
		Slots
		{#snippet end()}<span>end</span>{/snippet}
	</ZButton>
	<ZInput aria-label="Reduced input" />
	<ZInputGroup aria-label="Reduced input group"
		><ZInput aria-label="Grouped reduced input" /></ZInputGroup
	>
	<ZTextarea aria-label="Reduced textarea" />
	<ZFileUpload disabled inputLabel="Reduced upload" />
	<ZSkeleton shape="circle" width={40} data-testid="coverage-skeleton-circle" />
	<ZSkeleton shape="rectangle" height="3rem" data-testid="coverage-skeleton-rectangle" />
	<ZCarousel
		ariaLabel="Reduced carousel"
		items={slides}
		itemKey={(entry) => entry.id}
		itemLabel={(entry) => entry.label}
		autoplayInterval={1000}
		data-testid="coverage-carousel-reduced"
	>
		{#snippet item(entry)}<span>{entry.label}</span>{/snippet}
	</ZCarousel>
</ZProvider>

<ZCarousel
	ariaLabel="Coverage carousel"
	items={slides}
	itemKey={(entry) => entry.id}
	itemLabel={(entry) => entry.label}
	loop={false}
	pauseOnHover={false}
	autoplayInterval={1000}
	bind:value={carouselValue}
	onValueChange={() => (carouselChanges += 1)}
	data-testid="coverage-carousel"
>
	{#snippet item(entry)}<span>{entry.label}</span>{/snippet}
</ZCarousel>

<ZTimeline items={timelineItems} data-testid="coverage-timeline">
	{#snippet item(entry)}<em>{entry.title}</em>{/snippet}
</ZTimeline>
<ZTimeline items={timelineItems} data-testid="coverage-timeline-default" />

<ZAlert title="Static notice" live="off" />
<ZAlert
	title="Urgent notice"
	live="assertive"
	tone="danger"
	dismissible
	onDismiss={() => (alertDismissed += 1)}
	data-testid="coverage-alert"
>
	Danger details
	{#snippet action()}<ZButton>Resolve</ZButton>{/snippet}
</ZAlert>

<ZResult title="Warning result" tone="warning" headingLevel={3} data-testid="coverage-result">
	{#snippet icon()}<span>!</span>{/snippet}
	Result description
	{#snippet actions()}<ZButton>Retry</ZButton>{/snippet}
</ZResult>

<ZToast
	title="Danger toast"
	tone="danger"
	dismissible={false}
	data-testid="coverage-toast-danger"
/>
<ZToast
	title="Action and dismiss toast"
	actionLabel="Act now"
	onAction={() => undefined}
	onDismiss={() => undefined}
	data-testid="coverage-toast-dismiss"
/>
<ZToast
	title="Action toast"
	actionLabel="Act"
	dismissible={false}
	onAction={() => (toastActions += 1)}
	data-testid="coverage-toast-action"
/>

<ZProgress
	label="Custom progress"
	min={10}
	max={20}
	value={25}
	formatValue={(value) => `${value} units`}
/>
<ZProgress label="Indeterminate line" />
<ZProgress label="Determinate circle" value={15} max={20} view="circle" />
<ZProgress label="Indeterminate circle" view="circle" />

<ZStatistic label="Big integer" value={1234567890123456789n} trend={0}>
	{#snippet prefix()}<span>≈</span>{/snippet}
	{#snippet suffix()}<span> req</span>{/snippet}
</ZStatistic>
<ZStatistic label="Down trend" value={42} trend={-4} />

<ZDataTable
	caption="Single table"
	columns={tableColumns}
	rows={tableRows}
	rowKey={(row) => row.id}
	selectionMode="single"
	defaultSort={{ columnId: 'name', direction: 'descending' }}
	isRowDisabled={(row) => row.id === 'disabled'}
	bind:selectedKeys={tableSelection}
	data-testid="coverage-data-table"
/>
<ZDataTable
	caption="Empty table"
	columns={tableColumns}
	rows={[]}
	rowKey={() => 'none'}
	emptyLabel="Nothing to display"
/>

<ZVirtualList
	ariaLabel="Empty virtual list"
	items={[]}
	itemKey={() => 'none'}
	height={80}
	initialIndex={5}
	onRangeChange={(range) => (emptyRange = `${range.startIndex}:${range.endIndex}`)}
>
	{#snippet item()}<span>Never rendered</span>{/snippet}
</ZVirtualList>

<ZDateField
	aria-label="Coverage date"
	defaultValue={new CalendarDate(2026, 8, 18)}
	minValue={new CalendarDate(2026, 8, 1)}
	maxValue={new CalendarDate(2026, 8, 31)}
	locale="en-GB"
	data-testid="coverage-date-field"
/>
<ZDateField aria-label="Empty coverage date" data-testid="coverage-date-empty" />
<ZTimeField
	aria-label="Coverage time"
	defaultValue={new Time(13, 30)}
	hourCycle={12}
	granularity="minute"
	minuteStep={7}
	minValue={new Time(8)}
	maxValue={new Time(18)}
	data-testid="coverage-time-field"
/>

<ZDateField aria-label="Disabled date" disabled required />
<ZCascader disabled nodes={treeNodes} defaultValue={['root']} name="disabled-cascader" />
<ZFileUpload disabled multiple={false} maxFiles={1} inputLabel="Disabled upload" />
<ZMention disabled readonly aria-label="Disabled mention" items={[]} />
<ZNumberField disabled readonly required name="disabled-number" />
<ZPinInput
	readonly
	required
	mask
	mode="text"
	length={2}
	defaultValue="A"
	validateCharacter={(character) => /[A-Z]/u.test(character)}
/>
<ZPinInput disabled length={2} />
<ZTransfer disabled filterable={false} items={transferItems} value={['one']} />
<ZTreeSelect disabled nodes={treeNodes} defaultExpandedKeys={['root']} />
<ZTree
	aria-label="Multiple coverage tree"
	nodes={treeNodes}
	defaultExpandedKeys={['root']}
	defaultSelectedKeys={['root']}
	selectionMode="multiple"
/>
<ZTree aria-label="Non-selectable coverage tree" nodes={treeNodes} selectionMode="none" />
<ZCheckbox disabled invalid size="small" defaultChecked value="disabled" />
<ZSwitch disabled invalid size="small" defaultChecked />
<ZTimeField
	aria-label="Readonly coverage time"
	defaultValue={new Time(9)}
	readonly
	hourCycle={12}
	data-testid="coverage-time-readonly"
/>

<output data-testid="coverage-output"
	>{carouselValue}:{carouselChanges}:{alertDismissed}:{toastActions}:{tableSelection.join(
		','
	)}:{emptyRange}</output
>
