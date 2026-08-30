<script lang="ts">
	import {
		ZPopconfirm,
		ZPopconfirmAction,
		ZPopconfirmCancel,
		ZPopconfirmContent,
		ZPopconfirmDescription,
		ZPopconfirmTitle,
		ZPopconfirmTrigger
	} from '../src/entrypoints/index.js';

	let { defaultOpen = false, prevent = false }: { defaultOpen?: boolean; prevent?: boolean } =
		$props();
	let open = $state<boolean>();
	let outcome = $state('pending');
</script>

<div data-testid="popconfirm-inline-host">
	<ZPopconfirm bind:open {defaultOpen} placement="bottom-start">
		<ZPopconfirmTrigger data-testid="popconfirm-trigger">Delete release</ZPopconfirmTrigger>
		<ZPopconfirmContent data-testid="popconfirm-content">
			<ZPopconfirmTitle>Delete this release?</ZPopconfirmTitle>
			<ZPopconfirmDescription>It cannot be deployed again.</ZPopconfirmDescription>
			<ZPopconfirmCancel
				data-testid="popconfirm-cancel"
				onclick={(event) => {
					outcome = 'cancel';
					if (prevent) event.preventDefault();
				}}
			>
				Cancel
			</ZPopconfirmCancel>
			<ZPopconfirmAction
				data-testid="popconfirm-action"
				onclick={(event) => {
					outcome = 'action';
					if (prevent) event.preventDefault();
				}}
			>
				Delete
			</ZPopconfirmAction>
		</ZPopconfirmContent>
	</ZPopconfirm>
</div>
<button data-testid="popconfirm-outside">Outside</button>
<output data-testid="popconfirm-output">{open}:{outcome}</output>
