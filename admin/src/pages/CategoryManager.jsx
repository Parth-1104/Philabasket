import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import {
    Trash2, FolderTree, RefreshCw,
    ChevronRight, Check, Search, Plus, Tag, Layers, ArrowRight
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
    const [activeTab, setActiveTab] = useState('add'); // 'add' | 'group'

    const fetchCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/list');
            if (response.data.success) setCategories(response.data.categories);
        } catch {
            toast.error('Failed to load categories');
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!quickAddName.trim()) return;
        try {
            const response = await axios.post(
                backendUrl + '/api/category/add',
                { name: quickAddName.trim(), group: 'Independent' },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success(`"${quickAddName}" added`);
                setQuickAddName('');
                fetchCategories();
            }
        } catch {
            toast.error('Failed — category may already exist.');
        }
    };

    const existingGroups = useMemo(() =>
        [...new Set(categories.map(c => c.group).filter(g => g && g !== 'Independent'))].sort()
    , [categories]);

    const availableToMap = useMemo(() =>
        categories.filter(c =>
            (c.group === 'Independent' || !c.group) &&
            c.name.toLowerCase().includes(childSearch.toLowerCase())
        )
    , [categories, childSearch]);

    const groupedData = useMemo(() => {
        const groups = {};
        categories.forEach(cat => {
            const key = cat.group && cat.group !== 'Independent' ? cat.group : '— Ungrouped';
            if (!groups[key]) groups[key] = [];
            groups[key].push(cat);
        });
        return groups;
    }, [categories]);

    const toggleChildSelection = (name) => {
        setSelectedChildren(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const onSubmitGrouping = async (e) => {
        e.preventDefault();
        const finalGroup = isCreatingNewGroup ? newGroupName.trim() : selectedGroup;
        if (!finalGroup) return toast.warning('Select or create a group first.');
        if (selectedChildren.length === 0) return toast.warning('Select at least one category to group.');
        try {
            setLoading(true);
            const promises = selectedChildren.map(name =>
                axios.post(backendUrl + '/api/category/update', { name, group: finalGroup }, { headers: { token } })
            );
            await Promise.all(promises);
            toast.success(`${selectedChildren.length} categories moved to "${finalGroup}"`);
            setSelectedChildren([]);
            setChildSearch('');
            setNewGroupName('');
            setIsCreatingNewGroup(false);
            fetchCategories();
        } catch {
            toast.error('Grouping failed.');
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            const response = await axios.post(backendUrl + '/api/category/remove', { id }, { headers: { token } });
            if (response.data.success) { toast.success('Deleted'); fetchCategories(); }
        } catch (error) { toast.error(error.message); }
    };

    return (
        <div className='min-h-screen bg-[#F7F6F3]' style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

            <div className='max-w-5xl mx-auto px-6 py-10'>

                {/* Header */}
                <div className='mb-10'>
                    <div className='flex items-center gap-3 mb-1'>
                        <div className='w-2 h-8 bg-[#BC002D] rounded-full' />
                        <h1 className='text-2xl font-black text-gray-900 tracking-tight'>Category Manager</h1>
                    </div>
                    <p className='text-sm text-gray-400 ml-5 font-medium'>Add new categories or organize existing ones into groups</p>
                </div>

                {/* Tab Switcher */}
                <div className='flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-gray-200 w-fit shadow-sm'>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'add' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <Tag size={15} />
                        Add Category
                    </button>
                    <button
                        onClick={() => setActiveTab('group')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'group' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <Layers size={15} />
                        Group Categories
                        {availableToMap.length > 0 && (
                            <span className='bg-[#BC002D] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full'>{availableToMap.length}</span>
                        )}
                    </button>
                </div>

                {/* ─── ADD CATEGORY PANEL ─── */}
                {activeTab === 'add' && (
                    <div className='bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8'>
                        <div className='px-8 py-6 border-b border-gray-100'>
                            <div className='flex items-center gap-3'>
                                <div className='w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center'>
                                    <Plus size={18} className='text-white' />
                                </div>
                                <div>
                                    <h2 className='text-base font-bold text-gray-900'>Add New Category</h2>
                                    <p className='text-xs text-gray-400 mt-0.5'>New categories start as ungrouped and can be organized later</p>
                                </div>
                            </div>
                        </div>
                        <div className='px-8 py-8'>
                            <form onSubmit={handleQuickAdd} className='flex gap-3 max-w-lg'>
                                <div className='flex-1 relative'>
                                    <input
                                        type='text'
                                        value={quickAddName}
                                        onChange={(e) => setQuickAddName(e.target.value)}
                                        placeholder='e.g. Electronics, Footwear, Books...'
                                        className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-gray-900 focus:bg-white transition-all'
                                    />
                                </div>
                                <button
                                    type='submit'
                                    disabled={!quickAddName.trim()}
                                    className='px-6 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-[#BC002D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap'
                                >
                                    <Plus size={16} />
                                    Add Category
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── GROUP CATEGORIES PANEL ─── */}
                {activeTab === 'group' && (
                    <div className='bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8'>
                        <div className='px-8 py-6 border-b border-gray-100'>
                            <div className='flex items-center gap-3'>
                                <div className='w-9 h-9 bg-[#BC002D] rounded-xl flex items-center justify-center'>
                                    <Layers size={18} className='text-white' />
                                </div>
                                <div>
                                    <h2 className='text-base font-bold text-gray-900'>Group Categories</h2>
                                    <p className='text-xs text-gray-400 mt-0.5'>Select ungrouped categories and assign them to a group</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={onSubmitGrouping} className='p-8 space-y-8'>

                            {/* STEP 1 */}
                            <div>
                                <div className='flex items-center gap-3 mb-4'>
                                    <div className='w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center'>
                                        <span className='text-[10px] font-black text-gray-500'>1</span>
                                    </div>
                                    <p className='text-xs font-bold text-gray-500 uppercase tracking-widest'>Choose or Create a Group</p>
                                </div>

                                <div className='flex gap-2 mb-3'>
                                    <button
                                        type='button'
                                        onClick={() => setIsCreatingNewGroup(false)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isCreatingNewGroup ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        Existing Group
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setIsCreatingNewGroup(true)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isCreatingNewGroup ? 'bg-[#BC002D] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        + New Group
                                    </button>
                                </div>

                                {isCreatingNewGroup ? (
                                    <input
                                        autoFocus
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        className='w-full max-w-sm px-5 py-3.5 bg-red-50 border border-red-200 rounded-xl text-sm font-medium outline-none focus:border-[#BC002D] transition-all'
                                        placeholder='New group name...'
                                    />
                                ) : (
                                    <div className='relative max-w-sm'>
                                        <select
                                            value={selectedGroup}
                                            onChange={(e) => setSelectedGroup(e.target.value)}
                                            className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none appearance-none cursor-pointer focus:border-gray-900 transition-all'
                                        >
                                            <option value=''>Select a group...</option>
                                            {existingGroups.map((g, i) => <option key={i} value={g}>{g}</option>)}
                                        </select>
                                        <ChevronRight size={14} className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none' />
                                    </div>
                                )}
                            </div>

                            {/* STEP 2 */}
                            <div>
                                <div className='flex items-center justify-between mb-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center'>
                                            <span className='text-[10px] font-black text-gray-500'>2</span>
                                        </div>
                                        <p className='text-xs font-bold text-gray-500 uppercase tracking-widest'>Select Ungrouped Categories</p>
                                    </div>
                                    {selectedChildren.length > 0 && (
                                        <span className='text-xs font-bold text-[#BC002D]'>{selectedChildren.length} selected</span>
                                    )}
                                </div>

                                <div className='relative mb-3 max-w-sm'>
                                    <Search size={13} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                                    <input
                                        type='text'
                                        value={childSearch}
                                        onChange={(e) => setChildSearch(e.target.value)}
                                        placeholder='Filter ungrouped categories...'
                                        className='w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-gray-900 transition-all'
                                    />
                                </div>

                                <div className='bg-gray-50 border border-gray-200 rounded-2xl p-4 min-h-[100px] max-h-[180px] overflow-y-auto custom-scrollbar'>
                                    {availableToMap.length === 0 ? (
                                        <div className='h-full flex flex-col items-center justify-center py-6 text-gray-300'>
                                            <FolderTree size={28} className='mb-2' />
                                            <p className='text-xs font-bold'>No ungrouped categories found</p>
                                        </div>
                                    ) : (
                                        <div className='flex flex-wrap gap-2'>
                                            {availableToMap.map(cat => (
                                                <button
                                                    key={cat._id}
                                                    type='button'
                                                    onClick={() => toggleChildSelection(cat.name)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border
                                                        ${selectedChildren.includes(cat.name)
                                                            ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'}`}
                                                >
                                                    {selectedChildren.includes(cat.name) && <Check size={11} />}
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className='pt-2'>
                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-[#BC002D] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]'
                                >
                                    {loading ? <RefreshCw className='animate-spin' size={16} /> : <ArrowRight size={16} />}
                                    {loading ? 'Saving...' : `Assign to Group${selectedChildren.length > 0 ? ` (${selectedChildren.length})` : ''}`}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ─── HIERARCHY MAP ─── */}
                <div className='mt-10'>
                    <div className='flex items-center gap-3 mb-6'>
                        <FolderTree size={18} className='text-gray-400' />
                        <h2 className='text-sm font-bold text-gray-500 uppercase tracking-widest'>Current Structure</h2>
                        <div className='flex-1 h-px bg-gray-200' />
                        <span className='text-xs text-gray-400 font-medium'>{categories.length} total</span>
                    </div>

                    <div className='space-y-4'>
                        {Object.keys(groupedData).sort().map(groupName => (
                            <div key={groupName} className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
                                <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60'>
                                    <div className='flex items-center gap-2.5'>
                                        <div className={`w-2 h-2 rounded-full ${groupName === '— Ungrouped' ? 'bg-gray-300' : 'bg-[#BC002D]'}`} />
                                        <h3 className='text-xs font-bold text-gray-700 uppercase tracking-wider'>{groupName}</h3>
                                    </div>
                                    <span className='text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full'>{groupedData[groupName].length}</span>
                                </div>
                                <div className='p-5 flex flex-wrap gap-2'>
                                    {groupedData[groupName].map(item => (
                                        <div
                                            key={item._id}
                                            className='group flex items-center gap-3 bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm px-4 py-2.5 rounded-xl transition-all'
                                        >
                                            <div>
                                                <p className='text-xs font-bold text-gray-800'>{item.name}</p>
                                                <p className='text-[10px] text-gray-400 font-medium'>{item.productCount || 0} products</p>
                                            </div>
                                            <Trash2
                                                onClick={() => deleteCategory(item._id)}
                                                size={13}
                                                className='text-gray-200 hover:text-red-500 cursor-pointer transition-colors ml-1'
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default CategoryManager;