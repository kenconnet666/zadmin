<script lang="ts">
	import { ZButton, ZIcon, ZSpinner, ZStack, ZText } from '@zadmin/zui';
</script>

{#snippet addIcon()}
	<ZIcon name="plus" />
{/snippet}

{#snippet nextIcon()}
	<ZIcon name="arrowRight" />
{/snippet}

{#snippet saveIndicator()}
	<ZSpinner label="正在保存" size="small" />
{/snippet}

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton start={addIcon}>新建项目</ZButton>
		<ZButton end={nextIcon} variant="secondary">继续配置</ZButton>
		<ZButton loading loadingIndicator={saveIndicator} loadingLabel="正在保存设置">保存设置</ZButton>
	</ZStack>
	<ZStack gap="small">
		<ZButton fullWidth start={addIcon}>占满可用宽度</ZButton>
		<ZText tone="muted">start、end和loadingIndicator都使用Snippet，按钮主体宽度保持稳定。</ZText>
	</ZStack>
</ZStack>
