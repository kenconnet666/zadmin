---
'@zadmin/zui': minor
---

统一Calendar、DateField、DatePicker与DateRangePicker的Provider timeZone和类型安全date locale合同，使Picker成为ZField唯一业务owner并隔离内部Calendar，同时补齐select-only combobox与readonly合同；TimeField改为从locale pack继承segment、AM/PM文案和默认hourCycle。
