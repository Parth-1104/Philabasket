import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { 
    Upload, RefreshCw, Trash2, Search, 
    Edit3, Save, X, ExternalLink, 
    Link as LinkIcon, Database,
    ChevronLeft, ChevronRight, AlertTriangle, Copy, Check, Loader2
} from 'lucide-react';

// ─── Lazy image with IntersectionObserver + blur-up ──────────────────────────
const LazyImage = ({ src, alt, className }) => {
    const [loaded, setLoaded] = useState(false);
    const [inView, setInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { rootMargin: '300px' }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className='w-full h-full relative'>
            {!loaded && (
                <div className='absolute inset-0 rounded-lg shimmer bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100'/>
            )}
            {inView && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                />
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MediaLibrary = ({ token }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Two-phase loading state
    const [gallery, setGallery] = useState([]);
    const [loadingInitial, setLoadingInitial] = useState(false);
    const [loadingRest, setLoadingRest] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [copied, setCopied] = useState(false);

    const INITIAL_BATCH = 50;
    const itemsPerPage = 60;

    const [inspectingAsset, setInspectingAsset] = useState(null);
    const [editValue, setEditValue] = useState("");

    // ── Two-phase fetch: paint first 50, stream the rest in background ───────
    const fetchGallery = useCallback(async () => {
        setLoadingInitial(true);
        setGallery([]);
        try {
            const res = await axios.get(backendUrl + '/api/product/list-media', { headers: { token } });
            if (!res.data.success) return;
            const all = res.data.media;

            // Phase 1: show first 50 immediately
            setGallery(all.slice(0, INITIAL_BATCH));
            setLoadingInitial(false);

            // Phase 2: append the rest in 50-item chunks, yielding between each
            if (all.length > INITIAL_BATCH) {
                setLoadingRest(true);
                const rest = all.slice(INITIAL_BATCH);
                const chunkSize = 50;
                for (let i = 0; i < rest.length; i += chunkSize) {
                    await new Promise(r => setTimeout(r, 0)); // yield to browser
                    setGallery(prev => [...prev, ...rest.slice(i, i + chunkSize)]);
                }
                setLoadingRest(false);
            }
        } catch (err) {
            toast.error("Failed to load media");
            setLoadingInitial(false);
            setLoadingRest(false);
        }
    }, [token]);

    useEffect(() => { fetchGallery(); }, [fetchGallery]);

    // ── Derived / memoised ────────────────────────────────────────────────────
    const filteredGallery = useMemo(() => gallery.filter(img => {
        const matchesSearch = img.originalName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" ? true :
            filterStatus === "assigned" ? img.isAssigned : !img.isAssigned;
        return matchesSearch && matchesFilter;
    }), [gallery, searchTerm, filterStatus]);

    const totalPages = Math.max(1, Math.ceil(filteredGallery.length / itemsPerPage));

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredGallery.slice(start, start + itemsPerPage);
    }, [filteredGallery, currentPage, itemsPerPage]);

    const stats = useMemo(() => ({
        total: gallery.length,
        assigned: gallery.filter(i => i.isAssigned).length,
        orphaned: gallery.filter(i => !i.isAssigned).length,
    }), [gallery]);

    const allPageSelected = paginatedItems.length > 0 && paginatedItems.every(img => selectedIds.includes(img._id));

    // ── Actions ───────────────────────────────────────────────────────────────
    const toggleSelect = (e, id) => {
        e.stopPropagation();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAllOnPage = () => {
        const pageIds = paginatedItems.map(img => img._id);
        const allSelected = pageIds.every(id => selectedIds.includes(id));
        if (allSelected) setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        else setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
    };

    const saveEdit = async () => {
        try {
            const res = await axios.post(backendUrl + '/api/product/update-media-name',
                { id: inspectingAsset._id, newName: editValue },
                { headers: { token } }
            );
            if (res.data.success) {
                toast.success("Name updated");
                setGallery(prev => prev.map(img =>
                    img._id === inspectingAsset._id ? { ...img, originalName: editValue } : img
                ));
                setInspectingAsset(prev => ({ ...prev, originalName: editValue }));
            }
        } catch { toast.error("Update failed"); }
    };

    const handleDelete = async (ids) => {
        const idArray = Array.isArray(ids) ? ids : [ids];
        if (!window.confirm(`Delete ${idArray.length} asset(s)? This cannot be undone.`)) return;
        try {
            const res = await axios.post(backendUrl + '/api/product/delete-media', { ids: idArray }, { headers: { token } });
            if (res.data.success) {
                toast.success(`${idArray.length} asset(s) deleted`);
                setSelectedIds(prev => prev.filter(id => !idArray.includes(id)));
                if (inspectingAsset && idArray.includes(inspectingAsset._id)) setInspectingAsset(null);
                fetchGallery();
            }
        } catch { toast.error("Deletion failed"); }
    };

    const handleUpload = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (!selectedFiles.length) return;
        setUploading(true);
        for (let i = 0; i < selectedFiles.length; i++) {
            const formData = new FormData();
            formData.append("image", selectedFiles[i]);
            formData.append("originalName", selectedFiles[i].name);
            try {
                await axios.post(backendUrl + "/api/product/upload-media", formData, { headers: { token } });
                setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
            } catch (err) { console.error(err); }
        }
        toast.success("Upload complete");
        setUploading(false); setProgress(0); fetchGallery();
    };

    const copyUrl = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className='flex flex-col h-screen bg-gray-50 overflow-hidden' style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

                @keyframes shimmer {
                    0%   { background-position: -600px 0; }
                    100% { background-position:  600px 0; }
                }
                .shimmer {
                    background: linear-gradient(90deg, #f0f0f0 25%, #fafafa 50%, #f0f0f0 75%);
                    background-size: 1200px 100%;
                    animation: shimmer 1.5s infinite linear;
                }

                .thumb-card { transition: box-shadow 0.15s ease, transform 0.15s ease; }
                .thumb-card:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(0,0,0,0.13); }
                .thumb-card.is-active  { box-shadow: 0 0 0 2.5px #2563eb; transform: scale(0.97); }
                .thumb-card.is-selected { box-shadow: 0 0 0 2.5px #3b82f6; }

                .sidebar-in { animation: sideIn 0.2s ease; }
                @keyframes sideIn { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }

                .scroll { overflow-y: auto; scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
                .scroll::-webkit-scrollbar { width: 5px; }
                .scroll::-webkit-scrollbar-track { background: transparent; }
                .scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }

                .prog-bar { transition: width 0.3s ease; }
                select { appearance: none; -webkit-appearance: none; }
            `}} />

            {/* ── Header ───────────────────────────────────────────────────── */}
            <header className='bg-white border-b border-gray-200 px-6 py-3.5 flex-shrink-0 z-10'>
                <div className='flex items-center justify-between gap-4 flex-wrap'>

                    {/* Title + stat pills */}
                    <div className='flex items-center gap-5'>
                        <div>
                            <h1 className='text-base font-bold text-gray-900 leading-tight' style={{ letterSpacing: '-0.02em' }}>
                                Media Library
                            </h1>
                            <p className='text-[10px] text-gray-400 leading-none mt-0.5' style={{ fontFamily: "'DM Mono', monospace" }}>
                                Philatelic Asset Registry
                            </p>
                        </div>

                        <div className='flex items-center gap-1.5'>
                            {[
                                { label: 'Total',    value: stats.total,    filter: 'all',        cls: 'bg-gray-100 text-gray-700' },
                                { label: 'Assigned', value: stats.assigned, filter: 'assigned',   cls: 'bg-emerald-50 text-emerald-700' },
                                { label: 'Orphaned', value: stats.orphaned, filter: 'unassigned', cls: 'bg-red-50 text-red-600' },
                            ].map(s => (
                                <button key={s.label}
                                    onClick={() => { setFilterStatus(s.filter); setCurrentPage(1); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:brightness-95 transition-all ${s.cls}`}
                                >
                                    <span className='font-bold'>{s.value}</span>
                                    <span className='opacity-70 font-medium'>{s.label}</span>
                                </button>
                            ))}

                            {loadingRest && (
                                <span className='flex items-center gap-1.5 text-[11px] text-gray-400 ml-1'>
                                    <Loader2 size={11} className='animate-spin'/> loading more…
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Search + actions */}
                    <div className='flex items-center gap-2'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={13}/>
                            <input
                                type="text"
                                placeholder="Search assets…"
                                className='bg-gray-50 border border-gray-200 pl-9 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-52 transition-all placeholder:text-gray-400'
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <button
                            onClick={fetchGallery}
                            className='p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800'
                            title="Refresh"
                        >
                            <RefreshCw size={14} className={loadingInitial ? 'animate-spin' : ''}/>
                        </button>
                        <label className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-colors shadow-sm select-none'>
                            <Upload size={13}/> Upload
                            <input type="file" multiple accept="image/*" onChange={handleUpload} className='hidden'/>
                        </label>
                    </div>
                </div>

                {/* Upload progress bar */}
                {uploading && (
                    <div className='mt-3'>
                        <div className='flex justify-between text-[11px] text-gray-400 mb-1'>
                            <span>Uploading… {progress}%</span>
                            <span>Please wait</span>
                        </div>
                        <div className='h-1 bg-gray-100 rounded-full overflow-hidden'>
                            <div className='prog-bar h-full bg-blue-500 rounded-full' style={{ width: `${progress}%` }}/>
                        </div>
                    </div>
                )}
            </header>

            {/* ── Body ─────────────────────────────────────────────────────── */}
            <div className='flex flex-1 overflow-hidden'>

                {/* ── Main grid panel ─────────────────────────────────────── */}
                <div className='flex-1 flex flex-col overflow-hidden'>

                    {/* Toolbar */}
                    <div className='flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                            {/* Select all on page */}
                            <button
                                onClick={selectAllOnPage}
                                className='flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors'
                            >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0
                                    ${allPageSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                    {allPageSelected && <Check size={10} className='text-white' strokeWidth={3}/>}
                                </div>
                                <span className='font-medium whitespace-nowrap'>
                                    {allPageSelected ? 'Deselect page' : 'Select page'}
                                </span>
                            </button>

                            {selectedIds.length > 0 && (
                                <div className='flex items-center gap-2 pl-3 border-l border-gray-200'>
                                    <span className='text-xs font-semibold text-blue-600 whitespace-nowrap'>
                                        {selectedIds.length} selected
                                    </span>
                                    <button
                                        onClick={() => handleDelete(selectedIds)}
                                        className='flex items-center gap-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap'
                                    >
                                        <Trash2 size={11}/> Delete
                                    </button>
                                    <button
                                        onClick={() => setSelectedIds([])}
                                        className='text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors'
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className='flex items-center gap-3'>
                            <div className='relative'>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                    className='text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer'
                                >
                                    <option value="all">All assets</option>
                                    <option value="assigned">Assigned only</option>
                                    <option value="unassigned">Orphaned only</option>
                                </select>
                                <svg className='absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                                    <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7'/>
                                </svg>
                            </div>
                            <span className='text-[11px] text-gray-400' style={{ fontFamily: "'DM Mono', monospace" }}>
                                {filteredGallery.length} items
                            </span>
                        </div>
                    </div>

                    {/* ── Image Grid ─────────────────────────────────────────── */}
                    <div className='flex-1 scroll p-4'>
                        {loadingInitial ? (
                            /* Skeleton placeholders while first batch loads */
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3'>
                                {Array.from({ length: 18 }).map((_, i) => (
                                    <div key={i} className='aspect-square rounded-xl overflow-hidden'>
                                        <div className='w-full h-full shimmer'/>
                                    </div>
                                ))}
                            </div>
                        ) : paginatedItems.length === 0 ? (
                            <div className='h-full flex flex-col items-center justify-center gap-3 text-gray-400'>
                                <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center'>
                                    <Database size={24} className='opacity-30'/>
                                </div>
                                <p className='text-sm font-medium text-gray-500'>No assets found</p>
                                <p className='text-xs text-gray-300'>Try adjusting your search or filter</p>
                            </div>
                        ) : (
                            /*
                             * Grid: 2 → 3 → 4 → 5 → 6 → 7 columns as viewport grows.
                             * Each card is square and larger than before (aspect-square + no tiny gap).
                             */
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3'>
                                {paginatedItems.map((img) => {
                                    const isSelected = selectedIds.includes(img._id);
                                    const isActive   = inspectingAsset?._id === img._id;
                                    return (
                                        <div
                                            key={img._id}
                                            onClick={() => { setInspectingAsset(img); setEditValue(img.originalName); }}
                                            className={`thumb-card relative bg-white rounded-xl overflow-hidden cursor-pointer border-2 group aspect-square
                                                ${isActive    ? 'is-active border-blue-500'
                                                : isSelected  ? 'is-selected border-blue-400'
                                                              : 'border-transparent'}`}
                                        >
                                            {/* Lazy image fills card */}
                                            <div className='absolute inset-0 p-2.5'>
                                                <LazyImage
                                                    src={img.imageUrl}
                                                    alt={img.originalName}
                                                    className='w-full h-full object-contain mix-blend-multiply'
                                                />
                                            </div>

                                            {/* Hover tint */}
                                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition-colors pointer-events-none'/>

                                            {/* Checkbox (visible on hover / when selected) */}
                                            <button
                                                onClick={(e) => toggleSelect(e, img._id)}
                                                className={`absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center z-10 shadow-sm transition-all
                                                    ${isSelected
                                                        ? 'bg-blue-600 border-2 border-blue-600 opacity-100'
                                                        : 'bg-white/90 border-2 border-gray-300 opacity-0 group-hover:opacity-100'}`}
                                            >
                                                {isSelected && <Check size={11} className='text-white' strokeWidth={3}/>}
                                            </button>

                                            {/* Orphaned indicator */}
                                            {!img.isAssigned && (
                                                <div className='absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white z-10'/>
                                            )}

                                            {/* Filename tooltip — revealed on hover */}
                                            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-5 pb-2 px-2.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                                                <p className='text-white text-[9px] truncate leading-tight' style={{ fontFamily: "'DM Mono', monospace" }}>
                                                    {img.originalName}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className='flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2.5 flex items-center justify-between'>
                        <span className='text-[11px] text-gray-400' style={{ fontFamily: "'DM Mono', monospace" }}>
                            Page {currentPage} / {totalPages}
                        </span>
                        <div className='flex items-center gap-1'>
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className='p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                            >
                                <ChevronLeft size={16}/>
                            </button>

                            {/* Sliding window of page numbers */}
                            {(() => {
                                const start = Math.max(1, currentPage - 2);
                                const end   = Math.min(totalPages, start + 4);
                                return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                                            ${currentPage === p ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        {p}
                                    </button>
                                ));
                            })()}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className='p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                            >
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Inspection Sidebar ──────────────────────────────────── */}
                {inspectingAsset && (
                    <aside className='sidebar-in w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden'>

                        {/* Sidebar header */}
                        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0'>
                            <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                                Asset Details
                            </span>
                            <button
                                onClick={() => setInspectingAsset(null)}
                                className='p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors'
                            >
                                <X size={15}/>
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className='flex-1 scroll'>

                            {/* Preview */}
                            <div className='p-5 border-b border-gray-100'>
                                <div className='aspect-square bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden'>
                                    <img
                                        src={inspectingAsset.imageUrl}
                                        alt={inspectingAsset.originalName}
                                        className='max-w-full max-h-full object-contain p-4 mix-blend-multiply'
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className='px-5 py-3.5 border-b border-gray-100 flex items-center justify-between'>
                                <span className='text-xs text-gray-500'>Status</span>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    inspectingAsset.isAssigned
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-red-50 text-red-600'
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${inspectingAsset.isAssigned ? 'bg-emerald-500' : 'bg-red-500'}`}/>
                                    {inspectingAsset.isAssigned ? 'Assigned' : 'Orphaned'}
                                </span>
                            </div>

                            {/* Name edit */}
                            <div className='px-5 py-4 border-b border-gray-100 space-y-2'>
                                <label className='text-xs font-semibold text-gray-500 flex items-center gap-1.5'>
                                    <Edit3 size={11}/> File Name
                                </label>
                                <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className='w-full text-[11px] bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-h-[72px] resize-none text-gray-800 transition-all leading-relaxed'
                                    style={{ fontFamily: "'DM Mono', monospace" }}
                                />
                                <button
                                    onClick={saveEdit}
                                    disabled={editValue === inspectingAsset.originalName}
                                    className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors'
                                >
                                    <Save size={12}/> Save Changes
                                </button>
                            </div>

                            {/* URL */}
                            <div className='px-5 py-4 border-b border-gray-100 space-y-2'>
                                <label className='text-xs font-semibold text-gray-500 flex items-center gap-1.5'>
                                    <LinkIcon size={11}/> URL
                                </label>
                                <div className='flex items-center gap-2'>
                                    <div
                                        className='flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-500 truncate'
                                        style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px' }}
                                    >
                                        {inspectingAsset.imageUrl}
                                    </div>
                                    <button
                                        onClick={() => copyUrl(inspectingAsset.imageUrl)}
                                        title="Copy URL"
                                        className='flex-shrink-0 p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-500'
                                    >
                                        {copied
                                            ? <Check size={12} className='text-emerald-500'/>
                                            : <Copy size={12}/>}
                                    </button>
                                </div>
                            </div>

                            {/* Format */}
                            <div className='px-5 py-4'>
                                <p className='text-xs font-semibold text-gray-400 mb-1'>Format</p>
                                <p className='text-xs text-gray-600'>Cloudinary CDN Asset</p>
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className='flex-shrink-0 border-t border-gray-100 p-4 space-y-2'>
                            <a
                                href={inspectingAsset.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className='w-full flex items-center justify-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 py-2.5 rounded-lg font-medium transition-colors'
                            >
                                <ExternalLink size={12}/> Open in new tab
                            </a>
                            <button
                                onClick={() => handleDelete(inspectingAsset._id)}
                                className='w-full flex items-center justify-center gap-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-lg font-medium transition-colors border border-red-100'
                            >
                                <AlertTriangle size={12}/> Delete this asset
                            </button>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default MediaLibrary;