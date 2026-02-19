import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Star, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react'
import { backendUrl } from '../App';


const Feedback = ({ token }) => {
  const [list, setList] = useState([]);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/feedback/list', { headers: { token } });
      if (response.data.success) {
        setList(response.data.feedback.reverse());
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const toggleFeatured = async (feedbackId, currentStatus) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/feedback/feature', 
        { feedbackId, status: !currentStatus }, 
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Testimonial Visibility Updated");
        fetchFeedback(); // Refresh the list
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => { fetchFeedback(); }, [token]);

  return (
    <div className='p-6'>
      <h2 className='text-xl font-black uppercase tracking-widest mb-6'>Collector Feedback Registry</h2>
      
      <div className='flex flex-col gap-4'>
        {/* Table Header */}
        <div className='hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr] items-center py-4 px-6 bg-gray-100 text-[10px] font-black uppercase tracking-widest'>
          <span>Collector</span>
          <span>Review Text</span>
          <span>Specimen Photo</span>
          <span>Rating</span>
          <span className='text-center'>Display on Home</span>
        </div>

        {/* Feedback Rows */}
        {list.map((item) => (
          <div key={item._id} className='grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_1fr] items-center gap-4 py-4 px-6 border border-gray-100 rounded-lg hover:shadow-md transition-all bg-white'>
            <p className='text-xs font-bold'>{item.userName}</p>
            <p className='text-xs text-gray-600 italic'>"{item.text || 'No description provided'}"</p>
            
            <div>
              {item.image ? (
                <a href={item.image} target="_blank" rel="noreferrer">
                  <img src={item.image} className='w-12 h-12 object-cover rounded-md border border-gray-100' alt="feedback" />
                </a>
              ) : (
                <span className='text-gray-300'><ImageIcon size={20} /></span>
              )}
            </div>

            <div className='flex text-amber-500'>
              {[...Array(item.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
            </div>

            <div className='flex justify-center'>
              <button 
                onClick={() => toggleFeatured(item._id, item.isFeatured)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${item.isFeatured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
              >
                {item.isFeatured ? <><CheckCircle size={14}/> Featured</> : <><XCircle size={14}/> Hidden</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Feedback;