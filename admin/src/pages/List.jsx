import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { AlertCircle, Package, TrendingDown, Box } from 'lucide-react'; // Added icons for the alert section

const ALL_CATEGORIES = [
    "AgriCulture Stamp", "Airmail", "Americas", "Ancillaries", "Animal & WildLife", 
    "Army", "Army Postal Cover APC", "Asia", "Autograph Cover", "Aviation Stamps", 
    "Bank", "Bird Stamps", "Block of Four", "Block of Four with Traffic light", 
    "Booklet", "BOPP", "Bridge Stamps", "Brochure Blank", "Brochure with MS", 
    "Brochure with stamp", "Buddha / Buddhism", "Building Stamps", "Butterfly & Insects", 
    "Carried Cover", "Cars", "Catalogue", "Children's Day Series", "Christianity", 
    "Christmas", "Cinema on Stamps", "Classic Items", "Coffee", "Color Cancellation", 
    "Commemorative", "Commemorative Coin", "Commemorative Year", "Country", "Covid 19", 
    "Cricket", "Cultural Theme", "Currency Stamps", "Dance Stamps", "Definitive", 
    "Definitive Block", "Definitive Number Strip", "Definitive Sheet", "Definitive Stamp", 
    "Educational Institute", "Environment", "Error", "Europe", "Exhibition Special", 
    "Face Value", "Fauna and Flora", "Festival", "First Day Cover", "First Day Cover Blank", 
    "First Day Cover Commercial Used", "First Day Cover with Miniature Sheet", 
    "First Flight/ AirMail", "Flag", "Food on Stamps", "FootBall", "Foreign First Day Covers", 
    "Foreign Miniature Sheets", "Foreign Stamps", "Fort / Castle/ Palace", "Fragrance Stamps", 
    "Freedom", "Freedom Fighter", "Full Sheet", "Gandhi Stamps", "GI Tag", "Greeting Card", 
    "Greetings", "Hinduism", "Historical", "Historical Place", "Indian Theme", "Jainism", 
    "Joint Issue", "Judiciary System", "Kumbh", "Light House", "Literature", 
    "Locomotive / Trains", "Marine / Fish", "Medical / Health", "Meghdoot", 
    "Miniature Sheets", "Musical Instrument", "My Stamp", "News Paper", 
    "Odd Shape / Unusual", "Olympic", "Organizations", "Personality", 
    "Place Cancellation", "Post Office", "Postal Stationery", "Postcard / Maxim Card", 
    "PPC", "Presentation Pack", "Ramayana", "Rare", "Red Cross", "River / Canal", 
    "RSS Rashtriya Swayamsevak Sangh", "Scout", "SheetLet", "Ships", "Sikhism", 
    "Single Stamp", "Single Stamp with Traffic light", "Social Message", "Space", 
    "Special Cancellation", "Special Cover", "Sports Stamps", "Stamp on Stamp", 
    "Technology", "Temple", "Tiger", "Transport", "United Nations UN", "Women Power", 
    "WWF", "Year", "Year Pack", "Yoga"
];

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [catSearch, setCatSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter low stock items (stock between 1 and 5)
  const lowStockItems = list.filter(item => item.stock > 0 && item.stock <= 5);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setList(response.data.products.reverse());
      }
    } catch (error) {
      toast.error("Failed to fetch inventory");
    }
  };

  useEffect(() => { fetchList(); }, []);

  const toggleSelect = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedItems(selectedItems.length === list.length ? [] : list.map(i => i._id));
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} stamps?`)) return;
    try {
      const response = await axios.post(backendUrl + '/api/product/remove-bulk', { ids: selectedItems }, { headers: { token } });
      if (response.data.success) {
        toast.success("Bulk deletion successful");
        setSelectedItems([]);
        fetchList();
      }
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Delete this stamp?")) return;
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } });
      if (response.data.success) {
        toast.success("Stamp removed");
        fetchList();
      }
    } catch (error) {
      toast.error("Error removing item");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditFormData({ ...item, stock: item.stock || 0, newImageFile: null }); 
    setCatSearch("");
  };

  const onImageChange = (e) => {
    if (e.target.files[0]) {
      setEditFormData({ ...editFormData, newImageFile: e.target.files[0] });
    }
  };

  const toggleCategory = (cat) => {
    const currentCats = Array.isArray(editFormData.category) ? [...editFormData.category] : [];
    setEditFormData({
      ...editFormData,
      category: currentCats.includes(cat) ? currentCats.filter(c => c !== cat) : [...currentCats, cat]
    });
  };

  const saveEdit = async (id) => {
    try {
      setLoading(true);
      const textResponse = await axios.post(backendUrl + '/api/product/update', { ...editFormData, id }, { headers: { token } });
      
      if (editFormData.newImageFile && textResponse.data.success) {
        const imgData = new FormData();
        imgData.append("id", id);
        imgData.append("image1", editFormData.newImageFile);
        await axios.post(backendUrl + '/api/product/update-images', imgData, { headers: { token } });
      }

      if (textResponse.data.success) {
        toast.success("Inventory Synchronized!");
        setEditingId(null);
        fetchList();
      }
    } catch (error) {
      toast.error("Cloud sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-7xl mx-auto p-4 lg:p-6 bg-gray-50 min-h-screen font-sans'>
      
      {/* Header Section */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h2 className='text-3xl font-black text-gray-900 uppercase tracking-tighter'>Inventory Console</h2>
          <p className='text-[10px] font-bold text-blue-600 uppercase tracking-widest'>PhilaBasket Global Registry</p>
        </div>
        
        {selectedItems.length > 0 && (
          <div className='flex items-center gap-3 bg-white p-2 px-4 rounded-full shadow-sm border border-red-100 animate-pulse'>
            <span className='text-[10px] font-black text-red-600 uppercase'>{selectedItems.length} marked</span>
            <button onClick={deleteSelected} className='bg-red-600 text-white text-[9px] px-4 py-1.5 rounded-full uppercase font-black hover:bg-black transition-all'>
              Purge Selected
            </button>
          </div>
        )}
      </div>

      {/* NEW: Low Stock Alerts Section */}
      {lowStockItems.length > 0 && (
        <div className='mb-12'>
            <div className='flex items-center gap-2 mb-4'>
                <AlertCircle size={18} className='text-red-500 animate-bounce' />
                <h3 className='text-[11px] font-black uppercase tracking-[0.2em] text-red-600'>Restock Urgency Required</h3>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                {lowStockItems.map((item) => (
                    <div key={item._id} onClick={() => startEdit(item)} className='bg-white border-2 border-red-100 p-4 rounded-3xl flex items-center gap-4 hover:border-red-500 cursor-pointer transition-all shadow-sm'>
                        <div className='w-12 h-14 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 p-1'>
                            <img src={item.image[0]} className='w-full h-full object-contain' alt="" />
                        </div>
                        <div className='flex-1 overflow-hidden'>
                            <p className='text-[10px] font-black uppercase truncate text-gray-900'>{item.name}</p>
                            <div className='flex items-center gap-2 mt-1'>
                                <TrendingDown size={12} className='text-red-500' />
                                <span className='text-[11px] font-black text-red-600'>{item.stock} LEFT</span>
                            </div>
                        </div>
                        <div className='w-8 h-8 rounded-full bg-red-50 flex items-center justify-center'>
                            <Package size={14} className='text-red-400' />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Main Table Headers */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='hidden md:grid grid-cols-[50px_80px_1fr_180px_100px_120px_150px] items-center px-6 py-4 bg-black text-white rounded-2xl shadow-xl mb-4'>
          <input type="checkbox" checked={selectedItems.length === list.length} onChange={toggleAll} className='w-4 h-4 accent-white' />
          <span className='text-[9px] font-black uppercase tracking-widest'>Specimen</span>
          <span className='text-[9px] font-black uppercase tracking-widest'>Identity</span>
          <span className='text-[9px] font-black uppercase tracking-widest'>Registry</span>
          <span className='text-[9px] font-black uppercase tracking-widest'>Volume</span>
          <span className='text-[9px] font-black uppercase tracking-widest'>Valuation</span>
          <span className='text-[9px] font-black uppercase tracking-widest text-center'>Management</span>
        </div>

        {/* List Items */}
        {list.map((item) => {
          const isOutOfStock = item.stock <= 0;
          const isLowStock = item.stock > 0 && item.stock <= 5;

          return (
            <div key={item._id} className={`group relative grid grid-cols-1 md:grid-cols-[50px_80px_1fr_180px_100px_120px_150px] items-center gap-4 p-4 md:px-6 bg-white rounded-2xl border transition-all duration-300 ${selectedItems.includes(item._id) ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:shadow-xl hover:-translate-y-0.5'} ${isLowStock ? 'border-red-200' : ''}`}>
              
              <div className='absolute top-4 left-4 md:relative md:top-0 md:left-0'>
                <input type="checkbox" checked={selectedItems.includes(item._id)} onChange={() => toggleSelect(item._id)} className='w-4 h-4 accent-blue-600 cursor-pointer' />
              </div>

              {/* Thumbnail */}
              <div className='flex justify-center md:justify-start relative'>
                {editingId === item._id ? (
                  <label htmlFor="update-image" className='cursor-pointer relative group/img'>
                    <div className='w-16 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-blue-400 p-1 overflow-hidden'>
                      <img src={editFormData.newImageFile ? URL.createObjectURL(editFormData.newImageFile) : item.image[0]} className='w-full h-full object-contain' alt="" />
                    </div>
                    <input type="file" id="update-image" hidden onChange={onImageChange} accept="image/*" />
                  </label>
                ) : (
                  <div className={`w-16 h-20 bg-gray-50 rounded-lg border border-gray-100 p-1 overflow-hidden shadow-inner ${isOutOfStock ? 'grayscale opacity-50' : ''}`}>
                    <img src={item.image[0]} className='w-full h-full object-contain' alt="" />
                    {isOutOfStock && (
                      <div className='absolute -top-1 -right-1 bg-red-600 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase shadow-md'>Sold Out</div>
                    )}
                  </div>
                )}
              </div>

              {/* Editable Fields */}
              {editingId === item._id ? (
                <div className='col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <div className='space-y-2'>
                    <input className='w-full text-xs p-2.5 bg-gray-50 border rounded-xl font-bold outline-none focus:border-blue-600' value={editFormData.name} onChange={(e)=>setEditFormData({...editFormData, name: e.target.value})} />
                    <div className='flex gap-2'>
                      <input className='w-full text-[10px] p-2 bg-gray-50 border rounded-xl font-bold' placeholder='Country' value={editFormData.country} onChange={(e)=>setEditFormData({...editFormData, country: e.target.value})} />
                      <input className='w-20 text-[10px] p-2 bg-gray-50 border rounded-xl font-bold' type="number" value={editFormData.year} onChange={(e)=>setEditFormData({...editFormData, year: e.target.value})} />
                    </div>
                  </div>

                  <div className='relative'>
                    <input type="text" placeholder="Search categories..." className='w-full text-[10px] p-2.5 bg-gray-50 border rounded-xl outline-none mb-1' value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
                    <div className='h-24 overflow-y-auto bg-white border rounded-xl p-2'>
                      {ALL_CATEGORIES.filter(c => c.toLowerCase().includes(catSearch.toLowerCase())).map(cat => (
                        <div key={cat} onClick={() => toggleCategory(cat)} className={`text-[9px] cursor-pointer px-2 py-1.5 rounded-lg mb-0.5 font-bold flex justify-between ${editFormData.category.includes(cat) ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-400'}`}>
                          {cat} {editFormData.category.includes(cat) && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='flex flex-col justify-center'>
                    <label className='text-[8px] font-black text-gray-400 uppercase ml-1 mb-1 tracking-widest'>Volume</label>
                    <input className={`w-full text-xs p-2.5 border rounded-xl font-black outline-none ${editFormData.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-green-600'}`} type="number" value={editFormData.stock} onChange={(e)=>setEditFormData({...editFormData, stock: Number(e.target.value)})} />
                  </div>

                  <div className='flex flex-col justify-center'>
                    <label className='text-[8px] font-black text-gray-400 uppercase ml-1 mb-1 tracking-widest'>Price</label>
                    <input className='w-full text-xs p-2.5 bg-blue-50 border border-blue-100 rounded-xl font-black text-blue-700 outline-none' type="number" value={editFormData.price} onChange={(e)=>setEditFormData({...editFormData, price: e.target.value})} />
                  </div>
                </div>
              ) : (
                <>
                  <div className='text-center md:text-left'>
                    <h3 className={`text-xs font-black uppercase tracking-tight line-clamp-1 ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>{item.name}</h3>
                    <div className='flex items-center justify-center md:justify-start gap-1.5 mt-1'>
                      <span className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>{item.country}</span>
                      <span className='text-[9px] font-black text-blue-500'>{item.year}</span>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-1 justify-center md:justify-start'>
                    {item.category.slice(0, 2).map((cat, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded-full text-[7px] font-black border uppercase ${isOutOfStock ? 'bg-gray-50 text-gray-300' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{cat}</span>
                    ))}
                    {item.category.length > 2 && <span className='text-[7px] text-gray-400 font-bold uppercase'>+{item.category.length - 2} More</span>}
                  </div>

                  <div className='text-center'>
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${isOutOfStock ? 'bg-red-100 text-red-600 animate-pulse' : isLowStock ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-700'}`}>
                      {isOutOfStock ? 'Depleted' : `${item.stock} Unit${item.stock > 1 ? 's' : ''}`}
                    </span>
                  </div>

                  <div className='text-center md:text-left'>
                    <span className={`text-sm font-black tracking-tighter ${isOutOfStock ? 'text-gray-300' : 'text-gray-900'}`}>{currency}{item.price}</span>
                  </div>
                </>
              )}

              <div className='flex flex-row md:flex-col gap-2 justify-center'>
                {editingId === item._id ? (
                  <>
                    <button disabled={loading} onClick={() => saveEdit(item._id)} className='flex-1 bg-blue-600 text-white text-[9px] py-2.5 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all'>
                      {loading ? '...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)} className='flex-1 bg-gray-100 text-gray-500 text-[9px] py-2.5 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all'>Cancle</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(item)} className='flex-1 bg-gray-50 text-gray-900 border border-gray-200 text-[9px] py-2.5 px-4 rounded-xl font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all'>Edit</button>
                    <button onClick={() => removeProduct(item._id)} className='flex-1 text-gray-900 text-[9px] py-2.5 px-4 border border-gray-200 rounded-xl font-black uppercase tracking-widest hover:text-red-600 hover:bg-black transition-all'>Delete</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default List;