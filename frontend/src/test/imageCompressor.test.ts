import { describe, it, expect } from 'vitest';
import { validateImageFile, compressImage } from '../utils/imageCompressor';

describe('Image Compressor & Validation Utility', () => {
  it('approves standard image file types (JPEG, PNG, WebP)', () => {
    const validJpeg = new File(['fake-jpeg-data'], 'food.jpg', { type: 'image/jpeg' });
    const validPng = new File(['fake-png-data'], 'food.png', { type: 'image/png' });
    const validWebp = new File(['fake-webp-data'], 'food.webp', { type: 'image/webp' });

    expect(validateImageFile(validJpeg).valid).toBe(true);
    expect(validateImageFile(validPng).valid).toBe(true);
    expect(validateImageFile(validWebp).valid).toBe(true);
  });

  it('rejects non-image file types with user-friendly error', () => {
    const pdfFile = new File(['fake-pdf-content'], 'menu.pdf', { type: 'application/pdf' });
    const textFile = new File(['fake-text-content'], 'notes.txt', { type: 'text/plain' });

    const pdfResult = validateImageFile(pdfFile);
    expect(pdfResult.valid).toBe(false);
    expect(pdfResult.error).toContain('Please upload a valid image file');

    const textResult = validateImageFile(textFile);
    expect(textResult.valid).toBe(false);
  });

  it('rejects oversized files exceeding maximum threshold', () => {
    // 20MB file exceeds 15MB default limit
    const largeBuffer = new Uint8Array(20 * 1024 * 1024);
    const oversizedFile = new File([largeBuffer], 'giant.jpg', { type: 'image/jpeg' });

    const result = validateImageFile(oversizedFile, 15 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Image file is too large');
  });

  it('compressImage returns valid base64 data URL for valid image', async () => {
    const file = new File(['sample-image-bytes'], 'salad.jpg', { type: 'image/jpeg' });
    const dataUrl = await compressImage(file);

    expect(typeof dataUrl).toBe('string');
    expect(dataUrl).toContain('data:');
  });

  it('compressImage rejects when validation fails', async () => {
    const badFile = new File(['data'], 'script.sh', { type: 'application/x-sh' });
    await expect(compressImage(badFile)).rejects.toThrow('Please upload a valid image file');
  });
});
