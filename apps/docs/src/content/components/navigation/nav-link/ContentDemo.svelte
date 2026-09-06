<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Folder from '@lucide/svelte/icons/folder';
	import { ZNavLink, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZStack gap="small" style="max-width: 100%;">
		<ZText weight="semibold">窄宽度与RTL内容</ZText>
		<ZNavLink
			label="华东区域合作伙伴结算与对账中心（2026年第三季度）"
			description="长说明在content区域内自然换行，不截断必要名称。"
			href="/workspace/settlement"
			external
		>
			{#snippet start()}<Folder aria-hidden="true" />{/snippet}
			{#snippet end()}<ExternalLink aria-hidden="true" />{/snippet}
		</ZNavLink>
		<ZNavLink label="系统状态与最近活动">
			{#snippet labelContent()}<span>可替换的 <strong>labelContent</strong></span>{/snippet}
		</ZNavLink>
	</ZStack>
</ZProvider>
