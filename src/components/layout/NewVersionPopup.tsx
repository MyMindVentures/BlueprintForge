import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGuide } from '../../hooks/useGuide';
import { useI18n } from '../../i18n/I18nProvider';

interface NewVersionPopupProps {
  onOpenChangelog: () => void;
}

/**
 * Handles the new version popup workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function NewVersionPopup({ onOpenChangelog }: NewVersionPopupProps) {
  const { profile, acknowledgeVersion } = useAuth();
  const { latestVersion } = useGuide();
  const { t, formatDate } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (
      profile?.role === 'vibe_coder' &&
      latestVersion?.version &&
      (!profile.acknowledged_versions || !profile.acknowledged_versions.includes(latestVersion.version))
    ) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [profile, latestVersion]);

  if (!isVisible || !latestVersion) return null;

  const handleAcknowledge = async () => {
    setIsVisible(false);
    await acknowledgeVersion(latestVersion.version);
  };

  const handleOpenChangelog = () => {
    onOpenChangelog();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-black/90 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-4 text-accent">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-xl font-bold text-white tracking-tight">{t("changelog.newVersionDeployed")}</h3>
        </div>
        
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white/50 tracking-wider uppercase">{t("changelog.version")}</span>
            <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-mono rounded font-bold">{latestVersion.version}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white/50 tracking-wider uppercase">{t("changelog.date")}</span>
            <span className="text-sm text-white/80">
              {latestVersion.created_at ? formatDate(latestVersion.created_at, { dateStyle: 'medium' }) : t('states.justNow')}
            </span>
          </div>
          <p className="text-sm text-white/80 mt-4 border-t border-white/5 pt-4">
            {latestVersion.release_notes || t('changelog.defaultReleaseNotes')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleOpenChangelog}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-colors border border-white/10 flex justify-center items-center gap-2"
          >
            {t("buttons.viewChangelog")}
          </button>
          <button 
            onClick={handleAcknowledge}
            className="flex-1 px-4 py-2 bg-accent hover:bg-accent/90 text-black rounded-lg text-sm font-black transition-colors flex justify-center items-center gap-2"
          >
            {t("buttons.gotIt")} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
