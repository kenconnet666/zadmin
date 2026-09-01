import { describe, expect, it } from 'vitest';

import {
	enUSLocalePack,
	resolveZuiLocalePack,
	zhCNLocalePack
} from '../src/runtime/foundation/locale.js';

describe('typed locale packs', () => {
	it('merges typed namespaces while preserving parameterized defaults', () => {
		const pack = resolveZuiLocalePack(enUSLocalePack, {
			common: { close: '关闭' },
			pagination: { label: '分页导航', page: (page) => `第${page}页` }
		});

		expect(pack.common).toEqual({ close: '关闭', copy: 'Copy' });
		expect(pack.pagination.next).toBe('Next page');
		expect(pack.pagination.page('12')).toBe('第12页');
	});

	it('adapts legacy string templates without overriding typed values', () => {
		const pack = resolveZuiLocalePack(
			enUSLocalePack,
			{ pagination: { next: '继续' } },
			{
				'pagination.next': '下一页',
				'pagination.page': '第{page}页'
			}
		);

		expect(pack.pagination.next).toBe('继续');
		expect(pack.pagination.page('3')).toBe('第3页');
	});

	it('ships a complete Chinese locale pack', () => {
		expect(zhCNLocalePack.common.close).toBe('关闭');
		expect(zhCNLocalePack.pagination.page('18')).toBe('第18页');
	});
});
