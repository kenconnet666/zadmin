<script lang="ts">
    import {ZField, ZInput} from '@zadmin/zui';

    let account = $state('');
    const error = $derived(
        account.length > 0 && account.length < 3 ? '账号至少需要3个字符' : undefined
    );
</script>

<ZField
        label="Account"
        description="ZField自动连接label、description、error与ZInput。"
        {error}
        required
>
    <ZInput bind:value={account} data-testid="field-account" placeholder="alice"/>
</ZField>
