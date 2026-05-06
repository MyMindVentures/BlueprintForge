import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Key, Save, RefreshCw, Star, Cpu, Zap, Info, Search, XCircle, CheckCircle2, ChevronRight, Terminal, ExternalLink, RotateCcw, Loader2, Brain, Sparkles, AlertTriangle, Github
} from "lucide-react";
import { LLMSettings, OpenRouterModel } from "../../types";
import { useToast } from "../ui/Toast";
import { HelpIcon } from "../Onboarding";
import { GlassPanel } from "../ui/GlassPanel";
import { StatusBadge } from "../ui/StatusBadge";
import { ActionButton } from "../ui/ActionButton";
import { SearchInput } from "../ui/SearchInput";
import { useGithubSettings } from "../../hooks/useGithubSettings";
import { useI18n } from '../../i18n/I18nProvider';

interface LLMSettingsProps {
  settings: LLMSettings;
  onUpdate: (updates: Partial<LLMSettings>) => void;
  onSync: () => Promise<void>;
  onTestConnection: (apiKey: string) => Promise<{ success: boolean }>;
  onGenerateIntelligence: () => Promise<void>;
  onRegenerateAll: () => Promise<void>;
  syncStatus: {
    phase: "idle" | "syncing" | "intelligence" | "success" | "error" | "warning";
    total: number;
    completed: number;
    failed: number;
    mappingFailed: number;
    currentModelName: string;
    error: string | null;
    errorDetail?: {
      status: number | null;
      message: string;
      endpoint: string;
      timestamp: string;
    } | null;
  };
  agents?: { id: string, name: string }[];
  projects?: { id: string, name: string }[];
  onOpenDiagnostics?: () => void;
}

