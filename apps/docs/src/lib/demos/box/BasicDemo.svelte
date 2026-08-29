<script lang="ts">
	import { ZBox, defaultTheme, icss } from '@zadmin/zui';

	const boxClass = icss(defaultTheme, (s) => {
		s.padding._large;
		s.borderWidth._hairline;
		s.borderStyle.solid;
		s.borderColor._border;
		s.borderRadius._large;
		s.backgroundColor._surface;
		s.color._text;
	});
</script>

<ZBox class={boxClass} data-demo-root="box">
	ZBox保持真实div根元素，并转发class、style、ref与原生HTML属性。
</ZBox>
