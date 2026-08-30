---
'@zadmin/zui': minor
---

加固ICSS级联、Theme、已有基础组件和包边界，增加按需Shiki代码展示入口，让Docs直接消费组件单文件metadata；同时删除多余`src/lib`层、集中package entrypoints并移除未被生产代码使用的`@zadmin/zui/core`入口；抽取内部Theme focus ring并门禁全部可见原生input/textarea的focus-visible或focus-within合同；基础原生控件默认生成SSR稳定id，调用方id与Field controlId保持优先；Table、Code与Docs导航使用逻辑start/end文本对齐保持RTL一致。
