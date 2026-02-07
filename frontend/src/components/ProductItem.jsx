import React, { useContext, useEffect, useState, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Plus, Zap } from 'lucide-react'
import { toast } from 'react-toastify'

const ProductItem = ({ id, _id, image, name, price, marketPrice, category, linkToFilter = false }) => {
    
  const { formatPrice, currency, addToCart, wishlist, toggleWishlist } = useContext(ShopContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const productId = _id || id;
  
  const createSeoSlug = (text) => {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').trim();
  };

  const optimizedImage = useMemo(() => {
    const rawUrl = image && image[0] ? image[0] : "";
    if (!rawUrl || !rawUrl.includes('cloudinary')) return rawUrl;
    const watermarkTransform = 'l_Logo-5_nqnyl4,o_50,w_0.6,c_scale';
    return rawUrl.replace('/upload/', `/upload/f_auto,q_auto,w_600,${watermarkTransform}/`);
  }, [image]);

  const handleNavigation = (e) => {
    e.preventDefault();
    const slug = createSeoSlug(name || "specimen");
    navigate(`/product/${productId}/${slug}`);
    window.scrollTo(0,0);
  };

  // --- ACTIONS HANDLERS ---
  const onAddToCart = (e) => {
    e.stopPropagation(); 
    addToCart(productId, 1);
    toast.success("Added to Registry", { autoClose: 1500 });

  };

  const onBuyNow = async (e) => {
    e.stopPropagation();
    await addToCart(productId, 1);
    navigate('/cart');
    window.scrollTo(0,0);;
  };

  const onToggleWishlist = (e) => {
    e.stopPropagation(); 
    toggleWishlist(productId);
  };

  const symbol = currency === 'USD' ? '$' : '₹';

  return (
      <div className='relative block group select-none transition-all duration-700 cursor-pointer'>
          {/* IMAGE CONTAINER */}
          <div className='relative overflow-hidden bg-white p-1 border border-black/[0.05] group-hover:border-[#BC002D]/30 rounded-br-[40px] lg:rounded-br-[60px] shadow-sm group-hover:shadow-2xl' onClick={handleNavigation}>
              
              {/* WISHLIST BUTTON */}
              <button 
  onClick={onToggleWishlist}
  className='absolute top-3 right-3 z-30 p-2 bg-white/70 backdrop-blur-md rounded-full border border-black/10 hover:bg-[#BC002D] hover:text-white transition-all shadow-sm'
>
  <Heart 
    size={14} 
    className={`${
      wishlist.includes(productId) 
        ? 'fill-[#BC002D] text-[#BC002D]' 
        : 'text-black'
    } transition-colors`} 
  />
</button>

              <div className='relative aspect-[3/4] lg:aspect-[4/5] flex items-center justify-center bg-[#F8F8F8] group-hover:bg-white transition-colors duration-700 rounded-br-[35px] lg:rounded-br-[30px]'>
                  <img 
                      onLoad={() => setIsLoaded(true)}
                      className={`z-10 w-full h-full object-contain p-2 lg:p-5 transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100 group-hover:scale-110' : 'opacity-0 scale-95'}`} 
                      src={optimizedImage} 
                      alt={name} 
                  />
                  
                  {/* QUICK ACTIONS OVERLAY */}
                  <div className='absolute bottom-4 left-0 right-0 z-30 flex flex-col items-center gap-2 translate-y-20 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 px-4'>
                     <button 
                        onClick={onAddToCart}
                        className='w-full bg-white text-black border border-black/10 flex items-center justify-center gap-2 py-2 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-gray-50'
                     >
                        <Plus size={10} /> Add to Cart
                     </button>
                     <button 
                        onClick={onBuyNow}
                        className='w-full bg-black text-white flex items-center justify-center gap-2 py-2 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-[#BC002D]'
                     >
                        <Zap size={10} /> Buy Now
                     </button>
                  </div>
              </div>
          </div>
          
          <div className='pb-7 lg:mt-5 px-1'>
              <div className='flex flex-col gap-2'>
                <div className='flex justify-between items-start gap-4'>
                  {/* --- COMPULSORY 3-LINE VISIBILITY --- 
                      Line-clamp ensures it doesn't exceed 3 lines, 
                      Min-height ensures it always occupies the space of 3 lines 
                  */}
                  <h3 className='text-[11px] lg:text-[13px] font-black uppercase tracking-[0.05em] text-gray-900 group-hover:text-[#BC002D] transition-colors leading-[1.4] line-clamp-3 min-h-[4.2em] lg:min-h-[4.2em] overflow-hidden' onClick={handleNavigation}>
                      {name || "Untitled Specimen"}
                  </h3>
                  
                  <div className='flex flex-col items-end shrink-0'>
                    {marketPrice > price && (
                        <p className='text-[9px] lg:text-[10px] font-bold text-gray-400 tabular-nums line-through decoration-[#BC002D]/50 mb-1'>
                            <span className='mr-0.5'>{symbol}</span>
                            {formatPrice(marketPrice)}
                        </p>
                    )}
                    <p className='text-[11px] lg:text-[15px] font-black text-gray-900 tabular-nums leading-none'>
                        <span className='text-[9px] mr-0.5 text-[#BC002D]'>{symbol}</span>
                        {formatPrice(price)}
                    </p>
                  </div>
                </div>
              </div>
          </div>
      </div>
  )
}

export default ProductItem;