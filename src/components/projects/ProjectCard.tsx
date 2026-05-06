import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Pencil, Copy, FileText, Trash2, Clock, ExternalLink } from "lucide-react";
import { Project } from "../../types";
import { useToast } from "../ui/Toast";
import { GlassCard } from "../ui/GlassCard";
import { StatusBadge } from "../ui/StatusBadge";
import { useI18n } from '../../i18n/I18nProvider';

interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onExport: (id: string) => void;
}

/**
 * Handles the project card workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export function ProjectCard({ 
  project, onOpen, onDelete, onDuplicate, onRename, onExport 
}: ProjectCardProps) {
  const { formatRelativeTime } = useI18n();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editName.trim() && editName !== project.name) {
      try {
        onRename(project.id, editName.trim());
        toast.success("Project renamed");
      } catch (e) {
        toast.error("Rename failed");
      }
    } else {
      setEditName(project.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditName(project.name);
      setIsEditing(false);
    }
  };

  const statusMap: Record<string, "info" | "success" | "warning" | "idle"> = {
    Draft: "idle",
    Converted: "success",
    Updated: "warning"
  };

  return (
    <GlassCard 
      className="group flex flex-col h-[340px] relative overflow-hidden flex-shrink-0"
      onClick={() => !isEditing && onOpen(project.id)}
    >
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <StatusBadge 
          label={project.status} 
          status={statusMap[project.status] || "idle"} 
        />
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <IconButton 
            icon={<Copy size={14} />} 
            title="Duplicate" 
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(project.id);
            }} 
          />
          <IconButton 
            icon={<FileText size={14} />} 
            title="Export Markdown" 
            onClick={(e) => {
              e.stopPropagation();
              onExport(project.id);
            }} 
          />
          <IconButton 
            icon={<Trash2 size={14} />} 
            variant="danger"
            title="Delete" 
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${project.name}"?`)) onDelete(project.id);
            }} 
          />
        </div>
      </div>

      <div className="flex-1 relative z-10 mt-2">
        <div className="h-10 mb-2">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-black/40 border border-accent/50 rounded-xl px-3 py-1.5 text-base font-black text-white focus:outline-none"
            />
          ) : (
            <div className="flex items-center gap-2 group/title">
              <h3 className="text-xl font-black text-white line-clamp-1 group-hover:text-accent transition-colors">
                {project.name}
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }} 
                className="opacity-0 group-hover/title:opacity-100 p-1.5 hover:bg-white/5 rounded-lg text-text-dim hover:text-white transition-opacity"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>
        
        <p className="text-text-dim text-sm line-clamp-4 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
          {project.rawConcept || "Enter your app concept to begin architecture mapping."}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-[10px] text-text-dim uppercase tracking-widest font-black opacity-40 group-hover:opacity-80 transition-opacity">
          <Clock size={12} className="text-accent" />
          {formatRelativeTime(project.updatedAt)}
        </div>
        <button
          className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] uppercase font-black tracking-widest transition-colors group/btn"
        >
          Inspect <ExternalLink size={12} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </GlassCard>
  );
}

function IconButton({ icon, title, onClick, variant = "normal" }: { icon: React.ReactNode; title: string; onClick: (e: any) => void; variant?: "normal" | "danger" }) {
  const { formatRelativeTime } = useI18n();
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-2 glass rounded-xl transition-all ${
        variant === "danger" 
          ? "hover:bg-red-500/20 text-text-dim hover:text-red-400 border-white/5 hover:border-red-500/20" 
          : "hover:bg-white/10 text-white/40 hover:text-white border-white/5"
      }`}
    >
      {icon}
    </button>
  );
}
