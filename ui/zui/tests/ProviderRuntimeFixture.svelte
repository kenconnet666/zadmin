<script lang="ts">
	import {
		ZButton,
		ZProvider,
		zhCNLocalePack,
		type IcssRuntime,
		type ZuiTheme
	} from '../src/entrypoints/index.js';
	import ContextProbe from './ContextProbe.svelte';

	interface Props {
		nestedTheme?: ZuiTheme;
		runtime: IcssRuntime;
		theme: ZuiTheme;
	}

	let { nestedTheme, runtime, theme }: Props = $props();
</script>

<ZProvider
	colorScheme="dark"
	contrast="high"
	density="compact"
	direction="rtl"
	idPrefix="test"
	locale="zh-CN"
	localePack={zhCNLocalePack}
	motion="reduced"
	portalContainer={null}
	translations={{ close: '关闭' }}
	{runtime}
	{theme}
	timeZone="Asia/Shanghai"
>
	<ZButton data-testid="outer-provider">Outer</ZButton>
	<ContextProbe id="outer-context" />
	{#if nestedTheme}
		<ZProvider theme={nestedTheme}>
			<ZButton data-testid="inner-provider">Inner</ZButton>
			<ContextProbe id="inner-context" />
		</ZProvider>
	{/if}
</ZProvider>
