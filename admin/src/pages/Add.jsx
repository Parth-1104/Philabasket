import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, FileText, UploadCloud, RefreshCw } from 'lucide-react'

const Add = ({ token }) => {
  const [uploadMode, setUploadMode] = useState('manual');
  const [loading, setLoading] = useState(false);

  // --- Manual Entry State ---
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [imageName, setImageName] = useState(""); 
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [year, setYear] = useState("");
  const [country, setCountry] = useState("");
  const [condition, setCondition] = useState("Mint");
  const [stock, setStock] = useState(1);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const fetchCategories = async () => {
    try {
        const response = await axios.get(backendUrl + '/api/category/list');
        if (response.data.success) {
            const names = response.data.categories.map(cat => cat.name);
            setCategoryOptions(names);
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.error(error);
        toast.error("Registry Sync Failed: Could not load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleCategory = (cat) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(item => item !== cat) : [...prev, cat]);
  }

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
      formData.append("category", JSON.stringify(categories));
      formData.append("year", year);
      formData.append("country", country);
      formData.append("condition", condition);
      formData.append("stock", stock);
      
      if (imageName) {
        formData.append("imageName", imageName.trim());
      }

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } });

      if (response.data.success) {
        toast.success(response.data.message);
        setName(''); setDescription(''); setPrice(''); setMarketPrice(''); setYear(''); 
        setCountry(''); setCategories([]); setImageName('');
        setImage1(false); setImage2(false); setImage3(false); setImage4(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed. Verify your registry connection.");
    } finally {
      setLoading(false);
    }
  }

  const onCsvUploadHandler = async(e) => {
    const file = e.target.files[0];
    if (!file || loading) return;

    // --- ADDED: CONFIRMATION PROMPT ---
    const confirmUpload = window.confirm(`Are you sure you want to upload "${file.name}" to the Stamp Registry? This will commit multiple items to the archive.`);
    if (!confirmUpload) {
        e.target.value = null; // Reset input
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post(backendUrl + "/api/product/bulk-add", formData, { headers: { token } });
        if (response.data.success) {
            toast.success(response.data.message);
            setUploadMode('manual');
        } else {
            // --- ADDED: DISPLAY EXACT ERROR FROM BACKEND ---
            toast.error(response.data.message || "Bulk Upload Failed");
        }
    } catch (error) {
        // --- ADDED: DISPLAY DETAILED SYSTEM ERROR ---
        const errorMsg = error.response?.data?.message || "Ensure imageName column matches Media Registry.";
        toast.error(`Sync Error: ${errorMsg}`);
    } finally {
        setLoading(false);
        e.target.value = null; // Clear file input
    }
  }

  return (
    <div className='w-full p-8 bg-white min-h-screen font-sans'>
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
          
          {/* --- ADDED: LOADING OVERLAY --- */}
          {loading && (
            <div className='absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300'>
                <RefreshCw size={40} className='text-blue-600 animate-spin mb-4' />
                <p className='text-[10px] font-black uppercase tracking-[0.3em] text-blue-600'>Synchronizing Archive...</p>
            </div>
          )}

          <UploadCloud size={48} className='text-gray-300 group-hover:text-blue-500 transition-colors mb-6' />
          <p className='mb-6 text-sm font-bold text-gray-500 uppercase tracking-widest'>Upload Stamp Registry CSV</p>
          <input 
            type="file" 
            accept=".csv" 
            disabled={loading}
            onChange={onCsvUploadHandler} 
            className='block w-fit text-xs text-gray-500 file:mr-4 file:py-3 file:px-8 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-black file:transition-all cursor-pointer disabled:opacity-50'
          />
          <p className='mt-8 text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-gray-100'>
            Required: name, price, imageName (matches Media Library)
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-8 max-w-4xl'>
          
          {/* ... (Manual Form remains identical to your provided logic) ... */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 w-full'>
            <div className='space-y-6'>
                <div>
                    <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Local Upload</p>
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
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <ImageIcon size={14} className='text-blue-500' />
                    </div>
                    <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>OR Sync from Registry</p>
                    <input 
                        onChange={(e) => setImageName(e.target.value)} 
                        value={imageName} 
                        className='w-full pl-10 pr-4 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs font-bold placeholder:text-blue-300 outline-none focus:border-blue-400 transition-all' 
                        type="text" 
                        placeholder='Enter Filename (e.g. main02.png)' 
                    />
                </div>
            </div>

            <div className='space-y-6'>
                <div className='w-full'>
                    <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Stamp Title</p>
                    <input onChange={(e) => setName(e.target.value)} value={name} className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-black transition-all' type="text" placeholder='e.g. 1840 Penny Black' required />
                </div>
                <div className='w-full'>
                    <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Historical Dossier</p>
                    <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:border-black transition-all' rows={4} placeholder='Details on watermark, perforation, and heritage...' required />
                </div>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 w-full'>
            <div>
              <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Country</p>
              <input onChange={(e) => setCountry(e.target.value)} value={country} className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none' type="text" placeholder='UK' required />
            </div>
            <div>
              <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Year</p>
              <input onChange={(e) => setYear(e.target.value)} value={year} className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none' type="number" placeholder='1840' required />
            </div>
            <div>
              <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Price (Valuation)</p>
              <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none' type="Number" placeholder='500' required />
            </div>
            <div>
              <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Market Price (MSRP)</p>
              <input onChange={(e) => setMarketPrice(e.target.value)} value={marketPrice} className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none' type="Number" placeholder='750' />
            </div>
            <div>
              <p className='mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400'>Stock</p>
              <input onChange={(e) => setStock(e.target.value)} value={stock} className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none' type="number" placeholder='1' />
            </div>
          </div>

          <div>
            <p className='mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400'>Registry Categories</p>
            <div className='flex flex-wrap gap-2'>
              {categoryOptions.map((cat) => (
                <p key={cat} onClick={() => toggleCategory(cat)} className={`${categories.includes(cat) ? "bg-black text-white" : "bg-gray-100 text-gray-400"} px-4 py-2 rounded-full cursor-pointer text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105`}>
                  {cat}
                </p>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className='w-full md:w-64 py-5 mt-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-black transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center justify-center gap-2'>
            {loading ? (
                <>
                    <RefreshCw size={14} className='animate-spin' />
                    Synchronizing...
                </>
            ) : "Commit to Archive"}
          </button>
        </form>
      )}
    </div>
  )
}

export default Add