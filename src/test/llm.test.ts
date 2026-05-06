import { describe, it, expect, vi } from 'vitest';
import { 
  fetchOpenRouterModels, 
  callOpenRouterChatCompletion,
  testOpenRouterConnection
} from '../services/llm';
import { server } from './setup';
import { http, HttpResponse } from 'msw';

describe('OpenRouter API Client', () => {
  const apiKey = 'sk-or-v1-test-key';

  it('should include correct headers in requests', async () => {
    let capturedHeaders: Headers | null = null;

    server.use(
      http.get('https://openrouter.ai/api/v1/models', ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ data: [] });
      })
    );

    await fetchOpenRouterModels(apiKey);

    expect(capturedHeaders).not.toBeNull();
    expect(capturedHeaders?.get('Authorization')).toBe(`Bearer ${apiKey}`);
    expect(capturedHeaders?.get('Content-Type')).toBe('application/json');
    expect(capturedHeaders?.get('X-Title')).toBeDefined();
  });

  it('should handle 401 Unauthorized', async () => {
    server.use(
      http.get('https://openrouter.ai/api/v1/models', () => {
        return new HttpResponse(JSON.stringify({ error: { message: 'Invalid key' } }), { status: 401 });
      })
    );

    await expect(fetchOpenRouterModels(apiKey)).rejects.toThrow(/Authentication Error/);
  });

  it('should handle 402 Payment Required', async () => {
    server.use(
      http.get('https://openrouter.ai/api/v1/models', () => {
        return new HttpResponse(null, { status: 402 });
      })
    );

    await expect(fetchOpenRouterModels(apiKey)).rejects.toThrow(/Payment Required/);
  });

  it('should handle 429 Rate Limited', async () => {
    server.use(
      http.get('https://openrouter.ai/api/v1/models', () => {
        return new HttpResponse(null, { status: 429 });
      })
    );

    await expect(fetchOpenRouterModels(apiKey)).rejects.toThrow(/Rate Limited/);
  });

  it('should handle 500 Server Error', async () => {
    server.use(
      http.get('https://openrouter.ai/api/v1/models', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    await expect(fetchOpenRouterModels(apiKey)).rejects.toThrow(/Server Error/);
  });

  it('should call chat completions with correct payload', async () => {
    let capturedBody: any = null;

    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          choices: [{ message: { content: 'test response' } }]
        });
      })
    );

    const response = await callOpenRouterChatCompletion({
      apiKey,
      model: 'test-model',
      messages: [{ role: 'user', content: 'hello' }],
      temperature: 0.5,
      maxTokens: 100
    });

    expect(response).toBe('test response');
    expect(capturedBody.model).toBe('test-model');
    expect(capturedBody.messages[0].content).toBe('hello');
    expect(capturedBody.max_tokens).toBe(100);
  });

  it('should handle empty choices safely', async () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json({ choices: [] });
      })
    );

    await expect(callOpenRouterChatCompletion({
      apiKey,
      model: 'test-model',
      messages: []
    })).rejects.toThrow(/empty response/);
  });
});
