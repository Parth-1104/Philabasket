import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({ token }) => {
  // --- State for Modes ---
  const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'csv'

  // --- State for Manual Entry ---
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState([]); // Array for multi-category
  const [year, setYear] = useState("");
  const [country, setCountry] = useState("");
  const [condition, setCondition] = useState("Mint");
  const [stock, setStock] = useState(1);
  const [bestseller, setBestseller] = useState(false);

  // Available options
  const categoryOptions = ["Rare", "Historical", "Airmail", "Commemorative", "Definitive", "Europe", "Asia", "Americas"];

  const toggleCategory = (cat) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(item => item !== cat) : [...prev, cat]);
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData()

      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", JSON.stringify(categories))
      formData.append("year", year)
      formData.append("country", country)
      formData.append("condition", condition)
      formData.append("stock", stock)
      formData.append("bestseller", bestseller)

      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        // Reset fields
        setName(''); setDescription(''); setPrice(''); setYear(''); setCountry(''); setCategories([]);
        setImage1(false); setImage2(false); setImage3(false); setImage4(false);
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Placeholder for CSV handler
  const onCsvUploadHandler = async(e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post(backendUrl + "/api/product/bulk-add", formData, { 
            headers: { token } 
        });

        if (response.data.success) {
            toast.success(response.data.message);
            setUploadMode('manual'); // Switch back to manual mode after success
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        toast.error("Upload failed: " + error.message);
    }
  }

  return (
    <div className='w-full p-4'>
      {/* Mode Switcher */}
      <div className='flex gap-4 mb-8 border-b pb-4'>
        <button 
          onClick={() => setUploadMode('manual')}
          className={`px-4 py-2 rounded ${uploadMode === 'manual' ? 'bg-black text-white' : 'bg-gray-100'}`}
        >
          Single Stamp Entry
        </button>
        <button 
          onClick={() => setUploadMode('csv')}
          className={`px-4 py-2 rounded ${uploadMode === 'csv' ? 'bg-black text-white' : 'bg-gray-100'}`}
        >
          Bulk Upload (CSV)
        </button>
      </div>

      {uploadMode === 'csv' ? (
        <div className='flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-10 rounded-lg'>
          <p className='mb-4 text-gray-600'>Upload a CSV file with stamp details</p>
          <input type="file" accept=".csv" onChange={onCsvUploadHandler} className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100'/>
          <p className='mt-4 text-xs text-gray-400'>Columns required: name, price, description, year, country, stock...</p>
        </div>
      ) : (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4'>
          
          {/* Image Upload Section */}
          <div>
            <p className='mb-2 font-medium'>Upload Stamp Images</p>
            <div className='flex gap-2'>
              {[image1, image2, image3, image4].map((img, index) => (
                <label key={index} htmlFor={`image${index + 1}`}>
                  <img className='w-24 h-24 object-cover border-2 border-dotted border-gray-300 cursor-pointer' src={!img ? assets.upload_area : URL.createObjectURL(img)} alt="" />
                  <input onChange={(e) => [setImage1, setImage2, setImage3, setImage4][index](e.target.files[0])} type="file" id={`image${index + 1}`} hidden />
                </label>
              ))}
            </div>
          </div>

          <div className='w-full'>
            <p className='mb-2 font-medium'>Stamp Name / Title</p>
            <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 border rounded' type="text" placeholder='e.g. 1840 Penny Black' required />
          </div>

          <div className='w-full'>
            <p className='mb-2 font-medium'>Historical Description</p>
            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 border rounded' rows={3} placeholder='Describe history, watermark, or perforation details' required />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[700px]'>
            <div>
              <p className='mb-2 font-medium'>Country</p>
              <input onChange={(e) => setCountry(e.target.value)} value={country} className='w-full px-3 py-2 border rounded' type="text" placeholder='Great Britain' required />
            </div>
            <div>
              <p className='mb-2 font-medium'>Year of Issue</p>
              <input onChange={(e) => setYear(e.target.value)} value={year} className='w-full px-3 py-2 border rounded' type="number" placeholder='1840' required />
            </div>
            <div>
              <p className='mb-2 font-medium'>Price ($)</p>
              <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 border rounded' type="Number" placeholder='500' required />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px]'>
            <div>
              <p className='mb-2 font-medium'>Condition</p>
              <select onChange={(e) => setCondition(e.target.value)} className='w-full px-3 py-2 border rounded bg-white'>
                <option value="Mint">Mint (Unused)</option>
                <option value="Used">Used</option>
                <option value="Fine">Fine</option>
                <option value="Near Mint">Near Mint</option>
              </select>
            </div>
            <div>
              <p className='mb-2 font-medium'>Available Stock</p>
              <input onChange={(e) => setStock(e.target.value)} value={stock} className='w-full px-3 py-2 border rounded' type="number" placeholder='1' />
            </div>
          </div>

          {/* Multiple Category Selection */}
          <div>
            <p className='mb-2 font-medium'>Categories (Select Multiple)</p>
            <div className='flex flex-wrap gap-2'>
              {categoryOptions.map((cat) => (
                <p 
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`${categories.includes(cat) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"} px-4 py-1 rounded-full cursor-pointer text-sm transition-all`}
                >
                  {cat}
                </p>
              ))}
            </div>
          </div>

          <div className='flex gap-2 mt-2 items-center'>
            <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' className='w-4 h-4' />
            <label className='cursor-pointer font-medium' htmlFor="bestseller">Mark as Featured / Bestseller</label>
          </div>

          <button type="submit" className='w-44 py-3 mt-4 bg-black text-white font-bold hover:bg-gray-800 transition-colors'>ADD STAMP</button>
        </form>
      )}
    </div>
  )
}

export default Add