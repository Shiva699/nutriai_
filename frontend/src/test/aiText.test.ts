import { describe, it, expect } from 'vitest';
import { sanitizeAIText } from '../components/aiText';

describe('aiText - sanitizeAIText', () => {
  it('strips bold and italic markdown markers', () => {
    const raw = 'This is **bold text** and *italic text*.';
    expect(sanitizeAIText(raw)).toBe('This is bold text and italic text.');
  });

  it('removes code blocks and backticks', () => {
    const raw = 'Here is some `inline code` and a block:\n```json\n{"test": 1}\n```';
    const cleaned = sanitizeAIText(raw);
    expect(cleaned).not.toContain('```');
    expect(cleaned).not.toContain('`');
    expect(cleaned).toContain('inline code');
  });

  it('strips markdown headings (#, ##, ###)', () => {
    const raw = '### Daily Nutrition Summary';
    expect(sanitizeAIText(raw)).toBe('Daily Nutrition Summary');
  });

  it('strips hyphen and asterisk bullet points and numbered list markers', () => {
    const raw = '- Item 1\n* Item 2\n1. Numbered Item';
    const cleaned = sanitizeAIText(raw);
    expect(cleaned).toBe('Item 1\nItem 2\nNumbered Item');
  });

  it('compresses consecutive whitespaces and double spaces', () => {
    const raw = 'First line   with   spaces';
    const cleaned = sanitizeAIText(raw);
    expect(cleaned).toBe('First line with spaces');
  });
});
