import { tx } from '../../i18n/I18nProvider';
import React, { useState } from 'react';
import { useBuildFeed } from '../../hooks/useBuildFeed';
import { Save, CheckCircle2, AlertCircle, Star, Github } from 'lucide-react';
import { useToast } from '../ui/Toast';

/**
 * Handles the builder profile workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function BuilderProfile() {
  const { currentUser, currentUserProfile, saveProfile } = useBuildFeed();
  const { success } = useToast();
  
  const [formData, setFormData] = useState({
    name: currentUserProfile?.name || '',
    username: currentUserProfile?.username || '',
    email: currentUserProfile?.email || '',
    country: currentUserProfile?.country || '',
    timezone: currentUserProfile?.timezone || '',
    skills: currentUserProfile?.skills || '',
    preferred_stack: currentUserProfile?.preferred_stack || '',
    portfolio_url: currentUserProfile?.portfolio_url || '',
    github_url: currentUserProfile?.github_url || '',
    twitter_url: currentUserProfile?.twitter_url || '',
    availability: currentUserProfile?.availability || '',
    bio: currentUserProfile?.bio || '',
    looking_for_paid_work: currentUserProfile?.looking_for_paid_work ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(formData);
    success("Profile saved successfully");
  };

  if (currentUser?.role !== 'vibe_coder') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0A0A0A] p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto opacity-50" />
          <h2 className="text-xl font-bold text-white">{tx("uiLegacy.components.buildfeed.builderprofile.001")}</h2>
          <p className="text-sm text-text-dim max-w-md">{tx("uiLegacy.components.buildfeed.builderprofile.002")}</p>
        </div>
      </div>
    );
  }

  const isComplete = currentUserProfile?.status !== 'Incomplete Profile' && currentUserProfile?.status !== undefined;

  return (
    <div className="flex-1 overflow-auto bg-[#0A0A0A] p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">{tx("uiLegacy.components.buildfeed.builderprofile.003")}</h1>
            <p className="text-sm text-text-dim">{tx("uiLegacy.components.buildfeed.builderprofile.004")}</p>
          </div>
          <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center gap-2 ${
            currentUserProfile?.status === 'Verified Builder' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            currentUserProfile?.status === 'Active Builder' ? 'bg-accent/10 text-accent border-accent/20' :
            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
          }`}>
            {currentUserProfile?.status === 'Verified Builder' && <CheckCircle2 className="w-4 h-4" />}
            {currentUserProfile?.status || 'Incomplete Profile'}
          </div>
        </div>

        {!isComplete && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-2xl flex gap-4 text-yellow-400/90 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p><strong>{tx("uiLegacy.components.buildfeed.builderprofile.005")}</strong>{tx("uiLegacy.components.buildfeed.builderprofile.006")}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.007")}</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.008")}</label>
              <input required name="username" value={formData.username} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.009")}</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.010")}</label>
              <input required name="country" value={formData.country} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.011")}</label>
              <input name="timezone" placeholder={tx("uiLegacy.components.buildfeed.builderprofile.012")} value={formData.timezone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.013")}</label>
              <select name="availability" value={formData.availability} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50 appearance-none">
                <option value="">{tx("uiLegacy.components.buildfeed.builderprofile.014")}</option>
                <option value="Full-time">{tx("uiLegacy.components.buildfeed.builderprofile.015")}</option>
                <option value="Part-time">{tx("uiLegacy.components.buildfeed.builderprofile.016")}</option>
                <option value="Weekends only">{tx("uiLegacy.components.buildfeed.builderprofile.017")}</option>
                <option value="Unavailable">{tx("uiLegacy.components.buildfeed.builderprofile.018")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">{tx("uiLegacy.components.buildfeed.builderprofile.019")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.020")}</label>
                <input required name="skills" placeholder={tx("uiLegacy.components.buildfeed.builderprofile.021")} value={formData.skills} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.022")}</label>
                <input required name="preferred_stack" placeholder={tx("uiLegacy.components.buildfeed.builderprofile.023")} value={formData.preferred_stack} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.024")}</label>
                <input type="url" name="github_url" value={formData.github_url} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.025")}</label>
                <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">{tx("uiLegacy.components.buildfeed.builderprofile.026")}</label>
              <textarea name="bio" rows={3} value={formData.bio} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50 resize-none" />
            </div>

            <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
              <input type="checkbox" id="paid_work" name="looking_for_paid_work" checked={formData.looking_for_paid_work} onChange={handleChange} className="w-4 h-4 accent-accent rounded" />
              <label htmlFor="paid_work" className="text-sm font-medium text-white select-none">{tx("uiLegacy.components.buildfeed.builderprofile.027")}</label>
            </div>
          </div>

          <div className="flex flex-wrap flex-col md:flex-row justify-end pt-4 border-t border-white/5">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-accent text-white px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-accent/90 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)] w-full md:w-auto"
            >
              <Save className="w-4 h-4" />{tx("uiLegacy.components.buildfeed.builderprofile.028")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
