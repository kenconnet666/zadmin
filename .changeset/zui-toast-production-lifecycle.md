---
'@zadmin/zui': minor
---

重构显式ToastQueue和ZToaster生产生命周期：增加FIFO queued/visible/exiting阶段、仅入场后计时、多原因暂停、Presence与reduced-motion退出、Provider Portal边界、稳定id更新及公平maxVisible容量，并补充完整文档示例与浏览器合同。
