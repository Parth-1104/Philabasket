import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, addToCart, formatPrice } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')

  const fetchProductData = async () => {
    const item = products.find((item) => item._id === productId);
    if (item) {
      setProductData(item);
      setImage(item.image[0]);
    }
  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  // --- Reward Points Calculation ---
  const rewardPoints = productData ? Math.floor(productData.price * 0.10) : 0;
  const monetaryValue = (rewardPoints / 10).toFixed(2);

  return productData ? (
    <div className='bg-[#0a0a0a] min-h-screen pt-20 px-6 md:px-16 lg:px-24 text-white select-none animate-fade-in'>
      
      <div className='flex gap-12 flex-col lg:flex-row'>

        {/*---------- Product Images (The Loupe View) ------------- */}
        <div className='flex-1 flex flex-col-reverse gap-4 lg:flex-row'>
          <div className='flex lg:flex-col overflow-x-auto lg:overflow-y-auto justify-between lg:justify-normal lg:w-[18%] w-full custom-scrollbar'>
              {
                productData.image.map((item, index) => (
                  <img 
                    draggable="false" 
                    onClick={() => setImage(item)} 
                    src={item} 
                    key={index} 
                    className={`w-[22%] lg:w-full lg:mb-4 flex-shrink-0 cursor-pointer border transition-all duration-500 ${image === item ? 'border-[#B8860B] brightness-110' : 'border-white/5 opacity-50 hover:opacity-100'}`} 
                    alt="Specimen thumbnail" 
                  />
                ))
              }
          </div>
          <div className='w-full lg:w-[82%] group overflow-hidden border border-white/5 bg-[#111111] p-4 rounded-sm'>
              <img 
                draggable="false" 
                className='w-full h-auto transform group-hover:scale-110 transition-transform duration-700 cursor-crosshair' 
                src={image} 
                alt="Main Specimen" 
              />
          </div>
        </div>

        {/* -------- Stamp Info (The Appraisal) ---------- */}
        <div className='flex-1 lg:max-w-[500px]'>
          <div className='flex items-center gap-3 mb-6'>
            <span className='bg-[#B8860B]/10 text-[#B8860B] text-[10px] font-bold tracking-[0.2em] px-3 py-1 rounded-sm border border-[#B8860B]/20 uppercase'>{productData.country}</span>
            <span className='bg-white/5 text-gray-400 text-[10px] font-bold tracking-[0.2em] px-3 py-1 rounded-sm border border-white/10 uppercase'>{productData.year}</span>
          </div>

          <h1 className='font-serif text-3xl md:text-4xl text-white tracking-tight leading-tight'>
            {productData.name}
          </h1>
          
          <div className='flex items-center gap-1.5 mt-4 opacity-60'>
              {[...Array(4)].map((_, i) => <img key={i} src={assets.star_icon} alt="" className="w-2.5 brightness-0 invert" />)}
              <img src={assets.star_dull_icon} alt="" className="w-2.5 brightness-0 invert opacity-30" />
              <p className='pl-3 text-[10px] tracking-widest text-gray-500 uppercase'>(Certified Appraisal)</p>
          </div>

          <p className='mt-8 text-4xl font-light text-[#B8860B] tracking-tighter'>
            {formatPrice(productData.price)}
          </p>

          {/* --- SOVEREIGN REWARD PANEL --- */}
          <div className='mt-8 flex items-center gap-4 bg-[#111111] border border-[#B8860B]/30 p-5 rounded-sm relative overflow-hidden group'>
            <div className='absolute inset-0 bg-gradient-to-r from-[#B8860B]/5 to-transparent pointer-events-none'></div>
            <img src={assets.coin} className='w-8 h-8 animate-pulse relative z-10' alt="Points" />
            <div className='relative z-10'>
              <p className='text-[10px] font-bold text-[#B8860B] uppercase tracking-[0.3em] mb-1'>Collector Privilege</p>
              <p className='text-xs text-gray-400 font-light leading-relaxed'>
                Acquire this specimen to earn <span className='text-white font-bold'>{rewardPoints} PTS</span>. 
                <br />Valuation credit: <span className='text-[#B8860B]'>₹{monetaryValue}</span>
              </p>
            </div>
          </div>
          
          <div className='mt-10 space-y-4'>
            <div className='flex items-center gap-4'>
                <span className='text-[10px] text-gray-500 uppercase tracking-widest'>Specimen State</span>
                <span className='text-[10px] text-white uppercase tracking-widest bg-[#1a1a1a] px-3 py-1 rounded-full border border-white/5'>{productData.condition}</span>
            </div>
            <p className='text-sm text-gray-400 font-light leading-relaxed tracking-wide italic'>
                "{productData.description}"
            </p>
          </div>

          <div className='flex flex-wrap gap-2 mt-8'>
            {productData.category.map((cat, index) => (
              <span key={index} className='text-[9px] uppercase tracking-[0.3em] border border-[#B8860B]/20 px-3 py-1.5 bg-[#B8860B]/5 text-[#B8860B] font-bold rounded-sm'>
                {cat}
              </span>
            ))}
          </div>

          <div className='my-12'>
             {productData.stock > 0 ? (
               <div className='flex flex-col gap-4'>
                  <p className='text-[#B8860B] text-[10px] tracking-[0.4em] font-bold uppercase'>● Specimen Available in Archive</p>
                  <button 
                    onClick={() => addToCart(productData._id)} 
                    className='bg-[#B8860B] text-black px-12 py-5 text-[11px] font-black tracking-[0.4em] uppercase hover:bg-white transition-all duration-500 rounded-sm shadow-[0_0_40px_rgba(184,134,11,0.2)] active:scale-95 w-full lg:w-max'
                  >
                    Add to Collection
                  </button>
               </div>
             ) : (
               <button disabled className='border border-white/10 text-gray-600 px-12 py-5 text-[11px] tracking-[0.4em] uppercase cursor-not-allowed w-full lg:w-max'>Out of Stock</button>
             )}
          </div>

          <hr className='mt-12 border-white/5' />
          
          <div className='text-[10px] text-gray-500 mt-8 space-y-4 tracking-[0.2em] uppercase font-light'>
              <div className='flex items-center gap-4 group cursor-default'>
                  <div className='w-1 h-1 bg-[#B8860B] rounded-full group-hover:scale-150 transition-transform'></div>
                  <p>Guaranteed Certificate of Authenticity</p>
              </div>
              <div className='flex items-center gap-4 group cursor-default'>
                  <div className='w-1 h-1 bg-[#B8860B] rounded-full group-hover:scale-150 transition-transform'></div>
                  <p>White-Glove Insured Global Transit</p>
              </div>
              <div className='flex items-center gap-4 group cursor-default'>
                  <div className='w-1 h-1 bg-[#B8860B] rounded-full group-hover:scale-150 transition-transform'></div>
                  <p>14-Day Vault Return Policy</p>
              </div>
          </div>
        </div>
      </div>
      
      {/* Related Products Section */}
      <div className='mt-24 border-t border-white/5 pt-16'>
         <RelatedProducts category={productData.category[0]} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 2px; height: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #B8860B; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}} />
    </div>
  ) : <div className='min-h-screen bg-[#0a0a0a]'></div>
}

export default Product