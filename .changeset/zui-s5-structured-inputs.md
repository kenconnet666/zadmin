---
'@zadmin/zui': minor
---

增加S5 Form与结构化输入组件，并统一原生表单、受控状态、Field语义、locale解析、验证与资源清理合同；表单reset按实时form、DOM包含与显式form id判定归属，在组件root、关联form与document监听非composed事件，并通过节点action绑定组件生命周期、在原生默认动作后交给Svelte调度状态；Input/Textarea增加`onFormReset`组合回调；补充受控Arrow图标并统一Transfer、DataTable与Docs导航图标合同。
