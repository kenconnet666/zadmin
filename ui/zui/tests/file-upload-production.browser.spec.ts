import { cleanup, render } from '@testing-library/svelte';
import { mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFileUploadItem, type FileUploadTransportContext } from '../src/entrypoints/index.js';
import FileUploadProductionFixture from './FileUploadProductionFixture.svelte';

afterEach(cleanup);

function selectFiles(input: HTMLInputElement | null, files: readonly File[]): void {
	const transfer = new DataTransfer();
	for (const file of files) transfer.items.add(file);
	if (!input) return;
	input.files = transfer.files;
	input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('ZFileUpload production queue', () => {
	it('validates type, size, duplicate and count while preserving exact File FormData', async () => {
		render(FileUploadProductionFixture);
		const input = document.querySelector<HTMLInputElement>('input[type="file"]');
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="file-upload-production-form"]'
		);
		const first = new File(['{}'], 'a.json', { lastModified: 1, type: 'application/json' });
		selectFiles(input, [
			first,
			new File(['text'], 'wrong.txt', { type: 'text/plain' }),
			new File(['012345678'], 'large.json', { type: 'application/json' }),
			new File(['{}'], 'a.json', { lastModified: 1, type: 'application/json' })
		]);
		await tick();
		expect(
			document.querySelector('[data-testid="file-upload-production-output"]')?.textContent
		).toContain('a.json:queued:0:none::type,size,duplicate');
		expect((new FormData(form!).get('asset') as File).name).toBe('a.json');

		const dropped = new DataTransfer();
		dropped.items.add(new File(['yaml'], 'b.yaml', { type: 'text/yaml' }));
		document
			.querySelector<HTMLElement>('[data-slot="dropzone"]')
			?.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dropped }));
		await tick();
		expect((new FormData(form!).getAll('asset') as File[]).map((file) => file.name)).toEqual([
			'a.json',
			'b.yaml'
		]);
		expect(
			document.querySelector('[data-testid="file-upload-production"]')?.hasAttribute('data-full')
		).toBe(true);
	});

	it('uses explicit manual transport commands, progress, abort and retry generations', async () => {
		const attempts: FileUploadTransportContext[] = [];
		const completions: Array<() => void> = [];
		const transport = vi.fn((context: FileUploadTransportContext) => {
			attempts.push(context);
			return new Promise<void>((resolve, reject) => {
				completions.push(resolve);
				context.signal.addEventListener('abort', () => reject(new Error('aborted')), {
					once: true
				});
			});
		});
		const file = new File(['{}'], 'manual.json', { type: 'application/json' });
		render(FileUploadProductionFixture, {
			defaultFiles: [createFileUploadItem('manual', file)],
			transport
		});

		document.querySelector<HTMLButtonElement>('[data-testid="upload-all"]')?.click();
		await tick();
		expect(transport).toHaveBeenCalledOnce();
		expect(document.body.textContent).toContain('manual:manual.json:uploading:0:none');
		attempts[0].reportProgress(42);
		await tick();
		expect(document.body.textContent).toContain('manual:manual.json:uploading:42:none');
		document
			.querySelector<HTMLButtonElement>('[aria-label="Abort upload for manual.json"]')
			?.click();
		await tick();
		expect(attempts[0].signal.aborted).toBe(true);
		expect(document.body.textContent).toContain('manual:manual.json:aborted:42:none');

		document
			.querySelector<HTMLButtonElement>('[aria-label="Retry upload for manual.json"]')
			?.click();
		await tick();
		expect(transport).toHaveBeenCalledTimes(2);
		completions[1]();
		await tick();
		expect(document.body.textContent).toContain('manual:manual.json:success:100:none');
	});

	it('maps transport failure to a typed error and recovers on retry', async () => {
		let attempt = 0;
		const transport = vi.fn(async () => {
			attempt += 1;
			if (attempt === 1) throw new Error('private transport detail');
		});
		const file = new File(['{}'], 'retry.json', { type: 'application/json' });
		render(FileUploadProductionFixture, {
			defaultFiles: [createFileUploadItem('retry', file)],
			transport
		});

		document.querySelector<HTMLButtonElement>('[aria-label="Upload retry.json"]')?.click();
		await tick();
		expect(document.body.textContent).toContain(
			'retry:retry.json:error:0:Upload failed for retry.json'
		);
		document
			.querySelector<HTMLButtonElement>('[aria-label="Retry upload for retry.json"]')
			?.click();
		await tick();
		expect(document.body.textContent).toContain('retry:retry.json:success:100:none');
	});

	it('keeps readonly focus and FormData while blocking all queue writes', async () => {
		const file = new File(['{}'], 'readonly.json', { type: 'application/json' });
		const transport = vi.fn();
		render(FileUploadProductionFixture, {
			defaultFiles: [createFileUploadItem('readonly', file)],
			readonly: true,
			transport
		});
		const root = document.querySelector<HTMLElement>('[data-testid="file-upload-production"]');
		const dropzone = root?.querySelector<HTMLButtonElement>('[data-slot="dropzone"]');
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="file-upload-production-form"]'
		);
		dropzone?.focus();
		dropzone?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="upload-all"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="clear-files"]')?.click();
		await tick();
		expect(document.activeElement).toBe(dropzone);
		expect(root?.getAttribute('aria-readonly')).toBe('true');
		expect(transport).not.toHaveBeenCalled();
		expect((new FormData(form!).get('asset') as File).name).toBe('readonly.json');
	});

	it('constructs AbortSignal and DataTransfer from the mounted owner realm', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerDocument = frame.contentDocument!;
		const ownerView = frame.contentWindow!;
		let signal: AbortSignal | undefined;
		const file = new ownerView.File(['{}'], 'realm.json', { type: 'application/json' });
		const component = mount(FileUploadProductionFixture, {
			props: {
				defaultFiles: [createFileUploadItem('realm', file)],
				transport: (context) => {
					signal = context.signal;
				}
			},
			target: ownerDocument.body
		});
		await tick();
		ownerDocument.querySelector<HTMLButtonElement>('[data-testid="upload-all"]')?.click();
		await tick();
		expect(signal).toBeInstanceOf(ownerView.AbortSignal);
		expect(
			ownerDocument.querySelector<HTMLInputElement>('input[type="file"]')?.files?.item(0)?.name
		).toBe('realm.json');
		await unmount(component);
		frame.remove();
	});
});
