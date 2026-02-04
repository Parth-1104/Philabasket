import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { Heart } from 'lucide-react';

const Product = () => {
  const { productId } = useParams();
  const { products, addToCart, formatPrice, currency, navigate, wishlist, toggleWishlist } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

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

  const handleAddToCart = () => {
    addToCart(productData._id);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  }

  const handleBuyNow = () => {
    addToCart(productData._id);
    navigate('/cart');
  }

  const rewardPoints = productData ? Math.floor(productData.price * 0.10) : 0;
  const valuationSymbol = currency === 'USD' ? '$' : '₹';
  const valuationValue = currency === 'USD' ? (rewardPoints * 0.012).toFixed(2) : (rewardPoints / 10).toFixed(2);

  return productData ? (
    <div className='bg-white min-h-screen pt-20 pb-12 px-6 md:px-16 lg:px-24 text-black select-none animate-fade-in relative'>
      
      {showPopup && (
        <div className='fixed top-6 left-1/2 -translate-x-1/2 z-[1000] animate-bounce-in'>
          <div className='bg-black text-white px-6 py-3 flex items-center gap-3 shadow-2xl border border-[#D4AF37]/50 rounded-sm backdrop-blur-md bg-opacity-90'>
            <p className='text-[9px] font-black uppercase tracking-[0.2em]'>Specimen Catalogued</p>
          </div>
        </div>
      )}

      <div className='flex gap-10 flex-col lg:flex-row items-start'>
        {/* MEDIA SECTION - Compacted */}
        <div className='flex-1 flex flex-col-reverse gap-4 lg:flex-row w-full'>
          <div className='flex lg:flex-col overflow-x-auto lg:w-[12%] w-full hide-scrollbar gap-3'>
              {productData.image.map((item, index) => (
                  <img draggable="false" onClick={() => setImage(item)} src={item} key={index} 
                    className={`w-[18%] lg:w-full aspect-square object-contain cursor-pointer border transition-all duration-500 p-1.5 bg-[#F9F9F9] ${image === item ? 'border-[#BC002D]' : 'border-black/5 opacity-50'}`} 
                    alt="Thumbnail" />
              ))}
          </div>
          <div className='w-full lg:w-[53%] relative group bg-[#F9F9F9] flex items-center justify-center border border-black/5 p-8 min-h-[350px] md:min-h-[450px]'>
              {productData.price > 1000 && (
                <div className='absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 px-2 py-1 border border-[#D4AF37]/30'>
                   <div className='w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse'></div>
                   <span className='text-[7px] font-black tracking-[0.2em] uppercase text-[#D4AF37]'>Rare</span>
                </div>
              )}
              <img draggable="false" className='max-w-full max-h-[380px] object-contain drop-shadow-xl transition-transform duration-700 hover:scale-105' src={image} alt="Main Specimen" />
          </div>
        </div>

        {/* INFO SECTION - Streamlined */}
        <div className='flex-1 lg:max-w-[680px]'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-[#BC002D] text-[8px] font-black tracking-[0.3em] px-3 py-1 bg-[#BC002D]/5 uppercase'>{productData.country}</span>
            <span className='text-gray-400 text-[8px] font-bold tracking-[0.3em] uppercase'>{productData.year} Archive</span>
          </div>

          <h1 className='font-serif text-3xl md:text-4xl text-black tracking-tight leading-tight mb-2 uppercase font-bold'>{productData.name}</h1>
          
          <div className='flex items-center gap-2 mb-6'>
              <div className='flex gap-1'>
                {[...Array(5)].map((_, i) => <div key={i} className={`w-1 h-1 rounded-full ${i < 4 ? 'bg-[#BC002D]' : 'bg-black/10'}`}></div>)}
              </div>
              <p className='text-[8px] tracking-[0.3em] text-gray-400 uppercase font-black'>Certified Heritage Asset</p>
          </div>

          {/* APPRAISAL GRID - Compact */}
          <div className='mb-6 grid grid-cols-2 gap-y-3 gap-x-8 border-y border-black/5 py-5'>
              {[
                {label: 'Condition', val: productData.condition || 'Mint'},
                {label: 'Origin', val: productData.country},
                {label: 'Issue Year', val: productData.year},
                {label: 'Stock', val: productData.stock > 0 ? `${productData.stock} left` : 'Sold Out', color: productData.stock < 5}
              ].map((stat, i) => (
                <div key={i} className='flex flex-col'>
                    <p className='text-[7px] font-black text-gray-400 uppercase tracking-widest'>{stat.label}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${stat.color ? 'text-[#BC002D]' : 'text-black'}`}>{stat.val}</p>
                </div>
              ))}
          </div>

          <div className='mb-6'>
              <p className='text-[7px] font-black text-[#BC002D] uppercase tracking-[0.3em] mb-2'>Significance</p>
              <p className='text-xs md:text-sm font-bold text-gray-700 leading-relaxed line-clamp-3 hover:line-clamp-none cursor-default transition-all'>
                  {productData.description}
              </p>
          </div>

          {/* PRICE - High Impact but sized correctly */}
          <div className='flex items-end gap-3 mb-6'>
              <div className='flex items-end gap-0.5'>
                  <span className='text-xl font-serif text-[#D4AF37] mb-1'>{valuationSymbol}</span>
                  <p className='text-4xl md:text-5xl font-medium text-[#D4AF37] tracking-tighter tabular-nums'>
                      {String(formatPrice(productData.price)).replace(/[₹$]/g, '')}
                  </p>
              </div>
              {productData.marketPrice > productData.price && (
                  <p className='text-lg font-medium text-gray-300 line-through mb-1.5 tabular-nums'>
                      {String(formatPrice(productData.marketPrice)).replace(/[₹$]/g, '')}
                  </p>
              )}
          </div>

          {/* PRIVILEGE BOX - Slimmer */}
          <div className='mb-8 p-4 border border-black/5 bg-[#FBFBFB] flex items-center gap-4'>
            <img src={assets.coin} className='w-7 h-7 grayscale' alt="Points" />
            <div>
              <p className='text-[8px] font-black text-[#BC002D] uppercase tracking-[0.3em]'>Points Credit</p>
              <p className='text-[9px] text-gray-500 font-bold uppercase tracking-wider'>
                Earn <span className='text-black'>{rewardPoints} PTS</span> (~{valuationSymbol}{valuationValue})
              </p>
            </div>
          </div>
          
          <div className='mb-10 flex flex-col sm:flex-row gap-3'>
            {productData.stock > 0 ? (
              <>
              <button onClick={() => toggleWishlist(productData._id)} className='flex-1 flex items-center justify-center border border-black/5 py-2 hover:bg-gray-50'>
                  <Heart size={18} className={wishlist.includes(productData._id) ? 'fill-[#BC002D] text-[#BC002D]' : 'text-gray-300'} />
                </button>
                <button onClick={handleAddToCart} className='flex-[2] bg-black text-white py-4 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-[#BC002D] transition-colors rounded-sm'>
                  Add to Cart
                </button>
                <button onClick={handleBuyNow} className='flex-[2] border border-black py-4 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-black hover:text-white transition-colors rounded-sm'>
                  Buy Now
                </button>
                
              </>
            ) : (
              <button disabled className='w-full border border-black/5 text-gray-300 py-4 text-[10px] font-black tracking-[0.4em] uppercase'>Exhausted</button>
            )}
          </div>

          {/* TRUST BADGES - Horizontal and tight */}
          {/* <div className='flex justify-between pt-6 border-t border-black/5 gap-2'>
              {['Authentic', 'Insured'].map((text, i) => (
                <div key={i} className='flex flex-col gap-1'>
                  <p className='text-[7px] font-black uppercase text-black'>{text}</p>
                  <p className='text-[7px] text-gray-400 font-bold uppercase tracking-tighter'>Verified</p>
                </div>
              ))}
          </div> */}
        </div>
      </div>
      
      {/* RELATED - Reduced Margin */}
      <div className='mt-20 border-t border-black/5 pt-[-3vh]'>
         {/* <div className='mb-8 text-center'>
            <p className='text-[8px] tracking-[0.4em] text-[#BC002D] uppercase font-black mb-1'>Parallel Specimens</p>
            <h2 className='text-2xl font-serif text-black italic'>You may also like</h2>
         </div> */}
         <RelatedProducts category={productData.category[0]} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } @keyframes bounce-in { 0% { transform: translate(-50%, -20px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } } .animate-bounce-in { animation: bounce-in 0.4s ease-out forwards; }`}} />
    </div>
  ) : <div className='min-h-screen bg-white'></div>
}

export default Product;