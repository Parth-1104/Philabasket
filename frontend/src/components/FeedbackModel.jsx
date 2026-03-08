import React, { useState } from 'react';
import { Star, X, Box, Truck, ShieldCheck, Tag, Zap } from 'lucide-react';

const FeedbackModal = ({ currentOrder, setShowFeedbackModal, handleFeedbackSubmit }) => {
  // Main Rating State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Detailed Category Ratings
  const [detailedRatings, setDetailedRatings] = useState({
    packingrating: 5,
    shippingrating: 5,
    qualityrating: 5,
    raterating: 5,
    processrating: 5
  });

  const ratingCategories = [
    { id: 'qualityrating', label: 'Specimen Quality', Icon: ShieldCheck },
    { id: 'packingrating', label: 'Packing Integrity', Icon: Box },
    { id: 'shippingrating', label: 'Logistics Speed', Icon: Truck },
    { id: 'raterating', label: 'Valuation/Rates', Icon: Tag },
    { id: 'processrating', label: 'Acquisition Process', Icon: Zap },
  ];

  const handleDetailedRating = (category, value) => {
    setDetailedRatings(prev => ({ ...prev, [category]: value }));
  };

  return (
    <div className='fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-6 text-[#3B0D11]'>
      <div className='absolute inset-0 bg-black/80 backdrop-blur-md' onClick={() => setShowFeedbackModal(false)}></div>
      
      <div className='bg-white w-full max-w-xl relative z-10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300'>
        {/* Header */}
        <div className='bg-[#BC002D] p-6 text-white flex justify-between items-center'>
          <div>
            <h3 className='font-black uppercase tracking-[0.2em] text-xs'>Consignment Feedback</h3>
            <p className='text-[10px] font-bold opacity-80 mt-1'>REGISTRY ID: #{currentOrder?.orderNo}</p>
          </div>
          <X className='cursor-pointer hover:rotate-90 transition-transform' onClick={() => setShowFeedbackModal(false)} />
        </div>

        <form onSubmit={(e) => handleFeedbackSubmit(e, { rating, ...detailedRatings })} className='p-8 flex flex-col gap-8 max-h-[80vh] overflow-y-auto'>
          
          {/* OVERALL GRADE - Hero Section */}
          <div className='flex flex-col items-center gap-3 pb-8 border-b border-gray-100'>
            <p className='text-[10px] font-black uppercase tracking-widest text-[#3B0D11]'>Overall Experience</p>
            <div className='flex items-center gap-3'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  className='transition-all active:scale-90'
                  onMouseEnter={() => setHoverRating(star)} 
                  onMouseLeave={() => setHoverRating(0)} 
                  onClick={() => setRating(star)}
                >
                  <Star size={32} className={`transition-colors ${(hoverRating || rating) >= star ? 'fill-[#BC002D] text-[#BC002D]' : 'text-[#3B0D11]'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* DETAILED METRICS - Grid Layout */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6'>
            {ratingCategories.map(({ id, label, Icon }) => (
              <div key={id} className='flex flex-col gap-2'>
                <div className='flex items-center gap-2 mb-1'>
                  <Icon size={12} className="text-[#BC002D]" />
                  <p className='text-[9px] font-black uppercase tracking-widest text-[#3B0D11]'>{label}</p>
                </div>
                <div className='flex items-center gap-1.5'>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleDetailedRating(id, val)}
                      className={`w-8 h-8 rounded-md text-[10px] font-bold transition-all border 
                        ${detailedRatings[id] === val 
                          ? 'bg-[#BC002D] text-white border-[#BC002D] shadow-lg shadow-red-100' 
                          : 'bg-white text-[#3B0D11] border-gray-100 hover:border-gray-300'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* TEXT FEEDBACK */}
          <div className='flex flex-col gap-2'>
             <p className='text-[10px] font-black uppercase tracking-widest text-[#3B0D11]'>Additional Remarks</p>
             <textarea 
               className='w-full p-4 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#BC002D]/30 min-h-[100px] resize-none'
               placeholder="Describe the specimen quality or shipping experience..."
             />
          </div>

          <button type="submit" className='w-full bg-[#BC002D] text-white py-4 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-[#a00026] transition-colors shadow-xl shadow-red-100'>
            Submit Appraisal
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal