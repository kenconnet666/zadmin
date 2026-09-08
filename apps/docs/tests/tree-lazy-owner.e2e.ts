import { expect, test } from '@playwright/test';

test('Tree lazy owner exposes failure retry, external removal and disabled navigation', async ({
	page
}) => {
	await page.clock.install({ time: new Date('2026-09-08T00:00:00Z') });
	await page.goto('/#/components/tree');
	const lazy = page.getByTestId('demo-tree-lazy-retry');
	const lazyTree = lazy.getByRole('tree', { name: '懒加载报表树', exact: true });
	await expect(lazyTree).toBeVisible();
	await page.clock.pauseAt(new Date('2026-09-08T02:00:00Z'));
	await page.clock.runFor(500);
	await expect(lazyTree.locator('[data-slot="load-error"]')).toBeVisible();
	await lazyTree.focus();
	await lazyTree.press('ArrowRight');
	await expect(lazyTree).toHaveAttribute('aria-busy', 'true');
	await lazy.getByRole('button', { name: 'Owner外部移除报表节点', exact: true }).click();
	await page.clock.runFor(0);
	await expect(lazy.getByText(/已取消：1/u)).toBeVisible();
	await expect(lazyTree.getByRole('treeitem', { name: '日报', exact: true })).toHaveCount(0);

	await page.reload();
	const retryLazy = page.getByTestId('demo-tree-lazy-retry');
	const retryTree = retryLazy.getByRole('tree', { name: '懒加载报表树', exact: true });
	await expect(retryTree).toBeVisible();
	await page.clock.pauseAt(new Date('2026-09-08T04:00:00Z'));
	await page.clock.runFor(500);
	await expect(retryTree.locator('[data-slot="load-error"]')).toBeVisible();
	await retryTree.focus();
	await retryTree.press('ArrowRight');
	await page.clock.runFor(500);
	await expect(retryTree.getByRole('treeitem', { name: '日报', exact: true })).toBeVisible();
	const monthly = retryTree.getByRole('treeitem', { name: '月报', exact: true });
	await monthly.click();
	await expect(monthly).toHaveAttribute('aria-selected', 'false');
	await retryLazy.getByRole('button', { name: 'Owner外部移除报表节点', exact: true }).click();
	await expect(retryTree.getByRole('treeitem', { name: '日报', exact: true })).toHaveCount(0);

	const interactive = page.getByTestId('demo-tree-navigation');
	const tree = interactive.getByRole('tree', { name: '项目结构', exact: true });
	await tree.focus();
	await tree.press('End');
	await expect(tree).toHaveAttribute('data-active-key', 'worker');
	await tree.press('ArrowDown');
	await expect(tree).toHaveAttribute('data-active-key', 'worker');
	await expect(
		interactive.getByRole('treeitem', { name: '旧版服务（只读）', exact: true })
	).toHaveAttribute('aria-disabled', 'true');
});
