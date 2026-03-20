import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  X, Search, Database, Upload, Youtube, 
  Save, RefreshCw, Image as ImageIcon, CheckCircle2 
} from 'lucide-react';
import { assets } from '../assets/assets';
import { backendUrl } from '../App';

const EditBlog = ({ token }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Blog Data States
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("Registry News");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [existingImage, setExistingImage] = useState("");

    // Image Source States
    const [imageFile, setImageFile] = useState(null); // Local Upload
    const [selectedCloudinaryUrl, setSelectedCloudinaryUrl] = useState(""); // Registry Pick
    const [useRegistry, setUseRegistry] = useState(false);

    // Media Library States
    const [allMedia, setAllMedia] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchMedia = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/media/all`, { headers: { token } });
            if (res.data.success) setAllMedia((res.data.media || res.data.files || []).reverse());
        } catch (err) { console.error("Media registry offline"); }
    };

    const fetchBlogDetails = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/blog/list');
            const blog = response.data.blogs.find(item => item._id === id);
            if (blog) {
                setTitle(blog.title);
                setContent(blog.content);
                setCategory(blog.category);
                setYoutubeUrl(blog.youtubeUrl || "");
                setExistingImage(blog.image);
            }
        } catch (error) {
            toast.error("Failed to load intel record");
        }
    }

    useEffect(() => { 
        fetchBlogDetails();
        if (token) fetchMedia();
    }, [id, token]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("id", id);
            formData.append("title", title);
            formData.append("content", content);
            formData.append("category", category);
            formData.append("youtubeUrl", youtubeUrl);

            // Logic: prioritize New File > Registry Pick > Keep Original
            if (imageFile) {
                formData.append("image", imageFile);
            } else if (selectedCloudinaryUrl) {
                formData.append("image", selectedCloudinaryUrl);
            }

            const response = await axios.post(backendUrl + "/api/blog/update", formData, { headers: { token } });
            
            if (response.data.success) {
                toast.success("Archive Record Synchronized");
                navigate('/list-blog');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='max-w-4xl mx-auto pb-20'>
            <form onSubmit={onSubmitHandler} className='p-8 flex flex-col gap-6 bg-white rounded-3xl shadow-sm border border-gray-100'>
                <div className='flex justify-between items-center'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-[#BC002D]'>Update Intel Specimen</p>
                    <div className='flex bg-gray-100 p-1 rounded-xl gap-1'>
                        <button type="button" onClick={() => setUseRegistry(false)} className={`px-4 py-2 rounded-lg text-[9px] font-bold flex items-center gap-2 transition-all ${!useRegistry ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}><Upload size={12}/> DEVICE</button>
                        <button type="button" onClick={() => setUseRegistry(true)} className={`px-4 py-2 rounded-lg text-[9px] font-bold flex items-center gap-2 transition-all ${useRegistry ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}><Database size={12}/> CLOUDINARY</button>
                    </div>
                </div>

                {/* IMAGE SELECTOR */}
                <div className='relative'>
                    {!useRegistry ? (
                        <label htmlFor="blog-image" className='w-full h-80 bg-gray-50 rounded-2xl cursor-pointer border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden'>
                            <img className='w-full h-full object-contain p-4' 
                                 src={imageFile ? URL.createObjectURL(imageFile) : existingImage || assets.upload_area} alt="" />
                            <input onChange={(e)=>setImageFile(e.target.files[0])} type="file" id="blog-image" hidden />
                        </label>
                    ) : (
                        <div onClick={() => setShowMediaPicker(true)} className='w-full h-80 bg-gray-50 rounded-2xl cursor-pointer border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden'>
                            <img src={selectedCloudinaryUrl || existingImage} className='w-full h-full object-contain p-4' alt="Registry Pick" />
                        </div>
                    )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='w-full'>
                        <p className='mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest'>Article Category</p>
                        <select onChange={(e)=>setCategory(e.target.value)} value={category} className='w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-[#BC002D] text-sm font-bold'>
                            <option value="Registry News">Registry News</option>
                            <option value="Historical Analysis">Historical Analysis</option>
                            <option value="Rare Acquisitions">Rare Acquisitions</option>
                        </select>
                    </div>

                    <div className='w-full'>
                        <p className='mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest'>YouTube Link</p>
                        <div className='relative'>
                            <Youtube className='absolute left-4 top-1/2 -translate-y-1/2 text-red-600' size={16} />
                            <input onChange={(e)=>setYoutubeUrl(e.target.value)} value={youtubeUrl} className='w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-[#BC002D] text-sm' placeholder="Video URL..." />
                        </div>
                    </div>
                </div>

                <input onChange={(e)=>setTitle(e.target.value)} value={title} className='text-3xl font-bold border-b border-gray-100 outline-none focus:border-[#BC002D] py-4' placeholder="Headline..." required />
                <textarea onChange={(e)=>setContent(e.target.value)} value={content} className='min-h-[300px] border border-gray-100 p-6 rounded-2xl outline-none focus:border-[#BC002D] leading-relaxed' placeholder="Content..." required />
                
                <button disabled={isSaving} className='bg-black text-white py-4 font-black uppercase tracking-widest rounded-xl hover:bg-[#BC002D] transition-all flex items-center justify-center gap-3'>
                    {isSaving ? <RefreshCw className='animate-spin' size={18}/> : <Save size={18}/>}
                    Commit Changes to Registry
                </button>
            </form>

            {/* MEDIA PICKER MODAL */}
            {showMediaPicker && (
                <div className='fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm'>
                    <div className='bg-white w-full max-w-2xl h-[80vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl'>
                        <div className='p-6 border-b flex justify-between items-center bg-gray-50'>
                            <h3 className='font-black uppercase tracking-widest text-xs'>Select Registry Image</h3>
                            <X className='cursor-pointer' onClick={() => setShowMediaPicker(false)} />
                        </div>
                        <div className='p-4 border-b bg-gray-50'>
                            <input className='w-full p-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-[#BC002D] text-sm' placeholder='Search Specimen ID...' onChange={(e)=>setSearchQuery(e.target.value)} />
                        </div>
                        <div className='flex-1 overflow-y-auto p-2'>
                            {allMedia.filter(m => m.originalName.toLowerCase().includes(searchQuery.toLowerCase())).map((media) => (
                                <div key={media._id} onClick={() => { setSelectedCloudinaryUrl(media.imageUrl); setShowMediaPicker(false); }} className={`flex items-center gap-4 p-3 cursor-pointer rounded-xl hover:bg-gray-50 transition-all ${selectedCloudinaryUrl === media.imageUrl ? 'bg-red-50' : ''}`}>
                                    <img src={media.imageUrl} className='w-12 h-12 object-contain bg-white rounded-lg border' alt="" />
                                    <p className='text-[10px] font-black uppercase flex-1'>{media.originalName}</p>
                                    {selectedCloudinaryUrl === media.imageUrl && <CheckCircle2 size={16} className='text-[#BC002D]'/>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditBlog;