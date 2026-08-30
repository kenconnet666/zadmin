<script lang="ts">
	import { ZAlert, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZAlert live="off" title="说明" tone="info">这条静态说明不会进入live region。</ZAlert>
	<ZAlert title="配置有效" tone="success">所有必填环境变量均已设置。</ZAlert>
	<ZAlert title="即将过期" tone="warning">证书将在7天后过期。</ZAlert>
	<ZAlert live="assertive" title="发布失败" tone="danger">生产健康检查没有通过。</ZAlert>
</ZStack>
