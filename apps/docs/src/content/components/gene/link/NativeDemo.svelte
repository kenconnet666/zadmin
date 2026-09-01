<script lang="ts">
	import { ZLink, ZStack } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZLink aria-current="page" href="#/components/link">当前页</ZLink>
	<ZLink download="zui-link-example.txt" href="data:text/plain,ZUI%20Link%20example">
		下载示例文本
	</ZLink>
	<ZLink href="mailto:team@example.com">联系维护团队</ZLink>
	<ZLink href="https://example.com/license" rel="license nofollow" target="_blank">
		许可证（新窗口）
	</ZLink>
</ZStack>
