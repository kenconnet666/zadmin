<script lang="ts">
	import {
		ZCascader,
		ZColorPicker,
		ZCommand,
		ZCommandPalette,
		ZFileUpload,
		ZMention,
		ZMultiSelect,
		ZMultiSelectTrigger,
		ZNumberField,
		ZProvider,
		ZSelect,
		ZSelectTrigger,
		ZTagsInput,
		ZTransfer,
		ZTreeSelect,
		enUSLocalePack,
		zhCNLocalePack
	} from '../src/entrypoints/index.js';

	const nodes = [{ key: 'root', label: 'Root' }] as const;
	const transferItems = [{ key: 'alpha', label: 'Alpha' }] as const;
	const file = new File(['seed'], 'brief.txt', { type: 'text/plain' });
	let chinese = $state(false);
</script>

<button data-testid="toggle-locale" type="button" onclick={() => (chinese = !chinese)}>
	Toggle locale
</button>

<ZProvider
	locale={chinese ? 'zh-CN' : 'en-US'}
	localePack={chinese ? zhCNLocalePack : enUSLocalePack}
>
	<div data-testid="locale-components">
		<ZSelect>
			<ZSelectTrigger data-testid="select-default" />
		</ZSelect>
		<ZMultiSelect>
			<ZMultiSelectTrigger data-testid="multi-select-default" />
		</ZMultiSelect>
		<ZCascader data-testid="cascader-default" {nodes} />
		<ZTreeSelect data-testid="tree-select-default" {nodes} />
		<ZCommand data-testid="command-default" items={[]} />
		<ZCommand
			data-testid="command-explicit"
			inputLabel="Fixed search label"
			items={[]}
			placeholder="Fixed command placeholder"
		/>
		<ZNumberField data-testid="number-field-default" defaultValue={2} />
		<div data-testid="palette-default">
			<ZCommandPalette items={[]} />
		</div>
		<ZMention data-testid="mention-default" items={[]} placeholder="Mention someone" />
		<ZTransfer data-testid="transfer-default" items={transferItems} />
		<ZFileUpload data-testid="file-upload-default" defaultFiles={[file]} />
		<ZTagsInput data-testid="tags-input-default" defaultValues={['alpha']} />
		<ZColorPicker allowAlpha data-testid="color-picker-default" />
	</div>
</ZProvider>
