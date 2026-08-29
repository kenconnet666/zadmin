<script module lang="ts">
    import type {ZuiComponentMetadata} from '../../../metadata/types.js';
    import type {ZDialogCloseProps} from '../dialog/ZDialogClose.svelte';

    export type ZAlertDialogCancelProps = ZDialogCloseProps;
    export const zuiMetadata = {
        category: 'overlay',
        id: 'alert-dialog-cancel',
        importStatement: "import { ZAlertDialogCancel } from '@zadmin/zui';",
        name: 'ZAlertDialogCancel',
        bindings: [{description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null'}],
        dependencies: ['ZAlertDialog', 'ZDialogClose', 'ZButton'],
        events: [{
            description: 'preventDefault可保持AlertDialog打开。',
            name: 'onclick',
            type: 'MouseEventHandler<HTMLButtonElement>'
        }],
        keyboard: [{description: '显式取消并关闭AlertDialog。', key: 'Enter / Space'}],
        parts: [],
        props: [{
            bindable: true,
            default: 'null',
            description: '真实button引用。',
            name: 'ref',
            type: 'HTMLButtonElement | null'
        }],
        since: '0.3.0',
        snippets: [{description: '取消操作内容。', name: 'children', type: 'Snippet'}],
        source: 'ui/zui/src/components/compound/alert-dialog/ZAlertDialogCancel.svelte',
        states: [],
        status: 'experimental',
        summary: '默认secondary视觉并显式取消AlertDialog。'
    } as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
    import ZDialogClose from '../dialog/ZDialogClose.svelte';

    let {ref = $bindable(null), variant = 'secondary', ...rest}: ZAlertDialogCancelProps = $props();
</script>

<ZDialogClose {...rest} {variant} bind:ref/>
