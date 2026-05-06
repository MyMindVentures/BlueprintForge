import { tx } from '../../i18n/I18nProvider';
import React, { useState, useMemo } from "react";
import { Plus, Layout } from "lucide-react";
import { Project } from "../../types";
import { ProjectCard } from "./ProjectCard";
import { SearchInput } from "../ui/SearchInput";
import { FilterBar } from "../ui/FilterBar";
import { EmptyState } from "../ui/EmptyState";

interface ProjectDashboardProps {
  projects: Project[];
  onNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onExport: (id: string) => void;
}

/**
 * Handles the project dashboard workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function ProjectDashboard({ 
  projects, onNew, onOpen, onDelete, onDuplicate, onRename, onExport 
}: ProjectDashboardProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filterOptions = [
    { id: "all", label:tx("uiStrings.components.projects.projectdashboard.001") },
    { id: "Draft", label:tx("uiStrings.components.projects.projectdashboard.002") },
    { id: "Converted", label:tx("uiStrings.components.projects.projectdashboard.003") },
    { id: "Updated", label:tx("uiStrings.components.projects.projectdashboard.004") }
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.rawConcept.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || p.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8 md:p-12 scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
                <Layout size={12} />{tx("uiLegacy.components.projects.projectdashboard.001")}</div>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">{tx("uiLegacy.components.projects.projectdashboard.002")}<span className="text-accent underline decoration-white/10 underline-offset-8">{tx("uiLegacy.components.projects.projectdashboard.003")}</span>
             </h1>
             <p className="text-text-dim text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">{tx("uiLegacy.components.projects.projectdashboard.004")}</p>
          </div>
          
          <button
            onClick={onNew}
            className="glass-btn-primary w-full lg:w-auto !h-14 sm:!h-16 !px-10 !text-sm !font-black !rounded-[24px] shadow-[0_20px_40px_rgba(255,107,0,0.2)]"
          >
            <Plus size={20} />{tx("uiLegacy.components.projects.projectdashboard.005")}</button>
        </div>

        {/* Browser / Tools Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
           <SearchInput 
             value={search} 
             onChange={setSearch} 
             placeholder={tx("uiLegacy.components.projects.projectdashboard.006")}
             className="flex-1 w-full"
           />
           <FilterBar 
             options={filterOptions} 
             activeId={filter} 
             onChange={setFilter} 
             className="shrink-0"
           />
        </div>

        {/* Content Section */}
        {projects.length === 0 ? (
          <div className="pt-20">
            <EmptyState 
              icon={Layout} 
              title={tx("uiLegacy.components.projects.projectdashboard.007")} 
              description={tx("uiLegacy.components.projects.projectdashboard.008")}
              action={
                <button
                  onClick={onNew}
                  className="glass-btn-primary !px-10 !py-4"
                >
                  <Plus size={20} />{tx("uiLegacy.components.projects.projectdashboard.009")}</button>
              }
            />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="pt-20">
             <EmptyState 
                icon={Plus} 
                title={tx("uiLegacy.components.projects.projectdashboard.010")} 
                description={`We couldn't find any projects matching "${search}" in logic group "${filter}".`}
                action={
                  <button onClick={() => { setSearch(""); setFilter("all"); }} className="text-accent font-black uppercase text-[11px] tracking-widest hover:underline">{tx("uiLegacy.components.projects.projectdashboard.011")}</button>
                }
             />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onOpen={onOpen}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onRename={onRename}
                onExport={onExport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
