import type { ComponentProps } from 'svelte';

import ZTable, {
	type TableDensity,
	type TableScroll,
	type ZTableProps
} from '../src/components/data-display/ZTable.svelte';
import ZTag, {
	type TagSize,
	type TagTone,
	type ZTagProps
} from '../src/components/data-display/ZTag.svelte';
import type { ZuiLocalePackOverrides, ZuiTagLocale } from '../src/runtime/foundation/locale.js';

const size: TagSize = 'small';
const tone: TagTone = 'warning';
const tagProps = {
	removeTabIndex: -1,
	removable: true,
	size,
	textValue: 'production',
	tone
} satisfies ComponentProps<typeof ZTag> satisfies ZTagProps;

const density: TableDensity = 'spacious';
const scroll: TableScroll = 'auto';
const tableProps = {
	caption: 'Deployments',
	captionHidden: true,
	density,
	scroll,
	scrollLabel: 'Deployment table scroll area',
	striped: true
} satisfies ComponentProps<typeof ZTable> satisfies ZTableProps;

const tagLocale: ZuiTagLocale = {
	removeTag: (value) => (value ? `Delete ${value}` : 'Delete tag')
};
const localeOverride = { tag: tagLocale } satisfies ZuiLocalePackOverrides;

// @ts-expect-error Tag size is finite
const invalidTagSize = { size: 'large' } satisfies ZTagProps;
// @ts-expect-error compound owners can only choose 0 or -1
const invalidTabIndex = { removeTabIndex: 2 } satisfies ZTagProps;
// @ts-expect-error Table caption is required
const invalidTable = { striped: true } satisfies ZTableProps;
// @ts-expect-error Table scroll is finite
const invalidScroll = { caption: 'Deployments', scroll: 'both' } satisfies ZTableProps;

void tagProps;
void tableProps;
void localeOverride;
void invalidTagSize;
void invalidTabIndex;
void invalidTable;
void invalidScroll;
