import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { ImagePlus, Trash2,Plus, Edit3, Save, X, Loader2, Link as LinkIcon } from 'lucide-react';

const BannerManager = ({ token }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ image: '', title: '', link: '' });

    const fetchBanners = async () => {
        const res = await axios.get(backendUrl + '/api/banner/list');
        if (res.data.success) setBanners(res.data.banners);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = editId ? '/api/banner/update' : '/api/banner/add';
            const payload = editId ? { ...formData, id: editId } : formData;
            
            const res = await axios.post(backendUrl + endpoint, payload, { headers: { token } });
            if (res.data.success) {
                toast.success(res.data.message);
                setFormData({ image: '', title: '', link: '' });
                setEditId(null);
                fetchBanners();
            }
        } catch (error) { toast.error("Operation Failed"); }
        finally { setLoading(false); }
    };

    const startEdit = (banner) => {
        setEditId(banner._id);
        setFormData({ image: banner.image, title: banner.title, link: banner.link });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteBanner = async (id) => {
        if (!window.confirm("Purge this banner?")) return;
        const res = await axios.post(backendUrl + '/api/banner/remove', { id }, { headers: { token } });
        if (res.data.success) { toast.success("Deleted"); fetchBanners(); }
    };

    useEffect(() => { fetchBanners(); }, []);

    return (
        <div className='p-6 bg-[#FCF9F4] min-h-screen font-serif pb-20'>
            <div className='mb-10'>
                <h2 className='text-2xl font-black uppercase tracking-tighter'>Hero <span className='text-[#BC002D]'>Banners</span></h2>
                <p className='text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]'>Manage Homepage Visual Strategy</p>
            </div>

            {/* FORM PANEL */}
            <div className='bg-white p-8 border border-gray-100 rounded-sm shadow-sm mb-12 max-w-4xl'>
                <div className='flex items-center gap-3 mb-6'>
                    {editId ? <Edit3 className='text-[#BC002D]' size={18}/> : <ImagePlus className='text-[#BC002D]' size={18}/>}
                    <h3 className='font-black uppercase text-xs tracking-widest'>{editId ? 'Edit Existing Slide' : 'Register New Slide'}</h3>
                </div>
                
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <input 
                        value={formData.image} 
                        onChange={(e)=>setFormData({...formData, image: e.target.value})}
                        placeholder="Cloudinary Image URL..." 
                        className='w-full px-4 py-3 bg-gray-50 border border-gray-100 text-xs outline-none focus:border-[#BC002D]'
                    />
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <input value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} placeholder="Title (e.g. Winter Sale)" className='px-4 py-3 bg-gray-50 border border-gray-100 text-xs outline-none focus:border-[#BC002D]' />
                        <input value={formData.link} onChange={(e)=>setFormData({...formData, link: e.target.value})} placeholder="Redirect Link (e.g. /collection)" className='px-4 py-3 bg-gray-50 border border-gray-100 text-xs outline-none focus:border-[#BC002D]' />
                    </div>
                    <div className='flex gap-2'>
                        <button type='submit' className='bg-black text-white px-10 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#BC002D] transition-all flex items-center gap-2'>
                            {loading ? <Loader2 className='animate-spin' size={14}/> : (editId ? <Save size={14}/> : <Plus size={14}/>)}
                            {editId ? 'Update Banner' : 'Publish Banner'}
                        </button>
                        {editId && <button onClick={() => {setEditId(null); setFormData({image:'', title:'', link:''})}} className='bg-gray-100 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200'>Cancel</button>}
                    </div>
                </form>
            </div>

            {/* PREVIEW GRID */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {banners.map(b => (
                    <div key={b._id} className='group relative bg-white border border-gray-100 p-2 shadow-sm hover:shadow-xl transition-all duration-500'>
                        <div className='relative h-48 overflow-hidden bg-gray-100'>
                            <img src={b.image} className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700' alt="" />
                            <div className='absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <button onClick={() => startEdit(b)} className='p-2 bg-white text-black hover:bg-black hover:text-white rounded-full shadow-lg transition-all'><Edit3 size={14}/></button>
                                <button onClick={() => deleteBanner(b._id)} className='p-2 bg-white text-red-600 hover:bg-red-600 hover:text-white rounded-full shadow-lg transition-all'><Trash2 size={14}/></button>
                            </div>
                        </div>
                        <div className='p-4'>
                            <div className='flex justify-between items-center'>
                                <p className='text-[11px] font-black uppercase tracking-tighter'>{b.title || 'Draft Slide'}</p>
                                {b.link && <div className='flex items-center gap-1 text-[9px] font-bold text-[#BC002D] uppercase'><LinkIcon size={10}/> {b.link}</div>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BannerManager;