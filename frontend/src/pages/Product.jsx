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
  // Earn 10% of price in points
  const rewardPoints = productData ? Math.floor(productData.price * 0.10) : 0;
  // 10 Points = 1 Rupee value for redemption
  const monetaryValue = (rewardPoints / 10).toFixed(2);

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100 select-none'>
      
      <div className='flex gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {
                productData.image.map((item, index) => (
                  <img draggable="false" onClick={() => setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border hover:border-[#E63946]' alt="" />
                ))
              }
          </div>
          <div className='w-full sm:w-[80%]'>
              <img draggable="false" className='w-full h-auto border' src={image} alt="" />
          </div>
        </div>

        {/* -------- Stamp Info ---------- */}
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <span className='bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-300'>{productData.country}</span>
            <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-300'>{productData.year}</span>
          </div>

          <h1 className='font-medium text-2xl mt-3'>{productData.name}</h1>
          
          <div className='flex items-center gap-1 mt-2'>
              <img src={assets.star_icon} alt="" className="w-3" />
              <img src={assets.star_icon} alt="" className="w-3" />
              <img src={assets.star_icon} alt="" className="w-3" />
              <img src={assets.star_icon} alt="" className="w-3" />
              <img src={assets.star_dull_icon} alt="" className="w-3" />
              <p className='pl-2 text-sm'>(Verified Philatelist Review)</p>
          </div>

          <p className='mt-5 text-3xl font-medium text-[#E63946]'>
            {formatPrice(productData.price)}
          </p>

          {/* --- NEW REWARD POINTS DISPLAY --- */}
          <div className='mt-4 flex items-center gap-2 bg-orange-50 border border-orange-100 w-fit px-4 py-2 rounded-sm'>
            <div className='flex flex-col'>
              <p className='text-xs font-bold text-orange-700 uppercase tracking-wider'>Loyalty Reward</p>
              <p className='text-sm text-gray-700'>
                Earn <span className='font-bold text-orange-600'>{rewardPoints} Points</span> on this purchase
              </p>
            </div>
            <div className='h-8 w-[1px] bg-orange-200 mx-2'></div>
            <p className='text-[10px] text-gray-500 leading-tight'>
              Worth <span className='font-medium'>₹{monetaryValue}</span> <br /> off your next order
            </p>
          </div>
          
          <div className='mt-6 space-y-2'>
            <p className='text-gray-700'><span className='font-semibold'>Condition:</span> {productData.condition}</p>
            <p className='text-gray-500 md:w-4/5'>{productData.description}</p>
          </div>

          <div className='flex flex-wrap gap-2 mt-6'>
            {productData.category.map((cat, index) => (
              <span key={index} className='text-[10px] uppercase tracking-widest border px-2 py-1 bg-slate-50'>
                {cat}
              </span>
            ))}
          </div>

          <div className='my-8'>
             {productData.stock > 0 ? (
               <div className='flex flex-col gap-2'>
                  <p className='text-green-600 text-sm font-medium'>● In Stock ({productData.stock} available)</p>
                  <button onClick={() => addToCart(productData._id)} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 w-full sm:w-max'>
                    ADD TO COLLECTION
                  </button>
               </div>
             ) : (
               <button disabled className='bg-gray-400 text-white px-8 py-3 text-sm cursor-not-allowed'>OUT OF STOCK</button>
             )}
          </div>

          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-2'>
              <p className='flex items-center gap-2'>✓ Certificate of Authenticity included.</p>
              <p className='flex items-center gap-2'>✓ Secure, insured shipping globally.</p>
              <p className='flex items-center gap-2'>✓ 14-day return policy for collectors.</p>
          </div>
        </div>
      </div>
      
      {/* ... rest of specs and related products ... */}
      <RelatedProducts category={productData.category[0]} />
    </div>
  ) : <div className='opacity-0'></div>
}

export default Product