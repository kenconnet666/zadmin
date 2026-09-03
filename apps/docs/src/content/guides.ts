import type { ZCodeLanguage } from '@zadmin/zui/code';
import { zuiProgress } from '../framework/progress.generated.js';

export interface GuideLink {
	readonly href: string;
	readonly label: string;
}

export interface GuideSection {
	readonly bullets?: readonly string[];
	readonly code?: string;
	readonly id: string;
	readonly language?: ZCodeLanguage;
	readonly links?: readonly GuideLink[];
	readonly paragraphs: readonly string[];
	readonly title: string;
}

export interface GuideDefinition {
	readonly eyebrow: string;
	readonly id: string;
	readonly sections: readonly GuideSection[];
	readonly summary: string;
	readonly title: string;
}

export const guideDocs = [
	{
		eyebrow: 'GETTING STARTED',
		id: 'getting-started',
		title: '从真实Provider和原生语义开始。',
		summary:
			'安装必需peer、建立应用级Provider，再按业务状态所有权组合ZUI；不要先复制主题字面量或包装原生控件。',
		sections: [
			{
				id: 'install',
				title: '安装',
				paragraphs: ['Svelte与Lucide是必需peer；Shiki只在使用ZCode高亮入口时安装。'],
				code: 'pnpm add @zadmin/zui @lucide/svelte svelte',
				language: 'bash'
			},
			{
				id: 'provider',
				title: '应用根Provider',
				paragraphs: [
					'Provider统一Theme、明暗模式、locale、direction、contrast、density、motion、翻译、Portal边界和ICSS runtime，并且不创建额外DOM。'
				],
				code: `<script lang="ts">
\timport { ZButton, ZProvider, ZStack } from '@zadmin/zui';
\timport { auroraLight } from '@zadmin/zui/themes';
</script>

<ZProvider theme={auroraLight} colorScheme="light" locale="zh-CN">
\t<ZStack gap="medium"><ZButton>发布</ZButton></ZStack>
</ZProvider>`,
				language: 'svelte'
			},
			{
				id: 'ownership',
				title: '状态所有权',
				paragraphs: [
					'优先使用非受控defaultValue完成局部表单；需要跨页面、URL或服务器同步时，再显式传value并处理onValueChange。'
				],
				bullets: [
					'保留真实FormData、name和原生reset，不从视觉文本反推业务值。',
					'Compound组件按ZSelect、ZSelectTrigger、ZSelectContent、ZSelectItem平铺导入。',
					'disabled、readonly、required与invalid是不同合同，不合并成一个状态。'
				],
				links: [
					{ href: '#/components/provider', label: 'ZProvider' },
					{ href: '#/components/form', label: 'ZForm' },
					{ href: '#/components/select', label: 'ZSelect' }
				]
			}
		]
	},
	{
		eyebrow: 'ICSS',
		id: 'icss',
		title: '类型安全样式，不把运行时对象塞进DOM。',
		summary:
			'ICSS把静态规则编译为稳定class，把真正动态的值提升为受控变量；Theme token、CSS关键字和运行时数据保持不同职责。',
		sections: [
			{
				id: 'preprocess',
				title: '启用编译优化',
				paragraphs: ['SvelteKit项目在唯一生效的Svelte配置中安装ICSS preprocess。'],
				code: `import { icssPreprocess } from '@zadmin/zui/compiler';

export default {
\tpreprocess: [icssPreprocess()]
};`,
				language: 'typescript'
			},
			{
				id: 'authoring',
				title: '编写规则',
				paragraphs: [
					'第一方ZUI统一把builder参数命名为s。标准CSS关键字必须先进入属性元数据、类型、序列化和测试，再通过属性访问器使用。'
				],
				code: `const panelClass = $derived(
\ticss(defaultTheme, (s) => {
\t\ts.display.flex;
\t\ts.color._text;
\t\ts.width.px(width);
\t})
);`,
				language: 'typescript',
				bullets: [
					'稳定视觉字面量使用按目的命名的Theme token。',
					'结构零值、百分比和运行时业务数据不机械token化。',
					'未知第三方组件使用class-rule回退，不增加wrapper。'
				]
			},
			{
				id: 'csp',
				title: '严格CSP',
				paragraphs: [
					'禁止inline style attribute时使用class-rules动态值模式；SSR critical style仍通过nonce或hash保护。'
				],
				code: `icssPreprocess({ dynamicValues: 'class-rules' });`,
				language: 'typescript',
				links: [{ href: '#/guides/ssr-csp', label: 'SSR与CSP指南' }]
			}
		]
	},
	{
		eyebrow: 'ACCESSIBILITY',
		id: 'accessibility',
		title: '语义、键盘和焦点是同一个行为合同。',
		summary:
			'ZUI优先真实平台元素，在需要组合模式时按APG职责补充ARIA、roving focus、typeahead、顶层浮层所有权和可恢复焦点。',
		sections: [
			{
				id: 'native',
				title: '原生优先',
				paragraphs: [
					'Button、Input、Textarea、Table、Progress、Meter、Checkbox、Radio、Slider和表单控件保留真实元素；自定义视觉不能替代平台语义。'
				],
				bullets: [
					'装饰图标隐藏于可访问树；独立图标必须有可访问名称。',
					'基础原生控件自动生成SSR稳定ID；调用方显式id优先，ZField controlId优先于自动值。',
					'自动ID用于DOM与ARIA连接，不作为数据库、缓存或测试业务键。',
					'错误、说明与标签通过稳定ID关系连接。',
					'状态变化使用适当的status或alert，不把普通消息升级为assertive。',
					'aria-busy只公告区域或控件正在更新；ZButton loading还会禁用交互，两者不能互换。',
					'ZInput可用form属性关联DOM外部表单；内部reset signal是无name/id、disabled的hidden input，不进入FormData。',
					'独立Input/Textarea默认自管reset；复合组件用resetOnForm=false把唯一所有权交给父状态机，onFormReset仍用于通知。'
				],
				links: [
					{ href: '#/components/button', label: 'ZButton' },
					{ href: '#/components/input', label: 'ZInput' },
					{ href: '#/components/form', label: 'ZForm' }
				]
			},
			{
				id: 'keyboard',
				title: '集合键盘',
				paragraphs: ['Collection组件共享disabled跳过、Home/End、方向键、typeahead和稳定业务key。'],
				bullets: [
					'Tabs可选择automatic或manual activation。',
					'Menu、Select与Tree只移动当前可见、可用项。',
					'RTL改变逻辑方向，不复制一套组件实现。',
					'文档搜索由ZCommandPalette承载：/仅在非编辑上下文打开，Ctrl/⌘+K跨页面打开，Escape关闭并恢复原焦点。'
				]
			},
			{
				id: 'layers',
				title: '浮层与焦点',
				paragraphs: [
					'顶层Layer拥有Escape和outside dismiss。Modal使用FocusScope、scroll lock与inert；关闭后只恢复到仍连接的触发元素。'
				],
				bullets: [
					'Presence退场期间DOM仍挂载，使用inert移出Tab序和可访问树；不要在焦点恢复前给含焦点祖先设置aria-hidden。',
					'Provider、主题或方向更新可能替换Trigger；FocusScope在cleanup时解析当前Trigger，而不是只记住打开瞬间的旧节点。'
				],
				links: [
					{ href: '#/components/dialog', label: 'ZDialog' },
					{ href: '#/components/popover', label: 'ZPopover' },
					{ href: '#/components/tabs', label: 'ZTabs' }
				]
			},
			{
				id: 'preferences',
				title: '用户偏好',
				paragraphs: [
					'reduced-motion会停止WAAPI或把CSS过渡降为0；高对比度通过Theme和contrast轴表达，不在每个组件中复制视觉分支。'
				]
			}
		]
	},
	{
		eyebrow: 'SSR / CSP',
		id: 'ssr-csp',
		title: '每个请求拥有自己的样式Registry。',
		summary:
			'服务端渲染必须隔离请求级CSS、保持稳定ID、注入critical style，并让客户端从data-icss标记接管而不重复规则。',
		sections: [
			{
				id: 'sveltekit',
				title: 'SvelteKit请求边界',
				paragraphs: ['使用@zadmin/sveltekit/zui安装请求级Registry和critical CSS注入。'],
				code: `import { zuiHandle } from '@zadmin/sveltekit/zui';

export const handle = zuiHandle();`,
				language: 'typescript'
			},
			{
				id: 'policy',
				title: 'CSP模式',
				paragraphs: [
					'nonce与hash二选一；两者保护critical style element，不能混为动态style attribute授权。'
				],
				code: `zuiHandle({ csp: { nonce: (event) => event.locals.cspNonce } });

// 或对已有CSP header追加hash
zuiHandle({ csp: { hash: true } });`,
				language: 'typescript'
			},
			{
				id: 'invariants',
				title: '必须保持的不变量',
				paragraphs: ['并发请求、fragment HTML、完整HTML、ShadowRoot和hydrate都使用相同公开合同。'],
				bullets: [
					'不要在模块全局共享Server Registry。',
					'idPrefix在SSR与客户端必须一致。',
					'生产客户端产物不得包含compiler、testing或Node server入口。'
				]
			}
		]
	},
	{
		eyebrow: 'HMR',
		id: 'hmr',
		title: '更新规则所有权，不重建业务状态。',
		summary:
			'ICSS Registry按owner管理规则；组件HMR替换对应recipe输出，并在模块或组件销毁时释放监听器、observer、timer和Portal资源。',
		sections: [
			{
				id: 'recipes',
				title: 'Recipe热更新',
				paragraphs: [
					'第一方recipe通过registerRecipeHmr登记模块所有权。修改Theme或recipe只替换相关规则，不给style sheet无限追加版本。'
				]
			},
			{
				id: 'state',
				title: '状态与资源',
				paragraphs: [
					'HMR不是跳过生命周期清理的理由。状态能否保留由Svelte边界决定，资源必须始终可销毁。'
				],
				bullets: [
					'清理ResizeObserver、MutationObserver、media query与document listener。',
					'关闭计时器、自动轮播和Toast剩余时长。',
					'Portal owner或目标先销毁时都不能留下孤立DOM。'
				]
			},
			{
				id: 'debugging',
				title: '排查顺序',
				paragraphs: [
					'先确认组件状态，再检查Registry owner与style标记，最后检查HMR dispose；不要通过整页刷新掩盖资源泄漏。'
				]
			}
		]
	},
	{
		eyebrow: 'WEBVIEW',
		id: 'webview',
		title: '组件留在Web层，系统能力留在Host边界。',
		summary:
			'普通UI继续使用Svelte和ZUI；WebView2、桌面窗口、文件系统与原生服务由显式bridge拥有，不把宿主API藏进通用组件。',
		sections: [
			{
				id: 'boundary',
				title: '职责边界',
				paragraphs: [
					'Button、Form、Table、Dialog和Theme不感知C#或窗口句柄。Host能力通过应用服务注入，组件只消费业务状态。'
				],
				bullets: [
					'WebView facade保持可在普通浏览器中替换或模拟。',
					'窗口控制使用ZIcon受控manifest，不复制字符或手写通用SVG。',
					'生产Host、Vite开发Host和外部package都必须独立冒烟。'
				]
			},
			{
				id: 'layout',
				title: '布局与输入',
				paragraphs: [
					'尊重DPI、缩放、逻辑方向、IME、系统对比度和reduced-motion。不要把桌面窗口尺寸当成固定像素画布。'
				]
			},
			{
				id: 'validation',
				title: '验收',
				paragraphs: [
					'Windows门禁构建并测试C# core、desktop Svelte、Release Host和Vite development Host。组件证据、交互证据与bridge round-trip分别记录：原生语义不能替代真实点击，收到请求也不能冒充成功响应。'
				],
				bullets: [
					'组件记录精确marker、原生元素语义和可观察交互状态。',
					'Host独立校验app.snapshot请求与成功响应，再绑定完整revision。',
					'运行时生成的DesktopVerified矩阵不回写仓库内静态成熟度基线。'
				],
				links: [{ href: '#/components/provider', label: 'Provider偏好轴' }]
			}
		]
	},
	{
		eyebrow: 'PACKAGE',
		id: 'package',
		title: '从公开entrypoint消费，而不是依赖工作区路径。',
		summary:
			'发布合同由Changesets、API与成熟度事实、bundle预算、单次pack校验复用、仓库外验收和版本绑定Docs制品共同证明。',
		sections: [
			{
				id: 'maturity',
				title: '成熟度是可生成事实，不是页面徽标',
				paragraphs: [
					`当前${zuiProgress.api.components}个公开组件、${zuiProgress.api.declaredProps}个公开Props均已进入API合同，metadata gap与teaching fallback均为0；${zuiProgress.maturity.statuses.stable ?? 0}个组件满足stable策略，${zuiProgress.maturity.ProductionVerified}个拥有ProductionVerified证据。`
				],
				bullets: [
					`VisuallyVerified ${zuiProgress.maturity.VisuallyVerified}/${zuiProgress.api.components}；DesktopVerified ${zuiProgress.maturity.DesktopVerified}/${zuiProgress.api.components}。`,
					`当前release状态为${zuiProgress.release.status}，仍有${zuiProgress.release.blocked.length}个外部发布边界；页面不会把artifact合同冒充真实registry或Docs部署。`,
					'experimental只在生产证据、SSR、Docs、API metadata和family原子门禁全部满足后逐项晋级。'
				],
				code: `pnpm --filter @zadmin/docs progress:check
pnpm --filter @zadmin/docs maturity:check
pnpm --filter @zadmin/docs stability:check`,
				language: 'bash'
			},
			{
				id: 'entrypoints',
				title: '入口边界',
				paragraphs: [
					'根入口提供组件与公共运行时；按职责使用themes、code、runtime、compiler、metadata和testing子入口。'
				],
				bullets: [
					'应用生产代码不得导入testing或internal。',
					'ZCode从code入口加载，Shiki保持可选peer。',
					'Lucide使用单图标静态子路径，避免全量运行时索引。'
				]
			},
			{
				id: 'release',
				title: '发布门禁',
				paragraphs: [
					'公开API变化先审阅API快照、source metadata gap、稳定性策略和Changeset。CI对入口raw/gzip预算、动态Docs chunks、公开exports与浏览器依赖边界直接失败。'
				],
				code: `pnpm --filter @zadmin/docs audit:system
pnpm release:readiness
pnpm release:pack:artifacts --out=.release-artifacts`,
				language: 'bash'
			},
			{
				id: 'external',
				title: '仓库外验收',
				paragraphs: [
					'Core、ZUI、SvelteKit、WebView和Miniapp只pack一次并写入SHA-256 manifest；CI把路径可移植的validated-plan与同一批tarball上传再下载，重新校验后才供外部临时项目、package check和npm publish dry-run共同消费。计划中的executedConsumers保持为空，因此不会把artifact handoff冒充真实发布。'
				],
				links: [{ href: '#/guides/ssr-csp', label: 'SSR与CSP指南' }]
			},
			{
				id: 'versioned-docs',
				title: '版本绑定Docs制品',
				paragraphs: [
					`Docs build会生成包含包版本、完整Git revision、${zuiProgress.docs.routes.totalCount}条路由、逐文件SHA-256、整体bundle摘要和支持矩阵摘要的zui-artifact。CI会上传、重新下载并逐文件复验该制品，但deployed=${String(zuiProgress.docs.deployed)}仍表示尚未完成外部版本化部署。`
				],
				code: `pnpm --filter @zadmin/docs docs:versioned:check
pnpm --filter @zadmin/docs docs:versioned:emit
pnpm --filter @zadmin/docs docs:versioned:verify:self-test`,
				language: 'bash'
			}
		]
	}
] as const satisfies readonly GuideDefinition[];

export const guideDocsById: ReadonlyMap<string, GuideDefinition> = new Map(
	guideDocs.map((guide) => [guide.id, guide] as const)
);
