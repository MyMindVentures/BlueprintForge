import React from "react";
import { motion } from "motion/react";
import { 
  Plus, Layers, Zap, Settings, HelpCircle, 
  Tv, Radio, Github, Twitter, Cpu, User, Users, Compass, Home, UserPlus
} from "lucide-react";
import { useBuildFeed } from "../../hooks/useBuildFeed";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, User as UserIcon } from "lucide-react";
import { NewVersionPopup } from "./NewVersionPopup";
import { LanguageSelector } from "../../i18n/LanguageSelector";
import { useI18n } from "../../i18n/I18nProvider";
import { isFounderAdminRole, normalizeRole } from "../../authRoles";

interface AppShellProps {
  children: React.ReactNode;
  currentView: string;
  setView: (view: any) => void;
  onAddProject?: () => void;
  onOpenHelp?: () => void;
}

/**
 * Handles the app shell workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function AppShell({ children, currentView, setView: onViewChange, onAddProject, onOpenHelp }: AppShellProps) {
  const { lastNotification } = useBuildFeed();
  const { profile, user, logout } = useAuth();
  const { t } = useI18n();
  
  const role = normalizeRole(profile?.role || 'visitor');
  const hasFounderAccess = isFounderAdminRole(role);

  const tabs = [
    { id: "landing", label: t("navigation.home"), icon: Home },
    { id: "bootstrap", label: t("navigation.bootstrap"), icon: Zap },
    { id: "guide", label: t("navigation.guide"), icon: HelpCircle },
    { id: "vision", label: t("navigation.founderVision"), icon: Compass },
    ...(hasFounderAccess ? [{ id: "feed_admin", label: t("navigation.commandCenter"), icon: Tv }] : []),
    ...(hasFounderAccess ? [{ id: "coder_directory", label: t("navigation.globalNetwork"), icon: Users }] : []),
    ...(role === 'vibe_coder' ? [{ id: "coder_profile", label: t("navigation.builderProfile"), icon: UserIcon }] : []),
    { id: "feed_coder", label: t("navigation.liveBuildFeed"), icon: Radio },
    ...(user ? [
      { id: "projects", label: t("navigation.projects"), icon: Layers },
      { id: "agents", label: t("navigation.aiAgents"), icon: Zap },
      { id: "llm", label: t("navigation.openRouterSettings"), icon: Settings },
    ] : []),
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#050505] text-white selection:bg-accent/30 overflow-hidden font-sans w-full max-w-[100vw]">
      {/* Main Stage */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden order-1 md:order-2">
        {children}

        {/* Real-time notification popup */}
        {lastNotification && role === 'vibe_coder' && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 bg-[#111] border border-accent/30 p-4 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-8 flex max-w-[calc(100vw-2rem)] sm:max-w-sm flex-col gap-3 z-50">
            <div className="flex min-w-0 gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h4 className="break-words text-xs font-black leading-snug text-white">{t("notifications.newBuildRequest")}</h4>
                <p className="text-[10px] font-mono text-text-dim">{t("notifications.fromFounder")}</p>
              </div>
            </div>
            <p className="break-words text-sm font-bold text-white">{lastNotification.polished_title}</p>
            <p className="text-xs text-white/70 line-clamp-2">{lastNotification.polished_context}</p>
            <button 
              onClick={() => onViewChange("feed_coder")}
              className="mt-2 w-full rounded-xl bg-accent/10 py-2 text-xs font-bold leading-snug text-accent transition-colors hover:bg-accent/20 whitespace-normal break-words"
            >
              {t("buttons.viewRequest")}
            </button>
          </div>
        )}

        {/* Global Version Popup */}
        <NewVersionPopup onOpenChangelog={() => onViewChange("guide")} />
      </main>

      {/* Nav (Bottom on mobile, Sidebar on desktop) */}
      <aside className="w-full md:w-[100px] h-fit md:h-full border-t md:border-t-0 md:border-r border-white/5 flex flex-row md:flex-col items-center justify-between bg-black/80 md:bg-black/40 backdrop-blur-xl relative z-50 shrink-0 pb-[env(safe-area-inset-bottom)] md:pb-10 pt-2 md:pt-10 px-4 md:px-0 order-2 md:order-1 flex-none">
        
        {/* Brand / Logo */}
        <div className="hidden md:flex flex-col items-center gap-12 w-full relative">
           <motion.div 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="w-14 h-14 bg-accent rounded-[24px] flex items-center justify-center shadow-[0_0_40px_rgba(255,107,0,0.4)] cursor-pointer group"
             onClick={() => onViewChange("landing")}
           >
              <Cpu size={28} className="text-white group-hover:rotate-12 transition-transform" />
           </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex flex-row md:flex-col gap-1 md:gap-3 lg:gap-6 w-full md:px-2 lg:px-4 justify-around md:justify-start flex-1 md:flex-none mt-0 md:mt-8 lg:mt-12 overflow-x-auto md:overflow-y-auto scrollbar-none">
            {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => onViewChange(tab.id as any)}
                className={`
                relative group flex-1 md:w-full h-[50px] lg:h-[60px] flex flex-col items-center justify-center rounded-2xl transition-all shrink-0
                ${currentView === tab.id ? 'text-accent' : 'text-text-dim hover:text-white'}
                `}
            >
                {currentView === tab.id && (
                    <motion.div 
                    layoutId="nav-glow"
                    className="absolute inset-0 bg-accent/10 rounded-2xl border border-accent/20 blur-[2px]"
                    />
                )}
                <div className="relative">
                  <tab.icon size={22} strokeWidth={currentView === tab.id ? 2.5 : 2} />
                  {tab.id === 'feed_coder' && lastNotification && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-[#111]" />
                  )}
                </div>
                <span className="mt-1.5 hidden max-w-full break-words text-center text-[9px] font-black leading-tight opacity-60 sm:block">{tab.label}</span>
            </button>
            ))}
        </div>

        <div className="flex flex-row md:flex-col gap-3 md:gap-5 ml-4 md:ml-0 items-center justify-center w-full relative">
           <LanguageSelector compact />
           {user ? (
             <div className="group relative">
               <button 
                 className="w-12 h-12 flex flex-col items-center justify-center rounded-2xl hover:bg-white/5 text-text-dim hover:text-white transition-colors"
                 title={t("navigation.account")}
               >
                 {user.photoURL ? (
                    <img src={user.photoURL} className="w-6 h-6 rounded-lg grayscale group-hover:grayscale-0 transition-all" alt="Avatar" referrerPolicy="no-referrer" />
                 ) : (
                    <UserIcon size={18} />
                 )}
               </button>
               <div className="absolute bottom-16 left-1/2 hidden w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-1 rounded-xl border border-white/5 bg-[#111] p-2 shadow-xl group-hover:flex md:bottom-auto md:left-full md:top-1/2 md:z-[100] md:-translate-y-1/2 md:translate-x-2">
                 <div className="mb-1 break-words px-2 text-[8px] font-black leading-snug text-text-dim">{t("navigation.loggedInAs")}</div>
                 <div className="break-words px-2 py-1 text-[10px] font-bold text-white">{user.displayName || user.email}</div>
                 <div className="mb-2 break-words px-2 py-0.5 text-[8px] font-black text-accent">{role}</div>
                 <button
                   onClick={logout}
                   className="flex w-full min-w-0 items-center gap-2 rounded-lg p-2 text-left text-xs text-red-400 transition-colors hover:bg-red-500/10 whitespace-normal break-words"
                 >
                   <LogOut size={12} />
                   {t("navigation.logout")}
                 </button>
               </div>
             </div>
           ) : (
             <button 
               onClick={() => onViewChange("landing")}
               className="w-12 h-12 flex flex-col items-center justify-center rounded-2xl hover:bg-white/5 text-text-dim hover:text-white transition-colors"
               title={t("navigation.signIn")}
             >
               <UserIcon size={18} />
             </button>
           )}

           <button 
             onClick={onOpenHelp}
             className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/5 text-text-dim hover:text-white transition-colors"
           >
             <HelpCircle size={22} />
           </button>
        </div>
      </aside>

      {/* Quick Action Button (Floating) */}
      {onAddProject && currentView === "projects" && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddProject}
          className="fixed bottom-[80px] md:bottom-10 right-4 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-white text-black rounded-[24px] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 hover:bg-accent hover:text-white transition-colors group"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform" />
        </motion.button>
      )}
    </div>
  );
}
