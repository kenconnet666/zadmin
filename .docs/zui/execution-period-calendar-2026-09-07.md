# E14：周期选择与多月 Calendar

基线：E13 `6b0c289635503ca44bc2e04a59c6d6046e127e08`。本阶段实现 D06–D10 的核心能力，不以组件数量替代能力覆盖。

## 模型与组合决策

- 月、年、季度、周使用冻结的 plain discriminated Period records。季度自带 fiscalYearStartMonth，year 是财年起始年份；周自带 firstDayOfWeek/minimalDaysInFirstWeek，不依赖后续 locale 修改值含义。
- 工厂、规则校验、CalendarDate 边界运算、比较、分页、选择归一化、格式与可逆序列化由一个 period runtime 负责。无原生 Date 本地时区算术。
- ZPeriodCalendar 承担 inline 周期网格与 single/multiple/range 选择；ZPeriodPicker 组合该 Calendar 和已有 Popover/InputGroup/表单桥接。四种 granularity 共用这些能力，不新增四套只改名字的实现。
- HTML attrs 只在最终组件 Props 交叉一次；Picker 复用不含 HTML attrs 的 Calendar 行为 options，防止多层泛型展开。
- 默认即时选择适合原子的周期单元；confirm 可先编辑草稿。multiple 默认保持打开，range 首端也保持打开，allowEmpty 不改变这一自动关闭时机；显式确认可提交允许的 partial。
- 所有 FormData 保留周期语义：single 一项、multiple 同名重复、range 只产生 name.start/name.end。required 使空值无效，不禁止清空。

## Calendar 重构

ZCalendar 同一 owner 支持 single/multiple/range、visibleMonths 1–12、ISO/locale 周号及范围 preview。multiple 保输入序去重；焦点独立，已在可见窗口内的第二/第三月不挪为首月。多个网格的 outside-date 副本不再拥有重复交互节点。

旧 range 只表示视觉高亮，改名 highlightRange；真正 range selection 使用 value。DateRangePicker 和真实 Docs 调用随源码迁移。range partial 可表达但默认无效，allowEmpty 显式放行；业务不可用日期连续性按 allowNonContiguousRange 控制。

没有业务 predicate 时，范围只需 O(1) 端点边界判断；有 predicate 才在有限日期域内精确扫描。删除任意10,000项限制，并在到达end时终止，避免最大日期clamp形成循环。

## 对标与证据

