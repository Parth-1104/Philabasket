import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import RelatedProducts from '../components/RelatedProducts';
import { Heart, Loader2, Minus, Plus, PlayCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Product = () => {
  const { productId } = useParams();
  const { products, addToCart, formatPrice, currency, navigate, wishlist, toggleWishlist, backendUrl } = useContext(ShopContext);
  
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [activeVideo, setActiveVideo] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [isMainLoaded, setIsMainLoaded] = useState(false);

  const getWatermarkedUrl = (url) => {
    if (!url || !url.includes('cloudinary')) return url;
    const watermarkTransform = 'l_Logo-5_nqnyl4,o_50,w_0.6,c_scale';
    return url.includes('f_auto,q_auto') 
      ? url.replace('/f_auto,q_auto/', `/f_auto,q_auto,${watermarkTransform}/`)
      : url.replace('/upload/', `/upload/f_auto,q_auto,${watermarkTransform}/`);
  };

  // REVISED YOUTUBE LOGIC
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    }
    return null;
  };

  const fetchProductData = useCallback(async () => {
    let item = products.find((item) => item._id === productId);

    if (item) {
        setProductData(item);
        setImage(getWatermarkedUrl(item.image[0]));
    } else {
        try {
            // Using your /single endpoint logic
            const response = await axios.get(`${backendUrl}/api/product/single`, { params: { productId } });
            if (response.data.success) {
                const fetchedItem = response.data.product;
                setProductData(fetchedItem);
                setImage(getWatermarkedUrl(fetchedItem.image[0]));
            } else {
                toast.error("Specimen not found");
                navigate('/collection');
            }
        } catch (error) {
            console.error("Archive Sync Error:", error);
        }
    }
  }, [productId, products, backendUrl, navigate]);

  useEffect(() => {
    setProductData(false);
    fetchProductData();
  }, [productId, products, fetchProductData]);

  useEffect(() => {
    if (!image) return;
    const img = new Image();
    img.src = image;
    img.onload = () => setIsMainLoaded(true);
  }, [image]);

  const updateQuantity = (val) => {
    if (val < 1) return;
    if (productData && val > productData.stock) {
      toast.error(`Only ${productData.stock} specimens available`);
      return;
    }
    setQuantity(val);
  };

  const handleAddToCart = () => {
    addToCart(productData._id, quantity); 
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const valuationSymbol = currency === 'USD' ? '$' : '₹';

  // Helper to safely handle formatPrice as string
  const getSafePrice = (val) => {
    try {
        const formatted = formatPrice(val);
        return String(formatted).replace(/[₹$]/g, '').trim();
    } catch (e) {
        return val;
    }
  };

  return productData ? (
    <div className='bg-white min-h-screen pt-20 pb-12 px-6 md:px-16 lg:px-24 text-black select-none animate-fade-in relative'>
      
      {showPopup && (
        <div className='fixed top-6 left-1/2 -translate-x-1/2 z-[1000] animate-bounce-in'>
          <div className='bg-black text-white px-6 py-3 flex items-center gap-3 shadow-2xl border border-[#D4AF37]/50 rounded-sm'>
            <p className='text-[9px] font-black uppercase tracking-[0.2em]'>Archive Synchronized ({quantity})</p>
          </div>
        </div>
      )}

      <div className='flex gap-10 flex-col lg:flex-row items-start'>
        
        {/* MEDIA SECTION */}
        <div className='flex-1 flex flex-col-reverse gap-4 lg:flex-row w-full'>
          <div className='flex lg:flex-col overflow-x-auto lg:w-[12%] w-full hide-scrollbar gap-3'>
              {productData.image.map((item, index) => {
                  const thumb = getWatermarkedUrl(item);
                  return (
                    <img 
                      key={index}
                      onClick={() => { setImage(thumb); setActiveVideo(''); }} 
                      src={thumb} 
                      className={`w-[18%] lg:w-full aspect-square object-contain cursor-pointer border transition-all p-1.5 bg-[#F9F9F9] ${image === thumb && !activeVideo ? 'border-[#BC002D]' : 'border-black/5 opacity-50 hover:opacity-100'}`} 
                      alt="" 
                    />
                  );
              })}

              {productData.youtubeUrl && (
                <div 
                  onClick={() => {
                      const url = getEmbedUrl(productData.youtubeUrl);
                      if(url) {
                        setActiveVideo(url);
                      } else {
                        toast.error("Video record link invalid");
                      }
                  }}
                  className={`w-[18%] lg:w-full aspect-square flex flex-col items-center justify-center cursor-pointer border p-1.5 bg-black text-white transition-all ${activeVideo ? 'border-[#BC002D]' : 'opacity-60 hover:opacity-100'}`}
                >
                  <PlayCircle size={20} />
                  <span className='text-[7px] font-black uppercase mt-1'>Video</span>
                </div>
              )}
          </div>

          <div className='w-full lg:w-[88%] relative group bg-[#F9F9F9] flex items-center justify-center border border-black/5 p-4 min-h-[350px] md:min-h-[450px] overflow-hidden'>
              {activeVideo ? (
                <div className='absolute inset-0 z-30 bg-black animate-fade-in'>
                  <button onClick={() => setActiveVideo('')} className='absolute top-4 right-4 z-40 bg-white text-black p-2 rounded-full hover:bg-[#BC002D] hover:text-white transition-colors'>
                    <X size={16} />
                  </button>
                  <iframe 
                    className='w-full h-full'
                    src={activeVideo}
                    title="Specimen Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <img 
                  onLoad={() => setIsMainLoaded(true)}
                  className={`max-w-full max-h-[380px] object-contain drop-shadow-2xl transition-all duration-700 ${isMainLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
                  src={image} 
                  alt="" 
                />
              )}
          </div>
        </div>

        {/* INFO SECTION */}
        <div className='flex-1 lg:max-w-[480px]'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-[#BC002D] text-[8px] font-black tracking-[0.3em] px-3 py-1 bg-[#BC002D]/5 uppercase'>{productData.country}</span>
            <span className='text-gray-400 text-[8px] font-bold tracking-[0.3em] uppercase'>{productData.year} Archive</span>
          </div>

          <h1 className='text-xl md:text-3xl text-black tracking-tight leading-tight mb-6 uppercase font-bold'>{productData.name}</h1>
          
          <div className='mb-6 grid grid-cols-2 gap-4 border-y border-black/5 py-5'>
              <div className='flex flex-col'>
                  <p className='text-[9px] font-black text-gray-400 uppercase tracking-widest'>Condition</p>
                  <p className='text-[10px] font-bold uppercase'>{productData.condition || 'Mint'}</p>
              </div>
              <div className='flex flex-col'>
                  <p className='text-[9px] font-black text-gray-400 uppercase tracking-widest'>Registry Status</p>
                  <p className={`text-[10px] font-bold uppercase ${productData.stock < 5 ? 'text-[#BC002D]' : 'text-green-600'}`}>
                    {productData.stock > 0 ? `${productData.stock} left` : 'Sold Out'}
                  </p>
              </div>
          </div>

          <p className='text-xs md:text-sm text-gray-500 leading-relaxed font-medium italic mb-8'>
            {productData.description}
          </p>

          <div className='mb-8'>
              <p className='text-[7px] font-black text-[#BC002D] uppercase tracking-[0.3em] mb-3'>Acquisition Volume</p>
              <div className='flex items-center border border-black/5 bg-[#F9F9F9] w-fit rounded-sm'>
                  <button onClick={() => updateQuantity(quantity - 1)} className='p-3'><Minus size={10} /></button>
                  <span className='w-8 text-center text-[10px] font-black'>{quantity}</span>
                  <button onClick={() => updateQuantity(quantity + 1)} className='p-3'><Plus size={10} /></button>
              </div>
          </div>

          {/* VALUATION SECTION */}
          <div className='flex flex-col gap-1 mb-10'>
              <div className='flex items-baseline gap-2'>
                  <span className='text-2xl font-serif text-[#D4AF37]'>{valuationSymbol}</span>
                  <p className='text-5xl md:text-6xl font-medium text-[#D4AF37] tracking-tighter tabular-nums'>
                    {getSafePrice(productData.price * quantity)}
                  </p>
              </div>

              {productData.marketPrice > productData.price && (
                <div className='flex items-baseline gap-1 opacity-40 ml-1'>
                    <span className='text-xs font-serif text-gray-500'>{valuationSymbol}</span>
                    <p className='text-xl font-medium line-through decoration-[#BC002D]'>
                        {getSafePrice(productData.marketPrice * quantity)}
                    </p>
                </div>
              )}
          </div>

          <div className='flex flex-col sm:flex-row gap-3'>
            {productData.stock > 0 ? (
              <>
                <button onClick={() => toggleWishlist(productData._id)} className='flex-1 border border-black/5 py-4 flex items-center justify-center hover:bg-gray-50 transition-colors'>
                    <Heart size={18} className={wishlist.includes(productData._id) ? 'fill-[#BC002D] text-[#BC002D]' : 'text-gray-300'} />
                </button>
                <button onClick={handleAddToCart} className='flex-[3] bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#BC002D] transition-all'>
                  Add to Cart
                </button>
                <button onClick={() => navigate('/cart')} className='flex-[3] border border-black py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all'>
                  Instant Checkout
                </button>
              </>
            ) : (
              <button disabled className='w-full border border-black/5 text-gray-300 py-4 text-[10px] font-black uppercase'>Registry Exhausted</button>
            )}
          </div>
        </div>
      </div>
      
      <div className='mt-20 border-t border-black/5 pt-12'>
         <RelatedProducts category={productData.category[0]} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
      `}} />
    </div>
  ) : (
    <div className='min-h-screen flex flex-col items-center justify-center bg-white'>
        <Loader2 size={40} className='text-[#BC002D] animate-spin mb-4' />
        <p className='text-[10px] font-black uppercase tracking-[0.5em] text-gray-400'>Synchronizing Archives...</p>
    </div>
  );
};

export default Product;