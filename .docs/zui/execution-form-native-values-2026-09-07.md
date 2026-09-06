# E9：原生表单读值与字段状态一致性

本批在原生 FormData 所有权上增加可用API，未提前改变 ZForm 的提交或验证数据来源。

- `controller.getValues()` 读取当前successful controls，按注册的typed FieldPath形成深冻结对象或根数组；重复name保留有序数组，File保留身份。返回unknown，不把native字符串输入冒充Standard Schema的typed output。
- `getFieldValue(path)` 复用FormModel的安全路径读取，只读自身属性，缺失或unsuccessful字段返回undefined。标量字符串路径不按点号拆分。
- `setFieldFeedback(path, patch)` 明确只写errors/warnings/success。旧`setFieldState`保持同实现的deprecated alias，文档示例迁移到新名。
- `NativeFormBaseline`只保存比较基线，不接管控件值。真实input事件后等待Svelte flush，再比较同名有序FormData；改回初值恢复dirty=false。
- baseline在初始挂载、reset完成后建立；最后实例卸载清理。epoch/lifecycle阻止旧tick越过reset或destroy，被取消的原生reset保留原状态。
- 新空file input每次FormData产生新File，空名称/零尺寸与空或application/octet-stream MIME按空占位处理；真实File按身份区分，不能用相同名称/尺寸掩盖文件替换。
- 交叉审查发现同path不同htmlName冲突以及重复实例成员变化遗漏。现在注册时拒绝前者；部分增删通过membership回调在DOM flush后按原基线重新计算dirty。

Chrome实际验证Native Values示例中Alice→Bob使dirty=true，读值返回Bob和已选checkbox；再输入Alice恢复dirty=false。独立模型示例通过真实按钮验证批量写入、reset及row-1/row-2移动后身份保留。CheckboxGroup实际检查0/1项不满足min2、2项恢复有效、invalid颜色优先于tone。

本批还通过Chrome定位了上层Group拒绝选择但底层Checkbox保留局部checked的分叉。Item/SelectAll现使用函数binding把底层checked限定为组状态投射，用户变更走唯一group选择入口；拒绝后DOM checked、aria-checked、可见行状态和value数组一致，最大3项及最小2项已实测。

上下文模块热更新时还暴露了新Symbol使provider/consumer临时失联的问题。Form与CheckboxGroup现复用模块hot.data中的context key，生产仍使用模块私有Symbol，避免不同包副本共享上下文。新增key隔离/复用资产，实际浏览器在已选择额外项后热更新Group context再检查关联与选择状态。

这次热更新检查没有再出现context失联，24个checkbox恢复正常渲染；Demo状态被重建为默认值，因此本批不把它记录为业务状态保留通过。完整HMR保留/重置边界仍须按最终矩阵验收。

完整多引擎、SSR、类型、组合回归交CI。本地仅WebStorm局部检查、必要Chrome、格式与源码制品生成。native外部owner无事件写值的统一通知、ZForm注入model、自动adapter、错误分层接入和ZFormList仍需下一批完成，不能把独立helper能力当成这些集成已完成。
