import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Trash2, Edit3, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { backendUrl } from '../App'

const ListBlog = ({ token }) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
        const response = await axios.get(backendUrl + '/api/blog/list');
        console.log("Archive Response Data:", response.data); // CRITICAL: Check your browser console

        if (response.data.success) {
            // Ensure you are targeting the 'blogs' key specifically
            setList(response.data.blogs || []); 
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.error("Connection Error:", error);
        toast.error("Could not sync with the registry");
    }
}

  const removeBlog = async (id) => {
    try {
      // Ensure you have a delete route on your backend
      const response = await axios.post(backendUrl + '/api/blog/remove', { id }, { headers: { token } });
      if (response.data.success) {
        toast.success("Article Removed from Archive");
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='p-8 bg-white rounded-3xl shadow-sm border border-gray-100'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 tracking-tighter uppercase'>Registry Intel List</h2>
        <p className='text-[10px] font-black text-[#BC002D] tracking-widest uppercase mt-1'>Manage Published Analysis</p>
      </div>

      <div className='flex flex-col gap-4'>
        {/* Table Header */}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-4 px-6 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest'>
          <span>Specimen</span>
          <span>Headline</span>
          <span>Category</span>
          <span>Date</span>
          <span className='text-center'>Actions</span>
        </div>

        {/* Blog Items */}
        {list.map((item, index) => (
          <div key={index} className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-4 py-4 px-6 border border-gray-100 rounded-2xl hover:border-[#BC002D]/20 transition-all group'>
            <img className='w-16 h-10 object-cover rounded-lg bg-gray-50' src={item.image} alt="" />
            <p className='text-sm font-bold text-gray-800 truncate pr-4'>{item.title}</p>
            <p className='hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest'>{item.category}</p>
            <p className='hidden md:block text-[10px] font-medium text-gray-400'>
              {new Date(item.date).toLocaleDateString()}
            </p>
            
            <div className='flex justify-center gap-4'>
              <Link to={`/edit-blog/${item._id}`} className='p-2 text-gray-400 hover:text-[#BC002D] transition-colors'>
                <Edit3 size={18} />
              </Link>
              <button onClick={() => removeBlog(item._id)} className='p-2 text-gray-400 hover:text-red-600 transition-colors'>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListBlog