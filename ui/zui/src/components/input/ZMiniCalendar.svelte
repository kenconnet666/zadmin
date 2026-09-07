<script module lang="ts">
	import type { CalendarDate } from '@internationalized/date';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { Weekday } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { CalendarCellContext, CalendarHeaderContext } from './ZCalendar.svelte';

	export interface ZMiniCalendarProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly calendarLabel?: string;
		readonly dateCell?: Snippet<[context: CalendarCellContext]>;
		readonly defaultFocusedValue?: CalendarDate;
		readonly defaultValue?: CalendarDate | null;
		readonly disabled?: boolean;
		readonly firstDayOfWeek?: Weekday;
		focusedValue?: CalendarDate;
		readonly form?: string;
		readonly formParticipation?: 'auto' | 'none';
		readonly header?: Snippet<[context: CalendarHeaderContext]>;
		readonly invalid?: boolean;
		readonly isDateUnavailable?: (date: CalendarDate) => boolean;
		readonly locale?: string;
		readonly maxValue?: CalendarDate;
		readonly minValue?: CalendarDate;
		readonly name?: string;
		readonly nextLabel?: string;
		readonly onFocusedValueChange?: (value: CalendarDate) => void;
		readonly onValueChange?: (value: CalendarDate | null) => void;
		readonly previousLabel?: string;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly size?: ZControlSize;
		readonly timeZone?: string;
		value?: CalendarDate | null;
		readonly visibleDays?: number;
	}

	export const zuiMetadata = {
		bindings: [
			{
				description: '唯一内部Calendar拥有的nullable单日期选择。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{
				description: '独立于选择的键盘焦点日期。',
				name: 'focusedValue',
				type: 'CalendarDate | undefined'
			},
			{ description: '内部Calendar的真实根节点。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'input',
		dependencies: ['ZCalendar strip view', 'FormControlState', 'FormValueBridge'],
		events: [
			{
				description: '用户选择或清空日期；外部同步和reset不触发。',
				name: 'onValueChange',
				type: '(value: CalendarDate | null) => void'
			},
			{
				description: '用户改变roving焦点日期。',
				name: 'onFocusedValueChange',
				type: '(value: CalendarDate) => void'
			}
		],
		id: 'mini-calendar',
		importStatement: "import { ZMiniCalendar } from '@zadmin/zui';",
		keyboard: [
			{ description: '按实际书写方向逐日移动。', key: 'ArrowLeft / ArrowRight' },
			{ description: '按历法周上下移动。', key: 'ArrowUp / ArrowDown' },
			{ description: '移动到当前周边界。', key: 'Home / End' },
			{ description: '按visibleDays翻页。', key: 'PageUp / PageDown' },
			{ description: '选择当前日期。', key: 'Enter / Space' },
			{ description: '清空nullable值。', key: 'Delete / Backspace' }
		],
		name: 'ZMiniCalendar',
		parts: [
			{ description: '复用Calendar分页导航与typed header。', name: 'header' },
			{ description: '每行最多七天的strip grid。', name: 'grid' },
			{ description: '复用Calendar内部日期button。', name: 'cell' }
		],
		props: [
			{
				default: 'Provider localePack.date.calendarLabel',
				description: 'strip grid的可访问名称。',
				name: 'calendarLabel',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '透明透传给唯一Calendar owner的选择值。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{
				default: 'null',
				description: '非受控初值与原生form reset目标。',
				name: 'defaultValue',
				type: 'CalendarDate | null'
			},
			{
				bindable: true,
				default: 'value、defaultFocusedValue或today',
				description: '独立roving焦点日期。',
				name: 'focusedValue',
				type: 'CalendarDate'
			},
			{
				default: 'undefined',
				description: '非受控初始焦点日期。',
				name: 'defaultFocusedValue',
				type: 'CalendarDate'
			},
			{
				default: '7',
				description: '连续显示和每次分页的1–31个日期；每行最多七天。',
				name: 'visibleDays',
				type: 'number'
			},
			{
				default: 'Calendar默认日期内容',
				description: '只替换内部日期button内容。',
				name: 'dateCell',
				type: 'Snippet<[CalendarCellContext]>'
			},
			{
				default: 'Calendar默认strip页头',
				description: '通过只读context定制内部Calendar页头。',
				name: 'header',
				type: 'Snippet<[CalendarHeaderContext]>'
			},
			{
				default: 'locale规则',
				description: '空焦点时strip起点使用的周起始日。',
				name: 'firstDayOfWeek',
				type: 'Weekday'
			},
			{
				default: 'undefined',
				description: '最早可选日期。',
				name: 'minValue',
				type: 'CalendarDate'
			},
			{
				default: 'undefined',
				description: '最晚可选日期。',
				name: 'maxValue',
				type: 'CalendarDate'
			},
			{
				default: 'undefined',
				description: '业务日期不可用谓词。',
				name: 'isDateUnavailable',
				type: '(date: CalendarDate) => boolean'
			},
			{
				default: 'Field或false',
				description: '停止全部交互并退出FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '保留焦点、翻页和值提交，阻止选择。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '空值进入内在无效状态但仍可清空。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '投射外部无效状态。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field > componentDefaults.miniCalendar > calendar > density',
				description: 'strip日期、导航与typed context共享的五档尺寸。',
				name: 'size',
				type: 'ZControlSize'
			},
			{
				default: 'Provider locale',
				description: '周起点、日期格式与可访问名称的BCP 47 locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'Provider timeZone',
				description: 'today与日期格式使用的IANA时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'Field或undefined',
				description: '唯一ISO CalendarDate FormData字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: '最近祖先form',
				description: '唯一内部FormValueBridge关联的form id。',
				name: 'form',
				type: 'string'
			},
			{
				default: "'auto'",
				description: 'none退出父Form value scope与FormValueBridge，仍保留Calendar交互与refs。',
				name: 'formParticipation',
				type: "'auto' | 'none'"
			},
			{
				default: 'Provider localePack.date.previousDateWindow',
				description: '上一段导航按钮名称。',
				name: 'previousLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.date.nextDateWindow',
				description: '下一段导航按钮名称。',
				name: 'nextLabel',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '唯一内部Calendar根引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '内部日期button的定制内容。',
				name: 'dateCell',
				required: false,
				type: 'Snippet<[CalendarCellContext]>'
			},
			{
				description: '内部strip分页页头。',
				name: 'header',
				required: false,
				type: 'Snippet<[CalendarHeaderContext]>'
			}
		],
		source: 'ui/zui/src/components/input/ZMiniCalendar.svelte',
		states: [
			{ description: '固定strip布局。', name: 'data-view', values: ['strip'] },
			{
				description: '解析后的五档尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{ description: '整组禁用。', name: 'data-disabled', values: ['true'] },
			{ description: '只读浏览。', name: 'data-readonly', values: ['true'] },
			{ description: '字段或内在无效。', name: 'data-invalid', values: ['true'] }
		],
		status: 'experimental',
		summary: '复用唯一ZCalendar owner的紧凑连续日期条，不复制选择、焦点、表单或导航状态。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import ZCalendar from './ZCalendar.svelte';

	let {
		calendarLabel,
		dateCell,
		defaultFocusedValue,
		defaultValue,
		disabled,
		firstDayOfWeek,
		focusedValue = $bindable(),
		form,
		formParticipation = 'auto',
		header,
		invalid,
		isDateUnavailable,
		locale,
		maxValue,
		minValue,
		name,
		nextLabel,
		onFocusedValueChange,
		onValueChange,
		previousLabel,
		readonly: readonlyProp,
		ref = $bindable(null),
		required,
		size,
		timeZone,
		value = $bindable(),
		visibleDays = 7,
		...rest
	}: ZMiniCalendarProps = $props();
	const zui = useZui();
	const field = useZField();
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.miniCalendar?.size ??
				zui.componentDefaults.calendar?.size,
			zui.density
		)
	);
</script>

<ZCalendar
	{...rest}
	appearance="bare"
	{calendarLabel}
	{dateCell}
	{defaultFocusedValue}
	{defaultValue}
	{disabled}
	{firstDayOfWeek}
	bind:focusedValue
	{form}
	{formParticipation}
	{header}
	{invalid}
	{isDateUnavailable}
	{locale}
	{maxValue}
	{minValue}
	{name}
	{nextLabel}
	{onFocusedValueChange}
	{onValueChange}
	{previousLabel}
	readonly={readonlyProp}
	bind:ref
	{required}
	selectionMode="single"
	size={resolvedSize}
	{timeZone}
	bind:value
	view="strip"
	{visibleDays}
/>