/**
 * Handles the llmsettings page workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function LLMSettingsPage({ 
  settings, onUpdate, onSync, onTestConnection, onGenerateIntelligence, onRegenerateAll, syncStatus, onOpenDiagnostics 
}: LLMSettingsProps) {
  const { formatRelativeTime, formatDate, t } = useI18n();
  const toast = useToast();
  const { settings: githubSettings, setSettings: setGithubSettings } = useGithubSettings();
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey || "");
  const [showKey, setShowKey] = useState(false);
  const [showGithubKey, setShowGithubKey] = useState(false);
  const [search, setSearch] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (settings.openRouterApiKey && !apiKey) setApiKey(settings.openRouterApiKey);
  }, [settings.openRouterApiKey]);

  const providers = useMemo(() => {
    const p = new Set(settings.models.map(m => m.provider).filter(Boolean));
    return Array.from(p).sort();
  }, [settings.models]);

  const filteredModels = useMemo(() => {
    return settings.models.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [settings.models, search]);

  const handleSaveKey = () => {
    onUpdate({ openRouterApiKey: apiKey, apiKeySaved: !!apiKey });
    toast.success(t("settings.securityUpdated"));
  };

  const handleSync = async () => {
    try {
      await onSync();
      toast.success(t("settings.manifestSynchronized"));
    } catch (e: any) {
      toast.error(e.message || t("settings.syncFailure"));
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8 md:p-12 scrollbar-thin relative font-sans">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-40">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
                <Brain size={12} />
                {t("settings.globalBrainInterface")}
             </div>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
               {t("settings.fleet")} <span className="text-accent underline decoration-white/10 underline-offset-8">{t("auto.lLMSettingsPage.intelligence209049")}</span>
             </h1>
             <p className="text-text-dim text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed italic">
               {t("settings.subtitle")}
             </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <button 
               onClick={onOpenDiagnostics}
               className="glass-btn-secondary flex-1 sm:flex-none !h-14 !px-4 sm:!px-8 !text-[10px] sm:!text-[11px] !font-black !uppercase !tracking-widest"
             >
               <Terminal size={16} className="text-accent" />
               <span className="hidden sm:inline">{t("auto.lLMSettingsPage.diagnostics3e5c7f")}</span>
             </button>
             <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="glass-btn-primary flex-1 sm:flex-none justify-center !h-14 !px-4 sm:!px-8 !text-[10px] sm:!text-[11px] !font-black !uppercase !tracking-widest">
               {t("settings.console")} <ExternalLink size={16} />
             </a>
          </div>
        </div>

        {/* Sync Progress Toast-Style Overlay */}
        <AnimatePresence>
          {syncStatus.phase !== "idle" && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4">
              <div className="glass bg-black/80 border border-accent/40 rounded-3xl p-8 backdrop-blur-3xl shadow-2xl">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                       <RefreshCw className="text-accent animate-spin" size={20} />
                       <div>
                          <h4 className="text-[10px] font-black text-accent uppercase tracking-widest">{t("auto.lLMSettingsPage.processingIntelligencea85055")}</h4>
                          <p className="text-sm font-black text-white truncate max-w-[200px]">{syncStatus.currentModelName || t("settings.booting")}</p>
                       </div>
                    </div>
                    <span className="text-2xl font-black text-white">{syncStatus.total > 0 ? Math.round((syncStatus.completed + syncStatus.failed) / syncStatus.total * 100) : 0}%</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                    <motion.div animate={{ width: `${(syncStatus.completed + syncStatus.failed) / syncStatus.total * 100}%` }} className="h-full bg-accent" />
                 </div>
                 <div className="flex justify-between text-[9px] font-black uppercase text-text-dim">
                    <span>{t("settings.succeeded")}: {syncStatus.completed}</span>
                    <span>{t("settings.failed")}: {syncStatus.failed}</span>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* API Settings Section */}
        <GlassPanel className="p-10 relative overflow-hidden bg-white/[0.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-accent/10 rounded-[20px] flex items-center justify-center text-accent border border-accent/20 shadow-inner">
                      <Key size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t("auto.lLMSettingsPage.securityProtocol153125")}</h2>
                      <p className="text-[10px] text-accent font-black uppercase tracking-[.2em]">{t("auto.lLMSettingsPage.openrouterGatewayLink7546f4")}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative group max-w-lg">
                       <input 
                         type={showKey ? "text" : "password"}
                         value={apiKey}
                         onChange={e => setApiKey(e.target.value)}
                         placeholder={t("settings.placeholders.openRouterKey")}
                         className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 pr-14 text-sm font-mono text-white focus:outline-none focus:border-accent/40"
                       />
                       <button onClick={() => setShowKey(!showKey)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                         {showKey ? <XCircle size={18} /> : <CheckCircle2 size={18} className={settings.apiKeySaved ? "text-emerald-500" : ""} />}
                       </button>
                    </div>
                    
                    <div className="flex gap-3">
                       <ActionButton 
                         label="Test Link" 
                         loadingLabel="Pinging..."
                         onClick={async () => { await onTestConnection(apiKey); toast.info("Verification complete."); }}
                         icon={<Zap size={14} />}
                         variant="outline"
                         className="!h-12 !px-6"
                       />
                       <button onClick={handleSaveKey} className="glass-btn-primary !h-12 !px-8 !text-[11px] !font-black !uppercase !tracking-widest">
                         Lock Protocol
                       </button>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                       <StatusBadge 
                         label={settings.connectionStatus} 
                         status={settings.connectionStatus === 'Connected' ? 'success' : 'idle'} 
                       />
                       {settings.lastTestedAt && (
                         <span className="text-[10px] font-black text-text-dim/40 uppercase tracking-widest">Checked {formatRelativeTime(settings.lastTestedAt)}</span>
                       )}
                    </div>
                  </div>
               </div>

               <div className="space-y-8 bg-white/[0.02] p-8 rounded-[32px] border border-white/5 shadow-inner">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Sparkles size={18} className="text-accent" />
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{t("auto.lLMSettingsPage.masterIntelligenceEngine59c702")}</h3>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">{t("auto.lLMSettingsPage.selectedPrimaryb5ac52")}</label>
                        <select 
                          value={settings.defaultModelId || ""}
                          onChange={e => onUpdate({ defaultModelId: e.target.value })}
                          className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-4 text-xs font-black text-white focus:outline-none focus:border-accent/40 appearance-none cursor-pointer"
                        >
                           {settings.models.filter(m => m.enabled).map(m => <option key={m.id} value={m.id} className="bg-[#050505]">{m.name}</option>)}
                        </select>
                     </div>
                     <button
                        disabled={!settings.apiKeySaved || syncStatus.phase !== "idle"}
                        onClick={onGenerateIntelligence}
                        className="w-full h-14 glass-btn-primary !text-[10px] !font-black !uppercase !tracking-widest"
                     >
                        Initiate Global Analysis
                     </button>
                  </div>
               </div>
            </div>
        </GlassPanel>

        {/* GitHub Settings Section */}
        <GlassPanel className="p-10 relative overflow-hidden bg-white/[0.01]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-[20px] flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                      <Github size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t("auto.lLMSettingsPage.openSourceSync3d9663")}</h2>
                      <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[.2em]">{t("auto.lLMSettingsPage.githubConfiguration6d8d59")}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative group max-w-lg">
                       <input 
                         type={showGithubKey ? "text" : "password"}
                         value={githubSettings.github_token}
                         onChange={e => setGithubSettings({...githubSettings, github_token: e.target.value})}
                         placeholder={t("settings.placeholders.githubToken")}
                         className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 pr-14 text-sm font-mono text-white focus:outline-none focus:border-emerald-400/40"
                       />
                       <button onClick={() => setShowGithubKey(!showGithubKey)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                         {showGithubKey ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                       </button>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5 max-w-lg">
                      <input 
                        type="checkbox" 
                        id="auto_create_issues" 
                        checked={githubSettings.auto_create_issues} 
                        onChange={e => setGithubSettings({...githubSettings, auto_create_issues: e.target.checked})} 
                        className="w-4 h-4 accent-emerald-500 rounded" 
                      />
                      <label htmlFor="auto_create_issues" className="text-sm font-medium text-white/80 select-none">{t("auto.lLMSettingsPage.automaticallyCreateGithubIssuesWhenPublishing59f0dd")}</label>
                    </div>
                  </div>
               </div>

               <div className="space-y-6 bg-white/[0.02] p-8 rounded-[32px] border border-white/5 shadow-inner">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">{t("auto.lLMSettingsPage.repoUrl4a5630")}</label>
                        <input 
                          type="text"
                          value={githubSettings.repo_url}
                          placeholder={t("settings.placeholders.repoUrl")}
                          onChange={e => {
                            const val = e.target.value;
                            let owner = githubSettings.repo_owner;
                            let name = githubSettings.repo_name;
                            try {
                              const parts = new URL(val).pathname.split('/').filter(Boolean);
                              if (parts.length >= 2) {
                                owner = parts[0];
                                name = parts[1];
                              }
                            } catch (error) {}
                            
                            setGithubSettings({
                              ...githubSettings, 
                              repo_url: val,
                              repo_owner: owner,
                              repo_name: name
                            });
                          }}
                          className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-emerald-400/40"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">{t("auto.lLMSettingsPage.ownerc60083")}</label>
                          <input 
                            value={githubSettings.repo_owner}
                            onChange={e => setGithubSettings({...githubSettings, repo_owner: e.target.value})}
                            className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-emerald-400/40"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">{t("auto.lLMSettingsPage.name072a8c")}</label>
                          <input 
                            value={githubSettings.repo_name}
                            onChange={e => setGithubSettings({...githubSettings, repo_name: e.target.value})}
                            className="w-full h-12 bg-black/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-emerald-400/40"
                          />
                       </div>
                     </div>
                  </div>
               </div>
            </div>
        </GlassPanel>

        {/* Models Grid Section */}
        <section className="space-y-10">
           <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 gap-6">
              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase">{t("auto.lLMSettingsPage.operationalManifesta5b576")}</h2>
                {settings.lastSyncedAt && (
                  <p className="text-[10px] font-black text-text-dim/60 uppercase tracking-widest">
                    Last Synced: {formatRelativeTime(settings.lastSyncedAt)}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
                 {settings.models.length > 0 && (
                   <div className="flex gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">{t("auto.lLMSettingsPage.fleetSize48a961")}</p>
                        <p className="text-sm font-black text-white">{settings.models.length}</p>
                      </div>
                      {syncStatus.mappingFailed > 0 && (
                        <div className="text-left sm:text-right">
                          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-none">{t("auto.lLMSettingsPage.failures33250e")}</p>
                          <p className="text-sm font-black text-red-500">{syncStatus.mappingFailed}</p>
                        </div>
                      )}
                   </div>
                 )}
                 <button onClick={handleSync} className="glass-btn-secondary !h-12 w-full sm:w-auto !px-6 !text-[10px] !font-black !uppercase !tracking-widest">
                    Sync Manifest
                 </button>
              </div>
           </div>

           {/* Error Diagnostic Panel */}
           <AnimatePresence>
             {syncStatus.error && syncStatus.errorDetail && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                 <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 flex gap-5">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="space-y-3 flex-1">
                       <h4 className="text-xs font-black text-red-400 uppercase tracking-widest">{t("auto.lLMSettingsPage.protocolSyncFailure168d45")}</h4>
                       <p className="text-sm text-text-dim leading-relaxed">{syncStatus.error}</p>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2 border-t border-red-500/10">
                          <div>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t("auto.lLMSettingsPage.httpStatus8cdb48")}</p>
                            <p className="text-[10px] font-mono text-red-400">{syncStatus.errorDetail.status || "N/A"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t("auto.lLMSettingsPage.endpoint76fb42")}</p>
                            <p className="text-[10px] font-mono text-text-dim truncate">{syncStatus.errorDetail.endpoint}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t("auto.lLMSettingsPage.timestamp92a9be")}</p>
                            <p className="text-[10px] font-mono text-text-dim">{formatDate(syncStatus.errorDetail.timestamp, { timeStyle: 'medium' })}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="max-w-xl">
              <SearchInput value={search} onChange={setSearch} placeholder={t("settings.placeholders.searchFleet")} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredModels.map(model => (
                <ModelCardSmall 
                  key={model.id} 
                  model={model} 
                  isSelected={settings.defaultModelId === model.id}
                  onSelect={() => onUpdate({ defaultModelId: model.id })}
                  onToggle={() => onUpdate({ models: settings.models.map(m => m.id === model.id ? { ...m, enabled: !m.enabled } : m) })}
                />
              ))}
           </div>
        </section>
      </div>
    </div>
  );
}

function ModelCardSmall({ model, isSelected, onSelect, onToggle }: any) {
  const { t } = useI18n();
  const isUnavailable = model.unavailable;
  return (
    <GlassPanel className={`p-6 transition-all ${(!model.enabled || isUnavailable) ? 'opacity-30 blur-[0.5px] scale-95' : 'hover:border-accent/20'} ${isSelected ? 'ring-1 ring-accent/30' : ''}`}>
       <div className="flex items-start justify-between mb-6">
          <div className="h-10">
            <h4 className="text-sm font-black text-white truncate max-w-[140px] uppercase tracking-tight flex items-center gap-2">
              {model.name}
              {isUnavailable && <AlertTriangle size={12} className="text-red-500" />}
            </h4>
            <p className="text-[9px] font-mono text-white/20 truncate lowercase">{model.id.split('/').pop()}</p>
          </div>
          <button 
            disabled={isUnavailable}
            onClick={onToggle} 
            className={`w-10 h-5 rounded-full relative transition-all ${model.enabled && !isUnavailable ? 'bg-emerald-500' : 'bg-white/10'}`}
          >
             <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${model.enabled && !isUnavailable ? 'right-1' : 'left-1'}`} />
          </button>
       </div>
       <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-dim">
             <span>{t("auto.lLMSettingsPage.intelStatuse2c62f")}</span>
             <span className={model.intelligenceStatus === 'Ready' ? 'text-emerald-400' : model.intelligenceStatus === 'Failed' ? 'text-red-400' : ''}>
               {isUnavailable ? "Unavailable" : model.intelligenceStatus || "N/A"}
             </span>
          </div>
          <button 
            disabled={!model.enabled || isUnavailable}
            onClick={onSelect}
            className={`w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${isSelected ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-white/5 border-white/5 text-text-dim hover:text-white'}`}
          >
            {isSelected ? "Active Primary" : isUnavailable ? "Unsupported" : "Set Primary"}
          </button>
       </div>
    </GlassPanel>
  );
}
