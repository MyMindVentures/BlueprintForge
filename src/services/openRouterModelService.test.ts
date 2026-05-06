import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { syncOpenRouterModels, mapOpenRouterModel, mergeSyncedModels, buildModelHeaders } from './openRouterModelService';
import { OpenRouterModel } from '../types';

const server = setupServer(
  http.get('*/api/ai/models', ({ request }) => {
    const auth = request.headers.get('Authorization');
    const referer = request.headers.get('HTTP-Referer');
    const title = request.headers.get('X-OpenRouter-Title');

    if (!auth || !auth.includes('sk-test')) {
      return new HttpResponse(JSON.stringify({ error: { message: "Invalid API Key" } }), { status: 401 });
    }

    if (auth.includes('sk-test-402')) {
      return new HttpResponse(JSON.stringify({ error: { message: "No credits" } }), { status: 402 });
    }

    if (auth.includes('sk-test-429')) {
      return new HttpResponse(null, { status: 429 });
    }

    if (auth.includes('sk-test-500')) {
      return new HttpResponse(null, { status: 500 });
    }

    return HttpResponse.json({
      data: [
        { 
          id: 'openai/gpt-4o', 
          name: 'GPT-4o', 
          context_length: 128000,
          description: "Test description",
          pricing: { prompt: "0.005", completion: "0.015" },
          supported_parameters: ["tools", "response_format"],
          architecture: { input_modalities: ["text", "image"] }
        }
      ]
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('openRouterModelService', () => {
  describe('buildModelHeaders', () => {
    it('should contain required OpenRouter headers', () => {
      const headers = buildModelHeaders('test-key');
      expect(headers['Authorization']).toBe('Bearer test-key');
      expect(headers['HTTP-Referer']).toBeDefined();
      expect(headers['X-OpenRouter-Title']).toBe('BlueprintForge AI');
    });
  });

  describe('mapOpenRouterModel', () => {
    it('should map raw data correctly', () => {
      const raw = {
        id: 'provider/model',
        name: 'Model Name',
        context_length: 8000,
        description: 'Desc',
        supported_parameters: ['tools', 'reasoning'],
        architecture: { input_modalities: ['image'] }
      };
      const model = mapOpenRouterModel(raw);
      expect(model.id).toBe('provider/model');
      expect(model.provider).toBe('provider');
      expect(model.capabilities.supportsTools).toBe(true);
      expect(model.capabilities.supportsImages).toBe(true);
      expect(model.capabilities.supportsReasoning).toBe(true);
      expect(model.capabilities.supportsJson).toBe(false);
    });
  });

  describe('mergeSyncedModels', () => {
    it('should preserve enabled state and user notes', () => {
      const existing: OpenRouterModel[] = [{
        id: 'm1',
        enabled: false,
        userNotes: "My note",
        intelligenceStatus: "Ready",
        // ... other required fields
      } as any];
      
      const synced: OpenRouterModel[] = [{
        id: 'm1',
        enabled: true,
        // ... other required fields
      } as any];

      const merged = mergeSyncedModels(existing, synced);
      expect(merged[0].enabled).toBe(false);
      expect(merged[0].userNotes).toBe("My note");
      expect(merged[0].intelligenceStatus).toBe("Ready");
    });

    it('should mark missing models as unavailable', () => {
      const existing: OpenRouterModel[] = [{ id: 'old', enabled: true } as any];
      const synced: OpenRouterModel[] = [{ id: 'new', enabled: true } as any];
      
      const merged = mergeSyncedModels(existing, synced);
      const oldModel = merged.find(m => m.id === 'old');
      expect(oldModel?.unavailable).toBe(true);
    });
  });

  describe('syncOpenRouterModels API Contracts', () => {
    it('should fail safely with missing data array', async () => {
      server.use(
        http.get('*/api/ai/models', () => {
          return HttpResponse.json({ something: 'else' });
        })
      );
      await expect(syncOpenRouterModels('sk-test')).rejects.toThrow('unexpected model response');
    });

    it('should map 401 to Invalid API Key', async () => {
      await expect(syncOpenRouterModels('invalid')).rejects.toThrow('Invalid API Key (401)');
    });

    it('should map 402 to No Credits', async () => {
      await expect(syncOpenRouterModels('sk-test-402')).rejects.toThrow('No Credits (402)');
    });

    it('should map 429 to Rate Limited', async () => {
      await expect(syncOpenRouterModels('sk-test-429')).rejects.toThrow('Rate Limited (429)');
    });

    it('should map 500+ to OpenRouter service error', async () => {
      await expect(syncOpenRouterModels('sk-test-500')).rejects.toThrow('OpenRouter service error (500)');
    });
  });
});
