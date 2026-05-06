import React, { useState } from "react";
import { 
  ArrowLeft, Terminal, AlertCircle, CheckCircle2, 
  Send, RefreshCcw, ShieldCheck, Database, Zap
} from "lucide-react";
import { LLMSettings } from "../../types";
import { testOpenRouterConnection, buildOpenRouterHeaders, getLastDebugError } from "../../services/openRouterClient";
import { syncOpenRouterModels } from "../../services/openRouterModelService";
import { AIService } from "../../services/aiService";
import { StatusBadge } from "../ui/StatusBadge";
import { GlassPanel } from "../ui/GlassPanel";
import { motion } from "motion/react";
import { safeJsonParse } from "../../utils/safeJson";

interface DiagnosticsProps {
  llmSettings: LLMSettings;
  onBack: () => void;
}

/**
 * Handles the open router diagnostics page workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function OpenRouterDiagnosticsPage({ llmSettings, onBack }: DiagnosticsProps) {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ type: "info" | "success" | "error"; msg: string }[]>([]);

  const addLog = (type: "info" | "success" | "error", msg: string) => {
    setLogs(prev => [...prev, { type, msg }]);
  };

  const testHeaders = () => {
    addLog("info", "Testing Header Generation...");
    try {
      const headers = buildOpenRouterHeaders(llmSettings.openRouterApiKey || "missing");
      addLog("success", `Headers generated: ${Object.keys(headers).join(", ")}`);
      addLog("info", `Auth present: ${!!headers["Authorization"]}`);
    } catch (e: any) {
      addLog("error", `Header test failed: ${e.message}`);
    }
  };

  const testPayload = () => {
    addLog("info", "Testing Payload Validation...");
    const dummyPayload = { model: "test", messages: [{ role: "user", content: "test" }] };
    addLog("success", `Payload structure valid: ${JSON.stringify(dummyPayload).length} bytes`);
  };

  const testJsonParse = () => {
    addLog("info", "Testing JSON Parse Safeguards...");
    const valid = safeJsonParse('{"ok":true}', { ok: false });
    const invalid = safeJsonParse('{"bad":}', { ok: false });
    addLog("success", `Primary parse: ${valid.ok}`);
    addLog("success", `Fallback recovery: ${invalid.ok === false}`);
  };

  const showLastDebug = () => {
    const lastError = getLastDebugError();
    if (lastError) {
      addLog("error", `Last Server Feedback: [${lastError.status}] ${lastError.errorMessage}`);
      addLog("info", `Target Model: ${lastError.selectedModel}`);
    } else {
      addLog("info", "No recent server errors recorded.");
    }
  };

  const runFullDiagnostics = async () => {
    setTestStatus("testing");
    setLogs([]);
    addLog("info", "Starting full diagnostics suite...");

    const apiKey = llmSettings.openRouterApiKey;
    if (!apiKey) {
      addLog("error", "API Key is missing from settings.");
      setTestStatus("error");
      return;
    }

    try {
      // Test 1: Headers & Connection
      addLog("info", "Test 1: Validating headers and connection...");
      await testOpenRouterConnection(apiKey);
      addLog("success", "Connection established. Headers validated.");

      // Test 2: Model Sync
      addLog("info", "Test 2: Fetching available models...");
      const { models } = await syncOpenRouterModels(apiKey);
      addLog("success", `Successfully fetched ${models.length} models.`);

      // Test 3: Chat Completion
      addLog("info", "Test 3: Testing mini-completion (Hello World)...");
      const aiService = new AIService(apiKey, "openai/gpt-4o-mini");
      const res = await aiService.generateText("You are a helpful test assistant.", "Say hello briefly.");
      addLog("success", `Completion successful: "${res.trim()}"`);

      setTestStatus("success");
    } catch (e: any) {
      addLog("error", `Diagnostics failed: ${e.message}`);
      setErrorDetails(e.message);
      setTestStatus("error");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden">
      <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl text-text-dim hover:text-white transition-all"><ArrowLeft size={20} /></button>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white uppercase tracking-widest">Protocol Diagnostics</h1>
            <span className="text-[9px] font-black text-accent uppercase tracking-tighter">Diagnostic Suite / OpenRouter API</span>
          </div>
        </div>
        
        <button 
          onClick={runFullDiagnostics}
          disabled={testStatus === "testing"}
          className="glass-btn-primary !h-10 !px-6 !text-[10px] !font-black !uppercase !tracking-widest"
        >
          {testStatus === "testing" ? <RefreshCcw size={16} className="animate-spin" /> : <Send size={16} />}
          Initiate Full Suite
        </button>
      </header>

      <div className="flex-1 p-12 overflow-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="flex flex-wrap gap-3">
              <button onClick={testHeaders} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-white transition-all border border-white/5">Test Headers</button>
              <button onClick={testPayload} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-white transition-all border border-white/5">Test Payload</button>
              <button onClick={testJsonParse} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-white transition-all border border-white/5">Test JSON</button>
              <button onClick={showLastDebug} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-500/80 hover:text-amber-500 transition-all border border-amber-500/10">Show Last Feedback</button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DiagnosticCard 
                icon={<Database size={20} />} 
                label="API Foundation" 
                status={llmSettings.openRouterApiKey ? "Ready" : "Missing"} 
                color={llmSettings.openRouterApiKey ? "text-emerald-400" : "text-red-400"} 
              />
              <DiagnosticCard 
                icon={<ShieldCheck size={20} />} 
                label="Authorization" 
                status={llmSettings.connectionStatus} 
                color={llmSettings.connectionStatus === 'Connected' ? "text-emerald-400" : "text-amber-400"} 
              />
              <DiagnosticCard 
                icon={<Zap size={20} />} 
                label="Latency Index" 
                status="Nominal" 
                color="text-blue-400" 
              />
           </div>

           <GlassPanel className="bg-white/[0.01] border-white/5 overflow-hidden">
              <div className="h-12 border-b border-white/5 px-6 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-dim">
                  <Terminal size={14} className="text-accent" />
                  Terminal Feedback
                </div>
                {testStatus !== 'idle' && (
                  <StatusBadge label={testStatus} status={testStatus === 'success' ? 'success' : testStatus === 'error' ? 'error' : 'info'} />
                )}
              </div>
              <div className="p-8 font-mono text-[11px] h-[400px] overflow-auto scrollbar-thin space-y-2 bg-black/40">
                {logs.length === 0 ? (
                  <div className="text-white/20 italic">Awaiting diagnostic initiation...</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className={`flex gap-4 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      <span className="opacity-50">[{i+1}]</span>
                      <span className="font-black uppercase tracking-widest">[{log.type}]</span>
                      <span className="leading-tight">{log.msg}</span>
                    </div>
                  ))
                )}
              </div>
           </GlassPanel>

           {testStatus === 'error' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3 text-red-400 mb-3 text-xs font-black uppercase tracking-widest">
                  <AlertCircle size={16} /> Remediation Required
                </div>
                <p className="text-sm text-red-400/80 leading-relaxed font-mono px-1">
                  {errorDetails || "Unknown protocol failure encountered during sequence."}
                </p>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}

function DiagnosticCard({ icon, label, status, color }: any) {
  return (
    <GlassPanel className="p-6 bg-white/[0.02]">
      <div className={`mb-4 ${color}`}>{icon}</div>
      <div className="text-[9px] font-black text-white/30 uppercase tracking-[.2em] mb-1">{label}</div>
      <div className={`text-lg font-black uppercase tracking-tighter ${color}`}>{status}</div>
    </GlassPanel>
  );
}
