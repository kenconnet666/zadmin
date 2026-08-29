<script lang="ts">
    import {
        ZAlertDialog,
        ZAlertDialogAction,
        ZAlertDialogCancel,
        ZAlertDialogContent,
        ZAlertDialogDescription,
        ZAlertDialogOverlay,
        ZAlertDialogTitle,
        ZAlertDialogTrigger,
        ZStack,
        ZText
    } from '@zadmin/zui';

    let open = $state(false);
    let outcome = $state('尚未执行');
</script>

<ZAlertDialog bind:open>
    <ZAlertDialogTrigger data-testid="alert-dialog-trigger" variant="danger">
        删除生产部署
    </ZAlertDialogTrigger>
    <ZAlertDialogOverlay data-testid="alert-dialog-overlay"/>
    <ZAlertDialogContent data-testid="alert-dialog-content">
        <ZStack gap="large">
            <ZAlertDialogTitle>永久删除生产部署？</ZAlertDialogTitle>
            <ZAlertDialogDescription>
                此操作会移除zadmin-web及其未归档日志，且无法撤销。
            </ZAlertDialogDescription>
            <ZStack direction="row" gap="medium">
                <ZAlertDialogCancel data-testid="alert-dialog-cancel" onclick={() => (outcome = '已取消')}>
                    保留部署
                </ZAlertDialogCancel>
                <ZAlertDialogAction data-testid="alert-dialog-action" onclick={() => (outcome = '已确认删除')}>
                    确认删除
                </ZAlertDialogAction>
            </ZStack>
        </ZStack>
    </ZAlertDialogContent>
</ZAlertDialog>
<ZText tone="muted">open = {open} · 结果 = {outcome}</ZText>
