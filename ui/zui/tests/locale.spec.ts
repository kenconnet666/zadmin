import { describe, expect, it } from 'vitest';

import {
	enUSLocalePack,
	resolveZuiLocalePack,
	zhCNLocalePack
} from '../src/runtime/foundation/locale.js';

describe('typed locale packs', () => {
	it('merges typed namespaces while preserving parameterized defaults', () => {
		const pack = resolveZuiLocalePack(enUSLocalePack, {
			collection: { selectOption: 'Pick one' },
			command: { placeholder: 'Run a command' },
			common: { close: '关闭' },
			date: { nextMonth: '下个月' },
			fileUpload: { removeFile: (fileName) => `Delete ${fileName}` },
			pagination: { label: '分页导航', page: (page) => `第${page}页` },
			tagsInput: { removeTag: (value) => `Delete ${value}` },
			time: { hourCycle: 24, minute: '分钟' },
			transfer: { sourceTitle: 'Source' }
		});

		expect(pack.common).toEqual({ close: '关闭', copy: 'Copy' });
		expect(pack.collection).toMatchObject({
			selectNode: 'Select a node',
			selectOption: 'Pick one'
		});
		expect(pack.command).toMatchObject({ listLabel: 'Commands', placeholder: 'Run a command' });
		expect(pack.pagination.next).toBe('Next page');
		expect(pack.pagination.page('12')).toBe('第12页');
		expect(pack.pagination.pageStatus('3', '9')).toBe('Page 3 of 9');
		expect(pack.date).toMatchObject({ calendarLabel: 'Calendar', nextMonth: '下个月' });
		expect(pack.fileUpload.removeFile('brief.txt')).toBe('Delete brief.txt');
		expect(pack.tagsInput.removeTag('alpha')).toBe('Delete alpha');
		expect(pack.time).toMatchObject({ hour: 'Hour', hourCycle: 24, minute: '分钟' });
		expect(pack.transfer).toMatchObject({ sourceTitle: 'Source', targetTitle: 'Selected' });
	});

	it('adapts legacy string templates without overriding typed values', () => {
		const pack = resolveZuiLocalePack(
			enUSLocalePack,
			{ pagination: { next: '继续' } },
			{
				'date.previousMonth': '上个月',
				'pagination.next': '下一页',
				'pagination.page': '第{page}页',
				'time.toggleDayPeriod': '切换上午下午'
			}
		);

		expect(pack.pagination.next).toBe('继续');
		expect(pack.pagination.page('3')).toBe('第3页');
		expect(pack.date.previousMonth).toBe('上个月');
		expect(pack.time.toggleDayPeriod).toBe('切换上午下午');
	});

	it('ships a complete Chinese locale pack', () => {
		expect(zhCNLocalePack.common.close).toBe('关闭');
		expect(zhCNLocalePack.collection.cascaderLevel('3')).toBe('第3级');
		expect(zhCNLocalePack.collection.selectOption).toBe('选择一个选项');
		expect(zhCNLocalePack.colorPicker.color('#2563eb')).toBe('颜色 #2563eb');
		expect(zhCNLocalePack.command.paletteTrigger).toBe('打开命令面板');
		expect(zhCNLocalePack.date.calendarLabel).toBe('日历');
		expect(zhCNLocalePack.fileUpload.removeFile('说明.pdf')).toBe('移除文件 说明.pdf');
		expect(zhCNLocalePack.pagination.page('18')).toBe('第18页');
		expect(zhCNLocalePack.pagination.currentPage('18')).toBe('第18页，当前页');
		expect(zhCNLocalePack.pagination.totalItems('96')).toBe('共96条');
		expect(zhCNLocalePack.tagsInput.removeTag('生产')).toBe('移除标签 生产');
		expect(zhCNLocalePack.time.hourCycle).toBe(24);
		expect(zhCNLocalePack.time.pm).toBe('下午');
		expect(zhCNLocalePack.transfer.moveToTarget).toBe('将所选项目移至目标列表');
	});
});
