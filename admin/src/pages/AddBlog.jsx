import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import { Search, X, Image as ImageIcon, CheckCircle2, Upload, Database, Youtube } from 'lucide-react';

const AddBlog = ({ token }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    
    // Image Handling
    const [imageFile, setImageFile] = useState(null); // From device
    const [selectedCloudinaryUrl, setSelectedCloudinaryUrl] = useState(""); // From Registry
    const [useRegistry, setUseRegistry] = useState(false); 

    const [allMedia, setAllMedia] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const fetchMedia = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/media/all`, { headers: { token } });
            if (res.data.success) {
                setAllMedia((res.data.media || res.data.files || []).reverse());
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { if (token) fetchMedia(); }, [token]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("youtubeUrl", youtubeUrl);

        if (useRegistry) {
            if (!selectedCloudinaryUrl) return toast.error("Select an image from registry");
            formData.append("image", selectedCloudinaryUrl); // Sent as string
        } else {
            if (!imageFile) return toast.error("Upload an image from device");
            formData.append("image", imageFile); // Sent as file
        }
    
        try {
            const response = await axios.post(backendUrl + "/api/blog/add", formData, { headers: { token } });
            if (response.data.success) {
                toast.success("Article Published");
                setTitle(''); setContent(''); setYoutubeUrl('');
                setImageFile(null); setSelectedCloudinaryUrl("");
            }
        } catch (error) { toast.error("Publishing failed"); }
    };

    return (
        <div className='max-w-4xl mx-auto pb-20'>
            <form onSubmit={onSubmitHandler} className='p-8 flex flex-col gap-6 bg-white rounded-3xl border border-gray-100 shadow-sm'>
                <div className='flex justify-between items-center'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-[#BC002D]'>Archive Publisher</p>
                    <div className='flex bg-gray-100 p-1 rounded-xl gap-1'>
                        <button type="button" onClick={() => setUseRegistry(false)} className={`px-4 py-2 rounded-lg text-[9px] font-bold flex items-center gap-2 transition-all ${!useRegistry ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}><Upload size={12}/> DEVICE</button>
                        <button type="button" onClick={() => setUseRegistry(true)} className={`px-4 py-2 rounded-lg text-[9px] font-bold flex items-center gap-2 transition-all ${useRegistry ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}><Database size={12}/> Cloudinary</button>
                    </div>
                </div>
                
                {/* IMAGE SELECTOR */}
                {!useRegistry ? (
                    <label htmlFor="device-upload" className='w-full h-80 bg-gray-50 rounded-2xl cursor-pointer border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden'>
                        {imageFile ? <img src={URL.createObjectURL(imageFile)} className='w-full h-full object-contain p-4' /> : <div className='flex flex-col items-center gap-2 text-gray-400'><Upload size={40} strokeWidth={1}/><p className='text-[10px] font-bold uppercase'>Upload from PC</p></div>}
                        <input type="file" id="device-upload" hidden onChange={(e)=>setImageFile(e.target.files[0])} />
                    </label>
                ) : (
                    <div onClick={() => setShowMediaPicker(true)} className='w-full h-80 bg-gray-50 rounded-2xl cursor-pointer border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden'>
                        {selectedCloudinaryUrl ? <img src={selectedCloudinaryUrl} className='w-full h-full object-contain p-4' /> : <div className='flex flex-col items-center gap-2 text-gray-400'><Database size={40} strokeWidth={1}/><p className='text-[10px] font-bold uppercase'>Browse Registry</p></div>}
                    </div>
                )}

                <div className='space-y-4'>
                    <input onChange={(e)=>setTitle(e.target.value)} value={title} className='w-full text-3xl font-bold border-b border-gray-100 outline-none focus:border-[#BC002D] py-4' placeholder="Article Headline..." required />
                    
                    <div className='relative'>
                        <Youtube className='absolute left-4 top-1/2 -translate-y-1/2 text-red-600' size={18} />
                        <input onChange={(e)=>setYoutubeUrl(e.target.value)} value={youtubeUrl} className='w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#BC002D]' placeholder="YouTube Video Link (Optional)..." />
                    </div>

                    <textarea onChange={(e)=>setContent(e.target.value)} value={content} className='w-full min-h-[300px] border border-gray-100 p-6 rounded-2xl outline-none focus:border-[#BC002D]' placeholder="Write history..." required />
                </div>

                <button className='bg-[#BC002D] text-white py-4 font-black uppercase tracking-widest rounded-xl hover:bg-black'>Publish to Registry</button>
            </form>

            {/* MEDIA MODAL (Keep your existing search logic here) */}
            {/* --- UPDATED MEDIA MODAL --- */}
{/* --- UPDATED MEDIA PICKER (LIST VIEW) --- */}
{showMediaPicker && (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm'>
        <div className='bg-white w-full max-w-2xl h-[80vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl'>
            {/* Header */}
            <div className='p-6 border-b flex justify-between items-center bg-gray-50'>
                <div className='flex items-center gap-3'>
                    <Database size={18} className='text-[#BC002D]' />
                    <h3 className='font-black uppercase tracking-widest text-xs'>Registry Media List</h3>
                </div>
                <X className='cursor-pointer text-gray-400 hover:text-black' onClick={() => setShowMediaPicker(false)} />
            </div>
            
            {/* Search Bar */}
            <div className='p-4 bg-gray-50 border-b'>
                <input 
                    className='w-full p-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-[#BC002D] text-sm' 
                    placeholder='Search Specimen ID...' 
                    autoFocus
                    onChange={(e)=>setSearchQuery(e.target.value)} 
                />
            </div>

            {/* --- LIST CONTAINER --- */}
            <div className='flex-1 overflow-y-auto p-2 flex flex-col gap-1'>
                {allMedia
                    .filter(m => m.originalName.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((media) => (
                        <div 
                            key={media._id}
                            onClick={() => { setSelectedCloudinaryUrl(media.imageUrl); setShowMediaPicker(false); }}
                            className={`group flex items-center gap-4 p-3 cursor-pointer rounded-xl transition-all border-2
                                ${selectedCloudinaryUrl === media.imageUrl ? 'border-[#BC002D] bg-[#BC002D]/5' : 'border-transparent hover:bg-gray-50'}`}
                        >
                            {/* Small Image Preview */}
                            <div className='w-16 h-16 bg-white border border-gray-100 rounded-lg overflow-hidden flex-shrink-0'>
                                <img 
                                    src={media.imageUrl} 
                                    className='w-full h-full object-contain p-1' 
                                    alt={media.originalName} 
                                />
                            </div>

                            {/* Filename & Details */}
                            <div className='flex-1 min-w-0'>
                                <p className='text-[11px] font-black text-black uppercase tracking-tight truncate'>
                                    {media.originalName.split('.')[0]}
                                </p>
                                <p className='text-[9px] text-gray-400 font-bold uppercase tracking-widest'>
                                    Cloudinary Asset • {media.originalName.split('.').pop()}
                                </p>
                            </div>
                            
                            {/* Selection Logic */}
                            <div className='flex-shrink-0 pr-2'>
                                {selectedCloudinaryUrl === media.imageUrl ? (
                                    <CheckCircle2 size={18} className='text-[#BC002D]' />
                                ) : (
                                    <div className='w-5 h-5 border-2 border-gray-100 rounded-full group-hover:border-[#BC002D]/30 transition-colors' />
                                )}
                            </div>
                        </div>
                    ))}
                
                {allMedia.filter(m => m.originalName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div className='p-20 text-center text-gray-400 italic text-[10px] uppercase tracking-widest'>
                        No specimens found matching your search.
                    </div>
                )}
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default AddBlog;