---
'@zadmin/zui': minor
---

将DataTable生产化为原生table语义的数据表面：修复受控defaultSort清空，增加client/server排序所有权、
typed-key LogicalCollection/SelectionModel、选择与展开受控模型、列可见性和可访问列宽调整、逻辑方向sticky、
保留旧数据的loading/error/empty反馈、服务端分页ARIA位置，以及带动态测量、锚点保持和聚焦控制器的行虚拟化。

DataTable仍不提供单元格编辑、clipboard、pivot、聚合、Excel式二维焦点或列虚拟化；这些能力保留给独立DataGrid/X轨道。
