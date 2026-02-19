import React, { useEffect, useState, useContext } from 'react';
import { Quote, Star, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const Testimonials = () => {
  const { backendUrl } = useContext(ShopContext);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/feedback/featured`);
        if (response.data.success) {
          setFeaturedReviews(response.data.testimonials);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    if (backendUrl) fetchFeatured();
  }, [backendUrl]);

  // If no featured reviews yet, don't render the section to keep UI clean
  if (!loading && featuredReviews.length === 0) return null;

  return (
    <section className='bg-[#FCF9F4] py-20 md:py-32 px-6 md:px-16 lg:px-24 select-none'>
      <div className='max-w-7xl mx-auto'>
        {/* Section Header */}
        <div className='flex flex-col items-center text-center mb-16'>
          <div className='flex items-center gap-4 mb-4'>
            <span className='h-[1px] w-8 bg-[#BC002D]'></span>
            <p className='text-[10px] tracking-[0.5em] text-[#BC002D] uppercase font-black'>Collector Feedback</p>
            <span className='h-[1px] w-8 bg-[#BC002D]'></span>
          </div>
          <h2 className='text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter uppercase'>
            Our Customer's <span className='text-[#BC002D]'>Voices.</span>
          </h2>
        </div>

        {/* Testimonial Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {loading ? (
            // Simple Loading Skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className='bg-white/50 h-64 rounded-br-[50px] animate-pulse border border-black/5'></div>
            ))
          ) : (
            featuredReviews.map((review, index) => (
              <div 
                key={index} 
                className='bg-white p-8 rounded-br-[50px] border border-black/[0.03] shadow-sm hover:shadow-xl transition-all duration-500 group hover:border-[#BC002D]/20 flex flex-col justify-between'
              >
                <div>
                  <div className='flex justify-between items-start mb-6'>
                    <div className='flex gap-1'>
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} size={14} className='fill-[#BC002D] text-[#BC002D]' />
                      ))}
                    </div>
                    {review.image && (
                      <div className='w-12 h-12 rounded-lg overflow-hidden border border-black/5'>
                        <img src={review.image} alt="Specimen" className='w-full h-full object-cover' />
                      </div>
                    )}
                  </div>
                  
                  {/* <Quote className='text-[#BC002D]/10 mb-4 group-hover:text-[#BC002D]/20 transition-colors' size={40} /> */}
                  
                  <p className='text-gray-700 text-[14px] lg:text-[15px] leading-[1.6] font-medium italic mb-8 line-clamp-4'>
                    {review.text || "Exceptional philatelic service."}
                  </p>
                </div>

                <div className='pt-6 border-t border-gray-50'>
                  <p className='text-[12px] font-black uppercase tracking-widest text-gray-900'>{review.userName}</p>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-[#BC002D]'>Verified Collector</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;