import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, FileText, UploadCloud, RefreshCw, Star, Zap } from 'lucide-react'

const Add = ({ token }) => {
  const [uploadMode, setUploadMode] = useState('manual');
  const [loading, setLoading] = useState(false);

  // --- States ---
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [imageName, setImageName] = useState(""); 
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [category, setCategory] = useState(""); 
  const [dbCategories, setDbCategories] = useState([]); 
  const [year, setYear] = useState("");
  const [country, setCountry] = useState("");
  const [condition, setCondition] = useState("Mint");
  const [stock, setStock] = useState(1);
  
  // NEW STATES
  const [producedCount, setProducedCount] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [newArrival, setNewArrival] = useState(false);

  const fetchCategories = async () => {
    try {
        const response = await axios.get(backendUrl + '/api/category/list');
        if (response.data.success) {
            setDbCategories(response.data.categories);
        }
    } catch (error) {
        console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const groupedCategories = dbCategories.reduce((acc, cat) => {
      const key = cat.group || 'General / Uncategorized';
      if (!acc[key]) acc[key] = [];
      acc[key].push(cat);
      return acc;
  }, {});

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("marketPrice", marketPrice);
      formData.append("category", category);
      formData.append("year", year);
      formData.append("country", country);
      formData.append("condition", condition);
      formData.append("stock", stock);
      
      // NEW FIELD APPENDS
      formData.append("producedCount", producedCount);
      formData.append("bestseller", bestseller ? "true" : "false");
      formData.append("newArrival", newArrival ? "true" : "false");

      if (imageName) formData.append("imageName", imageName.trim());
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } });

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setName(''); setDescription(''); setPrice(''); setMarketPrice(''); setYear(''); 
        setCountry(''); setCategory(''); setImageName(''); setProducedCount('');
        setBestseller(false); setNewArrival(false);
        setImage1(false); setImage2(false); setImage3(false); setImage4(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  // (onCsvUploadHandler remains same...)
  const onCsvUploadHandler = async(e) => {
    const file = e.target.files[0];
    if (!file || loading) return;
    if (!window.confirm(`Upload "${file.name}" to the Archive?`)) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
        const response = await axios.post(backendUrl + "/api/product/bulk-add", formData, { headers: { token } });
        if (response.data.success) {
            toast.success(response.data.message);
            setUploadMode('manual');
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        toast.error("Sync Error: Check Media Registry matching.");
    } finally {
        setLoading(false);
        e.target.value = null;
    }
  }

  return (
    <div className='w-full p-8 bg-white min-h-screen font-sans select-none'>
      <div className='flex items-center justify-between mb-8'>
        <div>
            <h2 className='text-3xl font-black uppercase tracking-tighter'>Stamp Admission</h2>
            <p className='text-[10px] font-bold text-blue-600 uppercase tracking-widest'>Syncing with Media Registry</p>
        </div>
        <Link to="/media-library" className='bg-gray-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-50 transition-all'>
            <ImageIcon size={14}/> Open Media Library
        </Link>
      </div>

      <div className='flex gap-4 mb-10 bg-gray-50 p-2 rounded-2xl w-fit'>
        <button onClick={() => setUploadMode('manual')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${uploadMode === 'manual' ? 'bg-black text-white shadow-xl' : 'text-gray-400'}`}>
          <div className='flex items-center gap-2'><FileText size={14}/> Manual Entry</div>
        </button>
        <button onClick={() => setUploadMode('csv')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${uploadMode === 'csv' ? 'bg-black text-white shadow-xl' : 'text-gray-400'}`}>
          <div className='flex items-center gap-2'><UploadCloud size={14}/> Bulk CSV</div>
        </button>
      </div>

      {uploadMode === 'csv' ? (
        <div className='relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 p-20 rounded-[40px] bg-gray-50 transition-all hover:border-blue-300 group overflow-hidden'>
          {loading && (
            <div className='absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300'>
                <RefreshCw size={40} className='text-blue-600 animate-spin mb-4' />
                <p className='text-[10px] font-black uppercase tracking-[0.3em] text-blue-600'>Synchronizing Archive...</p>
            </div>
          )}
          <UploadCloud size={48} className='text-gray-300 group-hover:text-blue-500 transition-colors mb-6' />
          <p className='mb-6 text-sm font-bold text-gray-500 uppercase tracking-widest'>Upload Stamp Registry CSV</p>
          <input type="file" accept=".csv" disabled={loading} onChange={onCsvUploadHandler} className='block w-fit text-xs text-gray-500 file:mr-4 file:py-3 file:px-8 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white cursor-pointer disabled:opacity-50' />
        </div>
      ) : (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-8 max-w-5xl'>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 w-full'>
            <div className='space-y-8'>
                {/* Image Section */}
                <div>
                    <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Physical Asset Upload</p>
                    <div className='flex gap-3'>
                        {[image1, image2, image3, image4].map((img, index) => (
                            <label key={index} htmlFor={`image${index + 1}`} className='relative group'>
                                <img className='w-20 h-24 object-cover border border-gray-200 rounded-xl cursor-pointer group-hover:opacity-75 transition-all' src={!img ? assets.upload_area : URL.createObjectURL(img)} alt="" />
                                <input onChange={(e) => [setImage1, setImage2, setImage3, setImage4][index](e.target.files[0])} type="file" id={`image${index + 1}`} hidden />
                            </label>
                        ))}
                    </div>
                </div>

                <div className='relative'>
                    <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>OR Sync from Cloud Registry</p>
                    <div className='relative'>
                        <ImageIcon size={14} className='absolute left-4 top-1/2 -translate-y-1/2 text-blue-500' />
                        <input onChange={(e) => setImageName(e.target.value)} value={imageName} className='w-full pl-12 pr-4 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-400' type="text" placeholder='Enter Filename (e.g. #BK01.jpg)' />
                    </div>
                </div>

                {/* Flags Section (Bestseller / New Arrival) */}
                <div className='flex gap-4'>
                    <div 
                        onClick={() => setBestseller(!bestseller)} 
                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl cursor-pointer border transition-all ${bestseller ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                    >
                        <Star size={16} className={bestseller ? 'fill-amber-500' : ''} />
                        <span className='text-[10px] font-black uppercase tracking-widest'>Bestseller</span>
                    </div>
                    <div 
                        onClick={() => setNewArrival(!newArrival)} 
                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl cursor-pointer border transition-all ${newArrival ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                    >
                        <Zap size={16} className={newArrival ? 'fill-blue-500' : ''} />
                        <span className='text-[10px] font-black uppercase tracking-widest'>New Arrival</span>
                    </div>
                </div>

                <div>
                    <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Archive Architecture (Category)</p>
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-black transition-all'
                        required
                    >
                        <option value="">Select Specimen Group</option>
                        {Object.keys(groupedCategories).sort().map(group => (
                            <optgroup key={group} label={group.toUpperCase()} className="text-[10px] text-blue-600 font-black tracking-widest bg-gray-100 py-2">
                                {groupedCategories[group].map(cat => (
                                    <option key={cat._id} value={cat.name} className="bg-white text-gray-900 font-bold py-2">
                                        {cat.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
            </div>

            <div className='space-y-6'>
                <div className='w-full'>
                    <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Specimen Title</p>
                    <input onChange={(e) => setName(e.target.value)} value={name} className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none' type="text" placeholder='e.g. 1947 Jay Hind Block' required />
                </div>
                <div className='w-full'>
                    <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Historical Dossier (Description)</p>
                    <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none' rows={6} placeholder='Heritage details...' required />
                </div>
                {/* Produced Count Section */}
                <div className='w-full'>
                    <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Mintage (Produced Count)</p>
                    <input onChange={(e) => setProducedCount(e.target.value)} value={producedCount} className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none' type="number" placeholder='e.g. 1000000' />
                </div>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-5 gap-4 w-full'>
            {[
              { label: 'Origin', val: country, set: setCountry, ph: 'India', type: 'text' },
              { label: 'Year', val: year, set: setYear, ph: '1947', type: 'number' },
              { label: 'Price', val: price, set: setPrice, ph: '1500', type: 'number' },
              { label: 'Market', val: marketPrice, set: setMarketPrice, ph: '2000', type: 'number' },
              { label: 'Stock', val: stock, set: setStock, ph: '1', type: 'number' }
            ].map((field, idx) => (
              <div key={idx}>
                <p className='mb-3 text-[9px] font-black uppercase tracking-widest text-gray-400'>{field.label}</p>
                <input onChange={(e) => field.set(e.target.value)} value={field.val} className='w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none' type={field.type} placeholder={field.ph} required />
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className='w-full md:w-72 py-5 mt-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2'>
            {loading ? <RefreshCw size={14} className='animate-spin' /> : "Commit to Archive"}
          </button>
        </form>
      )}
    </div>
  )
}

export default Add