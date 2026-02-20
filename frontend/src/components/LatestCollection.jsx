import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, ChevronDown, X } from 'lucide-react'; 

const LatestCollection = () => {
    const { products, backendUrl } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    const [openGroups, setOpenGroups] = useState({}); 
    const [searchTerm, setSearchTerm] = useState(""); 
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/list');
            if (response.data.success) {
                setDbCategories(response.data.categories);
            }
        } catch (error) {
            console.error("Category Fetch Error:", error);
        }
    };

    // Filter by newArrival flag and slice for top 16 arrivals
    useEffect(() => {
        if (!products) return;
        const filtered = products
            .filter(item => item.newArrival === true || item.newArrival === "true")
            .sort((a, b) => b.date - a.date)
            .slice(0, 16);
        setLatestProducts(filtered); 
    }, [products]);

    useEffect(() => {
        if (backendUrl) fetchCategories();
    }, [backendUrl]);

    // --- UNIFIED ALPHABETICAL INDEX LOGIC ---
    const unifiedIndex = useMemo(() => {
        if (!dbCategories.length) return [];

        const groupsMap = {};
        const independentList = [];

        // Filter categories based on search term
        const filtered = dbCategories.filter(cat => 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.forEach(cat => {
            const item = { name: cat.name, count: cat.productCount || 0 };
            
            // Check if the category belongs to a group
            if (!cat.group || ['General', 'Independent', 'none', ''].includes(cat.group.trim())) {
                independentList.push({ ...item, type: 'independent' });
            } else {
                const gName = cat.group.trim();
                if (!groupsMap[gName]) {
                    groupsMap[gName] = { name: gName, type: 'group', items: [], totalCount: 0 };
                }
                groupsMap[gName].items.push(item);
                groupsMap[gName].totalCount += item.count;
            }
        });

        // Combine Groups and Independent items into one master list
        const combined = [
            ...Object.values(groupsMap),
            ...independentList
        ];

        // Sort the entire unified registry alphabetically by name
        return combined.sort((a, b) => a.name.localeCompare(b.name));
    }, [dbCategories, searchTerm]);

    const toggleGroup = (groupName) => setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));

    const handleCategoryClick = (catName) => {
        // replace: true swaps the current history entry to prevent back-button loops
        navigate(`/collection?category=${encodeURIComponent(catName)}`, { replace: true });
        window.scrollTo(0, 0);
    };

    const handleProductClick = (productId) => { 
        // Sends priorityId state so Collection page moves this item to index 0
        navigate('/collection', { state: { priorityId: productId } }); 
        window.scrollTo(0, 0); 
    };

    return (
        <div className='bg-white py-12 md:py-32 overflow-hidden select-none relative'>
            <div className="absolute -left-[10vw] top-[10%] h-[80%] w-[35%] bg-[#bd002d]/5 rounded-r-[600px] pointer-events-none"></div>

            <div className='px-6 md:px-16 lg:px-24 relative z-10'>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 border border-[#BC002D] rounded-full flex items-center justify-center">
                                <span className="text-[10px] font-serif italic text-[#BC002D] font-bold">PB</span>
                            </div>
                            <span className="text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black">Featured Specimens</span>
                        </div>
                        <h2 className="text-5xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-none">
                            NEW <span className="text-[#bd002d]">Arrivals.</span>
                        </h2>
                    </div>
                </div>

                <div className='flex flex-col lg:flex-row gap-12'>
                    {/* --- SIDEBAR --- */}
                    <div className='w-full lg:w-[25%]'>
                        <div className='lg:sticky lg:top-32'>
                            <div className='bg-[#bd002d] p-6 lg:p-8 rounded-[30px] lg:rounded-[40px] shadow-2xl shadow-[#bd002d]/20 relative overflow-hidden'>
                                <h3 className='text-white font-black text-[9px] lg:text-xs tracking-[0.3em] uppercase mb-6'>Registry Index</h3>

                                <div className='relative z-10 mb-6'>
                                    <Search size={12} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40' />
                                    <input 
                                        type="text"
                                        placeholder="Search Registry..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-8 py-2.5 text-[10px] text-white outline-none font-bold uppercase tracking-widest"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className='flex flex-col gap-2 overflow-y-auto max-h-[180vh] hide-scrollbar relative z-10 pr-2'>
                                    {unifiedIndex.map((entry) => (
                                        <div key={entry.name} className="flex flex-col">
                                            {entry.type === 'group' ? (
                                                <>
                                                    <button 
                                                        onClick={() => toggleGroup(entry.name)}
                                                        className='text-white/80 hover:text-amber-400 text-[10px] font-black tracking-widest uppercase w-full py-3 px-3 hover:bg-white/5 rounded-xl transition-all flex items-center justify-between group'
                                                    >
                                                        <div className='flex items-center gap-2'>
                                                            <span className='truncate'>{entry.name}</span>
                                                            <span className='text-[8px] opacity-40 font-mono'>({entry.totalCount})</span>
                                                        </div>
                                                        <ChevronDown 
                                                            size={14} 
                                                            className={`transition-transform duration-300 ${openGroups[entry.name] ? 'rotate-180 text-amber-400' : 'opacity-40 group-hover:opacity-100'}`} 
                                                        />
                                                    </button>
                                                    <div className={`flex flex-col gap-1 ml-4 border-l border-white/10 pl-4 transition-all duration-500 overflow-hidden ${openGroups[entry.name] ? 'max-h-[1000px] mt-2 mb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                        {entry.items.sort((a, b) => a.name.localeCompare(b.name)).map((sub) => (
                                                            <button 
                                                                key={sub.name} 
                                                                onClick={() => handleCategoryClick(sub.name)} 
                                                                className='text-white/60 hover:text-white text-[9px] font-bold py-2.5 flex justify-between uppercase border-b border-white/5 last:border-0'
                                                            >
                                                                <span>{sub.name}</span>
                                                                <span className='text-amber-400/60 font-mono'>{sub.count}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => handleCategoryClick(entry.name)} 
                                                    className='text-white/80 hover:text-amber-400 text-[10px] font-black tracking-widest uppercase w-full py-3 px-3 hover:bg-white/5 rounded-xl transition-all flex items-center justify-between group'
                                                >
                                                    <span className='truncate'>{entry.name}</span>
                                                    <span className='text-[8px] opacity-40 font-mono'>{entry.count}</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN PRODUCT GRID */}
                    {/* MAIN PRODUCT GRID */}
<div className='w-full lg:w-3/4'>
    <div className='flex overflow-x-auto lg:grid lg:grid-cols-4 gap-6 md:gap-x-8 gap-y-12 snap-x snap-mandatory px-2'>
        {latestProducts.map((item, index) => (
            <div 
                key={item._id || index} 
                onClick={() => handleProductClick(item._id)} 
                className="min-w-[85%] sm:min-w-[45vw] lg:min-w-[20%] snap-center flex flex-col group bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-br-[40px] md:rounded-br-[60px] overflow-hidden cursor-pointer"
            >
                {/* REMOVED pointer-events-none so buttons work */}
                <div className="relative p-1 md:p-3 flex-grow">
                    <div className="absolute top-0 right-0 z-20 overflow-hidden w-20 h-20 pointer-events-none">
                        <div className="absolute top-[20%] -right-[30%] bg-[#bd002d] text-white text-[7px] font-black py-1 w-[140%] text-center transform rotate-45 shadow-sm uppercase tracking-tighter">New</div>
                    </div>
                    
                    <div className="w-full bg-[#f8f8f8] rounded-br-[35px] md:rounded-br-[45px] p-2">
                        <ProductItem 
                            id={item._id} 
                            _id={item._id} 
                            image={item.image} 
                            name={item.name} 
                            price={item.price} 
                            marketPrice={item.marketPrice} 
                            category={item.category ? item.category[0] : ""} 
                            isPriorityMode={true} 
                        />
                    </div>
                </div>
            </div>
        ))}
    </div>
</div>
                </div>
            </div>
        </div>
    );
};

export default LatestCollection;