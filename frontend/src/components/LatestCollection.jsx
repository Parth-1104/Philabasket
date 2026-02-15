import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShoppingCart, Zap, ChevronDown, Plus, Minus, Search, X } from 'lucide-react'; 

const LatestCollection = () => {
    const { products, backendUrl, addToCart } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    const [openGroups, setOpenGroups] = useState({}); 
    const [showAllIndependent, setShowAllIndependent] = useState(false);
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

    useEffect(() => {
        setLatestProducts(products.slice(0, 9)); 
    }, [products]);

    useEffect(() => {
        if (backendUrl) fetchCategories();
    }, [backendUrl]);

    // Updated Memo to handle Search Filtering
    const { grouped, independent } = useMemo(() => {
        const groupedResult = {};
        const independentResult = [];
    
        if (!dbCategories.length || !products.length) {
            return { grouped: {}, independent: [] };
        }

        // Filter categories based on search input
        const filteredCategories = dbCategories.filter(cat => 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
        filteredCategories.forEach(cat => {
            const count = products.filter(p => {
                if (p.category && Array.isArray(p.category)) {
                    return p.category.some(item => 
                        item.trim().toLowerCase() === cat.name.trim().toLowerCase()
                    );
                }
                return p.category === cat.name;
            }).length;
    
            const item = { name: cat.name, count };
    
            if (!cat.group || ['General', 'Independent', 'none', ''].includes(cat.group)) {
                independentResult.push(item);
            } else {
                if (!groupedResult[cat.group]) groupedResult[cat.group] = [];
                groupedResult[cat.group].push(item);
            }
        });
    
        return { grouped: groupedResult, independent: independentResult };
    }, [dbCategories, products, searchTerm]);

    const toggleGroup = (groupName) => {
        setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    const handleCategoryClick = (catName) => {
        navigate(`/collection?category=${encodeURIComponent(catName)}`);
        window.scrollTo(0, 0);
    };

    const handleProductClick = (productId) => { navigate('/collection', { state: { priorityId: productId } }); window.scrollTo(0, 0); };
    const onAddToCart = (e, productId) => { e.stopPropagation(); addToCart(productId, 1); toast.success("Added to Registry", { position: "bottom-right", autoClose: 1000 }); };
    const onBuyNow = async (e, productId) => { e.stopPropagation(); await addToCart(productId, 1); navigate('/cart'); window.scrollTo(0, 0); };

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
                    <div className='w-full lg:w-1/4'>
                        <div className='lg:sticky lg:top-32'>
                            <div className='bg-[#bd002d] p-6 lg:p-8 rounded-[30px] lg:rounded-[40px] shadow-2xl shadow-[#bd002d]/20 relative overflow-hidden'>
                                <div className='flex items-center justify-between mb-6 relative z-10'>
                                    <h3 className='text-white font-black text-[9px] lg:text-xs tracking-[0.3em] uppercase'>Registry Index</h3>
                                    
                                    {/* MOBILE ONLY TOGGLE */}
                                    <button 
                                        onClick={() => setShowAllIndependent(!showAllIndependent)} 
                                        className='text-amber-400 text-[8px] lg:hidden font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full'
                                    >
                                        {showAllIndependent ? 'View Less' : 'View All'}
                                    </button>
                                </div>

                                {/* --- SEARCH INPUT --- */}
                                <div className='relative z-10 mb-6 group'>
                                    <div className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-amber-400 transition-colors'>
                                        <Search size={12} />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Search Registry..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-8 py-2.5 text-[10px] text-white placeholder:text-white/40 outline-none focus:border-amber-400/50 transition-all font-bold uppercase tracking-widest"
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm("")}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className='flex flex-col gap-2 overflow-y-auto max-h-[180vh] hide-scrollbar relative z-10 pr-2'>
                                    {/* --- 1. GROUPED SECTION --- */}
                                    {Object.keys(grouped).sort().map((groupName) => (
                                        <div key={groupName} className="flex flex-col mb-1">
                                            <div 
                                                className='flex items-center justify-between cursor-pointer py-3 border-b border-white/10 hover:bg-white/5 px-2 rounded-lg transition-all' 
                                                onClick={() => toggleGroup(groupName)}
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.15em] hover:text-white transition-all text-left leading-tight max-w-[140px]">
                                                        {groupName}
                                                    </span>
                                                    <span className='text-[8px] text-white/40 font-bold tabular-nums'>
                                                        ({grouped[groupName].reduce((sum, c) => sum + c.count, 0)})
                                                    </span>
                                                </div>
                                                <ChevronDown size={14} className={`text-amber-400 transition-transform duration-300 ${openGroups[groupName] ? 'rotate-180' : ''}`} />
                                            </div>
                                            
                                            <div className={`flex flex-col gap-0.5 ml-3 border-l-2 border-amber-400/20 pl-4 transition-all duration-500 overflow-hidden ${openGroups[groupName] ? 'max-h-[800px] mt-2 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                                                {grouped[groupName].map((cat) => (
                                                    <button 
                                                        key={cat.name}
                                                        onClick={() => handleCategoryClick(cat.name)}
                                                        className='text-white/70 hover:text-white text-[9px] font-bold uppercase text-left py-2 flex items-center justify-between group/item border-b border-white/5 last:border-0'
                                                    >
                                                        <span className='truncate mr-2 group-hover/item:translate-x-1 transition-transform'>{cat.name}</span>
                                                        <span className='text-[8px] text-amber-400/60 font-mono'>{cat.count}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* --- 2. INDEPENDENT SECTION (Mobile Collapsible) --- */}
                                    {independent.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/20">
                                            <p className='text-[8px] text-white/30 font-black uppercase tracking-widest mb-4 ml-2'>General Registry</p>
                                            <div className='flex flex-col gap-1'>
                                                {independent
                                                    .slice(0, (!showAllIndependent && window.innerWidth < 1024) ? 4 : independent.length)
                                                    .map((cat) => (
                                                    <button 
                                                        key={cat.name}
                                                        onClick={() => handleCategoryClick(cat.name)}
                                                        className='text-white/80 hover:text-amber-400 text-[10px] font-black tracking-widest uppercase text-left py-3 px-3 hover:bg-white/5 rounded-xl transition-all flex items-center justify-between group'
                                                    >
                                                        <span className='truncate'>{cat.name}</span>
                                                        <span className='text-[8px] opacity-40 group-hover:opacity-100 font-mono'>{cat.count}</span>
                                                    </button>
                                                ))}

                                                {independent.length > 4 && (
                                                    <button 
                                                        onClick={() => setShowAllIndependent(!showAllIndependent)}
                                                        className='lg:hidden mt-2 text-center py-2 text-amber-400 text-[9px] font-black uppercase tracking-widest bg-white/5 rounded-lg border border-white/10 flex items-center justify-center gap-2'
                                                    >
                                                        {showAllIndependent ? <><Minus size={10}/> View Less</> : <><Plus size={10}/> View All ({independent.length})</>}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* No Search Results State */}
                                    {searchTerm && Object.keys(grouped).length === 0 && independent.length === 0 && (
                                        <div className='py-8 text-center'>
                                            <p className='text-white/40 text-[9px] font-black uppercase tracking-widest italic'>No categories found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN PRODUCT GRID */}
                    <div className='w-full lg:w-3/4'>
                        <div className='flex overflow-x-auto lg:grid lg:grid-cols-3 gap-6 md:gap-x-8 gap-y-12 pb-10 lg:pb-0 snap-x snap-mandatory mobile-scrollbar px-2'>
                            {latestProducts.map((item, index) => (
                                <div key={index} className="min-w-[85%] sm:min-w-[45vw] lg:min-w-0 snap-center flex flex-col group bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-br-[40px] md:rounded-br-[60px] overflow-hidden">
                                    <div className="relative p-1 md:p-3 flex-grow cursor-pointer" onClick={() => handleProductClick(item._id)}>
                                        <div className="absolute top-0 right-0 z-20 overflow-hidden w-20 h-20 pointer-events-none">
                                            <div className="absolute top-[20%] -right-[30%] bg-[#bd002d] text-white text-[7px] font-black py-1 w-[140%] text-center transform rotate-45 shadow-sm uppercase tracking-tighter">New</div>
                                        </div>
                                        <div className="w-full bg-[#f8f8f8] rounded-br-[35px] md:rounded-br-[45px] p-2">
                                            <ProductItem id={item._id} _id={item._id} image={item.image} name={item.name} price={item.price} marketPrice={item.marketPrice} category={item.category[0]} linkToFilter={true} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 p-4 pt-0">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={(e) => onAddToCart(e, item._id)} className="bg-gray-100 text-gray-900 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all duration-300">
                                                <ShoppingCart size={14} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Add</span>
                                            </button>
                                            <button onClick={(e) => onBuyNow(e, item._id)} className="bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#bd002d] transition-all duration-300 shadow-lg shadow-black/10">
                                                <Zap size={14} className="fill-amber-400 text-amber-400" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Buy Now</span>
                                            </button>
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