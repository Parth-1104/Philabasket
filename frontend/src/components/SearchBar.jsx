import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import { useLocation, useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch, products } = useContext(ShopContext);
    const [visible, setVisible] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    // Configure Fuse.js for "Big Brand" fuzzy matching
    const fuse = new Fuse(products, {
        keys: ['name', 'category', 'country', 'year'],
        threshold: 0.4, // 0.0 is perfect match, 1.0 matches everything. 0.3 is the "Sweet Spot".
        distance: 100
    });

    useEffect(() => {
        if (location.pathname.includes('collection')) {
            setVisible(true);
        } else {
            setVisible(false)
        }
    }, [location])

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (value.length > 1) {
            const results = fuse.search(value).slice(0, 5); // Top 5 relevant suggestions
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    if (!showSearch || !visible) return null;

    return (
        <div className='sticky top-[80px] z-[90] w-full bg-white/90 backdrop-blur-xl border-b border-black/5 animate-fade-in'>
            <div className='max-w-4xl mx-auto px-6 py-8 relative'>
                
                {/* Search Input Label */}
                <p className='text-[9px] tracking-[0.5em] text-[#D4AF37] uppercase font-black mb-4 text-center'>
                    Archives Registry Search
                </p>

                <div className='flex items-center gap-4'>
                    <div className='flex-1 flex items-center bg-[#F9F9F9] border border-black/5 px-6 py-4 rounded-sm focus-within:border-[#BC002D]/40 transition-all'>
                        <img className='w-4 opacity-30 brightness-0' src={assets.search_icon} alt="" />
                        <input 
                            value={search} 
                            onChange={handleSearchChange} 
                            autoFocus
                            className='flex-1 outline-none bg-transparent text-sm ml-4 text-black placeholder:text-gray-300 font-light' 
                            type="text" 
                            placeholder='Search by specimen name, country, or era...'
                        />
                    </div>
                    
                    <button 
                        onClick={() => setShowSearch(false)}
                        className='p-2 hover:rotate-90 transition-transform duration-500'
                    >
                        <img className='w-3 opacity-40 brightness-0' src={assets.cross_icon} alt="Close" />
                    </button>
                </div>

                {/* --- SMART SUGGESTIONS PANEL --- */}
                {suggestions.length > 0 && (
                    <div className='absolute left-6 right-16 mt-2 bg-white border border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden animate-slide-down'>
                        {suggestions.map(({ item }) => (
                            <div 
                                key={item._id}
                                onClick={() => {
                                    setSearch(item.name);
                                    setSuggestions([]);
                                    navigate(`/product/${item._id}`);
                                }}
                                className='flex items-center gap-4 p-4 hover:bg-[#F9F9F9] cursor-pointer transition-colors group'
                            >
                                <img src={item.image[0]} className='w-10 h-10 object-contain bg-white border border-black/5 p-1' alt="" />
                                <div className='flex-1'>
                                    <p className='text-[11px] font-bold text-black uppercase tracking-widest'>{item.name}</p>
                                    <p className='text-[9px] text-[#D4AF37] uppercase tracking-widest'>{item.category[0]} • {item.country}</p>
                                </div>
                                <span className='text-[10px] text-black/10 group-hover:text-[#BC002D] transition-colors'>→</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                .animate-slide-down { animation: slideDown 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    )
}

export default SearchBar