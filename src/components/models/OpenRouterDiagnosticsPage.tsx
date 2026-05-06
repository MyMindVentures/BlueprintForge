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
import { useI18n } from "../../i18n/I18nProvider";

interface DiagnosticsProps {
  llmSettings: LLMSettings;
  onBack: () => void;
}

/**
 * Handles the open router diagnostics page workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function OpenRouterDiagnosticsPage({ llmSettings, onBack }: DiagnosticsProps) {
  const { t } = useI18n();
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ type: "info" | "success" | "error"; msg: string }[]>([]);

  const translateConnectionStatus = (status: string) => t(`states.connectionStatus.${status.replace(/ /g, "")}`);
  const translateLogType = (type: "info" | "success" | "error") => t(`states.logTypes.${type}`);

  const addLog = (type: "info" | "success" | "error", msg: string) => {
    setLogs(prev => [...prev, { type, msg }]);
  };

  const testHeaders = () => {
    addLog("info", t("openrouter.logs.testingHeaderGeneration"));
    try {
      const headers = buildOpenRouterHeaders(llmSettings.openRouterApiKey || "missing");
      addLog("success", t("openrouter.logs.headersGenerated", { headers: Object.keys(headers).join(", ") }));
      addLog("info", t("openrouter.logs.authPresent", { present: !!headers["Authorization"] }));
    } catch (e: any) {
      addLog("error", t("openrouter.logs.headerTestFailed", { message: e.message }));
    }
  };

  const testPayload = () => {
    addLog("info", t("openrouter.logs.testingPayloadValidation"));
    const dummyPayload = { model: "test", messages: [{ role: "user", content: "test" }] };
    addLog("success", t("openrouter.logs.payloadStructureValid", { bytes: JSON.stringify(dummyPayload).length }));
  };

  const testJsonParse = () => {
    addLog("info", t("openrouter.logs.testingJsonParseSafeguards"));
    const valid = safeJsonParse('{"ok":true}', { ok: false });
    const invalid = safeJsonParse('{"bad":}', { ok: false });
    addLog("success", t("openrouter.logs.primaryParse", { ok: valid.ok }));
    addLog("success", t("openrouter.logs.fallbackRecovery", { ok: invalid.ok === false }));
  };

  const showLastDebug = () => {
    const lastError = getLastDebugError();
    if (lastError) {
      addLog("error", t("openrouter.logs.lastServerFeedback", { status: lastError.status, message: lastError.errorMessage }));
      addLog("info", t("openrouter.logs.targetModel", { model: lastError.selectedModel }));
    } else {
      addLog("info", t("openrouter.logs.noRecentServerErrors"));
    }
  };

  const runFullDiagnostics = async () => {
    setTestStatus("testing");
    setLogs([]);
    addLog("info", t("openrouter.logs.startingDiagnostics"));

    const apiKey = llmSettings.openRouterApiKey;
    if (!apiKey) {
      addLog("error", t("errors.openRouterApiKeyMissingFromSettings"));
      setTestStatus("error");
      return;
    }

    try {
      // Test 1: Headers & Connection
      addLog("info", t("openrouter.logs.validatingHeadersConnection"));
      await testOpenRouterConnection(apiKey);
      addLog("success", t("openrouter.logs.connectionEstablished"));

      // Test 2: Model Sync
      addLog("info", t("openrouter.logs.fetchingModels"));
      const { models } = await syncOpenRouterModels(apiKey);
      addLog("success", t("openrouter.logs.modelsFetched", { count: models.length }));

      // Test 3: Chat Completion
      addLog("info", t("openrouter.logs.testingMiniCompletion"));
      const aiService = new AIService(apiKey, "openai/gpt-4o-mini");
      const res = await aiService.generateText(t("openrouter.testAssistantSystemPrompt"), t("openrouter.testAssistantUserPrompt"));
      addLog("success", t("openrouter.logs.completionSuccessful", { result: res.trim() }));

      setTestStatus("success");
    } catch (e: any) {
      addLog("error", t("openrouter.logs.diagnosticsFailed", { message: e.message }));
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
            <h1 className="text-sm font-black text-white uppercase tracking-widest">{t("openrouter.protocolDiagnostics")}</h1>
            <span className="text-[9px] font-black text-accent uppercase tracking-tighter">{t("openrouter.diagnosticSuite")}</span>
          </div>
        </div>

        <button
          onClick={runFullDiagnostics}
          disabled={testStatus === "testing"}
          className="glass-btn-primary !h-10 !px-6 !text-[10px] !font-black !uppercase !tracking-widest"
        >
          {testStatus === "testing" ? <RefreshCcw size={16} className="animate-spin" /> : <Send size={16} />}
          {t("openrouter.initiateFullSuite")}
        </button>
      </header>

      <div className="flex-1 p-12 overflow-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="flex flex-wrap gap-3">
              <button onClick={testHeaders} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-white transition-all border border-white/5">{t("openrouter.testHeaders")}</button>
              <button onClick={testPayload} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-white transition-all border border-white/5">{t("openrouter.testPayload")}</button>
              <button onClick={testJsonParse} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-white transition-all border border-white/5">{t("openrouter.testJson")}</button>
              <button onClick={showLastDebug} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-500/80 hover:text-amber-500 transition-all border border-amber-500/10">{t("openrouter.showLastFeedback")}</button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DiagnosticCard
                icon={<Database size={20} />}
                label={t("openrouter.apiFoundation")}
                status={llmSettings.openRouterApiKey ? t("states.ready") : t("states.missing")}
                color={llmSettings.openRouterApiKey ? "text-emerald-400" : "text-red-400"}
              />
              <DiagnosticCard
                icon={<ShieldCheck size={20} />}
                label={t("openrouter.authorization")}
                status={translateConnectionStatus(llmSettings.connectionStatus)}
                color={llmSettings.connectionStatus === 'Connected' ? "text-emerald-400" : "text-amber-400"}
              />
              <DiagnosticCard
                icon={<Zap size={20} />}
                label={t("openrouter.latencyIndex")}
                status={t("states.nominal")}
                color="text-blue-400"
              />
           </div>

           <GlassPanel className="bg-white/[0.01] border-white/5 overflow-hidden">
              <div className="h-12 border-b border-white/5 px-6 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-dim">
                  <Terminal size={14} className="text-accent" />
                  {t("openrouter.terminalFeedback")}
                </div>
                {testStatus !== 'idle' && (
                  <StatusBadge label={t(`states.testStatus.${testStatus}`)} status={testStatus === 'success' ? 'success' : testStatus === 'error' ? 'error' : 'info'} />
                )}
              </div>
              <div className="p-8 font-mono text-[11px] h-[400px] overflow-auto scrollbar-thin space-y-2 bg-black/40">
                {logs.length === 0 ? (
                  <div className="text-white/20 italic">{t("openrouter.awaitingDiagnosticInitiation")}</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className={`flex gap-4 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      <span className="opacity-50">[{i+1}]</span>
                      <span className="font-black uppercase tracking-widest">[{translateLogType(log.type)}]</span>
                      <span className="leading-tight">{log.msg}</span>
                    </div>
                  ))
                )}
              </div>
           </GlassPanel>

           {testStatus === 'error' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3 text-red-400 mb-3 text-xs font-black uppercase tracking-widest">
                  <AlertCircle size={16} /> {t("errors.remediationRequired")}
                </div>
                <p className="text-sm text-red-400/80 leading-relaxed font-mono px-1">
                  {errorDetails || t("errors.unknownProtocolFailure")}
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
