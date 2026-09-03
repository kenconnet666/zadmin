---
'@zadmin/zui': patch
---

统一Select、MultiSelect、Combobox、DatePicker、DateRangePicker与Transfer的隐藏FormData序列化、外部form关联和唯一reset生命周期；无业务值时不再提交空的代理字段。

将共享form reset回调延后到owner Window的下一任务，确保WebKit原生reset default action完成后再恢复受控segment值，同时保留取消、去重与owner-realm清理语义。
