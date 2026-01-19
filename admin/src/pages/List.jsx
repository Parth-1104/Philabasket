import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {

  const [list, setList] = useState([])

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse());
      }
      else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Handle image upload for CSV-imported stamps
  const handleImageUpload = async (id, files) => {
    const formData = new FormData();
    // Assuming you want to allow adding up to 4 images
    Array.from(files).forEach((file, index) => {
      formData.append(`image${index + 1}`, file);
    });
    formData.append("id", id);

    try {
      const response = await axios.post(backendUrl + '/api/product/update-images', formData, { headers: { token } });
      if (response.data.success) {
          toast.success("Images updated!");
          fetchList();
      }
    } catch (error) {
      toast.error("Upload failed");
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      <p className='mb-2 font-bold text-gray-700'>Stamp Inventory Management</p>
      <div className='flex flex-col gap-2'>

        {/* ------- Table Header ---------- */}
        <div className='hidden md:grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr] items-center py-2 px-4 border bg-gray-100 text-sm font-bold'>
          <span>Image</span>
          <span>Name</span>
          <span>Origin (Year)</span>
          <span>Category</span>
          <span>Price</span>
          <span className='text-center'>Action</span>
        </div>

        {/* ------ Stamp List ------ */}
        {
          list.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr] items-center gap-2 py-2 px-4 border text-sm hover:bg-gray-50' key={index}>
              
              {/* Image Logic: Show image or Upload button if empty */}
              {item.image && item.image.length > 0 ? (
                <img draggable="false" className='w-12 h-12 object-cover rounded' src={item.image[0]} alt="" />
              ) : (
                <label className='cursor-pointer bg-blue-50 text-blue-600 px-2 py-1 text-[10px] rounded border border-blue-200 text-center'>
                  Add Image
                  <input 
                    type="file" 
                    multiple 
                    hidden 
                    onChange={(e) => handleImageUpload(item._id, e.target.files)} 
                  />
                </label>
              )}

              <p className='font-medium'>{item.name}</p>
              
              <p className='text-gray-500'>{item.country} ({item.year})</p>
              
              <div className='flex flex-wrap gap-1'>
                {item.category.map((cat, i) => (
                  <span key={i} className='bg-slate-100 px-1 rounded text-[10px]'>{cat}</span>
                ))}
              </div>

              <p className='font-bold text-orange-600'>{currency}{item.price}</p>
              
              <div className='flex justify-center gap-4'>
                 <p onClick={()=>removeProduct(item._id)} className='cursor-pointer text-red-500 hover:font-bold transition-all'>Remove</p>
              </div>
            </div>
          ))
        }

      </div>
    </>
  )
}

export default List