通过 Context7 核对 [Mantine MonthPicker](https://mantine.dev/dates/month-picker) 和 [YearPicker](https://mantine.dev/dates/year-picker) 的单选、多选、范围、min/max 和页面导航合同。ZUI 保留既有 @internationalized/date 体系，使用明确周期 records，不把月份和年份冒充日期。

本记录处于实现验收阶段。只执行 WebStorm 受影响诊断、格式/源码制品审计和必要浏览器点查；纯算法、类型、SSR、多浏览器和长期稳定性资产交远程CI。最终组件族验收和余下能力矩阵保持进行中。

## 当前实现快照

- `ZPeriodCalendar` 与 `ZPeriodPicker` 以 `granularity=month|year|quarter|week` 覆盖 D06–D09 的核心选择能力；single/multiple/range、partial、min/max、业务 unavailable、immediate/confirm、FormData 与 reset 使用同一 Period runtime 和 owner 合同。它们是通用周期入口，不再新增四套只替换名称的 Calendar/Picker 状态机。
- `ZCalendar` 以判别 `selectionMode=single|multiple|range` 拥有真实值；multiple 保输入与追加顺序去重，range 保留 partial、hover/键盘 preview 与 `allowEmpty`，`allowNonContiguousRange` 明确业务不可用日连续性。旧 `range` 视觉参数已改为 `highlightRange`，`ZDateRangePicker`、`DateTimePickerPanel`、`ZDateTimeRangePicker` 与真实 Docs 消费者已迁移；高亮只投射 `data-highlighted`，不改变 `aria-selected` 或 `data-selected`。
- `visibleMonths=1..12` 共享一个 selection/focusedValue/roving refs owner。header 按整组月份翻页；焦点已位于第二或第三个可见月时不把它挪到首月。相邻月份 outside-date 副本和日期上界 clamp 副本只保留结构占位，不产生重复 button、id 或 ref。
- 周号直接消费 `periodFromDate` 与 `getLocaleWeekRules`。ISO 使用 Monday/4-day 规则；locale 优先使用 `Intl.Locale.getWeekInfo/weekInfo`，旧运行时以 CLDR 48 minimum-days 快照和 `@internationalized/date` locale 周起始日回退。Calendar 在 year 1/year 9999/BC 等相邻 week-year 不可表示的边界保留空行头，不把 year 0/10000 交给 Period runtime。
- 日期域边界不设任意 10,000 天业务上限；连续性扫描只在存在业务 predicate 时执行，并在命中 end 后终止。没有 predicate 时，完整有序范围通过端点 min/max 做 O(1) 判断。`9999-12` 的多月请求缩短为可表示窗口，Next 禁用且只保留一个可交互 `9999-12-31`。

## 当前证据与未关闭边界

- 本地真实浏览器在 390px 下验证了 PeriodPicker 单月 Arrow/Enter 提交、季度 confirm 事务与 readonly 可聚焦；Calendar 验证了两月边界键盘和 multiple 选择。PeriodPicker 五档外框为 24/28/32/40/48px，trigger 与 clear 内容高度为 22/26/30/38/46px，整页横向溢出为 0。
- 必填 PeriodPicker 的真实表单只有一份 `month=2026-09`；清空后 FormData 为空，submit 显示“请填写此项”；reset 恢复唯一 `month=2026-09` 且 invalid 消失。该点查证明单页组合边界，不替代多浏览器 Form 矩阵。
- PeriodCalendar Docs 点查发现 `weekPeriod` 工厂调用风格与冻结接口不一致；源码已统一为 `weekPeriod(year, week, rules?: WeekRules)` 并同步直接消费者。该修正尚未获得当前候选远程结果，不据此宣称API稳定。
- 成组视觉复核修复了未应用的网格行样式：月/年四列、季度两列、周一列与键盘列数一致；月单元仅显示短月份，完整年月保留在可访问名称；周号与日期边界自然换行。390px下各网格宽314px且无横向溢出，周单元内容高44px；年份范围2024→2026实测从partial invalid转为三年完整选择。
- Calendar与Picker共用`resolvePeriodConfiguration`，所有value/default/focus/min/max及显式周/财年规则在浮层关闭时也校验。修复year 12页边界、禁用周期误标invalid和实际RTL方向图标。Picker仍独占表单owner，面板不产生重复字段。
- 最终源码制品生成完成，API runtime审计为183组件、2572生成props、0 actionable issues、0 metadata/default mismatches。WebStorm逐文件检查通过；一次批量检查返回`more=true`未提供结果，已使用逐文件结果作为依据。这些静态结果不等于完整TypeScript或浏览器矩阵通过。
- E13 CI [34075524716](https://github.com/kenconnet666/zadmin/actions/runs/34075524716) 已完成失败：工作区构建、Chromium 与 Firefox 通过；WebKit、静态契约、组件测试、覆盖率、Windows 与外部 SSR 仍失败。E14 已在源码中修复已定位的类型、测试资产、Form clone echo、测试localePack边界与异步状态等待，但尚无新的同候选远程结果，不能把修复文件或本地点查记为通过。
- WebKit Docs 在 DateRange 第二端真实单击后仍停留于 start-only/open/selecting 状态；现有源码只显示focus更新范围preview且日期button身份/可用性稳定，尚无事件trace证明focus导致click目标丢失。测试保持原子单click，不用预先focus绕开pointerdown→focus→click序列；该边界继续列为未定位。
- Rating保持同步`onHoverChange`：同一fraction重复事件去重，真实指针跨过多个fraction时允许逐值通知。资产验证最终preview、canonical value与leave=0，不把特定驱动路径经过几个hit zone固定成回调次数。
- 当前源码/API 资产为 183 个公开组件、113 个 Docs families。数量只说明当前资产面，不表示成熟度晋升、D06–D10 全部细节闭合或远程验收完成。
- `ZCalendar` 的 cell/header snippets、非 Gregorian 可编辑值、drag range、完整辅助技术矩阵和当前候选多浏览器/Windows/外部包证据仍开放。Period 与 Calendar 均维持现有实验/未发布边界，不在本记录中宣称 stable。

## 下一阶段可并行工作

1. **E14 远程归因与复验**：以当前候选运行 static、component、coverage、三浏览器、Windows 和 external SSR；按 gate 分离产品缺陷、资产时序和环境差异，不用放宽断言消除失败。
2. **Calendar 定制与辅助技术**：在不新增第二 selection owner 的前提下设计 cell/header snippets，补多月 grid 命名、周号 row-header、range preview 公告、forced-colors 与 screen-reader 场景。
3. **日期时间联合约束复验**：DateTimePickerPanel/DateTimeRange 的日期 preview 已按 display time zone 投影 CalendarDate 并消费 `highlightRange`；下一步验证 min/max 日期与具体时刻的联合边界，避免把“某时刻不可用”扩成整天不可用。
4. **国际历法专项**：研究 CalendarDate calendar/era 值保持、Intl 显示历法与可编辑历法的边界；在模型、序列化和键盘运算明确前不把 Gregorian UI 标签改名冒充支持。
5. **W3 后续日期能力**：InlineDateTime、TimeGrid/TimeValue、MiniCalendar 可与国际历法研究并行；都复用现有 Field、Calendar、Panel、Period、FormControlDraftState 和 Popover 生命周期，不复制值/焦点/表单状态机。
