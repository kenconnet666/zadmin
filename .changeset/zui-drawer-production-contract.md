---
'@zadmin/zui': minor
---

收口Drawer生产合同：复用Dialog单一modal内核，增加预设、number与CSS自定义尺寸并修正full
viewport边界；Dialog统一解析auto/full/reduced动画偏好和Trigger所属Document/ShadowRoot
Portal边界，并修复Portal、FocusScope、DismissableLayer、inert与scroll lock在iframe realm中的
ownerDocument判断；补齐嵌套层、焦点恢复、滚动锁、dismiss策略及多示例文档证据。
