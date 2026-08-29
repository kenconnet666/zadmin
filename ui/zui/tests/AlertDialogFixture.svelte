<script lang="ts">
    import {
        ZAlertDialog,
        ZAlertDialogAction,
        ZAlertDialogCancel,
        ZAlertDialogContent,
        ZAlertDialogDescription,
        ZAlertDialogOverlay,
        ZAlertDialogTitle,
        ZAlertDialogTrigger
    } from '../src/entrypoints/index.js';

    let {defaultOpen = false}: { defaultOpen?: boolean } = $props();
    let open = $state<boolean>();
    let outcome = $state('pending');
</script>

<div data-testid="alert-dialog-inline-host">
    <ZAlertDialog bind:open {defaultOpen}>
        <ZAlertDialogTrigger data-testid="alert-dialog-trigger">Delete</ZAlertDialogTrigger>
        <ZAlertDialogOverlay data-testid="alert-dialog-overlay"/>
        <ZAlertDialogContent data-testid="alert-dialog-content">
            <ZAlertDialogTitle>Delete production?</ZAlertDialogTitle>
            <ZAlertDialogDescription>This cannot be undone.</ZAlertDialogDescription>
            <ZAlertDialogCancel data-testid="alert-dialog-cancel" onclick={() => (outcome = 'cancel')}>
                Cancel
            </ZAlertDialogCancel>
            <ZAlertDialogAction data-testid="alert-dialog-action" onclick={() => (outcome = 'action')}>
                Delete
            </ZAlertDialogAction>
        </ZAlertDialogContent>
    </ZAlertDialog>
    <output data-testid="alert-dialog-output">{open}:{outcome}</output>
</div>
