import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const sizes = [16, 24, 32, 48, 64, 256];
const output = resolve(import.meta.dirname, '../src-tauri/icons/icon.ico');

function roundedRectangle(x, y, size) {
	const radius = size * 0.22;
	const edge = size - 1;
	const nearestX = Math.max(radius, Math.min(x, edge - radius));
	const nearestY = Math.max(radius, Math.min(y, edge - radius));
	return Math.hypot(x - nearestX, y - nearestY) <= radius;
}

function zGlyph(x, y, size) {
	const min = size * 0.24;
	const max = size * 0.76;
	if (x < min || x > max || y < min || y > max) return false;
	const bar = size * 0.09;
	return y <= min + bar || y >= max - bar || Math.abs(x + y - size) <= bar * 0.72;
}

function dibImage(size) {
	const xorStride = size * 4;
	const maskStride = Math.ceil(size / 32) * 4;
	const pixels = Buffer.alloc(xorStride * size);
	const mask = Buffer.alloc(maskStride * size);
	for (let y = 0; y < size; y += 1) {
		for (let x = 0; x < size; x += 1) {
			const visible = roundedRectangle(x, y, size);
			const glyph = visible && zGlyph(x, y, size);
			const ratio = (x + y) / Math.max(1, (size - 1) * 2);
			const red = glyph ? 255 : Math.round(37 + (124 - 37) * ratio);
			const green = glyph ? 255 : Math.round(99 + (58 - 99) * ratio);
			const blue = glyph ? 255 : Math.round(235 + (237 - 235) * ratio);
			const row = size - 1 - y;
			const offset = row * xorStride + x * 4;
			pixels[offset] = blue;
			pixels[offset + 1] = green;
			pixels[offset + 2] = red;
			pixels[offset + 3] = visible ? 255 : 0;
			if (!visible) {
				const maskOffset = row * maskStride + Math.floor(x / 8);
				mask[maskOffset] |= 1 << (7 - (x % 8));
			}
		}
	}

	const header = Buffer.alloc(40);
	header.writeUInt32LE(40, 0);
	header.writeInt32LE(size, 4);
	header.writeInt32LE(size * 2, 8);
	header.writeUInt16LE(1, 12);
	header.writeUInt16LE(32, 14);
	header.writeUInt32LE(0, 16);
	header.writeUInt32LE(pixels.length + mask.length, 20);
	return Buffer.concat([header, pixels, mask]);
}

const images = sizes.map((size) => ({ image: dibImage(size), size }));
const directory = Buffer.alloc(6 + images.length * 16);
directory.writeUInt16LE(0, 0);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(images.length, 4);
let offset = directory.length;
for (const [index, entry] of images.entries()) {
	const entryOffset = 6 + index * 16;
	directory[entryOffset] = entry.size === 256 ? 0 : entry.size;
	directory[entryOffset + 1] = entry.size === 256 ? 0 : entry.size;
	directory.writeUInt16LE(1, entryOffset + 4);
	directory.writeUInt16LE(32, entryOffset + 6);
	directory.writeUInt32LE(entry.image.length, entryOffset + 8);
	directory.writeUInt32LE(offset, entryOffset + 12);
	offset += entry.image.length;
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, Buffer.concat([directory, ...images.map((entry) => entry.image)]));
console.log(`Generated ${images.length}-layer Windows icon at ${output}.`);
