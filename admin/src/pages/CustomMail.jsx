import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Send, Search, UserMinus, CheckCircle2, ImagePlus, Layout, Link as LinkIcon, Upload, X, Eye, RefreshCw, ShieldAlert } from 'lucide-react';
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
                toast.success("Asset verified and staged");
            } else { toast.error(res.data.message); }
        } catch (error) { toast.error("File sync rejected by registry."); }
        finally { setUploading(false); }
    };

    const handleSend = async () => {
        if (!subject || !message) return toast.warning("Briefing incomplete. Provide subject and message.");
        
        const netReach = customers.length - excluded.length;
        
        // --- ADDED: CONFIRMATION POPUP ---
        const confirmDispatch = window.confirm(
            `CONFIRM DISPATCH\n\nTarget Reach: ${netReach} Customers\nSubject: ${subject}\n\nExecute transmission? This cannot be revoked.`
        );

        if (!confirmDispatch) return;

        setLoading(true);
        try {
            const res = await axios.post(backendUrl + '/api/mail/send-bulk', 
                { target: 'customers', subject, message, excludedEmails: excluded, bannerImage, templateType },
                { headers: { token } }
            );
            if(res.data.success) {
                toast.success("Intelligence Dispatched successfully");
                setSubject(""); setMessage(""); setBannerImage(""); setExcluded([]);
            }
        } catch (error) { 
            toast.error(error.response?.data?.message || "Transmission failed."); 
        }
        finally { setLoading(false); }
    };

    const filteredCustomers = customers.filter(c => 
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className='p-8 bg-white min-h-screen font-sans relative'>
            {/* Header */}
            <div className='mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
                <div>
                    <h2 className='text-3xl font-black uppercase tracking-tighter'>Intelligence Dispatch</h2>
                    <p className='text-[10px] font-black text-[#BC002D] uppercase tracking-[0.4em]'>Curation & Creative Console</p>
                </div>
                <div className='flex gap-4 w-full md:w-auto'>
                    <button onClick={() => setShowPreview(!showPreview)} className='flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all'>
                        {showPreview ? <><X size={14}/> Edit Draft</> : <><Eye size={14}/> Live Preview</>}
                    </button>
                    <div className='flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#BC002D] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100'>
                        Reach: {customers.length - excluded.length}
                    </div>
                </div>
            </div>
            
            <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
                {/* Audience Selection */}
                <div className='xl:col-span-1 border border-gray-100 rounded-3xl bg-gray-50 flex flex-col overflow-hidden h-[fit-content] max-h-[700px] shadow-sm'>
                    <div className='p-5 bg-white border-b border-gray-100 flex items-center gap-3'>
                        <Search size={16} className='text-gray-300' />
                        <input onChange={(e)=>setSearchTerm(e.target.value)} type="text" placeholder="Search Registrants..." className='text-[11px] font-bold outline-none w-full bg-transparent placeholder:text-gray-300' />
                    </div>
                    <div className='overflow-y-auto custom-scrollbar'>
                        {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                            <div key={c.email} onClick={() => setExcluded(prev => prev.includes(c.email) ? prev.filter(e => e !== c.email) : [...prev, c.email])}
                                 className={`p-5 border-b border-gray-100 cursor-pointer flex justify-between items-center transition-all ${excluded.includes(c.email) ? 'bg-red-50/50' : 'hover:bg-white'}`}>
                                <div className={excluded.includes(c.email) ? 'opacity-40' : ''}>
                                    <p className='text-[11px] font-black uppercase tracking-tight'>{c.name || 'Anonymous User'}</p>
                                    <p className='text-[9px] text-gray-400 font-mono tracking-tighter'>{c.email}</p>
                                </div>
                                {excluded.includes(c.email) ? <UserMinus size={16} className='text-red-500' /> : <CheckCircle2 size={16} className='text-green-500' />}
                            </div>
                        )) : (
                            <div className='p-10 text-center text-gray-400 text-[10px] font-black uppercase'>No matches found</div>
                        )}
                    </div>
                </div>

                {/* Dispatch Builder */}
                <div className='xl:col-span-2 space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='p-5 bg-gray-50 rounded-3xl border border-gray-100'>
                            <p className='text-[9px] font-black uppercase text-gray-400 mb-3 flex items-center gap-2'><Layout size={12}/> Email Palette</p>
                            <div className='flex gap-2 bg-white p-1 rounded-2xl border border-gray-200'>
                                <button onClick={()=>setTemplateType('light')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${templateType==='light' ? 'bg-[#BC002D] text-white shadow-lg' : 'text-gray-300 hover:text-black'}`}>Light</button>
                                <button onClick={()=>setTemplateType('dark')} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${templateType==='dark' ? 'bg-black text-white shadow-lg' : 'text-gray-300 hover:text-black'}`}>Dark</button>
                            </div>
                        </div>

                        <div className='p-5 bg-gray-50 rounded-3xl border border-gray-100'>
                            <div className='flex justify-between items-center mb-3'>
                                <p className='text-[9px] font-black uppercase text-gray-400 flex items-center gap-2'><ImagePlus size={12}/> Briefing Banner</p>
                                <div className='flex bg-white rounded-xl p-1 border border-gray-200'>
                                    <button onClick={()=>setImageMode('url')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${imageMode==='url' ? 'bg-[#BC002D] text-white' : 'text-gray-300'}`}>URL</button>
                                    <button onClick={()=>setImageMode('upload')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${imageMode==='upload' ? 'bg-[#BC002D] text-white' : 'text-gray-300'}`}>Local</button>
                                </div>
                            </div>
                            {imageMode === 'url' ? (
                                <div className='relative flex items-center'>
                                    <LinkIcon size={12} className='absolute left-4 text-gray-400' />
                                    <input value={bannerImage} onChange={(e)=>setBannerImage(e.target.value)} type="text" placeholder="Intelligence Source Link..." className='w-full pl-10 pr-3 py-3 text-[10px] font-bold rounded-xl border outline-none focus:border-[#BC002D] bg-white placeholder:text-gray-200' />
                                </div>
                            ) : (
                                <label className={`flex items-center justify-center gap-3 w-full py-3 border border-dashed rounded-xl cursor-pointer transition-all ${bannerImage ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-[#BC002D]'}`}>
                                    {uploading ? <RefreshCw size={14} className='animate-spin text-gray-400'/> : <Upload size={14} className={bannerImage ? 'text-green-500' : 'text-gray-400'}/>}
                                    <span className={`text-[10px] font-black uppercase ${bannerImage ? 'text-green-600' : 'text-gray-400'}`}>{uploading ? "Uploading..." : bannerImage ? "Asset Secured" : "Browse Files"}</span>
                                    <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                                </label>
                            )}
                        </div>
                    </div>

                    {showPreview ? (
                        <div className={`p-10 border rounded-[40px] transition-all shadow-2xl relative overflow-hidden ${templateType === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
                            {bannerImage && <img src={bannerImage} className='w-full aspect-[21/9] object-cover rounded-2xl mb-8 shadow-2xl' alt="Preview" />}
                            <h3 className='text-3xl font-black uppercase tracking-tighter mb-6'>{subject || "Mission Subject Pending"}</h3>
                            <div className='text-[13px] leading-relaxed whitespace-pre-wrap font-medium'>{message || "No briefing content established..."}</div>
                        </div>
                    ) : (
                        <div className='bg-white p-8 border border-gray-100 rounded-[40px] space-y-6 shadow-sm relative overflow-hidden'>
                            {loading && (
                                <div className='absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300'>
                                    <RefreshCw size={40} className='text-[#BC002D] animate-spin mb-4' />
                                    <p className='text-[11px] font-black uppercase tracking-[0.4em] text-[#BC002D]'>Dispatching Intelligence...</p>
                                </div>
                            )}
                            <input value={subject} onChange={e=>setSubject(e.target.value)} className='w-full p-4 border-b-2 text-2xl font-black uppercase tracking-tighter outline-none focus:border-[#BC002D] placeholder-gray-100' placeholder="Briefing Subject..." />
                            <textarea value={message} onChange={e=>setMessage(e.target.value)} className='w-full h-96 p-6 bg-gray-50 rounded-3xl outline-none border-2 border-transparent focus:border-[#BC002D] transition-all text-sm font-bold leading-relaxed placeholder:text-gray-300' placeholder="Type your strategic message here..." />
                            <button onClick={handleSend} disabled={loading || uploading} className='w-full py-5 bg-black text-white font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-[#BC002D] transition-all disabled:bg-gray-100 flex items-center justify-center gap-4 shadow-xl active:scale-95'>
                                {loading ? <RefreshCw size={18} className='animate-spin'/> : <Send size={18}/>}
                                {loading ? "TRANSMITTING..." : "EXECUTE DISPATCH"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default CustomerMail;