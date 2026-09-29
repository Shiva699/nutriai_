import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Groq Model Configuration & Anti-Regression Suite', () => {
  const chatRoutePath = path.resolve(__dirname, '../../../backend/routes/chat.js');

  it('ensures deprecated or unavailable llama-3.3-70b-versatile is never reintroduced', () => {
    const fileContent = fs.readFileSync(chatRoutePath, 'utf8');
    expect(fileContent).not.toContain('llama-3.3-70b-versatile');
  });

  it('configures verified available llama-3.1-8b-instant for text generation', () => {
    const fileContent = fs.readFileSync(chatRoutePath, 'utf8');
    expect(fileContent).toContain('llama-3.1-8b-instant');
  });

  it('preserves separate vision model llama-3.2-11b-vision-preview for Food Analyzer', () => {
    const fileContent = fs.readFileSync(chatRoutePath, 'utf8');
    expect(fileContent).toContain('llama-3.2-11b-vision-preview');
  });

  it('exposes available models array in test route for diagnostic verification', () => {
    const fileContent = fs.readFileSync(chatRoutePath, 'utf8');
    expect(fileContent).toContain('models: modelIds');
  });
});
