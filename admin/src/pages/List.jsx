import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

// Master Category List for PhilaBasket
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
  // Add your full 100+ list here...
];

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [catSearch, setCatSearch] = useState(""); // State for filtering dropdown

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditFormData({
      name: item.name,
      country: item.country,
      year: item.year,
      price: item.price,
      category: item.category // Now handled as an Array
    });
    setCatSearch("");
  }

  // Toggle category selection in Array
  const toggleCategory = (cat) => {
    const currentCats = [...editFormData.category];
    if (currentCats.includes(cat)) {
      setEditFormData({ ...editFormData, category: currentCats.filter(c => c !== cat) });
    } else {
      setEditFormData({ ...editFormData, category: [...currentCats, cat] });
    }
  };

  const saveEdit = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/update', { ...editFormData, id }, { headers: { token } });
      if (response.data.success) {
        toast.success("Stamp details updated!");
        setEditingId(null);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Update failed");
    }
  }

  // ... (removeProduct and handleImageUpload remain the same)

  useEffect(() => { fetchList() }, [])

  return (
    <div className='p-2'>
      <p className='mb-4 font-bold text-gray-700 uppercase tracking-widest text-sm'>Stamp Inventory Management</p>
      <div className='flex flex-col gap-2'>

        {/* --- Table Header --- */}
        <div className='hidden md:grid grid-cols-[0.8fr_2fr_1.2fr_2fr_0.8fr_1fr] items-center py-3 px-4 border bg-gray-100 text-[11px] font-black uppercase text-gray-500 tracking-tighter'>
          <span>Image</span>
          <span>Name</span>
          <span>Origin</span>
          <span>Category Selector</span>
          <span>Price</span>
          <span className='text-center'>Actions</span>
        </div>

        {list.map((item, index) => (
          <div className='grid grid-cols-1 md:grid-cols-[0.8fr_2fr_1.2fr_2fr_0.8fr_1fr] items-center gap-4 py-3 px-4 border bg-white text-sm hover:shadow-md transition-shadow' key={index}>
            
            <div className='flex justify-center'>
              <img draggable="false" className='w-12 h-16 object-contain border p-1 bg-gray-50' src={item.image[0]} alt="" />
            </div>

            {editingId === item._id ? (
              <>
                <input className='border px-2 py-1 rounded text-xs' value={editFormData.name} onChange={(e)=>setEditFormData({...editFormData, name: e.target.value})} />
                <div className='flex flex-col gap-1'>
                  <input className='border px-2 py-1 rounded text-xs' placeholder='Country' value={editFormData.country} onChange={(e)=>setEditFormData({...editFormData, country: e.target.value})} />
                  <input className='border px-2 py-1 rounded text-xs' placeholder='Year' type="number" value={editFormData.year} onChange={(e)=>setEditFormData({...editFormData, year: e.target.value})} />
                </div>

                {/* --- Searchable Category Dropdown --- */}
                <div className='relative bg-gray-50 p-2 rounded border border-gray-200'>
                  <input 
                    type="text" 
                    placeholder="Search Categories..." 
                    className='w-full text-[10px] p-1 mb-2 border rounded'
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                  />
                  <div className='h-28 overflow-y-auto bg-white border rounded p-1 flex flex-col gap-1'>
                    {ALL_CATEGORIES.filter(c => c.toLowerCase().includes(catSearch.toLowerCase())).map(cat => (
                      <div 
                        key={cat} 
                        onClick={() => toggleCategory(cat)}
                        className={`text-[10px] cursor-pointer px-2 py-1 rounded flex justify-between items-center font-bold ${editFormData.category.includes(cat) ? 'bg-red-600 text-white' : 'hover:bg-gray-100 text-gray-500'}`}
                      >
                        {cat}
                        {editFormData.category.includes(cat) && <span>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <input className='border px-2 py-1 rounded text-xs font-bold text-red-600' type="number" value={editFormData.price} onChange={(e)=>setEditFormData({...editFormData, price: e.target.value})} />
                
                <div className='flex flex-col gap-1'>
                  <button onClick={() => saveEdit(item._id)} className='bg-green-600 text-white text-[10px] py-1.5 rounded font-bold uppercase'>Save</button>
                  <button onClick={() => setEditingId(null)} className='bg-gray-200 text-gray-700 text-[10px] py-1.5 rounded font-bold uppercase'>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p className='font-bold text-gray-800 leading-tight'>{item.name}</p>
                <p className='text-gray-500'>{item.country} <span className='text-blue-600 font-bold'>({item.year})</span></p>
                <div className='flex flex-wrap gap-1'>
                  {item.category.map((cat, i) => (
                    <span key={i} className='bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-500 uppercase'>{cat}</span>
                  ))}
                </div>
                <p className='font-black text-red-600'>{currency}{item.price}</p>
                <div className='flex justify-center gap-3'>
                   <button onClick={() => startEdit(item)} className='text-blue-600 hover:underline text-[11px] font-bold uppercase'>Edit</button>
                   <button onClick={() => removeProduct(item._id)} className='text-red-500 hover:underline text-[11px] font-bold uppercase'>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default List