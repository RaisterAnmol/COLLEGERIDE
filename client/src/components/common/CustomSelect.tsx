import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string | number;
  label: string;
  secondaryLabel?: string;
  group?: string;
  disabled?: boolean;
}

export interface CustomSelectGroup {
  group: string;
  options: CustomSelectOption[];
}

export interface CustomSelectProps {
  value: string | number;
  onChange: (val: any) => void;
  options?: (CustomSelectOption | string | number)[];
  groups?: CustomSelectGroup[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  icon?: React.ReactNode;
  id?: string;
  name?: string;
  required?: boolean;
  ariaLabel?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options = [],
  groups,
  label,
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  triggerClassName = '',
  popoverClassName = '',
  icon,
  id,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [typeAheadQuery, setTypeAheadQuery] = useState('');
  const typeAheadTimerRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Normalize options into flat array and grouped structure
  const normalizedOptions: CustomSelectOption[] = React.useMemo(() => {
    if (groups && groups.length > 0) {
      const list: CustomSelectOption[] = [];
      groups.forEach((g) => {
        g.options.forEach((opt) => {
          list.push({ ...opt, group: opt.group || g.group });
        });
      });
      return list;
    }

    return options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { value: opt, label: String(opt) };
      }
      return opt;
    });
  }, [options, groups]);

  // Group normalized options for display
  const groupedDisplay = React.useMemo(() => {
    if (groups && groups.length > 0) {
      return groups;
    }

    const hasAnyGroup = normalizedOptions.some((o) => !!o.group);
    if (!hasAnyGroup) {
      return [{ group: '', options: normalizedOptions }];
    }

    const map = new Map<string, CustomSelectOption[]>();
    normalizedOptions.forEach((opt) => {
      const grp = opt.group || '';
      if (!map.has(grp)) {
        map.set(grp, []);
      }
      map.get(grp)!.push(opt);
    });

    return Array.from(map.entries()).map(([group, opts]) => ({
      group,
      options: opts,
    }));
  }, [normalizedOptions, groups]);

  // Selected Option Object
  const selectedOption = normalizedOptions.find((o) => String(o.value) === String(value));

  // Helper to split long labels into line 1 (short name) and line 2 (full/secondary details)
  const parseLabel = (labelStr: string, explicitSecondary?: string) => {
    if (explicitSecondary) {
      return { primary: labelStr, secondary: explicitSecondary };
    }
    // Check if label contains bracketed subtext like: "Premnagar Chowk (Market Junction)"
    const match = labelStr.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      return { primary: match[1].trim(), secondary: match[2].trim() };
    }
    return { primary: labelStr, secondary: undefined };
  };

  // Close on Outside Click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Handle open state & focus sync
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((o) => String(o.value) === String(value));
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, normalizedOptions, value]);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const el = listboxRef.current.querySelector(`[data-index="${focusedIndex}"]`);
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  const selectOption = useCallback(
    (opt: CustomSelectOption) => {
      if (opt.disabled) return;
      onChange(opt.value);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  // Keyboard navigation & accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;

      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < normalizedOptions.length - 1 ? prev + 1 : prev));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;

      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setFocusedIndex(normalizedOptions.length - 1);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < normalizedOptions.length) {
          selectOption(normalizedOptions[focusedIndex]);
        }
        break;

      default:
        // Type-ahead functionality
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const nextQuery = typeAheadQuery + e.key.toLowerCase();
          setTypeAheadQuery(nextQuery);

          if (typeAheadTimerRef.current) {
            window.clearTimeout(typeAheadTimerRef.current);
          }
          typeAheadTimerRef.current = window.setTimeout(() => {
            setTypeAheadQuery('');
          }, 800);

          const matchIdx = normalizedOptions.findIndex((o) =>
            o.label.toLowerCase().startsWith(nextQuery)
          );
          if (matchIdx >= 0) {
            setFocusedIndex(matchIdx);
          }
        }
        break;
    }
  };

  const selectedParsed = selectedOption
    ? parseLabel(selectedOption.label, selectedOption.secondaryLabel)
    : null;

  return (
    <div
      ref={containerRef}
      className={`relative select-none text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Optional Top Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-ink-primary mb-1.5 flex items-center gap-1 font-mono"
        >
          {icon}
          <span>{label}</span>
        </label>
      )}

      {/* Trigger Button - Form field styling with maroon focus and rotating chevron */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label || placeholder}
        className={`w-full min-h-[46px] flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl border bg-white text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-2xs outline-none ${
          isOpen
            ? 'border-[#582C4D] ring-2 ring-[#582C4D]/20'
            : 'border-slate-200/90 hover:border-slate-300 focus:border-[#582C4D] focus:ring-2 focus:ring-[#582C4D]/20'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
          {icon && !label && <span className="shrink-0 text-slate-500">{icon}</span>}
          {selectedParsed ? (
            <div className="min-w-0 flex-1 leading-snug">
              <span className="font-bold text-ink-primary block truncate">
                {selectedParsed.primary}
              </span>
              {selectedParsed.secondary && (
                <span className="text-[10px] text-ink-muted block truncate font-medium">
                  {selectedParsed.secondary}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-medium truncate">{placeholder}</span>
          )}
        </div>

        {/* Chevron that rotates 180° when open */}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#582C4D]' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown - Identical design to CampusDatePicker */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute left-0 top-full mt-2 z-[150] w-full min-w-[260px] sm:min-w-[320px] max-w-[calc(100vw-32px)] bg-white rounded-3xl border border-slate-200/90 shadow-[0_25px_60px_rgba(0,0,0,0.22)] p-3 text-slate-800 ${popoverClassName}`}
          >
            {/* Options Listbox Container with Thin Custom Scrollbar */}
            <div
              ref={listboxRef}
              role="listbox"
              tabIndex={-1}
              aria-activedescendant={
                focusedIndex >= 0 ? `${selectId}-opt-${focusedIndex}` : undefined
              }
              className="max-h-[340px] overflow-y-auto space-y-1 pr-1 custom-scrollbar"
            >
              {groupedDisplay.map((grp, gIdx) => {
                return (
                  <div key={`group-${gIdx}`} className={gIdx > 0 ? 'border-t border-slate-100 pt-2 mt-2' : ''}>
                    {/* Monospace Group Header */}
                    {grp.group && (
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        {grp.group}
                      </div>
                    )}

                    {/* Group Options */}
                    <div className="space-y-1">
                      {grp.options.map((opt) => {
                        const optIndex = normalizedOptions.indexOf(opt);
                        const isSelected = String(opt.value) === String(value);
                        const isFocused = focusedIndex === optIndex;
                        const parsed = parseLabel(opt.label, opt.secondaryLabel);

                        return (
                          <div
                            key={`opt-${opt.value}-${optIndex}`}
                            id={`${selectId}-opt-${optIndex}`}
                            data-index={optIndex}
                            role="option"
                            aria-selected={isSelected}
                            aria-disabled={opt.disabled}
                            onClick={() => selectOption(opt)}
                            onMouseEnter={() => setFocusedIndex(optIndex)}
                            className={`group w-full px-3 py-2.5 rounded-[14px] text-xs transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-[#582C4D] text-white shadow-xs font-bold'
                                : isFocused
                                ? 'bg-[#582C4D]/10 text-[#582C4D]'
                                : 'text-slate-800 hover:bg-[#582C4D]/10 hover:text-[#582C4D]'
                            } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            <div className="min-w-0 flex-1 text-left">
                              {/* Short name on line one - never truncated */}
                              <div
                                className={`text-xs font-bold ${
                                  isSelected ? 'text-white' : 'text-slate-900 group-hover:text-[#582C4D]'
                                }`}
                              >
                                {parsed.primary}
                              </div>

                              {/* Full details on line two smaller and lighter */}
                              {parsed.secondary && (
                                <div
                                  className={`text-[10px] mt-0.5 font-normal leading-tight ${
                                    isSelected
                                      ? 'text-white/80'
                                      : 'text-slate-500 group-hover:text-[#582C4D]/80'
                                  }`}
                                >
                                  {parsed.secondary}
                                </div>
                              )}
                            </div>

                            {/* Checkmark indicator for selected item */}
                            {isSelected && (
                              <Check className="w-4 h-4 text-white shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer Info (Matches CampusDatePicker) */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Verified Campus Transit</span>
              <span className="text-[#582C4D] font-bold">Select to Apply</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

