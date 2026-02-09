import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Trash2, Plus, FolderTree, Tag, ListPlus, RefreshCw, ExternalLink, Edit3 } from 'lucide-react';

const CategoryManager = ({ token }) => {
    const [categories, setCategories] = useState([]);
    const [childrenInput, setChildrenInput] = useState(''); 
    const [selectedGroup, setSelectedGroup] = useState(''); 
    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/list');
            if (response.data.success) setCategories(response.data.categories);
        } catch (error) {
            toast.error("Registry Sync Failed");
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        const finalGroup = isCreatingNewGroup ? newGroupName.trim() : selectedGroup;
        if (!finalGroup) return toast.warning("Please select or define a Parent Group.");
        
        const childrenArray = childrenInput.split(',').map(c => c.trim()).filter(c => c !== "");
        if (childrenArray.length === 0) return toast.warning("Enter sub-categories.");

        try {
            setLoading(true);
            const promises = childrenArray.map(name => 
                axios.post(backendUrl + '/api/category/add', { name, group: finalGroup }, { headers: { token } })
            );
            await Promise.all(promises);
            
            toast.success(`Architecture synced to ${finalGroup}`);
            setChildrenInput('');
            setNewGroupName('');
            setIsCreatingNewGroup(false);
            fetchCategories();
        } catch (error) {
            toast.error("Process failed. Check for duplicate sub-categories.");
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm("Purge this category?")) return;
        try {
            const response = await axios.post(backendUrl + '/api/category/remove', { id }, { headers: { token } });
            if (response.data.success) { toast.success("Removed"); fetchCategories(); }
        } catch (error) { toast.error(error.message); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const existingGroups = [...new Set(categories.map(c => c.group))].sort();
    
    const groupedCategories = categories.reduce((acc, cat) => {
        const key = cat.group || 'Independent';
        if (!acc[key]) acc[key] = [];
        acc[key].push(cat);
        return acc;
    }, {});

    return (
        <div className='max-w-5xl mx-auto p-4 lg:p-10 select-none'>
            <div className='mb-10'>
                <h2 className='text-3xl font-black text-gray-900 uppercase tracking-tighter'>Registry <span className='text-[#BC002D]'>Hierarchy</span></h2>
                <p className='text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-2'>Manage Parent Filters & Sub-Categories</p>
            </div>

            {/* BULK ADD FORM */}
            <form onSubmit={onSubmitHandler} className='bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl mb-12 space-y-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    
                    {/* Parent Group Selection */}
                    <div className='w-full space-y-3'>
                        <div className='flex justify-between items-center'>
                            <p className='text-[10px] font-black uppercase text-[#BC002D] tracking-widest'>1. Parent Group</p>
                            <button 
                                type="button"
                                onClick={() => setIsCreatingNewGroup(!isCreatingNewGroup)}
                                className='text-[9px] font-black uppercase text-blue-600 border-b border-blue-600/30'
                            >
                                {isCreatingNewGroup ? "Select Existing" : "+ Create New Group"}
                            </button>
                        </div>

                        {isCreatingNewGroup ? (
                            <div className='relative animate-in fade-in zoom-in duration-300'>
                                <Edit3 size={14} className='absolute left-4 top-1/2 -translate-y-1/2 text-blue-500' />
                                <input 
                                    autoFocus
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className='w-full pl-10 pr-4 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-400' 
                                    placeholder="Enter New Parent Name..."
                                />
                            </div>
                        ) : (
                            <select 
                                value={selectedGroup} 
                                onChange={(e) => setSelectedGroup(e.target.value)} 
                                className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-[#BC002D] appearance-none cursor-pointer'
                            >
                                <option value="">Select Existing Group</option>
                                {existingGroups.map((g, i) => (
                                    <option key={i} value={g}>{g}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Sub-Category Entry */}
                    <div className='w-full'>
                        <p className='text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest'>2. Sub-Categories (Comma Separated)</p>
                        <textarea 
                            onChange={(e) => setChildrenInput(e.target.value)} 
                            value={childrenInput} 
                            className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-black min-h-[100px]' 
                            placeholder="e.g. Victorian Era, Edwardian, Postal History..." 
                        />
                    </div>
                </div>

                <button type="submit" disabled={loading} className='w-full bg-black text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[#BC002D] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95'>
                    {loading ? <RefreshCw className='animate-spin' size={16}/> : <ListPlus size={16}/>} 
                    {loading ? 'Processing Registry...' : 'Commit to Architecture'}
                </button>
            </form>

            {/* HIERARCHY DISPLAY */}
            
            <div className='space-y-10'>
                {Object.keys(groupedCategories).sort().map(groupName => (
                    <div key={groupName} className='animate-in fade-in slide-in-from-bottom-4 duration-500 bg-gray-50/30 p-8 rounded-[40px] border border-gray-100'>
                        <div className='flex items-center justify-between mb-6 border-b border-black/5 pb-4'>
                            <div className='flex items-center gap-4'>
                                <FolderTree size={20} className='text-[#BC002D]' />
                                <div>
                                    <h3 className='text-sm font-black uppercase tracking-[0.2em] text-gray-900'>{groupName}</h3>
                                    <p className='text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1'>Archive Group</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm'>
                                <span className='text-[9px] font-black text-[#BC002D] uppercase tracking-tighter'>{groupedCategories[groupName].length} Categories</span>
                                <ExternalLink size={10} className='text-gray-300' />
                            </div>
                        </div>
                        <div className='flex flex-wrap gap-3'>
                            {groupedCategories[groupName].map((item) => (
                                <div key={item._id} className='bg-white px-5 py-3 rounded-2xl border border-gray-100 flex items-center gap-4 hover:border-[#BC002D] transition-all group shadow-sm'>
                                    <span className='text-[10px] font-bold text-gray-600 uppercase tracking-wider'>{item.name}</span>
                                    <Trash2 onClick={() => deleteCategory(item._id)} size={14} className='text-gray-200 hover:text-red-500 cursor-pointer transition-colors' />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryManager;