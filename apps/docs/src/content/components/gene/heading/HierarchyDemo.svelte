<script lang="ts">
	import { ZHeading, ZStack, ZText } from '@zadmin/zui';
</script>

<article>
	<ZStack gap="medium">
		<ZHeading level={1} size="xlarge">生产运行手册</ZHeading>
		<ZText as="p">页面只有一个描述主要主题的h1。</ZText>
		<section>
			<ZHeading level={2} size="large">部署流程</ZHeading>
			<ZText as="p">主要章节使用h2，不根据希望的字号跳过层级。</ZText>
			<section>
				<ZHeading level={3} size="large">回滚条件</ZHeading>
				<ZText as="p">子章节使用h3，但可以与父章节共享视觉size。</ZText>
			</section>
		</section>
	</ZStack>
</article>
