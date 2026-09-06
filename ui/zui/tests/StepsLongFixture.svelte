<script lang="ts">
	import ZSteps from '../src/components/navigation/ZSteps.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import type { ZControlSize } from '../src/runtime/foundation/control-size.js';
	let {
		size = 'medium',
		direction = 'ltr',
		orientation = 'horizontal'
	}: {
		size?: ZControlSize;
		direction?: 'ltr' | 'rtl';
		orientation?: 'horizontal' | 'vertical';
	} = $props();
	const items = [
		{
			key: 'one',
			title: '配置基础信息与身份认证',
			description: 'https://example.com/averylongunbreakableprojectpaththatmuststayinsideitsowner',
			status: 'complete'
		},
		{
			key: 'two',
			title: '确认所有部署参数并阅读发布说明',
			description: 'Correct the missing environment value',
			status: 'error',
			clickable: true
		},
		{ key: 'three', title: '发布完成', icon: 'check' }
	] as const;
</script>

<ZProvider {direction} motion="reduced">
	<div style="width:280px; max-width:100%" data-testid="steps-long-boundary">
		<ZSteps {items} {size} {orientation} currentKey="two" aria-label="Long steps">
			{#snippet title(item, context)}<span data-testid="steps-custom-title"
					>{item.title}{context.current ? ' (current)' : ''}</span
				>{/snippet}
		</ZSteps>
	</div>
</ZProvider>
