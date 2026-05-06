import React from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search...", className = "" }: SearchInputProps) {
  return (
    <div className={`relative group ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all shadow-inner"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
