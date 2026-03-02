import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { 
    Save, Plus, Trash2, Type, Layout, X, 
    Loader2, Globe, ChevronDown 
} from 'lucide-react';

const HeaderManager = ({ token }) => {
    const [loading, setLoading] = useState(false);
    const [headerData, setHeaderData] = useState({ marqueeText: "", navMenu: [] });
    const [allCategories, setAllCategories] = useState([]); // To store available categories

    const fetchData = async () => {
        try {
            const [headerRes, catRes] = await Promise.all([
                axios.get(backendUrl + '/api/header/get'),
                axios.get(backendUrl + '/api/category/list')
            ]);
            
            if (headerRes.data.success) {
                setHeaderData(headerRes.data.data || { marqueeText: "", navMenu: [] });
            }
            if (catRes.data.success) {
                setAllCategories(catRes.data.categories);
            }
        } catch (error) {
            toast.error("Failed to sync Registry data");
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- Menu Logic ---
    const addMenuTab = () => {
        setHeaderData({
            ...headerData,
            navMenu: [...headerData.navMenu, { title: "NEW TAB", groups: [] }]
        });
    };

    const addGroup = (tabIdx) => {
        const newData = { ...headerData };
        newData.navMenu[tabIdx].groups.push({ groupName: "NEW GROUP", items: [] });
        setHeaderData(newData);
    };

    const addItem = (tabIdx, groupIdx) => {
        const newData = { ...headerData };
        // Initialize with the first category or an empty string
        const defaultCat = allCategories.length > 0 ? allCategories[0].name : "";
        newData.navMenu[tabIdx].groups[groupIdx].items.push(defaultCat);
        setHeaderData(newData);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await axios.post(backendUrl + '/api/header/update', headerData, { headers: { token } });
            if (res.data.success) {
                toast.success("Header Protocol Synchronized");
                fetchData();
            }
        } catch (error) {
            toast.error("Deployment Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='p-6 bg-[#F7F6F3] min-h-screen font-serif pb-32'>
            <div className='mb-10'>
                <div className='flex items-center gap-3 mb-2'>
                    <div className='w-2 h-8 bg-[#BC002D]' />
                    <h2 className='text-2xl font-black uppercase tracking-tighter text-gray-900'>Header <span className='text-[#BC002D]'>Protocol</span></h2>
                </div>
                <p className='text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] ml-5'>Control the Global Marquee and Navigation Architecture</p>
            </div>

            {/* SECTION 1: MARQUEE (Capitalization removed) */}
            <div className='bg-white p-8 border border-gray-100 rounded-sm shadow-sm mb-8'>
                <div className='flex items-center gap-3 mb-6'>
                    <Type className='text-[#BC002D]' size={18} />
                    <h3 className='font-black uppercase text-xs tracking-widest'>Marquee Announcement</h3>
                </div>
                <div className='relative'>
                    <textarea 
                        value={headerData.marqueeText}
                        onChange={(e) => setHeaderData({...headerData, marqueeText: e.target.value})}
                        className='w-full p-5 bg-gray-50 border border-gray-100 text-[11px] font-bold tracking-widest outline-none focus:border-[#BC002D] min-h-[80px]'
                        placeholder="Type exactly as you want it to appear..."
                    />
                    <div className='absolute bottom-3 right-3 text-[8px] font-black text-gray-300'>CASE SENSITIVE MODE</div>
                </div>
            </div>

            {/* SECTION 2: NAVIGATION BUILDER */}
            <div className='bg-white p-8 border border-gray-100 rounded-sm shadow-sm'>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10'>
                    <div className='flex items-center gap-3'>
                        <Layout className='text-[#BC002D]' size={18} />
                        <h3 className='font-black uppercase text-xs tracking-widest'>Mega Menu Architecture</h3>
                    </div>
                    <button onClick={addMenuTab} className='bg-black text-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#BC002D] transition-all'>
                        <Plus size={14} /> Add Navigation Tab
                    </button>
                </div>

                <div className='space-y-12'>
                    {headerData.navMenu.map((tab, tIdx) => (
                        <div key={tIdx} className='relative border-l-4 border-[#BC002D] bg-gray-50/30 p-8 rounded-r-lg'>
                            <div className='flex items-center gap-4 mb-8'>
                                <input 
                                    value={tab.title}
                                    onChange={(e) => {
                                        const n = [...headerData.navMenu];
                                        n[tIdx].title = e.target.value;
                                        setHeaderData({...headerData, navMenu: n});
                                    }}
                                    className='bg-gray-900 text-white px-5 py-2 text-[11px] font-black uppercase tracking-widest outline-none'
                                />
                                <button onClick={() => {
                                    const n = [...headerData.navMenu];
                                    n.splice(tIdx, 1);
                                    setHeaderData({...headerData, navMenu: n});
                                }} className='p-2 text-gray-300 hover:text-red-600 transition-colors'>
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                                {tab.groups.map((group, gIdx) => (
                                    <div key={gIdx} className='bg-white border border-gray-100 p-5 shadow-sm'>
                                        <div className='flex justify-between items-center mb-5 border-b border-gray-50 pb-2'>
                                            <input 
                                                value={group.groupName}
                                                onChange={(e) => {
                                                    const n = [...headerData.navMenu];
                                                    n[tIdx].groups[gIdx].groupName = e.target.value;
                                                    setHeaderData({...headerData, navMenu: n});
                                                }}
                                                className='text-[10px] font-black text-[#BC002D] bg-transparent uppercase outline-none w-full'
                                            />
                                            <button onClick={() => {
                                                const n = [...headerData.navMenu];
                                                n[tIdx].groups.splice(gIdx, 1);
                                                setHeaderData({...headerData, navMenu: n});
                                            }}><X size={12} className='text-gray-300' /></button>
                                        </div>
                                        
                                        <div className='space-y-2'>
                                            {group.items.map((item, iIdx) => (
                                                <div key={iIdx} className='flex gap-2 items-center'>
                                                    {/* Dropdown for category selection */}
                                                    <div className='relative flex-1'>
                                                        <select
                                                            value={item}
                                                            onChange={(e) => {
                                                                const n = [...headerData.navMenu];
                                                                n[tIdx].groups[gIdx].items[iIdx] = e.target.value;
                                                                setHeaderData({...headerData, navMenu: n});
                                                            }}
                                                            className='w-full appearance-none text-[9px] font-bold text-gray-600 bg-gray-50 p-2 border border-gray-100 outline-none pr-6 cursor-pointer'
                                                        >
                                                            <option value="">Select Category</option>
                                                            {allCategories.map((cat) => (
                                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={10} className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400' />
                                                    </div>
                                                    <button onClick={() => {
                                                        const n = [...headerData.navMenu];
                                                        n[tIdx].groups[gIdx].items.splice(iIdx, 1);
                                                        setHeaderData({...headerData, navMenu: n});
                                                    }}><X size={10} className='text-gray-300' /></button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => addItem(tIdx, gIdx)}
                                                className='mt-3 text-[8px] font-black text-gray-300 hover:text-[#BC002D] uppercase flex items-center gap-1'
                                            >
                                                <Plus size={10} /> Add Category Link
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                <button 
                                    onClick={() => addGroup(tIdx)}
                                    className='border-2 border-dashed border-gray-100 h-[120px] rounded-lg flex flex-col items-center justify-center text-gray-300 hover:text-[#BC002D] transition-all gap-2'
                                >
                                    <Globe size={20} />
                                    <span className='text-[8px] font-black uppercase'>New Column</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed Action Bar */}
            <div className='fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-6 flex justify-end z-50'>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className='bg-[#BC002D] text-white px-12 py-4 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3'
                >
                    {loading ? <Loader2 className='animate-spin' size={18} /> : <Save size={18} />}
                    Sync Header Changes
                </button>
            </div>
        </div>
    );
};

export default HeaderManager;