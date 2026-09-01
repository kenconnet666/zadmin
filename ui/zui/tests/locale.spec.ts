import { describe, expect, it } from 'vitest';

import {
	enUSLocalePack,
	resolveZuiLocalePack,
	zhCNLocalePack
} from '../src/runtime/foundation/locale.js';

describe('typed locale packs', () => {
	it('merges typed namespaces while preserving parameterized defaults', () => {
		const pack = resolveZuiLocalePack(enUSLocalePack, {
			carousel: { nextSlide: 'Continue slides' },
			collection: { selectOption: 'Pick one' },
			command: { placeholder: 'Run a command' },
			common: { close: '关闭' },
			date: { nextMonth: '下个月' },
			feedback: { loading: 'Working' },
			fileUpload: { removeFile: (fileName) => `Delete ${fileName}` },
			form: { unexpectedValidation: 'Could not validate.' },
			numberField: { increment: 'Add amount' },
			pagination: { label: '分页导航', page: (page) => `第${page}页` },
			progress: { label: 'Completion' },
			tagsInput: { removeTag: (value) => `Delete ${value}` },
			time: { hourCycle: 24, minute: '分钟' },
			tour: { next: 'Continue' },
			transfer: { sourceTitle: 'Source' }
		});

		expect(pack.common).toEqual({ clear: 'Clear', close: '关闭', copy: 'Copy' });
		expect(pack.carousel.nextSlide).toBe('Continue slides');
		expect(pack.carousel.slidePosition('2', '5', 'Release')).toBe('2 of 5: Release');
		expect(pack.collection).toMatchObject({
			selectNode: 'Select a node',
			selectOption: 'Pick one'
		});
		expect(pack.collection.treeLoading('Reports')).toBe('Loading children for Reports');
		expect(pack.command).toMatchObject({ listLabel: 'Commands', placeholder: 'Run a command' });
		expect(pack.command.results('12')).toBe('12 commands found');
		expect(pack.pagination.next).toBe('Next page');
		expect(pack.pagination.page('12')).toBe('第12页');
		expect(pack.pagination.pageStatus('3', '9')).toBe('Page 3 of 9');
		expect(pack.progress.label).toBe('Completion');
		expect(pack.date).toMatchObject({ calendarLabel: 'Calendar', nextMonth: '下个月' });
		expect(pack.feedback).toMatchObject({
			dismissNotification: 'Dismiss notification',
			loading: 'Working'
		});
		expect(pack.fileUpload.removeFile('brief.txt')).toBe('Delete brief.txt');
		expect(pack.form.unexpectedValidation).toBe('Could not validate.');
		expect(pack.numberField.increment).toBe('Add amount');
		expect(pack.numberField.minimum('1.5')).toBe('Value must be at least 1.5.');
		expect(pack.tagsInput.removeTag('alpha')).toBe('Delete alpha');
		expect(pack.tagsInput.editTag('alpha')).toBe('Edit alpha');
		expect(pack.time).toMatchObject({ hour: 'Hour', hourCycle: 24, minute: '分钟' });
		expect(pack.tour).toMatchObject({ finish: 'Finish', next: 'Continue' });
		expect(pack.tour.progress('2', '5')).toBe('Step 2 of 5');
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
		expect(zhCNLocalePack.common.clear).toBe('清空');
		expect(zhCNLocalePack.common.close).toBe('关闭');
		expect(zhCNLocalePack.carousel.goToSlide('3', '生产')).toBe('转到第3张：生产');
		expect(zhCNLocalePack.collection.cascaderLevel('3')).toBe('第3级');
		expect(zhCNLocalePack.collection.selectOption).toBe('选择一个选项');
		expect(zhCNLocalePack.collection.treeLoadError('报表')).toContain('加载报表失败');
		expect(zhCNLocalePack.colorPicker.color('#2563eb')).toBe('颜色 #2563eb');
		expect(zhCNLocalePack.command.paletteTrigger).toBe('打开命令面板');
		expect(zhCNLocalePack.command.results('12')).toBe('找到12个命令');
		expect(zhCNLocalePack.date.calendarLabel).toBe('日历');
		expect(enUSLocalePack.collection.searchResults('12')).toBe('12 paths found');
		expect(zhCNLocalePack.collection.searchResults('12')).toBe('找到12条路径');
		expect(enUSLocalePack.date.clearDateRange).toBe('Clear date range');
		expect(zhCNLocalePack.time.clearTime).toBe('清空时间');
		expect(zhCNLocalePack.feedback.dismissToast('发布成功')).toBe('关闭通知：发布成功');
		expect(zhCNLocalePack.fileUpload.removeFile('说明.pdf')).toBe('移除文件 说明.pdf');
		expect(zhCNLocalePack.form.unexpectedValidation).toBe('验证过程中发生意外错误。');
		expect(zhCNLocalePack.numberField.inputLabel).toBe('数字');
		expect(zhCNLocalePack.numberField.maximum('100')).toBe('数值不能大于 100。');
		expect(zhCNLocalePack.pagination.page('18')).toBe('第18页');
		expect(zhCNLocalePack.pagination.currentPage('18')).toBe('第18页，当前页');
		expect(zhCNLocalePack.pagination.totalItems('96')).toBe('共96条');
		expect(zhCNLocalePack.progress.label).toBe('进度');
		expect(zhCNLocalePack.tagsInput.removeTag('生产')).toBe('移除标签 生产');
		expect(zhCNLocalePack.tagsInput.editTag('生产')).toBe('编辑标签 生产');
		expect(zhCNLocalePack.time.hourCycle).toBe(24);
		expect(zhCNLocalePack.time.pm).toBe('下午');
		expect(zhCNLocalePack.tour.progress('2', '4')).toBe('第2步，共4步');
		expect(zhCNLocalePack.transfer.moveToTarget).toBe('将所选项目移至目标列表');
		expect(zhCNLocalePack.transfer.selectedNotLoaded('2', 2)).toBe('2 个已选项目尚未加载');
		expect(enUSLocalePack.transfer.selectedNotLoaded('1', 1)).toBe('1 selected item is not loaded');
		expect(enUSLocalePack.transfer.selectedNotLoaded('2', 2)).toBe(
			'2 selected items are not loaded'
		);
	});
});
