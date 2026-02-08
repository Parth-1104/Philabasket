import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { 
    Upload, Download, RefreshCw, Trash2, Search, ImageIcon,
    CheckSquare, Square, Edit3, Save, X, ExternalLink, Link as LinkIcon 
} from 'lucide-react';

const MediaLibrary = ({ token }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    
    // Gallery State
    const [gallery, setGallery] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");

    // Edit State
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

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

    // --- ACTIONS ---
    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === filteredGallery.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredGallery.map(img => img._id));
        }
    };

    const startEditing = (img) => {
        setEditingId(img._id);
        setEditValue(img.originalName);
    };

    const saveEdit = async (id) => {
        try {
            const res = await axios.post(backendUrl + '/api/product/update-media-name', { id, newName: editValue }, { headers: { token } });
            if (res.data.success) {
                toast.success("Filename updated");
                setEditingId(null);
                fetchGallery();
            }
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async (ids) => {
        const idArray = Array.isArray(ids) ? ids : [ids];
        if (!window.confirm(`Delete ${idArray.length} asset(s)? This action is permanent.`)) return;

        try {
            const res = await axios.post(backendUrl + '/api/product/delete-media', { ids: idArray }, { headers: { token } });
            if (res.data.success) {
                toast.success("Assets purged");
                setSelectedIds([]);
                fetchGallery();
            }
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return toast.error("Select images first");
        setUploading(true);
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("image", files[i]);
            formData.append("originalName", files[i].name);
            try {
                await axios.post(backendUrl + "/api/product/upload-media", formData, { headers: { token } });
                setProgress(Math.round(((i + 1) / files.length) * 100));
            } catch (err) { console.error(err); }
        }
        toast.success("Sync Complete");
        setUploading(false); setFiles([]); setProgress(0); fetchGallery();
    };

    const filteredGallery = gallery.filter(img => {
        const matchesSearch = img.originalName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" ? true : 
                             filterStatus === "assigned" ? img.isAssigned : !img.isAssigned;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className='p-8 bg-gray-50 min-h-screen font-sans'>
            {/* Header */}
            <div className='mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
                <div>
                    <h2 className='text-3xl font-black uppercase tracking-tighter text-gray-900'>Asset Registry</h2>
                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1'>
                        System Management & Filename Reconciliation
                    </p>
                </div>
                <div className='flex gap-3'>
                    {selectedIds.length > 0 && (
                        <button onClick={() => handleDelete(selectedIds)} className='flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-100'>
                            <Trash2 size={14} /> Delete Selected ({selectedIds.length})
                        </button>
                    )}
                    <button onClick={fetchGallery} className='p-3 bg-white border border-gray-200 rounded-xl hover:rotate-180 transition-all duration-700'>
                        <RefreshCw size={16} className={loadingGallery ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-1 xl:grid-cols-4 gap-8'>
                {/* Upload Section */}
                <div className='xl:col-span-1'>
                    <div className='bg-white border border-gray-100 rounded-3xl p-6 sticky top-8'>
                        <h4 className='font-black text-[10px] uppercase tracking-widest mb-4 text-gray-400'>Ingest Media</h4>
                        <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files))} className='hidden' id="bulk-img" />
                        <label htmlFor="bulk-img" className='block w-full text-center border-2 border-dashed border-gray-100 py-8 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all'>
                            <Upload size={20} className='mx-auto mb-2 text-gray-300' />
                            <span className='text-[9px] font-black text-gray-400 uppercase tracking-widest'>Select Local Files</span>
                        </label>
                        {files.length > 0 && (
                            <button onClick={handleUpload} className='mt-4 w-full py-4 bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-xl'>
                                {uploading ? `Uploading ${progress}%` : "Sync to Cloud"}
                            </button>
                        )}
                    </div>
                </div>

                {/* List View Section */}
                <div className='xl:col-span-3 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden'>
                    {/* Toolbar */}
                    <div className='p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center'>
                        <div className='flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl flex-1 w-full'>
                            <Search size={14} className='text-gray-400' />
                            <input type="text" placeholder="Search by filename..." className='bg-transparent outline-none text-xs w-full font-bold' onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <select onChange={(e) => setFilterStatus(e.target.value)} className='bg-gray-50 border-none px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none w-full md:w-auto'>
                            <option value="all">All Media</option>
                            <option value="assigned">Assigned</option>
                            <option value="unassigned">Orphaned</option>
                        </select>
                        <button onClick={selectAll} className='p-2 bg-gray-900 text-white rounded-lg'>
                            {selectedIds.length === filteredGallery.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                        </button>
                    </div>

                    {/* Table Header */}
                    <div className='grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400'>
                        <div className='col-span-1'>Preview</div>
                        <div className='col-span-5'>File Identity</div>
                        <div className='col-span-2'>Status</div>
                        <div className='col-span-2 text-center'>Usage</div>
                        <div className='col-span-2 text-right'>Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className='max-h-[65vh] overflow-y-auto custom-scrollbar'>
                        {filteredGallery.map((img) => (
                            <div key={img._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-50 hover:bg-blue-50/30 transition-all ${selectedIds.includes(img._id) ? 'bg-blue-50/50' : ''}`}>
                                {/* Preview */}
                                <div className='col-span-1 relative group' onClick={() => toggleSelect(img._id)}>
                                    <img src={img.imageUrl} className='w-12 h-12 object-cover rounded-lg border border-gray-100 bg-white' alt="" />
                                    <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center transition-all ${selectedIds.includes(img._id) ? 'bg-black opacity-100' : 'bg-gray-200 opacity-0 group-hover:opacity-100'}`}>
                                        <CheckSquare size={8} className='text-white' />
                                    </div>
                                </div>

                                {/* Identity (Edit Mode / Read Mode) */}
                                <div className='col-span-5'>
                                    {editingId === img._id ? (
                                        <div className='flex items-center gap-2'>
                                            <input 
                                                autoFocus
                                                value={editValue} 
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className='bg-white border border-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold w-full outline-none'
                                            />
                                            <button onClick={() => saveEdit(img._id)} className='p-2 text-green-600'><Save size={16}/></button>
                                            <button onClick={() => setEditingId(null)} className='p-2 text-red-400'><X size={16}/></button>
                                        </div>
                                    ) : (
                                        <div className='flex flex-col'>
                                            <span className='text-xs font-bold text-gray-900 truncate'>{img.originalName}</span>
                                            <span className='text-[8px] text-gray-400 font-mono'>{img._id}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status */}
                                <div className='col-span-2'>
                                    <span className={`text-[8px] px-2 py-1 rounded-full font-black uppercase ${img.isAssigned ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {img.isAssigned ? 'In Catalog' : 'Orphaned'}
                                    </span>
                                </div>

                                {/* Usage Icon */}
                                <div className='col-span-2 flex justify-center'>
                                    {img.isAssigned ? <LinkIcon size={14} className='text-blue-400' /> : <ImageIcon size={14} className='text-gray-200' />}
                                </div>

                                {/* Actions */}
                                <div className='col-span-2 flex justify-end gap-2'>
                                    <button onClick={() => startEditing(img)} className='p-2 text-gray-400 hover:text-black'><Edit3 size={14}/></button>
                                    <a href={img.imageUrl} target="_blank" rel="noreferrer" className='p-2 text-gray-400 hover:text-blue-500'><ExternalLink size={14}/></a>
                                    <button onClick={() => handleDelete(img._id)} className='p-2 text-gray-400 hover:text-red-600'><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e2e2; }
            `}} />
        </div>
    );
};

export default MediaLibrary;