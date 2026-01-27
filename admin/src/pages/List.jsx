import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

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

  // Selection Logic
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
    setEditFormData({ ...item });
    setCatSearch("");
  };

  const toggleCategory = (cat) => {
    const currentCats = [...editFormData.category];
    setEditFormData({
      ...editFormData,
      category: currentCats.includes(cat) ? currentCats.filter(c => c !== cat) : [...currentCats, cat]
    });
  };

  const saveEdit = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/update', { ...editFormData, id }, { headers: { token } });
      if (response.data.success) {
        toast.success("Updated!");
        setEditingId(null);
        fetchList();
      }
    } catch (error) {
      toast.error("Save failed");
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-4 lg:p-6 bg-gray-50 min-h-screen'>
      
      {/* --- Header Section --- */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Inventory</h2>
          <p className='text-sm text-gray-500'>Manage your philatelic collection</p>
        </div>
        
        {selectedItems.length > 0 && (
          <div className='flex items-center gap-3 bg-white p-2 px-4 rounded-full shadow-sm border border-red-100 animate-pulse'>
            <span className='text-xs font-bold text-red-600'>{selectedItems.length} selected</span>
            <button onClick={deleteSelected} className='bg-red-600 text-white text-[10px] px-3 py-1 rounded-full uppercase font-black hover:bg-red-700'>
              Delete Bulk
            </button>
          </div>
        )}
      </div>

      {/* --- Responsive Grid --- */}
      <div className='grid grid-cols-1 gap-4'>
        
        {/* Bulk Control Header */}
        <div className='hidden md:grid grid-cols-[50px_80px_1fr_180px_120px_150px] items-center px-6 py-3 bg-white rounded-xl shadow-sm border border-gray-100 mb-2'>
          <input type="checkbox" checked={selectedItems.length === list.length} onChange={toggleAll} className='w-4 h-4 accent-black' />
          <span className='text-[10px] font-bold text-gray-400 uppercase'>Visual</span>
          <span className='text-[10px] font-bold text-gray-400 uppercase'>Details</span>
          <span className='text-[10px] font-bold text-gray-400 uppercase'>Categories</span>
          <span className='text-[10px] font-bold text-gray-400 uppercase'>Price</span>
          <span className='text-[10px] font-bold text-gray-400 uppercase text-center'>Actions</span>
        </div>

        {list.map((item) => (
          <div key={item._id} className={`group relative grid grid-cols-1 md:grid-cols-[50px_80px_1fr_180px_120px_150px] items-center gap-4 p-4 md:px-6 bg-white rounded-2xl border transition-all duration-300 ${selectedItems.includes(item._id) ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:shadow-xl hover:-translate-y-0.5'}`}>
            
            {/* Checkbox */}
            <div className='absolute top-4 left-4 md:relative md:top-0 md:left-0'>
              <input type="checkbox" checked={selectedItems.includes(item._id)} onChange={() => toggleSelect(item._id)} className='w-4 h-4 accent-blue-600 cursor-pointer' />
            </div>

            {/* Thumbnail */}
            <div className='flex justify-center md:justify-start'>
              <div className='w-16 h-20 bg-gray-50 rounded-lg border border-gray-100 p-1 overflow-hidden shadow-inner'>
                <img src={item.image[0]} className='w-full h-full object-contain' alt="" />
              </div>
            </div>

            {/* Content / Edit Mode */}
            {editingId === item._id ? (
              <div className='col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <input className='w-full text-xs p-2 border rounded-lg focus:ring-2 ring-blue-500 outline-none' value={editFormData.name} onChange={(e)=>setEditFormData({...editFormData, name: e.target.value})} />
                  <div className='flex gap-2'>
                    <input className='w-full text-xs p-2 border rounded-lg' placeholder='Country' value={editFormData.country} onChange={(e)=>setEditFormData({...editFormData, country: e.target.value})} />
                    <input className='w-24 text-xs p-2 border rounded-lg' type="number" value={editFormData.year} onChange={(e)=>setEditFormData({...editFormData, year: e.target.value})} />
                  </div>
                </div>

                <div className='relative'>
                  <input type="text" placeholder="Search categories..." className='w-full text-[10px] p-2 border rounded-t-lg mb-0' value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
                  <div className='h-24 overflow-y-auto border border-t-0 rounded-b-lg bg-white p-1'>
                    {ALL_CATEGORIES.filter(c => c.toLowerCase().includes(catSearch.toLowerCase())).map(cat => (
                      <div key={cat} onClick={() => toggleCategory(cat)} className={`text-[9px] cursor-pointer px-2 py-1 rounded mb-0.5 font-bold flex justify-between ${editFormData.category.includes(cat) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-500'}`}>
                        {cat} {editFormData.category.includes(cat) && '✓'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className='flex flex-col justify-center'>
                  <div className='flex items-center bg-gray-100 rounded-lg px-3 py-2'>
                    <span className='text-gray-400 font-bold mr-1'>{currency}</span>
                    <input className='bg-transparent w-full text-sm font-black text-blue-700 outline-none' type="number" value={editFormData.price} onChange={(e)=>setEditFormData({...editFormData, price: e.target.value})} />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className='text-center md:text-left'>
                  <h3 className='font-bold text-gray-900 line-clamp-1'>{item.name}</h3>
                  <div className='flex items-center justify-center md:justify-start gap-2 mt-1'>
                    <span className='text-[10px] font-medium text-gray-400 uppercase tracking-widest'>{item.country}</span>
                    <span className='w-1 h-1 rounded-full bg-gray-300'></span>
                    <span className='text-[10px] font-black text-blue-500'>{item.year}</span>
                  </div>
                </div>

                <div className='flex flex-wrap gap-1 justify-center md:justify-start'>
                  {item.category.slice(0, 3).map((cat, i) => (
                    <span key={i} className='bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[8px] font-bold border border-blue-100 uppercase'>{cat}</span>
                  ))}
                  {item.category.length > 3 && <span className='text-[8px] text-gray-400 font-bold'>+{item.category.length - 3}</span>}
                </div>

                <div className='text-center md:text-left'>
                  <span className='text-lg font-black text-gray-900'>{currency}{item.price}</span>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className='flex flex-row md:flex-col gap-2 justify-center'>
              {editingId === item._id ? (
                <>
                  <button onClick={() => saveEdit(item._id)} className='flex-1 bg-green-600 text-white text-[10px] py-2 rounded-xl font-bold uppercase shadow-sm hover:bg-green-700'>Save</button>
                  <button onClick={() => setEditingId(null)} className='flex-1 bg-gray-100 text-gray-500 text-[10px] py-2 rounded-xl font-bold uppercase hover:bg-gray-200'>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(item)} className='flex-1 bg-black text-white text-[10px] py-2 px-4 rounded-xl font-bold uppercase hover:opacity-80 transition-opacity'>Edit</button>
                  <button onClick={() => removeProduct(item._id)} className='flex-1 border border-gray-200 text-gray-400 text-[10px] py-2 px-4 rounded-xl font-bold uppercase hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all'>Delete</button>
                </>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default List;