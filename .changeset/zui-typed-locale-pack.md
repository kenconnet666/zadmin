---
'@zadmin/zui': minor
---

增加可继承的类型安全`localePack`与英文/中文默认包，将Pagination、Calendar、DateField、TimeField、选择集合、Command、Transfer、FileUpload、TagsInput和ColorPicker迁移到可动态切换的标量或参数化文案；Provider新增默认UTC的显式`timeZone`，日期组件在SSR与客户端统一使用同一IANA时区，同时保留旧`translations`字符串字典作为有限的渐进兼容层。
