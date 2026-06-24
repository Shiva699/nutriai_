const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Groq } = require('groq-sdk');
const apiKey = process.env.GROQ_API_KEY;
console.log('loaded key:', !!apiKey, 'length:', apiKey ? apiKey.length : 0);
(async () => {
  try {
    const client = new Groq({ apiKey });
    console.log('client initialized', client.baseURL, client.timeout);
    const resp = await client.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('success', resp?.choices?.length, JSON.stringify(resp, null, 2));
  } catch (err) {
    console.error('error name:', err?.name);
    console.error('error message:', err?.message);
    console.error('error status:', err?.status);
    console.error('error response:', err?.response);
    console.error('error body:', err?.body);
    if (err?.response) console.error('err.response instanceof', err.response.constructor.name);
    process.exit(1);
  }
})();
