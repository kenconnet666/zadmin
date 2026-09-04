<script lang="ts">
	import { parseDate } from '@internationalized/date';
	import {
		ZCalendar,
		ZFileUpload,
		ZRadioGroup,
		ZRadioGroupItem,
		ZTagsInput,
		ZTransfer
	} from '../src/entrypoints/index.js';

	let tags = $state<readonly string[]>(['alpha']);
	let radio = $state('one');
	const date = parseDate('2026-09-04');
	const items = [
		{ key: 'one', label: 'One' },
		{ key: 'two', label: 'Two' },
		{ key: 'three', label: 'Three' }
	] as const;
</script>

<div data-testid="input-visual-contracts">
	<!-- @zui-visual ZRadioGroup orientation and selection geometry -->
	<ZRadioGroup bind:value={radio} data-testid="radio-horizontal" orientation="horizontal">
		<ZRadioGroupItem value="one" />
		<ZRadioGroupItem value="two" />
	</ZRadioGroup>

	<!-- @zui-visual ZCalendar size and invalid state geometry -->
	<div data-testid="calendar-small-wrap">
		<ZCalendar data-testid="calendar-small" size="small" invalid value={date} />
	</div>
	<div data-testid="calendar-large-wrap">
		<ZCalendar data-testid="calendar-large" size="large" value={date} />
	</div>

	<!-- @zui-visual ZTagsInput size and invalid state geometry -->
	<ZTagsInput bind:value={tags} data-testid="tags-small" invalid size="small" />
	<ZTagsInput data-testid="tags-large" defaultValue={['alpha']} size="large" />

	<!-- @zui-visual ZFileUpload invalid state geometry -->
	<ZFileUpload data-testid="file-upload-invalid" invalid inputLabel="Upload" />
	<ZFileUpload data-testid="file-upload-valid" inputLabel="Upload valid" />

	<!-- @zui-visual ZTransfer two-pane layout geometry -->
	<ZTransfer data-testid="transfer-invalid" invalid {items} />
</div>
