<script lang="ts">
	import { ZCard, ZStack, ZText } from '@zadmin/zui';
	import { ZCode, type ZCodeTheme } from '@zadmin/zui/code';

	const explicitTheme: ZCodeTheme = {
		dark: 'github-dark-high-contrast',
		light: 'github-light-high-contrast'
	};
	const source = 'const status: "ready" | "blocked" = "ready";';
</script>

<ZStack gap="medium">
	<ZText tone="muted">scheme可以覆盖Provider明暗轴；embedded用于已有容器，不重复边框。</ZText>
	<ZStack gap="medium">
		<ZCard>
			<ZCode
				ariaLabel="显式亮色代码"
				code={source}
				embedded
				lang="typescript"
				scheme="light"
				theme={explicitTheme}
			/>
		</ZCard>
		<ZCard>
			<ZCode
				ariaLabel="显式暗色代码"
				code={source}
				embedded
				lang="typescript"
				scheme="dark"
				theme={explicitTheme}
			/>
		</ZCard>
	</ZStack>
</ZStack>
