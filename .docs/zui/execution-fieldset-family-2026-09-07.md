# E8：原生分组与输入组件族一致性

本批实现 I06 Fieldset，配合 I07 RangeSlider、I08 Rating；完整 Form 模型、动态数组、日期、复杂集合输入及编辑器仍在总纲范围内。新组件保持 experimental/unreleased，文档和测试资产不等于当前提交已完成稳定验收。

## 实现与组合

- ZFieldset 使用真实 fieldset/第一 legend，description 合并 aria-describedby，name/form/disabled 保留原生属性。必填 legend 使用 string 或 Snippet；每个后代继续由自己的 Field/aria-label 命名，不伪造共同 controlId、labelId 或第二个值所有者。
- 组内容复用 ZStack。outlined/filled/plain 三种外观与五档 size 使用现有 Theme token；size 仅控制组内边距、间距和标题，不隐式改变独立控件的 size。新增 fieldset、slider、rangeSlider、rating 四组视觉默认值；行为和业务数据不进入 Provider defaults。
- Fieldset 的 legend 与边框保持可读；禁用透明度由实际可见控件或 InputGroup 负责，第一 legend 内恢复按钮保留原生例外。没有全组 inert、全树 opacity 或对后代强行写 disabled。
- Button、Input/NativeSelect、Checkbox、Textarea 共享 disabledControlStyles/nativeDisabledControlStyles，原生 :disabled 同时覆盖属性与祖先 fieldset。Switch 使用 :has(> input:disabled) 处理可见根，透明原生命中层保持透明。
- InputGroup 用直接原生控件或标记的 PasswordInput 原生输入判断禁用，只在组合根降低一次透明度；PasswordInput 的输入和按钮不会叠乘。单行输入与密码按钮采用扣除外框边界后的 contentHeight。
- PasswordInput 显式 bind:value 转发到唯一内部 ZInput；visibility 仍由 PasswordInput 独立拥有。修复旧代码的 rest 属性透传只传入不回写问题。
- CopyButton/ZCode 复制等待状态使用 aria-busy/aria-disabled 和重复请求守卫，保留发起按钮焦点；用户显式 disabled 仍使用原生 disabled。

## 参考与决策

[Mantine Fieldset](https://mantine.dev/core/fieldset) 提供成熟的原生分组、legend 与 disabled 用法；本实现选择与现有 ZUI 命名一致的 outlined/filled/plain。原生 :disabled 与显式 disabled 同时参与外观的做法也可见 [Mantine Button 样式说明](https://mantine.dev/core/button/)。第一 legend 例外由浏览器真实 DOM 决定，不能用组件上下文盲目覆盖。

## 验证边界

新增 SSR 原生语义、真实浏览器 Fieldset/FormData/reset/第一 legend、InputGroup 单一透明度、五档默认与窄屏长标题回归资产。源码生成、格式、WebStorm 局部检查和必要 Chrome 文档交互在本地；完整类型、SSR、多引擎、视觉、可访问性测试交远程 CI，不在本地运行长套件。

本批组审查已覆盖值所有权、尺寸优先级、原生禁用和组合透明度。整个目标结束前仍须对最终候选完成全组件族一致性矩阵；本文件不关闭全局验收。
