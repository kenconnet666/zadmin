import { inputGroupMetadata } from '@zadmin/zui/metadata';
import ActionsDemo from './ActionsDemo.svelte';
import actionsSource from './ActionsDemo.svelte?raw';
import FieldBridgeDemo from './FieldBridgeDemo.svelte';
import fieldBridgeSource from './FieldBridgeDemo.svelte?raw';
import FormDemo from './FormDemo.svelte';
import source from './FormDemo.svelte?raw';
import ResponsiveRtlDemo from './ResponsiveRtlDemo.svelte';
import responsiveRtlSource from './ResponsiveRtlDemo.svelte?raw';
import StatesDemo from './StatesDemo.svelte';
import statesSource from './StatesDemo.svelte?raw';
import TextareaDemo from './TextareaDemo.svelte';
import textareaSource from './TextareaDemo.svelte?raw';
import { inputGroupApiFacts } from '../../../../framework/component-api.generated.js';
import { defineComponentDoc } from '../../../../framework/component-doc.js';

export const inputGroupDoc = defineComponentDoc(inputGroupMetadata, {
	profiles: ['form-control'],
	sourceApi: inputGroupApiFacts,
	teaching: {
		props: {
			children: {
				default: '必填',
				description: '一个直接ZInput/ZTextarea业务value owner；第二个注册control会同步早失败。'
			},
			disabled: {
				default: 'Field context',
				description: '禁用唯一业务control；action按钮仍由业务调用方显式禁用。'
			},
			invalid: {
				default: 'Field context',
				description: '合并Field error并投射到边界和真实control的aria-invalid。'
			},
			prefix: {
				default: '—',
				description: '逻辑起始非交互affix；pointer激活聚焦真实control。'
			},
			ref: { default: 'null', description: '真实focus-within组合边界引用。' },
			size: {
				default: 'Field，其次 componentDefaults.input，最后 Provider density',
				description: '组合边界、affix与唯一control使用同一尺寸；control显式size仍优先。'
			},
			suffix: {
				default: '—',
				description: '逻辑结束非交互affix；action必须进入单独action Snippet。'
			}
		},
		summary:
			'拥有一个业务control注册位并桥接Field label/focus/id/name/description/state/size的Input Group，严格区分非交互affix与真实action。'
	},
	demos: [
		{
			component: FormDemo,
			covers: ['accessible-name', 'form-data', 'form-reset', 'native-props'],
			description: 'Field的label、name、required、description和size经Group进入唯一真实input。',
			id: 'input-group-affixes',
			source,
			title: 'Field桥接与Affix'
		},
		{
			component: ActionsDemo,
			covers: ['composition', 'disabled', 'variants-and-states'],
			description:
				'Lucide affix与真实ZButton action使用不同区域，invalid和disabled保持单一focus边界。',
			id: 'input-group-actions',
			source: actionsSource,
			title: '图标、Action与状态'
		},
		{
			component: FieldBridgeDemo,
			covers: ['accessible-name', 'focus', 'invalid', 'native-props'],
			description:
				'点击Field label聚焦注册control；error、required、name和small尺寸无需在Input重复声明。',
			id: 'input-group-field-owner',
			source: fieldBridgeSource,
			title: '唯一Field Control Owner'
		},
		{
			component: TextareaDemo,
			covers: ['composition', 'native-props', 'variants-and-states'],
			description: 'ZTextarea也可成为唯一value owner，长多行正文与两侧affix保持边界。',
			id: 'input-group-textarea',
			source: textareaSource,
			title: 'Textarea组合'
		},
		{
			component: ResponsiveRtlDemo,
			covers: ['native-props', 'rtl', 'variants-and-states'],
			description: '逻辑起止affix在RTL镜像，长affix在窄容器中截断并给control保留宽度。',
			id: 'input-group-responsive-rtl',
			source: responsiveRtlSource,
			title: 'RTL、长内容与窄屏'
		},
		{
			component: StatesDemo,
			covers: ['disabled', 'invalid', 'readonly', 'variants-and-states'],
			description: 'small/medium/large、required、readonly、disabled与invalid按统一优先级解析。',
			id: 'input-group-states',
			source: statesSource,
			title: '尺寸与Field状态'
		}
	],
	accessibility: [
		'InputGroup在初始化时claim最近ZField并向普通descendant隐藏原Field，防止辅助输入意外继承name或成为第二owner。',
		'直接ZInput/ZTextarea必须向Group注册；第二个业务control同步早抛，嵌套InputGroup也在子组件初始化时早抛。',
		'Field label点击调用Group注册的focus owner并聚焦真实input/textarea；id、name、description、disabled、invalid、readonly、required与size均投射给该control。',
		'prefix/suffix只承载非交互文本、单位或装饰Lucide；Button/Link必须进入prefixAction/suffixAction，并继续拥有自己的disabled与名称。',
		'逻辑CSS让prefix/suffix在RTL自动镜像；40% affix上限、min-width:0和ellipsis避免窄容器挤出业务control。',
		'Provider的componentDefaults.input.size会统一作用于未声明尺寸的Group、affix与其直接文本control。',
		'参考MUI InputAdornment和TextField的start/end adornment、FormControl继承，但ZUI不复制slotProps/sx，也不允许一个Group拥有多个业务value。'
	],
	keywords: [
		'input group',
		'input adornment',
		'prefix',
		'suffix',
		'action',
		'Field owner',
		'focus within',
		'form data',
		'rtl'
	]
});
