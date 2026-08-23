import { defaultTheme, type IcssStyle } from '../src/lib/index.js';

declare const style: IcssStyle<typeof defaultTheme>;

style.color._primary;
style.display.inlineFlex;
style.padding.px(4, 8);
style.width.percent(100);

// @ts-expect-error color does not accept length units
style.color.px(4);

// @ts-expect-error unknown theme tokens are rejected
style.color._missing;

// @ts-expect-error padding does not accept time units
style.padding.ms(100);
