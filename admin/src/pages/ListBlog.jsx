import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Trash2, Edit3, Youtube, VideoOff, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { backendUrl } from '../App'

const ListBlog = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
        const response = await axios.get(backendUrl + '/api/blog/list');
        if (response.data.success) {
            setList(response.data.blogs || []); 
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.error("Connection Error:", error);
        toast.error("Could not sync with the registry");
    } finally {
        setLoading(false);
    }
}

  const removeBlog = async (id) => {
    if (!window.confirm("Are you sure you want to expunge this article from the archive?")) return;
    
    try {
      const response = await axios.post(backendUrl + '/api/blog/remove', { id }, { headers: { token } });
      if (response.data.success) {
        toast.success("Article Removed from Archive");
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
        toast.error("Removal protocol failed");
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='p-8 bg-white rounded-3xl shadow-sm border border-gray-100'>
      <div className='mb-8 flex justify-between items-end'>
        <div>
            <h2 className='text-2xl font-bold text-gray-900 tracking-tighter uppercase'>Registry Intel List</h2>
            <p className='text-[10px] font-black text-[#BC002D] tracking-widest uppercase mt-1'>Manage Published Analysis & Multimedia</p>
        </div>
        <div className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            Total Entries: {list.length}
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        {/* Updated Table Header with Video Column */}
        <div className='hidden md:grid grid-cols-[80px_3fr_1fr_100px_1fr_100px] items-center py-4 px-6 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest'>
          <span>Specimen</span>
          <span>Headline</span>
          <span>Category</span>
          <span className='text-center'>Media</span>
          <span>Date</span>
          <span className='text-center'>Actions</span>
        </div>

        {/* Blog Items */}
        {list.length > 0 ? list.map((item, index) => (
          <div key={index} className='grid grid-cols-[60px_1fr_80px] md:grid-cols-[80px_3fr_1fr_100px_1fr_100px] items-center gap-4 py-4 px-6 border border-gray-100 rounded-2xl hover:border-[#BC002D]/20 transition-all group'>
            
            {/* Image Preview */}
            <img className='w-12 h-12 md:w-16 md:h-10 object-contain rounded-lg bg-gray-50 border border-gray-50' src={item.image} alt="" />
            
            {/* Title */}
            <p className='text-sm font-bold text-gray-800 truncate pr-4'>{item.title}</p>
            
            {/* Category */}
            <p className='hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest'>{item.category}</p>
            
            {/* --- YOUTUBE URL INDICATOR --- */}
            <div className='hidden md:flex justify-center'>
                {item.youtubeUrl ? (
                    <div className='flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-full'>
                        <Youtube size={12} />
                        <span className='text-[8px] font-black uppercase'>Video</span>
                    </div>
                ) : (
                    <div className='flex items-center gap-1.5 text-gray-300'>
                        <FileText size={12} />
                        <span className='text-[8px] font-black uppercase'>Text</span>
                    </div>
                )}
            </div>

            {/* Date */}
            <p className='hidden md:block text-[10px] font-medium text-gray-400'>
              {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            
            {/* Actions */}
            <div className='flex justify-center gap-2'>
              <Link to={`/edit-blog/${item._id}`} className='p-2 text-gray-400 hover:text-[#BC002D] hover:bg-gray-50 rounded-full transition-all'>
                <Edit3 size={16} />
              </Link>
              <button onClick={() => removeBlog(item._id)} className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all'>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )) : !loading && (
            <div className='p-20 text-center border-2 border-dashed border-gray-100 rounded-3xl'>
                <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]'>The Archive is currently empty.</p>
            </div>
        )}
      </div>
    </div>
  )
}

export default ListBlog