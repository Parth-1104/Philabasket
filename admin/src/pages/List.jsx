import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { 
  Search, Trash2, Edit3, X, Image as ImageIcon, Video, 
  Layers, Tag, Save, Eye, Youtube, Pin, Power, PowerOff, 
  CheckSquare, Square, EyeOff, Star, Zap, Filter,
  ChevronLeft, ChevronRight, RotateCcw, AlertTriangle,
  Package
} from 'lucide-react';

const ITEMS_PER_PAGE = 80;

// ─── Small reusable badge ─────────────────────────────────────────────────────
const Badge = ({ children, color = "gray" }) => {
  const map = {
    amber: "bg-amber-100 text-amber-700",
    blue:  "bg-blue-100 text-blue-700",
    red:   "bg-red-100 text-red-700",
    gray:  "bg-gray-100 text-gray-500",
    green: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${map[color]}`}>
      {children}
    </span>
  );
};

// ─── Tab button ────────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, children, count, color = "black" }) => {
  const activeMap = { black: "bg-black text-white", red: "bg-[#BC002D] text-white" };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all
        ${active ? activeMap[color] : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"}`}
    >
      {children}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
          {count}
        </span>
      )}
    </button>
  );
};

const List = ({ token }) => {
  // ── View mode: "active" | "trash" ──────────────────────────────────────────
  const [viewMode, setViewMode] = useState("active");

  // ── Active list state ───────────────────────────────────────────────────────
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterBestseller, setFilterBestseller] = useState(false);
  const [filterNewArrival, setFilterNewArrival] = useState(false);

  // ── Trash list state ────────────────────────────────────────────────────────
  const [trashList, setTrashList] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashTotal, setTrashTotal] = useState(0);
  const [trashPage, setTrashPage] = useState(1);
  const [trashTotalPages, setTrashTotalPages] = useState(1);
  const [trashSearch, setTrashSearch] = useState("");
  const [trashSelectedIds, setTrashSelectedIds] = useState([]);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // ── Fetch active products (paginated) ──────────────────────────────────────
  const fetchList = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/product/list`, {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
          includeHidden: 'false', // Backend must use this to filter the count
          bestseller: filterBestseller ? 'true' : undefined,
          newArrival: filterNewArrival ? 'true' : undefined,
        }
      });
      if (res.data.success) {
        setList(res.data.products);
        // Use the total from the backend which respects the 'includeHidden: false' filter
        setTotalCount(res.data.total); 
        setTotalPages(Math.max(1, Math.ceil(res.data.total / ITEMS_PER_PAGE)));
        setCurrentPage(page);
      }
    } catch { 
      toast.error("Failed to load products"); 
    } finally { 
      setLoading(false); 
    }
  }, [searchTerm, filterBestseller, filterNewArrival]);

  // ── Fetch trash (inactive products) ────────────────────────────────────────
  // ── Fetch trash (inactive products) ────────────────────────────────────────
  const fetchTrash = useCallback(async (page = 1) => {
    try {
      setTrashLoading(true);
      const res = await axios.get(`${backendUrl}/api/product/list`, {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          search: trashSearch,
          includeHidden: 'true',
          onlyHidden: 'true',   
        }
      });
  
      if (res.data.success) {
        // Filter for inactive products
        const inactiveItems = res.data.products.filter(p => p.isActive === false);
        setTrashList(inactiveItems);
  
        // Handle total count: prioritize a specific trash count from backend if available
        // otherwise fallback to the total returned when 'onlyHidden' is active.
        const accurateTrashTotal = res.data.trashTotal || res.data.total;
        
        setTrashTotal(accurateTrashTotal);
        setTrashTotalPages(Math.max(1, Math.ceil(accurateTrashTotal / ITEMS_PER_PAGE)));
        setTrashPage(page);
      }
    } catch (err) { 
      toast.error("Failed to load trash"); 
    } finally { 
      setTrashLoading(false); 
    }
  }, [trashSearch]);


  // Add a dedicated function to fetch counts for the badges
const fetchStats = useCallback(async () => {
  try {
      const [activeRes, trashRes] = await Promise.all([
          axios.get(`${backendUrl}/api/product/list`, { params: { limit: 1, includeHidden: 'false' } }),
          axios.get(`${backendUrl}/api/product/list`, { params: { limit: 1, onlyHidden: 'true' } })
      ]);

      if (activeRes.data.success) setTotalCount(activeRes.data.total);
      if (trashRes.data.success) setTrashTotal(trashRes.data.total);
  } catch (err) {
      console.error("Stats sync error", err);
  }
}, [token]);

// Trigger this on mount
useEffect(() => {
  fetchStats();
  fetchList(1); // Load the first page of active items
}, []);
  // ── Debounced refetch on filter/search changes ──────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setSelectedIds([]);
      setCurrentPage(1);
      fetchList(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, filterBestseller, filterNewArrival, fetchList]);

  useEffect(() => {
    if (viewMode === "trash") fetchTrash(1);
  }, [viewMode, trashSearch, fetchTrash]);

  // ── Selection helpers ────────────────────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === list.length && list.length > 0 ? [] : list.map(i => i._id));

  const toggleTrashSelect = (id) =>
    setTrashSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const toggleTrashSelectAll = () =>
    setTrashSelectedIds(trashSelectedIds.length === trashList.length && trashList.length > 0
      ? [] : trashList.map(i => i._id));

  // ── Soft delete (move to trash = set isActive: false) ──────────────────────
  const softDelete = async (ids) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    if (!window.confirm(`Move ${idArray.length} product(s) to trash?`)) return;
    try {
      setLoading(true);
      await axios.post(`${backendUrl}/api/product/bulk-status`, { ids: idArray, isActive: false }, { headers: { token } });
      toast.success(`${idArray.length} product(s) moved to trash`);
      setSelectedIds([]);
      fetchList(currentPage);
    } catch { toast.error("Failed to move to trash"); }
    finally { setLoading(false); }
  };

  // ── Restore from trash ──────────────────────────────────────────────────────
  const restoreFromTrash = async (ids) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    try {
      setTrashLoading(true);
      await axios.post(`${backendUrl}/api/product/bulk-status`, { ids: idArray, isActive: true }, { headers: { token } });
      toast.success(`${idArray.length} product(s) restored`);
      setTrashSelectedIds([]);
      fetchTrash(trashPage);
    } catch { toast.error("Restore failed"); }
    finally { setTrashLoading(false); }
  };

  // ── Permanent delete ────────────────────────────────────────────────────────
  const permanentDelete = async (ids) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    if (!window.confirm(`Permanently delete ${idArray.length} product(s)? This CANNOT be undone.`)) return;
    try {
      setTrashLoading(true);
      await axios.post(`${backendUrl}/api/product/remove-bulk`, { ids: idArray }, { headers: { token } });
      toast.success(`${idArray.length} product(s) permanently deleted`);
      setTrashSelectedIds([]);
      fetchTrash(trashPage);
    } catch { toast.error("Permanent delete failed"); }
    finally { setTrashLoading(false); }
  };

  // ── Bulk attribute update (bestseller / newArrival) ─────────────────────────
  const bulkAttribute = async (field, value) => {
    try {
      setLoading(true);
      await axios.post(`${backendUrl}/api/product/bulk-update-attributes`,
        { ids: selectedIds, field, value }, { headers: { token } }
      );
      toast.success(`${selectedIds.length} products updated`);
      setSelectedIds([]);
      fetchList(currentPage);
    } catch { toast.error("Bulk update failed"); }
    finally { setLoading(false); }
  };

  // ── Edit modal ──────────────────────────────────────────────────────────────
  const openEditModal = (item) => {
    setEditFormData({
      ...item,
      description: item.description || "",
      youtubeUrl: item.youtubeUrl || "",
      isLatest: item.isLatest || false,
      isActive: item.isActive !== undefined ? item.isActive : true,
      bestseller: item.bestseller || false,
      newArrival: item.newArrival || false,
      producedCount: item.producedCount || 0,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/api/product/update`, {
        id: editFormData._id,
        name: editFormData.name,
        description: editFormData.description,
        price: Number(editFormData.price),
        marketPrice: Number(editFormData.marketPrice),
        image: editFormData.image,
        youtubeUrl: editFormData.youtubeUrl,
        stock: Number(editFormData.stock),
        producedCount: Number(editFormData.producedCount),
        condition: editFormData.condition,
        isActive: editFormData.isActive,
        isLatest: editFormData.isLatest,
        bestseller: editFormData.bestseller,
        newArrival: editFormData.newArrival,
      }, { headers: { token } });
      if (res.data.success) {
        toast.success("Product updated");
        setIsModalOpen(false);
        fetchList(currentPage);
      }
    } catch { toast.error("Update failed"); }
  };

  const addImageSlot = () => {
    if (editFormData.image.length < 4) setEditFormData({ ...editFormData, image: [...editFormData.image, ""] });
    else toast.info("Maximum 4 images");
  };
  const removeImageSlot = (i) =>
    setEditFormData({ ...editFormData, image: editFormData.image.filter((_, idx) => idx !== i) });

  // ── Pagination component ────────────────────────────────────────────────────
  const Pagination = ({ page, total, onPage }) => {
    const start = Math.max(1, page - 2);
    const end   = Math.min(total, start + 4);
    return (
      <div className='flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3 mt-4'>
        <span className='text-xs text-gray-400 font-medium'>Page {page} of {total}</span>
        <div className='flex items-center gap-1'>
          <button disabled={page === 1} onClick={() => onPage(page - 1)}
            className='p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 transition-colors'>
            <ChevronLeft size={15}/>
          </button>
          {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
            <button key={p} onClick={() => onPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors
                ${p === page ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"}`}>
              {p}
            </button>
          ))}
          <button disabled={page === total} onClick={() => onPage(page + 1)}
            className='p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 transition-colors'>
            <ChevronRight size={15}/>
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className='max-w-7xl mx-auto p-4 lg:p-8 bg-gray-50 min-h-screen' style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .row-enter { animation: rowIn 0.15s ease; }
        @keyframes rowIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .cmd-bar { animation: barIn 0.2s ease; }
        @keyframes barIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h2 className='text-3xl font-black text-gray-900 uppercase tracking-tighter leading-tight'>
            Management <span className='text-[#BC002D]'>Console</span>
          </h2>
          <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1'>
            {viewMode === "active" ? `${totalCount} Active Specimens` : `${trashTotal} Archived Specimens`}
          </p>
        </div>

        {/* Search */}
        <div className='relative w-full md:w-80'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={14}/>
          <input
            type="text"
            placeholder={viewMode === "active" ? "Search products…" : "Search trash…"}
            value={viewMode === "active" ? searchTerm : trashSearch}
            onChange={(e) => viewMode === "active"
              ? setSearchTerm(e.target.value)
              : setTrashSearch(e.target.value)}
            className='w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 placeholder:text-gray-400 transition-all'
          />
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className='flex items-center gap-3 mb-6'>
        <Tab active={viewMode === "active"} onClick={() => { setViewMode("active"); setTrashSelectedIds([]); }} count={totalCount}>
          <Package size={13}/> Active
        </Tab>
        <Tab active={viewMode === "trash"} onClick={() => { setViewMode("trash"); setSelectedIds([]); }} count={trashTotal} color="red">
          <Trash2 size={13}/> Trash
        </Tab>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ACTIVE VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === "active" && (
        <>
          {/* Filter bar */}
          <div className='flex flex-wrap items-center gap-3 mb-5'>
            <div className='flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm'>
              <Filter size={13} className='text-gray-400'/>
              <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1'>Filter:</span>

              <button
                onClick={() => setFilterBestseller(!filterBestseller)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all
                  ${filterBestseller ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100"}`}
              >
                <Star size={11} className={filterBestseller ? "fill-amber-500 text-amber-500" : ""}/>
                Bestsellers
              </button>

              <button
                onClick={() => setFilterNewArrival(!filterNewArrival)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all
                  ${filterNewArrival ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100"}`}
              >
                <Zap size={11} className={filterNewArrival ? "fill-blue-500 text-blue-500" : ""}/>
                New Arrivals
              </button>

              {(filterBestseller || filterNewArrival || searchTerm) && (
                <button
                  onClick={() => { setFilterBestseller(false); setFilterNewArrival(false); setSearchTerm(""); }}
                  className='text-[10px] font-bold text-[#BC002D] hover:underline ml-1 uppercase'
                >
                  Reset
                </button>
              )}
            </div>

            {/* Select all on page */}
            <button onClick={toggleSelectAll}
              className='flex items-center gap-2 bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:border-gray-300 transition-colors shadow-sm'>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0
                ${selectedIds.length === list.length && list.length > 0 ? "bg-black border-black" : "border-gray-300"}`}>
                {selectedIds.length === list.length && list.length > 0 &&
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M1.5 6l3 3 6-6"/>
                  </svg>}
              </div>
              {selectedIds.length > 0 ? `${selectedIds.length} selected` : "Select all"}
            </button>
          </div>

          {/* ── Command bar (shows when items selected) ─────────────────────── */}
          {selectedIds.length > 0 && (
            <div className='cmd-bar mb-5 bg-gray-900 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xl'>
              <span className='text-xs font-black text-white bg-[#BC002D] px-4 py-2 rounded-xl uppercase tracking-wide'>
                {selectedIds.length} Selected
              </span>

              <div className='flex items-center gap-2 flex-wrap'>
                {/* Bulk bestseller */}
                <button onClick={() => bulkAttribute('bestseller', true)}
                  className='flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black px-3.5 py-2 rounded-xl text-[10px] font-black uppercase transition-all'>
                  <Star size={12} className="fill-black"/> +&nbsp;Bestseller
                </button>
                <button onClick={() => bulkAttribute('bestseller', false)}
                  className='flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/30 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase transition-all'>
                  <Star size={12}/> −&nbsp;Bestseller
                </button>

                <div className='w-px h-7 bg-white/20'/>

                {/* Bulk new arrival */}
                <button onClick={() => bulkAttribute('newArrival', true)}
                  className='flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase transition-all'>
                  <Zap size={12} className="fill-white"/> +&nbsp;New
                </button>
                <button onClick={() => bulkAttribute('newArrival', false)}
                  className='flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-blue-300 border border-blue-400/30 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase transition-all'>
                  <Zap size={12}/> −&nbsp;New
                </button>

                <div className='w-px h-7 bg-white/20'/>

                {/* Bulk move to trash */}
                <button onClick={() => softDelete(selectedIds)}
                  className='flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase transition-all'>
                  <Trash2 size={12}/> Move to Trash
                </button>

                <button onClick={() => setSelectedIds([])}
                  className='p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 transition-colors'>
                  <X size={14}/>
                </button>
              </div>
            </div>
          )}

          {/* ── Product list ─────────────────────────────────────────────────── */}
          <div className='space-y-2.5'>
            {loading && list.length === 0 ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 animate-pulse'>
                  <div className='w-4 h-4 rounded bg-gray-100'/>
                  <div className='w-12 h-14 rounded-lg bg-gray-100'/>
                  <div className='flex-1 space-y-2'>
                    <div className='h-3 bg-gray-100 rounded w-48'/>
                    <div className='h-2 bg-gray-50 rounded w-32'/>
                  </div>
                  <div className='h-5 bg-gray-100 rounded-full w-16'/>
                  <div className='h-5 bg-gray-100 rounded-full w-16'/>
                  <div className='h-8 bg-gray-100 rounded-xl w-20'/>
                </div>
              ))
            ) : list.length === 0 ? (
              <div className='py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200'>
                <Package size={36} className='mx-auto text-gray-200 mb-3'/>
                <p className='text-sm font-bold text-gray-400 uppercase tracking-widest'>No products found</p>
              </div>
            ) : (
              list.map((item) => {
                const isSelected = selectedIds.includes(item._id);
                return (
                  <div key={item._id}
                    className={`row-enter bg-white rounded-2xl border-2 flex items-center justify-between gap-3 p-3.5 transition-all hover:shadow-md
                      ${isSelected ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    {/* Left: checkbox + image + info */}
                    <div className='flex items-center gap-3 min-w-0'>
                      <button onClick={() => toggleSelect(item._id)}
                        className='flex-shrink-0 p-1 text-gray-300 hover:text-black transition-colors'>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                          ${isSelected ? "bg-black border-black" : "border-gray-300"}`}>
                          {isSelected &&
                            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M1.5 6l3 3 6-6"/>
                            </svg>}
                        </div>
                      </button>

                      {/* Thumbnail */}
                      <div className='flex-shrink-0 w-12 h-14 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden p-1 relative cursor-pointer'
                        onClick={() => openEditModal(item)}>
                        <img src={item.image[0]} className='w-full h-full object-contain' alt="" loading="lazy"/>
                        {item.isLatest && <Pin size={9} className='absolute -top-1 -right-1 text-[#BC002D] fill-[#BC002D]'/>}
                      </div>

                      {/* Name + meta */}
                      <div className=' cursor-pointer' onClick={() => openEditModal(item)}>
                        <div className='flex items-center gap-2 flex-wrap'>
                        <span className='text-sm font-bold text-gray-900 line-clamp-3 md:line-clamp-1 min-w-0 md:min-w-[500px] leading-tight'>
    {item.name}
</span>
                          {item.bestseller && <Badge color="amber"><Star size={9} className="fill-amber-500"/> Bestseller</Badge>}
                          {item.newArrival && <Badge color="blue"><Zap size={9} className="fill-blue-500"/> New</Badge>}
                        </div>
                        <p className='text-[10px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5'>
                          {item.country} • {item.year} • {item.condition}
                        </p>
                      </div>
                    </div>

                    {/* Right: price + actions */}
                    <div className='flex items-center gap-2 flex-shrink-0'>
                      <span className='text-sm font-black text-gray-800 hidden sm:block'>₹{item.price}</span>
                      <span className='text-[10px] font-semibold text-gray-400 hidden md:block bg-gray-50 px-2 py-1 rounded-lg'>
                        Stk: {item.stock ?? "—"}
                      </span>

                      <button onClick={() => openEditModal(item)}
                        className='p-2.5 rounded-xl bg-gray-50 hover:bg-black hover:text-white transition-all text-gray-500'>
                        <Edit3 size={14}/>
                      </button>
                      <button onClick={() => softDelete(item._id)}
                        className='p-2.5 rounded-xl bg-gray-50 hover:bg-red-600 hover:text-white transition-all text-gray-400'
                        title="Move to trash">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination page={currentPage} total={totalPages} onPage={(p) => { setSelectedIds([]); fetchList(p); }}/>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TRASH VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === "trash" && (
        <>
          {/* Trash info banner */}
          <div className='flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-3.5 mb-5'>
            <AlertTriangle size={16} className='text-red-500 flex-shrink-0'/>
            <p className='text-xs text-red-600 font-semibold'>
              Items in trash are hidden from the storefront. You can restore them or permanently delete them.
            </p>
          </div>

          {/* Trash select all + bulk actions */}
          <div className='flex flex-wrap items-center gap-3 mb-5'>
            <button onClick={toggleTrashSelectAll}
              className='flex items-center gap-2 bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:border-gray-300 transition-colors shadow-sm'>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0
                ${trashSelectedIds.length === trashList.length && trashList.length > 0 ? "bg-black border-black" : "border-gray-300"}`}>
                {trashSelectedIds.length === trashList.length && trashList.length > 0 &&
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M1.5 6l3 3 6-6"/>
                  </svg>}
              </div>
              {trashSelectedIds.length > 0 ? `${trashSelectedIds.length} selected` : "Select all"}
            </button>
          </div>

          {/* Trash command bar */}
          {trashSelectedIds.length > 0 && (
            <div className='cmd-bar mb-5 bg-gray-900 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xl'>
              <span className='text-xs font-black text-white bg-[#BC002D] px-4 py-2 rounded-xl uppercase tracking-wide'>
                {trashSelectedIds.length} Selected
              </span>
              <div className='flex items-center gap-2'>
                <button onClick={() => restoreFromTrash(trashSelectedIds)}
                  className='flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all'>
                  <RotateCcw size={12}/> Restore
                </button>
                <button onClick={() => permanentDelete(trashSelectedIds)}
                  className='flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all'>
                  <Trash2 size={12}/> Delete Forever
                </button>
                <button onClick={() => setTrashSelectedIds([])}
                  className='p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 transition-colors'>
                  <X size={14}/>
                </button>
              </div>
            </div>
          )}

          {/* Trash list */}
          <div className='space-y-2.5'>
            {trashLoading && trashList.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='bg-white rounded-2xl border border-dashed border-gray-200 p-4 flex items-center gap-4 animate-pulse'>
                  <div className='w-12 h-14 rounded-lg bg-gray-100'/>
                  <div className='flex-1 space-y-2'>
                    <div className='h-3 bg-gray-100 rounded w-48'/>
                    <div className='h-2 bg-gray-50 rounded w-32'/>
                  </div>
                </div>
              ))
            ) : trashList.length === 0 ? (
              <div className='py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200'>
                <Trash2 size={36} className='mx-auto text-gray-200 mb-3'/>
                <p className='text-sm font-bold text-gray-400 uppercase tracking-widest'>Trash is empty</p>
              </div>
            ) : (
              trashList.map((item) => {
                const isSelected = trashSelectedIds.includes(item._id);
                return (
                  <div key={item._id}
                    className={`row-enter bg-white rounded-2xl border-2 flex items-center justify-between gap-3 p-3.5 transition-all opacity-75
                      ${isSelected ? "border-red-400 bg-red-50/40 opacity-100" : "border-dashed border-gray-200 hover:opacity-90"}`}
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      <button onClick={() => toggleTrashSelect(item._id)}
                        className='flex-shrink-0 p-1'>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                          ${isSelected ? "bg-red-600 border-red-600" : "border-gray-300"}`}>
                          {isSelected &&
                            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M1.5 6l3 3 6-6"/>
                            </svg>}
                        </div>
                      </button>

                      <div className='flex-shrink-0 w-12 h-14 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden p-1 grayscale'>
                        <img src={item.image[0]} className='w-full h-full object-contain' alt="" loading="lazy"/>
                      </div>

                      <div className='min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-bold text-gray-500 truncate max-w-[200px] line-through decoration-gray-300'>{item.name}</span>
                          <Badge color="gray"><EyeOff size={9}/> Hidden</Badge>
                        </div>
                        <p className='text-[10px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5'>
                          {item.country} • {item.year} • ₹{item.price}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 flex-shrink-0'>
                      <button onClick={() => restoreFromTrash(item._id)}
                        className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 text-[10px] font-bold uppercase transition-all'>
                        <RotateCcw size={12}/> Restore
                      </button>
                      <button onClick={() => permanentDelete(item._id)}
                        className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-[10px] font-bold uppercase transition-all'>
                        <Trash2 size={12}/> Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {trashTotalPages > 1 && (
            <Pagination page={trashPage} total={trashTotalPages} onPage={(p) => { setTrashSelectedIds([]); fetchTrash(p); }}/>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && editFormData && (
        <div className='fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10'>
          <div className='absolute inset-0 bg-black/75 backdrop-blur-sm' onClick={() => setIsModalOpen(false)}/>
          <div className='relative bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl'
            style={{ animation: "rowIn 0.2s ease" }}>

            {/* Modal header */}
            <div className='sticky top-0 bg-white z-20 px-8 py-5 border-b border-gray-100 flex justify-between items-center rounded-t-[32px]'>
              <div>
                <h3 className='text-xl font-black uppercase tracking-tighter'>Edit Product</h3>
                <p className='text-xs text-gray-400 font-medium truncate max-w-sm'>{editFormData.name}</p>
              </div>
              <div className='flex items-center gap-3'>
                <button type="button"
                  onClick={() => setEditFormData({ ...editFormData, isActive: !editFormData.isActive })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all
                    ${editFormData.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {editFormData.isActive ? <><Power size={11}/> Active</> : <><PowerOff size={11}/> Hidden</>}
                </button>
                <button onClick={() => setIsModalOpen(false)}
                  className='p-2.5 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all'>
                  <X size={18}/>
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-[1fr_340px]'>
              <form onSubmit={handleUpdate} className='p-8 grid grid-cols-1 md:grid-cols-2 gap-10 border-r border-gray-100'>

                {/* Left column */}
                <div className='space-y-8'>
                  <div className='space-y-5'>
                    <h5 className='text-[10px] font-black text-[#BC002D] uppercase tracking-widest flex items-center gap-2'>
                      <Tag size={11}/> Identity
                    </h5>
                    <input className='w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all'
                      value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}/>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <label className='text-[9px] font-bold text-gray-400 uppercase ml-1'>Price</label>
                        <input type="number" className='w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-black/10 transition-all'
                          value={editFormData.price} onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}/>
                      </div>
                      <div className='space-y-1'>
                        <label className='text-[9px] font-bold text-gray-400 uppercase ml-1'>Market Price</label>
                        <input type="number" className='w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-black/10 transition-all'
                          value={editFormData.marketPrice} onChange={(e) => setEditFormData({ ...editFormData, marketPrice: e.target.value })}/>
                      </div>
                    </div>
                    <textarea rows={4} placeholder="Description…"
                      className='w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none resize-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all'
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}/>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                        <ImageIcon size={11}/> Images
                      </h5>
                      {editFormData.image.length < 4 &&
                        <button type="button" onClick={addImageSlot}
                          className='text-[9px] font-black bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800'>
                          + Add
                        </button>}
                    </div>
                    <div className='space-y-2'>
                      {editFormData.image.map((img, idx) => (
                        <div key={idx} className='flex items-center gap-2'>
                          <input className='flex-1 p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-black/10 transition-all'
                            value={img} onChange={(e) => {
                              const n = [...editFormData.image]; n[idx] = e.target.value;
                              setEditFormData({ ...editFormData, image: n });
                            }}/>
                          <button type="button" onClick={() => removeImageSlot(idx)}
                            className='p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'>
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className='space-y-8'>
                  <div className='space-y-4'>
                    <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                      <Video size={11}/> YouTube
                    </h5>
                    <div className='relative'>
                      <Youtube className='absolute left-4 top-1/2 -translate-y-1/2 text-red-500' size={15}/>
                      <input placeholder="YouTube URL"
                        className='w-full pl-11 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-black/10 transition-all'
                        value={editFormData.youtubeUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, youtubeUrl: e.target.value })}/>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                      <Layers size={11}/> Attributes
                    </h5>

                    {/* Bestseller + New Arrival toggles */}
                    <div className='grid grid-cols-2 gap-3'>
                      <button type="button"
                        onClick={() => setEditFormData({ ...editFormData, bestseller: !editFormData.bestseller })}
                        className={`flex items-center justify-between p-4 border-2 rounded-2xl transition-all
                          ${editFormData.bestseller ? "bg-amber-50 border-amber-300" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}>
                        <div className='text-left'>
                          <p className='text-[8px] font-black text-gray-400 uppercase'>Bestseller</p>
                          <p className={`text-[10px] font-black uppercase ${editFormData.bestseller ? "text-amber-600" : "text-gray-400"}`}>
                            {editFormData.bestseller ? "On" : "Off"}
                          </p>
                        </div>
                        <Star size={18} className={editFormData.bestseller ? "text-amber-500 fill-amber-500" : "text-gray-200"}/>
                      </button>

                      <button type="button"
                        onClick={() => setEditFormData({ ...editFormData, newArrival: !editFormData.newArrival })}
                        className={`flex items-center justify-between p-4 border-2 rounded-2xl transition-all
                          ${editFormData.newArrival ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}>
                        <div className='text-left'>
                          <p className='text-[8px] font-black text-gray-400 uppercase'>New Arrival</p>
                          <p className={`text-[10px] font-black uppercase ${editFormData.newArrival ? "text-blue-600" : "text-gray-400"}`}>
                            {editFormData.newArrival ? "On" : "Off"}
                          </p>
                        </div>
                        <Zap size={18} className={editFormData.newArrival ? "text-blue-500 fill-blue-500" : "text-gray-200"}/>
                      </button>
                    </div>

                    {/* Pin to home */}
                    <div className='flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl'>
                      <div>
                        <p className='text-[9px] font-black text-gray-400 uppercase'>Feature on Homepage</p>
                        <p className='text-[10px] font-semibold text-gray-500'>Show as pinned item</p>
                      </div>
                      <button type="button"
                        onClick={() => setEditFormData({ ...editFormData, isLatest: !editFormData.isLatest })}
                        className={`w-10 h-6 rounded-full transition-colors flex items-center px-1
                          ${editFormData.isLatest ? "bg-[#BC002D]" : "bg-gray-200"}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${editFormData.isLatest ? "translate-x-4" : "translate-x-0"}`}/>
                      </button>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <label className='text-[9px] font-bold text-gray-400 uppercase ml-1'>Stock</label>
                        <input type="number" className='w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-black/10 transition-all'
                          value={editFormData.stock}
                          onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}/>
                      </div>
                      <div className='space-y-1'>
                        <label className='text-[9px] font-bold text-gray-400 uppercase ml-1'>Mintage</label>
                        <input type="number" className='w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-black/10 transition-all'
                          value={editFormData.producedCount}
                          onChange={(e) => setEditFormData({ ...editFormData, producedCount: e.target.value })}/>
                      </div>
                    </div>

                    <div className='space-y-1'>
                      <label className='text-[9px] font-bold text-gray-400 uppercase ml-1'>Condition</label>
                      <select className='w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-black/10 transition-all appearance-none'
                        value={editFormData.condition}
                        onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}>
                        <option value="Mint">Mint</option>
                        <option value="Near Mint">Near Mint</option>
                        <option value="Fine">Fine</option>
                        <option value="Used">Used</option>
                      </select>
                    </div>
                  </div>

                  <div className='bg-gray-900 p-6 rounded-[28px]'>
                    <p className='text-white/50 text-[10px] uppercase font-bold mb-1'>Selling Price</p>
                    <p className='text-white text-3xl font-black mb-5'>₹{editFormData.price}</p>
                    <button type="submit"
                      className='w-full py-4 bg-[#BC002D] hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95'>
                      <Save size={14} className='inline mr-2'/> Save Changes
                    </button>
                  </div>
                </div>
              </form>

              {/* Live preview panel */}
              <div className='bg-gray-50 p-8 flex flex-col items-center border-l border-gray-100'>
                <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2'>
                  <Eye size={11}/> Live Preview
                </h5>
                <div className={`w-full max-w-[240px] bg-white rounded-3xl p-4 shadow-xl border border-gray-100 ${!editFormData.isActive ? "grayscale" : ""} relative overflow-hidden`}>
                  {editFormData.newArrival && (
                    <div className="absolute top-0 right-0 z-20 overflow-hidden w-16 h-16 pointer-events-none">
                      <div className="absolute top-[15%] -right-[30%] bg-[#BC002D] text-white text-[6px] font-black py-1 w-[140%] text-center transform rotate-45 shadow uppercase">New</div>
                    </div>
                  )}
                  <div className='aspect-[3/4] bg-gray-50 rounded-2xl flex items-center justify-center p-4 mb-4 relative'>
                    <img src={editFormData.image[0] || "https://placehold.co/300x400?text=No+Image"}
                      className='w-full h-full object-contain drop-shadow-md' alt=""/>
                    {editFormData.isLatest && <Pin size={12} className='absolute top-2 left-2 text-[#BC002D] fill-[#BC002D]'/>}
                    {editFormData.bestseller && <Star size={12} className='absolute bottom-2 right-2 text-amber-500 fill-amber-500'/>}
                  </div>
                  <p className='text-xs font-black uppercase truncate mb-1'>{editFormData.name || "Product name"}</p>
                  <p className='text-sm font-black text-[#BC002D]'>₹{editFormData.price}</p>
                  {!editFormData.isActive && (
                    <div className='mt-2 flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase'>
                      <EyeOff size={9}/> Hidden from store
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;