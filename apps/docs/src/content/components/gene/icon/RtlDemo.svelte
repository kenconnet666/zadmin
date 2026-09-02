<script lang="ts">
	import { ZIcon, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl">
	<ZStack align="center" direction="row" gap="medium">
		<ZIcon aria-hidden="true" name="arrowRight" size="medium" />
		<ZText>الاتجاه / 方向由业务语义决定</ZText>
	</ZStack>
</ZProvider>
<ZText tone="muted">
	ZIcon不会仅因RTL自动镜像方向图标；返回、前进或传输方向必须由拥有导航语义的组件明确选择。
</ZText>
