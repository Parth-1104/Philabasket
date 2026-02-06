import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch, backendUrl } = useContext(ShopContext);
    const [visible, setVisible] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const debounceTimeout = useRef(null);

    useEffect(() => {
        if (location.pathname.includes('collection')) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [location]);

    /**
     * ADVANCED SEARCH STRATEGY:
     * 1. Backend uses regex 'i' flag for mid-name matches.
     * 2. Backend text index handles multi-field fuzzy matching.
     */
    const fetchSuggestions = async (query) => {
        if (!query || query.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${backendUrl}/api/product/list`, {
                params: { 
                    search: query.trim(), 
                    limit: 8,
                    // We send a 'fuzzy' flag so your backend knows to use Regex/Fuzzy logic
                    fuzzy: true 
                }
            });

            if (response.data.success) {
                setSuggestions(response.data.products);
            }
        } catch (error) {
            console.error("Search Suggestion Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        
        debounceTimeout.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 350); // Slightly longer debounce for heavier fuzzy queries
    };

    if (!showSearch || !visible) return null;

    return (
        <div className='sticky top-[80px] z-[90] w-full bg-white/90 backdrop-blur-xl border-b border-black/5 animate-fade-in'>
            <div className='max-w-4xl mx-auto px-6 py-8 relative'>
                
                <p className='text-[9px] tracking-[0.5em] text-[#BC002D] uppercase font-black mb-4 text-center'>
                    Registry Smart-Match Search
                </p>

                <div className='flex items-center gap-4'>
                    <div className='flex-1 flex items-center bg-[#F9F9F9] border border-black/5 px-6 py-4 rounded-sm focus-within:border-[#BC002D]/40 transition-all'>
                        {loading ? (
                            <div className='w-4 h-4 border-2 border-[#BC002D] border-t-transparent rounded-full animate-spin'></div>
                        ) : (
                            <img className='w-4 opacity-30 brightness-0' src={assets.search_icon} alt="" />
                        )}
                        <input 
                            value={search} 
                            onChange={handleSearchChange} 
                            autoFocus
                            className='flex-1 outline-none bg-transparent text-sm ml-4 text-black placeholder:text-gray-300 font-light' 
                            type="text" 
                            placeholder='Try searching "Victoria" or "1854"...'
                        />
                    </div>
                    
                    <button onClick={() => { setShowSearch(false); setSuggestions([]); }} className='p-2'>
                        <img className='w-3 opacity-40 brightness-0' src={assets.cross_icon} alt="Close" />
                    </button>
                </div>

                {/* --- SMART SUGGESTIONS PANEL --- */}
                {suggestions.length > 0 && (
                    <div className='absolute left-6 right-16 mt-2 bg-white border border-black/5 shadow-2xl rounded-sm overflow-hidden z-[100]'>
                        {suggestions.map((item) => (
                            <div 
                                key={item._id}
                                onClick={() => {
                                    setSearch(item.name);
                                    setSuggestions([]);
                                    navigate(`/product/${item._id}`);
                                }}
                                className='flex items-center gap-4 p-4 hover:bg-[#F9F9F9] cursor-pointer group border-b border-black/[0.02] last:border-none'
                            >
                                <img src={item.image[0]} className='w-12 h-12 object-contain bg-white border border-black/5 p-1' alt="" />
                                <div className='flex-1'>
                                    <p className='text-[11px] font-black text-black uppercase tracking-widest'>
                                        {/* Highlight the match if possible (Visual feedback for mid-name match) */}
                                        {item.name}
                                    </p>
                                    <p className='text-[8px] text-[#BC002D] font-bold uppercase tracking-[0.2em] mt-1'>
                                        {item.country} • {item.year} • {item.category[0]}
                                    </p>
                                </div>
                                <span className='text-[9px] font-black text-gray-300 group-hover:text-[#BC002D] transition-colors'>MATCH FOUND →</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- "NO RESULTS" SUGGESTION --- */}
                {!loading && search.length >= 2 && suggestions.length === 0 && (
                    <div className='absolute left-6 right-16 mt-2 bg-white p-6 border border-black/5 shadow-xl text-center'>
                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>No exact matches in registry.</p>
                        <p className='text-[9px] text-gray-300 uppercase mt-1'>Check your spelling or try a different era.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchBar;