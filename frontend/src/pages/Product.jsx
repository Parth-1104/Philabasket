import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, addToCart, formatPrice, currency, navigate } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const { wishlist, toggleWishlist } = useContext(ShopContext); // State for the cool popup

  const fetchProductData = async () => {
    const item = products.find((item) => item._id === productId);
    if (item) {
      setProductData(item);
      setImage(item.image[0]);
    }
  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  // Handle Add to Collection with Popup
  const handleAddToCart = () => {
    addToCart(productData._id);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Auto-hide after 3 seconds
  }

  // Handle Immediate Acquisition (Buy Now)
  const handleBuyNow = () => {
    addToCart(productData._id);
    navigate('/cart');
  }

  const rewardPoints = productData ? Math.floor(productData.price * 0.10) : 0;
  const valuationSymbol = currency === 'USD' ? '$' : '₹';
  const valuationValue = currency === 'USD' ? (rewardPoints * 0.012).toFixed(2) : (rewardPoints / 10).toFixed(2);

  return productData ? (
    <div className='bg-white min-h-screen pt-24 pb-20 px-6 md:px-16 lg:px-24 text-black select-none animate-fade-in relative'>
      
      {/* --- ACQUISITION SUCCESS POPUP --- */}
      {showPopup && (
        <div className='fixed top-10 left-1/2 -translate-x-1/2 z-[1000] animate-bounce-in'>
          <div className='bg-black text-white px-8 py-4 flex items-center gap-4 shadow-2xl border border-[#D4AF37]/50 rounded-sm backdrop-blur-md bg-opacity-90'>
            <div className='w-2 h-2 bg-[#D4AF37] rounded-full'></div>
            <p className='text-[10px] font-black uppercase tracking-[0.3em]'>Specimen Added to Archive</p>
            <div className='w-2 h-2 bg-[#D4AF37] rounded-full'></div>
          </div>
        </div>
      )}

      <div className='flex gap-16 flex-col lg:flex-row'>
        {/*---------- Product Images Gallery remains the same ------------- */}
        <div className='flex-1 flex flex-col-reverse gap-6 lg:flex-row'>
          <div className='flex lg:flex-col overflow-x-auto lg:overflow-y-auto justify-between lg:justify-normal lg:w-[12%] w-full hide-scrollbar'>
              {productData.image.map((item, index) => (
                  <img draggable="false" onClick={() => setImage(item)} src={item} key={index} 
                    className={`w-[22%] lg:w-full lg:mb-4 flex-shrink-0 cursor-pointer border-2 transition-all duration-700 p-2 bg-[#F9F9F9] ${image === item ? 'border-[#BC002D] scale-105' : 'border-black/5 opacity-60 hover:opacity-100'}`} 
                    alt="Thumbnail" />
              ))}
          </div>
          <div className='w-full lg:w-[62%] relative group overflow-hidden bg-[#F9F9F9] p-8 border border-black/5 shadow-sm'>
              {productData.price > 1000 && (
                <div className='absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 border border-[#D4AF37]/30'>
                   <div className='w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse'></div>
                   <span className='text-[8px] font-black tracking-[0.3em] uppercase text-[#D4AF37]'>Rare Specimen</span>
                </div>
              )}
              <img draggable="false" className='w-full h-auto transform group-hover:scale-110 transition-transform duration-[1.5s] ease-out cursor-zoom-in' src={image} alt="Main Specimen" />
          </div>
        </div>

        {/* -------- Stamp Info / The Appraisal ---------- */}
        <div className='flex-1 lg:max-w-[550px]'>
          {/* Header Info remains the same */}
          <div className='flex items-center gap-4 mb-8'>
            <span className='bg-[#BC002D]/5 text-[#BC002D] text-[9px] font-black tracking-[0.4em] px-4 py-2 border border-[#BC002D]/10 uppercase'>{productData.country}</span>
            <span className='text-gray-400 text-[9px] font-bold tracking-[0.4em] uppercase border-l border-black/10 pl-4'>{productData.year} Archive</span>
          </div>

          <h1 className='font-serif text-4xl md:text-6xl text-black tracking-tight leading-tight mb-4'>{productData.name}</h1>
          
          <div className='flex items-center gap-2 mb-10'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < 4 ? 'bg-[#BC002D]' : 'bg-black/10'}`}></div>
              ))}
              <p className='pl-3 text-[9px] tracking-[0.5em] text-gray-400 uppercase font-black'>Verified Heritage Asset</p>
          </div>

          <div className='flex items-end gap-2 mb-10'>
            <span className='text-3xl font-serif text-[#D4AF37] leading-none mb-1'>{currency === 'USD' ? '$' : '₹'}</span>
            <p className='text-5xl md:text-6xl font-medium text-[#D4AF37] tracking-tighter tabular-nums'>
                {String(formatPrice(productData.price)).replace(/[₹$]/g, '')}
            </p>
          </div>

          {/* Sovereign Reward Panel remains same */}
          <div className='mb-12 p-6 border border-black/5 bg-[#FBFBFB] relative group overflow-hidden'>
            <div className='absolute left-0 top-0 h-full w-[2px] bg-[#BC002D]'></div>
            <div className='flex items-center gap-5'>
                <img src={assets.coin} className='w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-700' alt="Points" />
                <div>
                  <p className='text-[10px] font-black text-[#BC002D] uppercase tracking-[0.4em] mb-1'>Collector Privilege</p>
                  <p className='text-xs text-gray-500 font-light leading-relaxed uppercase tracking-wider'>
                    Acquire to earn <span className='text-black font-bold'>{rewardPoints} PTS</span>. 
                    Valuation credit: <span className='text-black font-bold'>{valuationSymbol}{valuationValue}</span>
                  </p>
                </div>
            </div>
          </div>
          
          {/* --- ACQUISITION BUTTONS --- */}
          {/* --- ACQUISITION BUTTONS --- */}
<div className='mb-16 flex flex-col sm:flex-row gap-4 items-stretch'>
  {productData.stock > 0 ? (
    <>
      <button 
        onClick={handleAddToCart} 
        className='group relative flex-[3] bg-black text-white px-10 py-6 text-[11px] font-black tracking-[0.5em] uppercase overflow-hidden rounded-sm'
      >
        <span className="absolute inset-0 w-0 bg-[#BC002D] transition-all duration-500 group-hover:w-full"></span>
        <span className="relative z-10">Add to Collection</span>
      </button>

      <button 
        onClick={handleBuyNow} 
        className='flex-[3] border-2 border-black text-black px-10 py-6 text-[11px] font-black tracking-[0.5em] uppercase hover:bg-black hover:text-white transition-all duration-500 rounded-sm'
      >
        Purchase Acquisition
      </button>

      {/* --- REFINED WISHLIST TOGGLE --- */}
      <button 
  onClick={() => toggleWishlist(productData._id)}
  className={`flex-1 flex items-center justify-center p-6 border transition-all duration-300 ${
    wishlist.includes(productData._id) 
    ? 'bg-red-50 border-red-200' 
    : 'border-black/5 hover:bg-gray-50'
  }`}
  title="Archive for Later"
>
  <img 
    /* Ensure you use a heart or star icon here, not the cart icon */
    src={assets.heart_icon || assets.star_icon} 
    className={`w-5 transition-all duration-500 ${
      wishlist.includes(productData._id) 
      ? 'brightness-100 scale-125' 
      : 'opacity-20 grayscale'
    }`} 
    style={{ 
        /* Fallback filter to turn the icon red if you don't have a red icon file */
        filter: wishlist.includes(productData._id) ? 'invert(15%) sepia(95%) saturate(6932%) hue-rotate(347deg) brightness(95%) contrast(101%)' : 'none' 
    }}
    alt="Wishlist" 
  />
</button>
    </>
  ) : (
    <button disabled className='w-full border border-black/5 text-gray-300 px-16 py-6 text-[11px] font-black tracking-[0.5em] uppercase cursor-not-allowed'>Specimen Exhausted</button>
  )}
</div>

          {/* Archival Policies remain same */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-black/5'>
              <div className='flex flex-col gap-2'>
                  <p className='text-[9px] font-black tracking-[0.3em] uppercase text-black'>Authenticity</p>
                  <p className='text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-widest'>Certified Registry Provenance</p>
              </div>
              <div className='flex flex-col gap-2'>
                  <p className='text-[9px] font-black tracking-[0.3em] uppercase text-black'>Logistics</p>
                  <p className='text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-widest'>White-Glove Insured Transit</p>
              </div>
              <div className='flex flex-col gap-2'>
                  <p className='text-[9px] font-black tracking-[0.3em] uppercase text-black'>Vault Return</p>
                  <p className='text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-widest'>14-Day Reflection Period</p>
              </div>
          </div>
        </div>
      </div>
      
      {/* Related Products Footer remains same */}
      <div className='mt-32 border-t border-black/5 pt-20'>
         <div className='mb-12 text-center'>
            <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black mb-2'>Historical Parallel</p>
            <h2 className='text-3xl font-serif text-black'>Related <span className='italic font-light text-black/20'>Specimens</span></h2>
         </div>
         <RelatedProducts category={productData.category[0]} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce-in {
          0% { transform: translate(-50%, -20px); opacity: 0; }
          50% { transform: translate(-50%, 10px); }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
      `}} />
    </div>
  ) : <div className='min-h-screen bg-white'></div>
}

export default Product