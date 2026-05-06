import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { buildOpenRouterHeaders, callOpenRouterChatCompletion } from './openRouterClient';

const server = setupServer(
  // Mock Models API
  http.get('*/api/ai/models', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.includes('sk-test')) {
      return new HttpResponse(JSON.stringify({ error: { message: "Invalid API Key" } }), { status: 401 });
    }
    return HttpResponse.json({
      data: [
        { id: 'openai/gpt-4o', name: 'GPT-4o', context_length: 128000 },
        { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', context_length: 200000 }
      ]
    });
  }),

  // Mock Completion API
  http.post('*/api/ai/chat/completions', async ({ request }) => {
    const auth = request.headers.get('Authorization');
    const clonedReq = request.clone();
    const body = await clonedReq.json() as any;

    if (!auth || !auth.includes('sk-test')) {
      return new HttpResponse(JSON.stringify({ error: { message: "Invalid API Key" } }), { status: 401 });
    }

    if (body.model === 'error-402') {
      return new HttpResponse(JSON.stringify({ error: { message: "No credits" } }), { status: 402 });
    }
    
    if (body.model === 'error-429') {
      return new HttpResponse(null, { status: 429 });
    }

    return HttpResponse.json({
      choices: [
        { message: { content: "Mocked response content" } }
      ]
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('openRouterClient', () => {
  describe('buildOpenRouterHeaders', () => {
    it('should build correct headers', () => {
      const apiKey = 'sk-test-key';
      const headers = buildOpenRouterHeaders(apiKey);
      
      expect(headers['Authorization']).toBe('Bearer sk-test-key');
      expect(headers['Content-Type']).toBe('application/json');
      // In JSDOM/Node X-Title and HTTP-Referer depend on environment
      expect(headers['X-OpenRouter-Title']).toBeDefined();
    });
  });

  describe('callOpenRouterChatCompletion', () => {
    it('should call chat completion successfully', async () => {
      const result = await callOpenRouterChatCompletion({
        apiKey: 'sk-test-key',
        model: 'openai/gpt-4o',
        messages: [{ role: 'user', content: 'hello' }]
      });
      expect(result).toBe('Mocked response content');
    });

    it('should handle 402 payment required', async () => {
      await expect(callOpenRouterChatCompletion({
        apiKey: 'sk-test-key',
        model: 'error-402',
        messages: []
      })).rejects.toThrow('errors.openRouterNoCredits');
    });

    it('should handle 429 rate limit', async () => {
      await expect(callOpenRouterChatCompletion({
        apiKey: 'sk-test-key',
        model: 'error-429',
        messages: []
      })).rejects.toThrow('errors.openRouterRateLimited');
    });
  });
});
