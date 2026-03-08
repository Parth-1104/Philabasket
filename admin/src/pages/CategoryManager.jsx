import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import {
    Trash2, FolderTree, RefreshCw, ChevronRight, Check, Search, 
    Plus, Tag, Layers, ArrowRight, Star, StarOff, Globe, Sparkles, X, Image as ImageIcon
} from 'lucide-react';

const CategoryManager = ({ token }) => {
    const [categories, setCategories] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [loading, setLoading] = useState(false);
    const [childSearch, setChildSearch] = useState('');
    const [selectedChildren, setSelectedChildren] = useState([]);
    const [quickAddName, setQuickAddName] = useState('');
    const [activeTab, setActiveTab] = useState('add');
    const [featuredSearch, setFeaturedSearch] = useState("");
    const [showFeaturedAdd, setShowFeaturedAdd] = useState(false);

    // --- MEDIA SYSTEM STATES ---
    const [allMedia, setAllMedia] = useState([]);
    const [imageSearch, setImageSearch] = useState("");
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [activeCategoryToUpdate, setActiveCategoryToUpdate] = useState(null);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/list');
            if (response.data.success) setCategories(response.data.categories);
        } catch { toast.error('Failed to load categories'); }
    };

    const fetchMedia = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/media/all`, { headers: { token } });
            if (res.data.success) {
                // Mapping different possible API responses for safety
                setAllMedia(res.data.media || res.data.files || res.data.users || []);
            }
        } catch (err) { console.error("Media sync error", err); }
    };

    useEffect(() => { 
        fetchCategories(); 
        fetchMedia();
    }, []);

    // --- MEDIA SEARCH LOGIC ---
    const filteredMedia = useMemo(() => {
        if (!imageSearch) return [];
        return allMedia.filter(m => 
            (m.originalName || "").toLowerCase().includes(imageSearch.toLowerCase())
        ).slice(0, 6);
    }, [allMedia, imageSearch]);

    const handleSelectImage = async (imageUrl) => {
        if (!activeCategoryToUpdate) return;
        try {
            const response = await axios.post(backendUrl + '/api/category/update', 
                { name: activeCategoryToUpdate, image: imageUrl }, { headers: { token } });
            if (response.data.success) {
                toast.success("Registry Image Updated");
                setShowMediaPicker(false);
                setImageSearch("");
                fetchCategories();
            }
        } catch { toast.error("Failed to update image"); }
    };

    const toggleFeatured = async (name, currentStatus) => {
        try {
            const response = await axios.post(backendUrl + '/api/category/update', 
                { name, featured: !currentStatus }, { headers: { token } });
            if (response.data.success) {
                toast.success(`${name} ${!currentStatus ? 'Pinned' : 'Unpinned'}`);
                fetchCategories();
            }
        } catch { toast.error('Update failed'); }
    };

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!quickAddName.trim()) return;
        try {
            const response = await axios.post(backendUrl + '/api/category/add',
                { name: quickAddName.trim() }, { headers: { token } });
            if (response.data.success) {
                toast.success(`"${quickAddName}" added`);
                setQuickAddName('');
                fetchCategories();
            }
        } catch { toast.error('Failed to add category'); }
    };

    // Memoized Data Processing
    const featuredCategories = useMemo(() => categories.filter(c => c.featured).sort((a,b) => a.name.localeCompare(b.name)), [categories]);
    const groupedData = useMemo(() => {
        const groups = {};
        categories.forEach(cat => {
            const key = cat.group && cat.group !== 'Independent' ? cat.group : '— Ungrouped';
            if (!groups[key]) groups[key] = [];
            groups[key].push(cat);
        });
        return groups;
    }, [categories]);

    const nonFeaturedSearchList = useMemo(() => 
        categories.filter(c => !c.featured && c.name.toLowerCase().includes(featuredSearch.toLowerCase())).slice(0, 5)
    , [categories, featuredSearch]);

    const availableToMap = useMemo(() =>
        categories.filter(c => (c.group === 'Independent' || !c.group) && c.name.toLowerCase().includes(childSearch.toLowerCase()))
    , [categories, childSearch]);

    const existingGroups = useMemo(() => [...new Set(categories.map(c => c.group).filter(g => g && g !== 'Independent'))].sort(), [categories]);

    const toggleChildSelection = (name) => {
        setSelectedChildren(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
    };

    const onSubmitGrouping = async (e) => {
        e.preventDefault();
        const finalGroup = isCreatingNewGroup ? newGroupName.trim() : selectedGroup;
        if (!finalGroup || selectedChildren.length === 0) return toast.warning('Missing selection');
        try {
            setLoading(true);
            await Promise.all(selectedChildren.map(name => 
                axios.post(backendUrl + '/api/category/update', { name, group: finalGroup }, { headers: { token } })
            ));
            toast.success('Grouping successful');
            setSelectedChildren([]);
            fetchCategories();
        } catch { toast.error('Grouping failed'); } finally { setLoading(false); }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm('Delete category?')) return;
        try {
            const response = await axios.post(backendUrl + '/api/category/remove', { id }, { headers: { token } });
            if (response.data.success) { toast.success('Deleted'); fetchCategories(); }
        } catch { toast.error('Error'); }
    };

    return (
        <div className='min-h-screen bg-[#F7F6F3] pb-20' style={{ fontFamily: "'DM Sans', sans-serif" }}>
            
            {/* --- MEDIA PICKER MODAL --- */}
            {showMediaPicker && (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm'>
        <div className='bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-200'>
            <div className='p-6 border-b flex justify-between items-center bg-gray-50/50'>
                <div>
                    <h3 className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Media Registry</h3>
                    <p className='text-xs font-bold text-black'>Select Category Asset</p>
                </div>
                <button onClick={() => setShowMediaPicker(false)} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
                    <X size={16}/>
                </button>
            </div>
            
            <div className='p-6 space-y-4'>
                {/* Search Input */}
                <div className='relative'>
                    <Search size={14} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input 
                        type="text" 
                        placeholder="Filter by filename..." 
                        value={imageSearch}
                        onChange={(e) => setImageSearch(e.target.value)}
                        className='w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-black transition-all'
                    />
                </div>
                
                {/* Scrollable List View */}
                <div className='space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
                    {filteredMedia.length > 0 ? (
                        filteredMedia.map((m) => (
                            <button 
                                key={m._id} 
                                onClick={() => handleSelectImage(m.imageUrl)}
                                className='w-full group flex items-center gap-4 p-3 rounded-2xl border border-gray-50 hover:border-[#BC002D] hover:bg-red-50/30 transition-all text-left'
                            >
                                {/* Thumbnail Container */}
                                <div className='w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-white flex-shrink-0'>
                                    <img 
                                        src={m.imageUrl} 
                                        className='w-full h-full object-cover group-hover:scale-110 transition-transform' 
                                        alt="" 
                                    />
                                </div>

                                {/* Filename & Metadata */}
                                <div className='flex-1 min-w-0'>
                                    <p className='text-[11px] font-black text-gray-800 truncate uppercase tracking-tight'>
                                        {m.originalName || "Unnamed Asset"}
                                    </p>
                                    <p className='text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5'>
                                        Registry Record
                                    </p>
                                </div>

                                {/* Selection Icon */}
                                <div className='opacity-0 group-hover:opacity-100 transition-opacity bg-[#BC002D] p-1.5 rounded-full shadow-lg shadow-red-200'>
                                    <Check size={12} className='text-white' />
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className='py-20 text-center text-gray-300'>
                            <ImageIcon size={36} className='mx-auto mb-3 opacity-10' />
                            <p className='text-[10px] font-black uppercase tracking-[0.2em]'>Archive Depleted</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Footer Tip */}
            <div className='p-4 bg-gray-50 border-t flex justify-center'>
                <p className='text-[8px] font-black text-gray-400 uppercase tracking-widest'>
                    Selecting an asset will update the registry record immediately
                </p>
            </div>
        </div>
    </div>
)}

            <div className='max-w-5xl mx-auto px-6 py-10'>
                
                {/* 1. FEATURED SECTION */}
                <div className='mb-12'>
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center'><Star size={20} className='text-amber-600 fill-amber-600' /></div>
                            <div>
                                <h2 className='text-xl font-black text-gray-900 tracking-tight'>Featured Collection</h2>
                                <p className='text-xs text-gray-400 font-medium uppercase tracking-widest'>Frontend Registry</p>
                            </div>
                        </div>
                        <button onClick={() => setShowFeaturedAdd(!showFeaturedAdd)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showFeaturedAdd ? 'bg-gray-900 text-white' : 'bg-white border text-gray-600'}`}>
                            {showFeaturedAdd ? <X size={14}/> : <Plus size={14}/>} {showFeaturedAdd ? 'Close' : 'Pin New'}
                        </button>
                    </div>

                    <div className='bg-white rounded-3xl border-2 border-amber-100 shadow-sm overflow-hidden'>
                        {showFeaturedAdd && (
                            <div className='p-6 bg-amber-50/50 border-b border-amber-100 animate-fade-in'>
                                <div className='relative max-w-md'>
                                    <Search size={14} className='absolute left-4 top-1/2 -translate-y-1/2 text-amber-600' />
                                    <input type="text" placeholder="Find category..." value={featuredSearch} onChange={(e) => setFeaturedSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-amber-200 rounded-2xl text-xs font-bold outline-none" />
                                </div>
                                <div className='mt-4 flex flex-wrap gap-2'>
                                    {featuredSearch.length > 0 && nonFeaturedSearchList.map(cat => (
                                        <button key={cat._id} onClick={() => {toggleFeatured(cat.name, false); setFeaturedSearch("");}} className='flex items-center gap-2 bg-white border border-amber-100 px-3 py-2 rounded-xl text-[10px] font-bold'><Sparkles size={12}/> {cat.name}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className='p-6 flex flex-wrap gap-3'>
                            {featuredCategories.length === 0 ? <p className='text-xs font-black text-gray-300 uppercase p-4'>Registry Depleted</p> : 
                                featuredCategories.map(cat => (
                                    <div key={cat._id} className='flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl'>
                                        <div className='w-8 h-8 rounded-full overflow-hidden border border-amber-200 bg-white'>
                                            {cat.image ? <img src={cat.image} className='w-full h-full object-cover' alt="" /> : <ImageIcon size={10} className='m-auto text-amber-200'/>}
                                        </div>
                                        <p className='text-xs font-black text-amber-900'>{cat.name}</p>
                                        <div className='flex items-center gap-1'>
                                            <button onClick={() => {setActiveCategoryToUpdate(cat.name); setShowMediaPicker(true);}} className='p-1.5 hover:bg-white rounded-lg text-amber-600 transition-colors'><ImageIcon size={14}/></button>
                                            <button onClick={() => toggleFeatured(cat.name, true)} className='p-1.5 hover:bg-white rounded-lg text-red-500 transition-colors'><StarOff size={14} /></button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>

                {/* 2. TABS */}
                <div className='flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-gray-200 w-fit shadow-sm'>
                    <button onClick={() => setActiveTab('add')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'add' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-black'}`}><Tag size={15} /> Add</button>
                    <button onClick={() => setActiveTab('group')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'group' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-black'}`}><Layers size={15} /> Group</button>
                </div>

                {activeTab === 'add' && (
                    <div className='bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8 animate-in slide-in-from-bottom-2 duration-300'>
                        <div className='px-8 py-6 border-b border-gray-100'>
                            <div className='flex items-center gap-3'>
                                <div className='w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center'><Plus size={18} className='text-white' /></div>
                                <div>
                                    <h2 className='text-base font-bold text-gray-900'>New Registry Entry</h2>
                                    <p className='text-xs text-gray-400 mt-0.5 uppercase tracking-widest font-bold'>Ungrouped Initialization</p>
                                </div>
                            </div>
                        </div>
                        <div className='px-8 py-8'>
                            <form onSubmit={handleQuickAdd} className='flex gap-3 max-w-lg'>
                                <input
                                    type='text'
                                    value={quickAddName}
                                    onChange={(e) => setQuickAddName(e.target.value)}
                                    placeholder='Electronics, Footwear, Books...'
                                    className='flex-1 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-black focus:bg-white transition-all'
                                />
                                <button
                                    type='submit'
                                    disabled={!quickAddName.trim()}
                                    className='px-6 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-[#BC002D] transition-colors disabled:opacity-40 flex items-center gap-2'
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'group' && (
                    <div className='bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8 animate-in slide-in-from-bottom-2 duration-300'>
                        <form onSubmit={onSubmitGrouping} className='p-8 space-y-8'>
                            <div>
                                <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4'>Step 1: Protocol Target</p>
                                <div className='flex gap-2 mb-3'>
                                    <button type='button' onClick={() => setIsCreatingNewGroup(false)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isCreatingNewGroup ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>Existing</button>
                                    <button type='button' onClick={() => setIsCreatingNewGroup(true)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isCreatingNewGroup ? 'bg-[#BC002D] text-white' : 'bg-gray-100 text-gray-500'}`}>+ New</button>
                                </div>
                                {isCreatingNewGroup ? (
                                    <input autoFocus value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className='w-full max-w-sm px-5 py-3.5 bg-red-50 border border-red-200 rounded-xl text-sm font-medium outline-none focus:border-[#BC002D]' placeholder='Group name...' />
                                ) : (
                                    <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className='w-full max-w-sm px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none appearance-none cursor-pointer'>
                                        <option value=''>Select group...</option>
                                        {existingGroups.map((g, i) => <option key={i} value={g}>{g}</option>)}
                                    </select>
                                )}
                            </div>

                            <div>
                                <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4'>Step 2: Member Selection</p>
                                <input type='text' value={childSearch} onChange={(e) => setChildSearch(e.target.value)} placeholder='Filter candidates...' className='w-full max-w-sm mb-4 px-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none' />
                                <div className='bg-gray-50 border border-gray-200 rounded-2xl p-4 max-h-[180px] overflow-y-auto custom-scrollbar flex flex-wrap gap-2'>
                                    {availableToMap.map(cat => (
                                        <button key={cat._id} type='button' onClick={() => toggleChildSelection(cat.name)} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${selectedChildren.includes(cat.name) ? 'bg-gray-900 text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}>
                                            {selectedChildren.includes(cat.name) && <Check size={10} className='inline mr-1' />} {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type='submit' disabled={loading} className='flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-[#BC002D] transition-all disabled:opacity-50'>
                                {loading ? <RefreshCw className='animate-spin' size={16} /> : <ArrowRight size={16} />} Save Grouping
                            </button>
                        </form>
                    </div>
                )}

                {/* 3. STRUCTURE MAP */}
                <div className='mt-12 grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {Object.keys(groupedData).sort().map(groupName => (
                        <div key={groupName} className='bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col hover:border-[#BC002D]/20 transition-all'>
                            <div className='px-6 py-4 border-b bg-gray-50/40 font-black text-[10px] uppercase tracking-widest text-gray-400'>{groupName}</div>
                            <div className='p-5 space-y-2'>
                                {groupedData[groupName].map(item => (
                                    <div key={item._id} className='flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all'>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 rounded-xl border border-gray-200 bg-white overflow-hidden flex-shrink-0'>
                                                {item.image ? <img src={item.image} className='w-full h-full object-cover' alt="" /> : <ImageIcon size={16} className='m-auto h-full text-gray-200'/>}
                                            </div>
                                            <div className='flex flex-col'>
                                                <p className='text-xs font-bold text-gray-800'>{item.name}</p>
                                                <p className='text-[9px] text-gray-400 font-bold uppercase'>{item.productCount || 0} Products</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            <button onClick={() => {setActiveCategoryToUpdate(item.name); setShowMediaPicker(true);}} className='p-2 hover:bg-white rounded-lg text-gray-400 hover:text-blue-500 transition-colors'><ImageIcon size={14}/></button>
                                            <button onClick={() => toggleFeatured(item.name, item.featured)} className={`p-2 rounded-lg transition-colors ${item.featured ? 'text-amber-500' : 'text-gray-300'}`}><Star size={14} className={item.featured ? 'fill-amber-500' : ''} /></button>
                                            <button onClick={() => deleteCategory(item._id)} className='p-2 text-gray-300 hover:text-red-500 transition-colors'><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;