import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Upload, Download, RefreshCw, Trash2, Search } from 'lucide-react';

const MediaLibrary = ({ token }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    
    // Gallery State
    const [gallery, setGallery] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch registered images from database
    const fetchGallery = async () => {
        setLoadingGallery(true);
        try {
            const res = await axios.get(backendUrl + '/api/product/list-media', { headers: { token } });
            if (res.data.success) setGallery(res.data.media);
        } catch (err) {
            toast.error("Failed to load media registry");
        } finally {
            setLoadingGallery(false);
        }
    };

    useEffect(() => { fetchGallery(); }, []);

    const handleUpload = async () => {
        if (files.length === 0) return toast.error("Select images first");
        setUploading(true);
        let successCount = 0;
        
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("image", files[i]);
            formData.append("originalName", files[i].name);

            try {
                await axios.post(backendUrl + "/api/product/upload-media", formData, { headers: { token } });
                successCount++;
                setProgress(Math.round(((i + 1) / files.length) * 100));
            } catch (err) { console.error(`Failed: ${files[i].name}`); }
        }
        
        toast.success(`Registered ${successCount} assets`);
        setUploading(false);
        setFiles([]);
        setProgress(0);
        fetchGallery(); // Refresh gallery after upload
    };

    // --- FEATURE: DOWNLOAD CSV TEMPLATE ---
    const downloadCsvTemplate = () => {
        if (gallery.length === 0) return toast.warning("Registry is empty");

        const headers = ["name", "price", "description", "year", "country", "category", "stock", "imageName"];
        const rows = gallery.map(item => [
            "", // name
            "", // price
            "", // description
            "", // year
            "India", // country
            "[]", // category
            "1", // stock
            item.originalName // The matched filename
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `PhilaBasket_Bulk_Template_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredGallery = gallery.filter(img => 
        img.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='p-8 bg-white rounded-3xl border border-gray-100 min-h-screen font-sans'>
            {/* Header */}
            <div className='mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
                <div>
                    <h2 className='text-3xl font-black uppercase tracking-tighter'>Media Registry</h2>
                    <p className='text-[10px] font-bold text-blue-600 uppercase tracking-widest'>Asset Database & CSV Generation</p>
                </div>
                <button 
                    onClick={downloadCsvTemplate}
                    className='flex items-center gap-2 bg-amber-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 hover:scale-105 transition-all'
                >
                    <Download size={14} /> Download Bulk CSV Template
                </button>
            </div>

            {/* Upload Area */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12'>
                <div className='lg:col-span-1 border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-gray-50 h-fit'>
                    <Upload size={32} className='text-gray-300 mb-4' />
                    <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files))} className='hidden' id="bulk-img" />
                    <label htmlFor="bulk-img" className='bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600 transition-all'>
                        Select Local Assets
                    </label>
                    <p className='mt-4 text-gray-400 text-[9px] uppercase font-bold'>{files.length} staged for registry</p>
                    
                    {files.length > 0 && (
                        <button onClick={handleUpload} disabled={uploading} className='mt-6 w-full py-3 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl'>
                            {uploading ? `Syncing ${progress}%` : "Execute Upload"}
                        </button>
                    )}
                </div>

                {/* Gallery Viewer */}
                <div className='lg:col-span-2 bg-gray-50 rounded-3xl p-6 border border-gray-100'>
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-gray-200 flex-1 max-w-md'>
                            <Search size={14} className='text-gray-400' />
                            <input 
                                type="text" 
                                placeholder="Search Filename..." 
                                className='bg-transparent outline-none text-xs w-full'
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchGallery} className='p-3 bg-white border border-gray-200 rounded-xl hover:rotate-180 transition-all duration-500'>
                            <RefreshCw size={14} className={loadingGallery ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar'>
                        {filteredGallery.map((img, idx) => (
                            <div key={idx} className='group relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 p-2 shadow-sm'>
                                <img src={img.imageUrl} className='w-full h-full object-contain rounded-lg' alt="" />
                                <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center'>
                                    <p className='text-[8px] text-white font-bold break-all mb-2'>{img.originalName}</p>
                                    <span className={`text-[7px] px-2 py-0.5 rounded-full font-black uppercase ${img.isAssigned ? 'bg-green-500' : 'bg-amber-500'} text-white`}>
                                        {img.isAssigned ? 'In Catalog' : 'Unassigned'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {filteredGallery.length === 0 && !loadingGallery && (
                            <div className='col-span-full py-20 text-center text-gray-400 text-xs font-bold uppercase'>No assets found in registry</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaLibrary;