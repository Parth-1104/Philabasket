import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const HorizontalRegistry = ({ dbCategories, searchTerm, setSearchTerm, handleCategoryClick }) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unifiedIndex = useMemo(() => {
        // --- ADD THIS SAFETY CHECK ---
        if (!dbCategories || !Array.isArray(dbCategories)) {
            return [];
        }

        const groupsMap = {};
        const independentList = [];
        const term = searchTerm?.toLowerCase().trim() || "";
        
        const normalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
    
        dbCategories.forEach(cat => {
            // ... rest of your existing logic
            // SAFE CHECKS: Use ?. and fallback to empty string
            const catName = cat.name?.toLowerCase() || ""; 
            const groupNameRaw = cat.group?.trim() || "";
            const groupNameLower = groupNameRaw.toLowerCase();
            
            // Match condition
            const isMatch = catName.includes(term) || groupNameLower.includes(term);
            if (!isMatch && term !== "") return;
    
            const item = { name: normalize(cat.name), count: cat.productCount || 0 };
            
            // Check if independent
            const isIndependent = !groupNameRaw || ['general', 'independent', 'none', ''].includes(groupNameLower);
    
            if (isIndependent) {
                independentList.push({ ...item, type: 'independent' });
            } else {
                const gName = normalize(groupNameRaw);
                if (!groupsMap[gName]) groupsMap[gName] = { name: gName, type: 'group', items: [], totalCount: 0 };
                groupsMap[gName].items.push(item);
                groupsMap[gName].totalCount += item.count;
            }
        });
    
        return [...Object.values(groupsMap), ...independentList].sort((a, b) => a.name.localeCompare(b.name));
    }, [dbCategories, searchTerm]);

    return (
        <div className="w-full bg-[#bd002d] rounded-[25px] lg:rounded-full p-2 mb-10 shadow-xl shadow-[#bd002d]/20 relative z-50">
            <div className="flex flex-col lg:flex-row items-center gap-4 px-4 py-1">
                
                {/* SEARCH BAR SECTION */}
                <div className="relative w-full lg:w-64 shrink-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                    <input 
                        type="text"
                        placeholder="Filter Registry..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-full pl-9 pr-8 py-2 text-[10px] text-white outline-none font-bold tracking-widest placeholder:text-white/40"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* HORIZONTAL SCROLLABLE INDEX */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full hide-scrollbar scroll-smooth">
                    {unifiedIndex.map((entry) => (
                        <div key={entry.name} className="relative shrink-0">
                            {entry.type === 'group' ? (
                                <div className="relative">
                                    <button 
                                        onClick={() => setOpenDropdown(openDropdown === entry.name ? null : entry.name)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                                            ${openDropdown === entry.name ? 'bg-white text-[#bd002d]' : 'text-white/90 hover:bg-white/10'}`}
                                    >
                                        {entry.name} <span className="opacity-60 font-mono">({entry.totalCount})</span>
                                        <ChevronDown size={12} className={`transition-transform ${openDropdown === entry.name ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* DROPDOWN MENU */}
                                    {openDropdown === entry.name && (
                                        <div ref={dropdownRef} className="absolute top-full left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                {entry.items.sort((a,b) => a.name.localeCompare(b.name)).map((sub) => (
                                                    <button 
                                                        key={sub.name}
                                                        onClick={() => { handleCategoryClick(sub.name); setOpenDropdown(null); }}
                                                        className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[#bd002d] rounded-xl flex justify-between items-center transition-colors border-b border-gray-50 last:border-0"
                                                    >
                                                        <span className="capitalize">{sub.name}</span>
                                                        <span className="text-[#bd002d] font-mono">{sub.count}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleCategoryClick(entry.name)}
                                    className="px-4 py-2 rounded-full text-white/90 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all"
                                >
                                    {entry.name} <span className="opacity-60 font-mono">({entry.count})</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HorizontalRegistry;