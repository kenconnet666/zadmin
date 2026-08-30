---
'@zadmin/zui': minor
---

增加独立`@zadmin/zui/layer`入口与LayerStack、Portal、DismissableLayer、FocusScope、scroll lock、inert others、Floating UI定位基础设施，以及ZPopover、ZTooltip、ZDialog、强制显式决策的ZAlertDialog、逻辑方向ZDrawer和就地危险操作ZPopconfirm消费者；同时按foundation、collection、form、layer职责重组runtime目录，保持基础runtime不打入浮层依赖；退出Presence依赖inert移出Tab序和可访问树，避免焦点恢复前叠加aria-hidden；FocusScope在cleanup时解析最新Trigger，支持Provider更新期间替换触发节点；Tooltip打开时拒绝可聚焦后代并引导使用Popover。
