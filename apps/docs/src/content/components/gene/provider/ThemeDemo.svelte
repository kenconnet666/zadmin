<script lang="ts">
    import {ZButton, ZProvider, ZStack, ZText, defaultTheme, extendTheme} from '@zadmin/zui';

    const violetTheme = extendTheme(defaultTheme, {
        color: {
            primary: '#7c3aed',
            primaryHover: '#6d28d9'
        }
    });
</script>

<ZStack gap="medium">
    <ZText weight="semibold">默认主题</ZText>
    <ZButton>Default action</ZButton>
    <ZProvider theme={violetTheme}>
        <ZStack gap="small">
            <ZText tone="primary" weight="semibold">嵌套Provider主题</ZText>
            <ZButton>Violet action</ZButton>
        </ZStack>
    </ZProvider>
</ZStack>
