<script lang="ts">
	import { ZAvatar, ZIcon, ZStack, ZText } from '@zadmin/zui';
</script>

{#snippet userFallback()}
	<ZIcon name="user" />
{/snippet}

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="large" wrap>
		<ZAvatar alt="ZUI品牌头像" shape="rounded" size="large" src="/favicon.svg" />
		<ZAvatar alt="尚未上传头像的用户" fallback={userFallback} size="large" />
	</ZStack>
	<ZText tone="muted">图片成功后使用原生img；无src时自定义fallback仍由根Avatar提供名称。</ZText>
</ZStack>
