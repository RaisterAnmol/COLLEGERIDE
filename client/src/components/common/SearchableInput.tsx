import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X, Sparkles } from "lucide-react";
import { AcademicOption } from "../../data/academicData";

interface SearchableInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: AcademicOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  helperText?: string;
  error?: string;
  id?: string;
}

export const SearchableInput: React.FC<SearchableInputProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Search or type custom...",
  required = false,
  disabled = false,
  icon,
  helperText,
  error,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal search input with external value
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      // Show top suggestions (e.g. first 25)
      return options.slice(0, 25);
    }

    const matches = options.filter((item) => {
      if (item.label.toLowerCase().includes(q)) return true;
      if (item.subtext?.toLowerCase().includes(q)) return true;
      if (item.aliases?.some((a) => a.toLowerCase().includes(q))) return true;
      return false;
    });

    // Score / prioritize startsWith matches first
    matches.sort((a, b) => {
      const aStarts = a.label.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.label.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });

    return matches.slice(0, 30);
  }, [options, searchTerm]);

  // Check if current search term is an exact match for an existing option
  const exactMatch = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return options.some((opt) => opt.label.toLowerCase() === q);
  }, [options, searchTerm]);

  const showCustomOption = searchTerm.trim().length > 0 && !exactMatch;

  // Total selectable items count (filtered + 1 if custom option shown)
  const totalItems = filteredOptions.length + (showCustomOption ? 1 : 0);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // If user left raw text in search without choosing, keep whatever they typed
        if (searchTerm !== value) {
          onChange(searchTerm);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm, value, onChange]);

  const handleSelect = (selectedVal: string) => {
    setSearchTerm(selectedVal);
    onChange(selectedVal);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(totalItems - 1);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
      }
    } else if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0) {
        e.preventDefault();
        if (showCustomOption && highlightedIndex === 0) {
          handleSelect(searchTerm.trim());
        } else {
          const optIdx = showCustomOption ? highlightedIndex - 1 : highlightedIndex;
          if (filteredOptions[optIdx]) {
            handleSelect(filteredOptions[optIdx].label);
          }
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Tab") {
      if (isOpen) {
        setIsOpen(false);
        if (searchTerm !== value) {
          onChange(searchTerm);
        }
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchTerm("");
    onChange("");
    setIsOpen(true);
    inputRef.current?.focus();
  };

  // Helper to highlight matching letters in search results
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="font-extrabold text-emerald-600 bg-emerald-50 rounded-xs px-0.5">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex justify-between items-center mb-1">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 select-none"
        >
          {label} {required && <span className="text-emerald-500">*</span>}
        </label>
        {helperText && (
          <span className="text-[10px] text-slate-400 hidden sm:inline-block">
            {helperText}
          </span>
        )}
      </div>

      <div
        className={`relative flex items-center w-full rounded-xl border transition-all duration-150 bg-white ${
          error
            ? "border-rose-400 focus-within:ring-2 focus-within:ring-rose-400"
            : isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
            : "border-slate-300 hover:border-slate-400 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
        } ${disabled ? "bg-slate-100 cursor-not-allowed opacity-75" : ""}`}
      >
        {/* Left Icon */}
        <div className="pl-3 pr-1 text-slate-400 shrink-0 select-none">
          {icon || <Search className="w-4 h-4" />}
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={searchTerm}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          required={required && !value}
          onFocus={() => setIsOpen(true)}
          onBlur={(e) => {
            if (!containerRef.current?.contains(e.relatedTarget as Node)) {
              setIsOpen(false);
              if (searchTerm !== value) {
                onChange(searchTerm);
              }
            }
          }}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            onChange(val);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className="w-full text-sm py-2.5 px-2 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium"
        />

        {/* Right Action Buttons */}
        <div className="pr-2 flex items-center gap-1 shrink-0">
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Clear text"
              tabIndex={-1}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            tabIndex={-1}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-emerald-600" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

      {/* Floating Suggestions Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 max-h-72 flex flex-col">
          {/* Header indicator */}
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              {searchTerm.trim() ? "Search Suggestions" : "Popular Suggestions"}
            </span>
            <span className="text-[10px] text-slate-400">
              {filteredOptions.length} available
            </span>
          </div>

          <ul
            ref={listRef}
            className="overflow-y-auto divide-y divide-slate-50 py-1 text-sm focus:outline-none"
            role="listbox"
          >
            {/* Custom Option pill if typing something unique */}
            {showCustomOption && (
              <li
                key="custom-write-in"
                role="option"
                aria-selected={highlightedIndex === 0}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(searchTerm.trim());
                }}
                className={`px-3 py-2.5 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                  highlightedIndex === 0
                    ? "bg-emerald-500 text-white font-medium"
                    : "bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold shrink-0">✏️ Use Custom:</span>
                  <span className="truncate italic">"{searchTerm.trim()}"</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    highlightedIndex === 0
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-200/60 text-emerald-800"
                  }`}
                >
                  Enter
                </span>
              </li>
            )}

            {filteredOptions.length === 0 && !showCustomOption && (
              <li className="px-4 py-6 text-center text-xs text-slate-400">
                No matching options found.
              </li>
            )}

            {filteredOptions.map((opt, idx) => {
              const itemIndex = showCustomOption ? idx + 1 : idx;
              const isSelected = value.toLowerCase() === opt.label.toLowerCase();
              const isHighlighted = highlightedIndex === itemIndex;

              return (
                <li
                  key={`${opt.label}-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt.label);
                  }}
                  onMouseEnter={() => setHighlightedIndex(itemIndex)}
                  className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                    isHighlighted
                      ? "bg-emerald-50 text-emerald-950 font-medium"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-xs sm:text-sm font-semibold truncate text-slate-800">
                      {renderHighlightedText(opt.label, searchTerm)}
                    </div>
                    {(opt.subtext || opt.category) && (
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                        {opt.category && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-medium">
                            {opt.category}
                          </span>
                        )}
                        {opt.subtext && <span>{opt.subtext}</span>}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>

          {/* Footer keyboard tip */}
          <div className="px-3 py-1 bg-slate-50/80 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Use ↑↓ keys to navigate</span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
};
