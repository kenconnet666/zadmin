# ZFileUpload 生产架构

## 结论

`ZFileUpload` 是 FilePicker、拖放入口、typed queue、表单桥和 transport command host，**不是 HTTP 上传客户端**。默认 `autoUpload=false`；没有传入 `transport` 时，它仍是完整的本地文件选择与 FormData 控件。传入 adapter 后，组件只负责把 `item + AbortSignal + reportProgress` 交给调用方，并把结果映射回不可变队列。

这条边界避免把 URL、fetch/XHR、headers、credentials、签名、服务端响应、缓存、分片、并发调度或服务端删除永久固化进设计系统。

## 成熟库对标与取舍

| 来源                                                                                              | 吸收                                                                         | 不直接复制                                                               |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Ant Design Upload](https://ant.design/components/upload/)                                        | controlled file list、明确状态/进度、remove/retry/cancel、custom request边界 | `action`、内置XHR、response/xhr对象、历史`File                           | originFileObj`双形态、巨型list DSL |
| [Naive UI Upload](https://github.com/tusen-ai/naive-ui/tree/main/src/upload)                      | pending/manual submit、typed list、retry/cancel、adapter回调                 | 组件持有xhrMap、method/action/headers/credentials、preview/image职责聚合 |
| [React Aria FileTrigger / DropZone](https://react-spectrum.adobe.com/react-aria/FileTrigger.html) | 原生file input、真实pressable、accept/multiple、选择与呈现分层               | 现阶段不承诺directory/camera；需先完成浏览器矩阵与移动端语义验证         |
| [MUI File upload pattern](https://mui.com/material-ui/react-button/#file-upload)                  | 保留原生隐藏file input、由设计系统按钮承载可见交互                           | 不让调用方每次手拼隐藏input、label和状态列表                             |

目录、camera capture、paste、thumbnail/preview、drag sort和chunk runtime都不是“再加一个布尔prop”能可靠完成的能力。它们分别涉及非标准目录API、移动设备权限、页面级剪贴板所有权、Object URL释放、可访问拖拽排序和业务传输协议，应在有独立合同与验证矩阵后增加。

## Typed queue

```ts
type FileUploadStatus = 'queued' | 'uploading' | 'success' | 'error' | 'aborted';

interface FileUploadItem {
	readonly id: string;
	readonly file: File;
	readonly status: FileUploadStatus;
	readonly progress: number; // 0..100
	readonly error?: string;
}
```

- `id` 是状态与请求世代的唯一身份，不能只用文件名。
- `File` 是 FormData 的原始业务值；服务端响应留在应用状态，不塞进组件通用类型。
- 所有状态更新都创建冻结的新对象和新数组，并统一经过 `files` / `onFilesChange`。
- `createFileUploadItem` 是 default/controlled 队列的规范化入口；重复 id、非有限进度、非法状态和不一致 success 进度会尽早失败。
- duplicate 规则使用 `name + size + lastModified + type`。它是用户体验去重，不是内容完整性或安全校验。

## 状态机与请求世代

允许的组件命令：

- `queued -> uploading`：手动 `upload` 或显式 `autoUpload`。
- `uploading -> success`：当前 adapter Promise 完成。
- `uploading -> error`：当前 adapter Promise 失败，错误经 `errorMessage` 安全映射。
- `uploading -> aborted`：用户或 controller 中止。
- `error | aborted -> uploading`：显式 `retry`，进度从 0 重新开始。
- 任意非删除态 `-> removed`：队列删除；它不是公开 status，因为已不在队列中。

每次启动都创建挂在当前 owner Window 上的 `AbortController`。active request以 `id -> request object` 保存；report/resolve/reject先验证对象身份。remove、clear、reset、外部删项和unmount先移除active identity再abort，因此迟到回调不会复活旧状态。外部owner把uploading项替换成其他状态时同样会终止失效请求。

## Picker、drop与校验

- 可见drop zone是真实 `<button type="button">`，原生拥有Enter/Space和焦点语义；不在`div role=button`上重造键盘。
- 不可见 `<input type="file">` 只打开系统选择器。`accept`是picker提示，不是安全边界。
- input change和drop统一进入同一纯校验：accept MIME/扩展、maxSize、duplicate、maxFiles与multiple。
- 拒绝结果保留每个File与精确reason；应用决定Toast、Field message或批量摘要。
- drag状态只接受DataTransfer types含`Files`的事件；readonly、disabled和full不会进入激活态。

## FormData和reset

浏览器不保证所有realm都能构造 `DataTransfer` 或给 `input.files` 赋值。生产表单因此以 `FileFormValueBridge` 为权威：

1. disabled hidden input提供稳定的祖先/外部`form`关联和reset信号；
2. 在关联form的原生`formdata`事件中，按队列顺序追加重复同名File entry；
3. picker自身不带name，避免浏览器FileList与typed queue双重提交；
4. owner-realm DataTransfer只尽力同步公开`inputRef.files`，失败不会损害FormData；
5. reset中止所有请求、恢复完整defaultFiles并清理drag瞬态，不触发`onFilesChange`。

`required`与`invalid`投射到真实drop zone焦点owner。业务是否至少一个文件由ZField/ZForm schema验证，避免浏览器尝试把焦点移到不可见file input。

## Disabled、readonly、Field与locale

- 显式状态与Field状态使用OR继承；子组件不能用`false`绕过Field禁用或只读边界。
- readonly保留drop zone焦点、队列、状态、描述关系和FormData，但阻止picker/drop/upload/abort/retry/remove/clear。
- disabled退出drop zone焦点、所有写入和FormData。
- `controlId`或Field controlId指向真实drop zone；Field focus registry直接保存按钮引用，兼容ShadowRoot。
- choose/drop/input/queue/empty/status/upload/abort/retry/remove全部来自typed `localePack.fileUpload`，显式业务文本优先。

## Motion与资源释放

- drop zone颜色/边框过渡由Theme duration控制；reduced motion把时长降为0。
- item只在owner element支持WAAPI且未减少动画时执行一次短入场；状态进度复用`ZProgress`。
- active AbortController、WAAPI animation、adapter demo timer、formdata/reset listener和MutationObserver都有确定destroy路径。

## 验证边界

本阶段源码提供专属浏览器规格，覆盖选择/拖放、四类拒绝、FormData/reset、手动进度、失败、abort/retry、readonly与iframe owner realm。按项目约定，本地只做WebStorm error检查、格式、静态生成/审计；这些browser specs与完整跨浏览器行为交给CI/CD。directory、mobile capture、paste、preview Object URL、拖拽排序、分片和高并发调度不在本阶段承诺内。
