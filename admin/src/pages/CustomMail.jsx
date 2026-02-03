import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Send, Search, UserMinus, CheckCircle2, ImagePlus, Layout, Link as LinkIcon, Upload, X, Eye } from 'lucide-react';
import { backendUrl } from '../App';

const CustomerMail = ({ token }) => {
    const [customers, setCustomers] = useState([]);
    const [excluded, setExcluded] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [bannerImage, setBannerImage] = useState(""); 
    const [uploading, setUploading] = useState(false);
    const [imageMode, setImageMode] = useState("url"); 
    const [templateType, setTemplateType] = useState("light");
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await axios.get(backendUrl + '/api/user/list', { headers: { token } });
                if (res.data.success) setCustomers(res.data.users || []);
            } catch (error) { toast.error("Registry connection failed"); }
        };
        if (token) fetchCustomers();
    }, [token]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image1', file); 
        setUploading(true);
        try {
            const res = await axios.post(backendUrl + '/api/product/upload-single', formData, { 
                headers: { token, 'Content-Type': 'multipart/form-data' } 
            });
            if (res.data.success) {
                setBannerImage(res.data.imageUrl); 
                toast.success("Banner secured in registry");
            } else { toast.error(res.data.message); }
        } catch (error) { toast.error("Registry rejected the file."); }
        finally { setUploading(false); }
    };

    const handleSend = async () => {
        if (!subject || !message) return toast.warning("Complete the briefing before dispatch.");
        setLoading(true);
        try {
            const res = await axios.post(backendUrl + '/api/mail/send-bulk', 
                { target: 'customers', subject, message, excludedEmails: excluded, bannerImage, templateType },
                { headers: { token } }
            );
            if(res.data.success) {
                toast.success("Intelligence Dispatched");
                setSubject(""); setMessage(""); setBannerImage("");
            }
        } catch (error) { toast.error("Dispatch failed"); }
        finally { setLoading(false); }
    };

    const filteredCustomers = customers.filter(c => 
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className='p-8 bg-white rounded-3xl border border-gray-100 min-h-screen'>
            {/* Header */}
            <div className='mb-8 flex justify-between items-end'>
                <div>
                    <h2 className='text-3xl font-black uppercase tracking-tighter'>Intelligence Dispatch</h2>
                    <p className='text-[10px] font-bold text-[#BC002D] uppercase tracking-[0.3em]'>Audience & Creative Control</p>
                </div>
                <div className='flex gap-4'>
                    <button onClick={() => setShowPreview(!showPreview)} className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all'>
                        <Eye size={14}/> {showPreview ? "Close Preview" : "Live Preview"}
                    </button>
                    <div className='bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest'>
                        Net Reach: {customers.length - excluded.length}
                    </div>
                </div>
            </div>
            
            <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
                {/* Left Audience Sidebar */}
                <div className='xl:col-span-1 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col overflow-hidden h-[fit-content] max-h-[800px]'>
                    <div className='p-4 bg-white border-b border-gray-100 flex items-center gap-2'>
                        <Search size={14} className='text-gray-400' />
                        <input onChange={(e)=>setSearchTerm(e.target.value)} type="text" placeholder="Search Registrants..." className='text-xs outline-none w-full bg-transparent' />
                    </div>
                    <div className='overflow-y-auto'>
                        {filteredCustomers.map(c => (
                            <div key={c.email} onClick={() => setExcluded(prev => prev.includes(c.email) ? prev.filter(e => e !== c.email) : [...prev, c.email])}
                                 className={`p-4 border-b border-gray-100 cursor-pointer flex justify-between items-center transition-all ${excluded.includes(c.email) ? 'bg-red-50 opacity-60' : 'hover:bg-white'}`}>
                                <div><p className='text-[11px] font-bold'>{c.name || 'User'}</p><p className='text-[9px] text-gray-400 font-mono'>{c.email}</p></div>
                                {excluded.includes(c.email) ? <UserMinus size={14} className='text-red-500' /> : <CheckCircle2 size={14} className='text-green-500' />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Creative Builder */}
                <div className='xl:col-span-2 space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Theme Toggle */}
                        <div className='p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                            <p className='text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-2'><Layout size={12}/> Select Theme</p>
                            <div className='flex gap-2'>
                                <button onClick={()=>setTemplateType('light')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${templateType==='light' ? 'bg-white border-[#BC002D] text-[#BC002D]' : 'bg-transparent text-gray-400'}`}>Light Mode</button>
                                <button onClick={()=>setTemplateType('dark')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${templateType==='dark' ? 'bg-gray-900 text-white border-gray-900' : 'bg-transparent text-gray-400'}`}>Dark Mode</button>
                            </div>
                        </div>

                        {/* Image Logic Toggle */}
                        <div className='p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                            <div className='flex justify-between items-center mb-2'>
                                <p className='text-[10px] font-black uppercase text-gray-400 flex items-center gap-2'><ImagePlus size={12}/> Banner Image</p>
                                <div className='flex bg-white rounded-md p-1 border border-gray-200'>
                                    <button onClick={()=>setImageMode('url')} className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${imageMode==='url' ? 'bg-[#BC002D] text-white' : 'text-gray-400'}`}>URL</button>
                                    <button onClick={()=>setImageMode('upload')} className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${imageMode==='upload' ? 'bg-[#BC002D] text-white' : 'text-gray-400'}`}>File</button>
                                </div>
                            </div>
                            {imageMode === 'url' ? (
                                <div className='relative flex items-center'>
                                    <LinkIcon size={12} className='absolute left-3 text-gray-400' />
                                    <input value={bannerImage} onChange={(e)=>setBannerImage(e.target.value)} type="text" placeholder="Paste Image Link..." className='w-full pl-8 pr-3 py-2 text-[10px] rounded-lg border outline-none focus:border-[#BC002D] bg-white' />
                                </div>
                            ) : (
                                <label className={`flex items-center justify-center gap-2 w-full py-2 border border-dashed rounded-lg cursor-pointer transition-all ${bannerImage ? 'bg-green-50 border-green-500' : 'bg-white border-gray-300 hover:border-[#BC002D]'}`}>
                                    {uploading ? <span className='text-[10px] font-bold text-gray-400 animate-pulse'>Uploading...</span> : bannerImage ? <span className='text-[10px] font-bold text-green-600'>Success: Image Staged</span> : <span className='text-[10px] font-bold text-gray-500'>Choose Local File</span>}
                                    <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Standardized Banner Preview */}
                    {bannerImage && (
                        <div className='relative rounded-2xl overflow-hidden group border-2 border-[#BC002D]/10'>
                            <div className='w-full aspect-[21/9] md:aspect-[3/1] bg-gray-100'>
                                <img src={bannerImage} className='w-full h-full object-cover object-center transition-transform group-hover:scale-105 duration-700' alt="Banner Preview" />
                            </div>
                            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]'>
                                <button onClick={()=>setBannerImage("")} className='bg-white text-[#BC002D] px-6 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all'>
                                    <X size={14}/> Remove Asset
                                </button>
                            </div>
                            <div className='absolute top-3 left-3 bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest'>Asset Verified</div>
                        </div>
                    )}

                    {/* Form or Email Preview */}
                    {showPreview ? (
                        <div className={`p-8 border rounded-3xl transition-all shadow-xl ${templateType === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
                            {bannerImage && <img src={bannerImage} className='w-full aspect-[3/1] object-cover rounded-xl mb-6 shadow-md' alt="Preview Banner" />}
                            <h3 className='text-2xl font-black uppercase mb-4'>{subject || "No Subject Defined"}</h3>
                            <div className='text-sm leading-relaxed whitespace-pre-wrap'>{message || "No briefing content provided..."}</div>
                        </div>
                    ) : (
                        <div className='bg-white p-6 border border-gray-100 rounded-3xl space-y-4 shadow-sm'>
                            <input value={subject} onChange={e=>setSubject(e.target.value)} className='w-full p-3 border-b text-xl font-bold outline-none focus:border-[#BC002D] placeholder-gray-200' placeholder="Briefing Subject..." />
                            <textarea value={message} onChange={e=>setMessage(e.target.value)} className='w-full h-80 p-4 bg-gray-50 rounded-xl outline-none border-2 border-transparent focus:border-[#BC002D] transition-all text-sm leading-relaxed' placeholder="Type your message content here..." />
                            <button onClick={handleSend} disabled={loading || uploading} className='w-full py-4 bg-black text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#BC002D] transition-all disabled:bg-gray-300 flex items-center justify-center gap-3'>
                                <Send size={18}/> {loading ? "TRANSMITTING..." : "EXECUTE DISPATCH"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerMail;