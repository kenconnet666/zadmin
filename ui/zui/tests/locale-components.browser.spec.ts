import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import LocaleComponentDefaultsFixture from './LocaleComponentDefaultsFixture.svelte';

function byTestId<TElement extends Element>(id: string): TElement {
	const element = document.querySelector<TElement>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`Missing locale fixture element "${id}".`);
	return element;
}

describe('component locale defaults', () => {
	it('updates Provider defaults dynamically while preserving explicit props', async () => {
		render(LocaleComponentDefaultsFixture);

		expect(byTestId('select-default').textContent?.trim()).toBe('Select an option');
		expect(byTestId('multi-select-default').textContent?.trim()).toBe('Select options');
		expect(byTestId('cascader-default').textContent?.trim()).toBe('Select a path');
		expect(byTestId('tree-select-default').textContent?.trim()).toBe('Select a node');
		expect(byTestId('command-default').querySelector<HTMLInputElement>('input')?.placeholder).toBe(
			'Type a command'
		);
		expect(byTestId('command-default').textContent).toContain('No commands found');
		expect(
			byTestId('number-field-default')
				.querySelector<HTMLInputElement>('[role="spinbutton"]')
				?.getAttribute('aria-label')
		).toBe('Number');
		expect(
			byTestId('number-field-default').querySelector('button[aria-label="Increase value"]')
		).not.toBeNull();
		expect(byTestId('palette-default').querySelector('button')?.textContent?.trim()).toBe(
			'Open command palette'
		);
		expect(byTestId('transfer-default').textContent).toContain('Available');
		expect(byTestId('transfer-default').textContent).toContain('Selected');
		expect(byTestId('transfer-default').querySelector<HTMLInputElement>('input')?.placeholder).toBe(
			'Filter items'
		);
		expect(byTestId('file-upload-default').textContent).toContain(
			'Drop files here or choose files'
		);
		expect(byTestId('file-upload-default').textContent).toContain('Choose files');
		expect(
			byTestId('file-upload-default').querySelector('button[aria-label="Remove brief.txt"]')
		).not.toBeNull();
		expect(
			byTestId('tags-input-default').querySelector<HTMLInputElement>('input')?.placeholder
		).toBe('Add tag');
		expect(
			byTestId('tags-input-default').querySelector('button[aria-label="Remove alpha"]')
		).not.toBeNull();
		expect(
			byTestId('color-picker-default').querySelector('button')?.getAttribute('aria-label')
		).toBe('Color #2563ebff');

		await userEvent.click(byTestId('toggle-locale'));
		await tick();

		expect(byTestId('select-default').textContent?.trim()).toBe('选择一个选项');
		expect(byTestId('multi-select-default').textContent?.trim()).toBe('选择选项');
		expect(byTestId('cascader-default').textContent?.trim()).toBe('选择路径');
		expect(byTestId('tree-select-default').textContent?.trim()).toBe('选择节点');
		expect(byTestId('command-default').querySelector<HTMLInputElement>('input')?.placeholder).toBe(
			'输入命令'
		);
		expect(
			byTestId('command-default')
				.querySelector<HTMLInputElement>('input')
				?.getAttribute('aria-label')
		).toBe('搜索命令');
		expect(byTestId('command-default').textContent).toContain('未找到命令');
		expect(
			byTestId('number-field-default')
				.querySelector<HTMLInputElement>('[role="spinbutton"]')
				?.getAttribute('aria-label')
		).toBe('数字');
		expect(
			byTestId('number-field-default').querySelector('button[aria-label="增大数值"]')
		).not.toBeNull();
		expect(byTestId('palette-default').querySelector('button')?.textContent?.trim()).toBe(
			'打开命令面板'
		);
		expect(byTestId('transfer-default').textContent).toContain('可选项目');
		expect(byTestId('transfer-default').textContent).toContain('已选项目');
		expect(
			byTestId('transfer-default').querySelector('button[aria-label="将所选项目移至目标列表"]')
		).not.toBeNull();
		expect(byTestId('transfer-default').querySelector<HTMLInputElement>('input')?.placeholder).toBe(
			'筛选项目'
		);
		expect(byTestId('file-upload-default').textContent).toContain('将文件拖放到此处或选择文件');
		expect(byTestId('file-upload-default').textContent).toContain('选择文件');
		expect(
			byTestId('file-upload-default').querySelector('button[aria-label="移除文件 brief.txt"]')
		).not.toBeNull();
		expect(
			byTestId('tags-input-default').querySelector<HTMLInputElement>('input')?.placeholder
		).toBe('添加标签');
		expect(
			byTestId('tags-input-default').querySelector('button[aria-label="移除标签 alpha"]')
		).not.toBeNull();
		expect(
			byTestId('color-picker-default').querySelector('button')?.getAttribute('aria-label')
		).toBe('颜色 #2563ebff');

		await userEvent.click(byTestId('cascader-default').querySelector('button')!);
		await tick();
		expect(document.querySelector('[role="listbox"][aria-label="第1级"]')).not.toBeNull();
		await userEvent.click(byTestId('tree-select-default').querySelector('button')!);
		await tick();
		expect(document.querySelector('[role="tree"][aria-label="树形选项"]')).not.toBeNull();
		await userEvent.click(byTestId('color-picker-default').querySelector('button')!);
		await tick();
		expect(document.querySelector('input[aria-label="选择颜色"]')).not.toBeNull();
		expect(document.querySelector('input[aria-label="十六进制颜色"]')).not.toBeNull();
		expect(document.querySelector('input[aria-label="透明度"]')).not.toBeNull();

		const mention = byTestId<HTMLTextAreaElement>('mention-default');
		await userEvent.click(mention);
		await userEvent.type(mention, '@');
		await tick();
		const mentionList = document.querySelector('[role="listbox"][aria-label="提及建议"]');
		expect(mentionList?.textContent).toContain('暂无建议');

		const explicitInput = byTestId('command-explicit').querySelector<HTMLInputElement>('input');
		expect(explicitInput?.getAttribute('aria-label')).toBe('Fixed search label');
		expect(explicitInput?.placeholder).toBe('Fixed command placeholder');
	});
});
