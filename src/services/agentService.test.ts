import { describe, it, expect } from 'vitest';
import { parseAgentResponse } from './agentService';
import { AIAgent } from '../types';

const mockAgent = (outputType: AIAgent['outputType']): AIAgent => ({
  id: 'test',
  code: 'TEST',
  name: 'Tester',
  status: 'Active',
  outputType,
} as AIAgent);

describe('agentService', () => {
  describe('parseAgentResponse', () => {
    it('should handle "Markdown only" type', () => {
      const agent = mockAgent('Markdown only');
      const res = parseAgentResponse('Hello World', agent, false);
      expect(res.app.markdown).toBe('Hello World');
      expect(res.app.sections).toEqual([]);
    });

    it('should handle "JSON only" type', () => {
      const agent = mockAgent('JSON only');
      const json = '{"foo": "bar"}';
      const res = parseAgentResponse(json, agent, true);
      expect(res.app.markdown).toContain('"foo": "bar"');
      expect(res.app.sections).toEqual([]);
    });

    it('should handle "Cards + Markdown" type with standard structure', () => {
      const agent = mockAgent('Cards + Markdown');
      const data = {
        app: {
          sections: [{ id: '1', title: 'Sec', code: 'S1', description: 'desc', type: 'section' }],
          markdown: '# Title'
        }
      };
      const res = parseAgentResponse(JSON.stringify(data), agent, true);
      expect(res.app.sections).toHaveLength(1);
      expect(res.app.markdown).toBe('# Title');
    });

    it('should recover JSON from markdown block', () => {
      const agent = mockAgent('Cards + Markdown');
      const content = 'Sure here is the JSON:\n```json\n{"sections": [], "markdown": "Recovered"}\n```';
      const res = parseAgentResponse(content, agent, true);
      expect(res.app.markdown).toBe('Recovered');
    });
  });
});
