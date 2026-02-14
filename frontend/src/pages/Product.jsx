import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import RelatedProducts from '../components/RelatedProducts';
import { Heart, Loader2, Minus, Plus, PlayCircle, X, Zap, Globe, CreditCard, Layers, ShoppingBag } from 'lucide-react';
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
    const watermarkTransform = 'l_Logo-5_go95bd,fl_relative,w_0.4,c_scale,o_70,a_-45';
    return url.includes('f_auto,q_auto') 
      ? url.replace('/f_auto,q_auto/', `/f_auto,q_auto,${watermarkTransform}/`)
      : url.replace('/upload/', `/upload/f_auto,q_auto,${watermarkTransform}/`);
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null;
  };

  const fetchProductData = useCallback(async () => {
    let item = products.find((item) => item._id === productId);
    if (item) {
        setProductData(item);
        setImage(getWatermarkedUrl(item.image[0]));
    } else {
        try {
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
    setIsMainLoaded(false);
  }, [image]);

  const updateQuantity = (val) => {
    if (val < 1) return;
    if (productData && val > productData.stock) {
      toast.error(`Only ${productData.stock} specimens in registry`);
      return;
    }
    setQuantity(val);
  };

  const handleAddToCart = () => {
    addToCart(productData._id, quantity); 
    setShowPopup(true);
    toast.success("Registry Updated", { position: "bottom-right", autoClose: 2000, hideProgressBar: true });
    setTimeout(() => setShowPopup(false), 4000);
  };

  const handleInstantCheckout = async () => {
    try {
      await addToCart(productData._id, quantity);
      navigate('/cart');
      window.scrollTo(0, 0);
    } catch (error) {
      toast.error("Checkout failed");
    }
  };

  const valuationSymbol = currency === 'USD' ? '$' : '₹';

  return productData ? (
    <div className='bg-white min-h-screen pt-24 pb-12 px-6 md:px-16 lg:px-24 select-none animate-fade-in relative'>
      {/* POPUP LOGIC */}
      {showPopup && (
          <div className='fixed top-10 left-1/2 -translate-x-1/2 z-[2000] w-[90vw] max-w-md animate-slide-down'>
              <div className='bg-white/80 backdrop-blur-xl border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl p-4 flex items-center gap-4'>
                  <div className='w-16 h-16 bg-[#F9F9F9] rounded-xl flex items-center justify-center p-2 border border-black/5'>
                      <img src={productData.image[0]} className='w-full h-full object-contain' alt="Success preview" />
                  </div>
                  <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                          <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></div>
                          <p className='text-[9px] font-black  tracking-[0.2em] text-gray-400'>Specimen Secured</p>
                      </div>
                      <h5 className='text-[5px] font-black  tracking-tight text-gray-900 line-clamp-1'>{productData.name}</h5>
                      <p className='text-[9px] font-bold text-[#BC002D] mt-1'>Quantity: {quantity} • Volume Synced</p>
                  </div>
                  <button onClick={() => setShowPopup(false)} className='p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400'><X size={16} /></button>
              </div>
          </div>
      )}
      
      <div className="absolute -right-[10vw] top-0 h-[50vh] w-[40vw] bg-[#BC002D]/5 rounded-bl-[600px] pointer-events-none z-0"></div>

      <div className='relative z-10 flex gap-12 flex-col lg:flex-row items-start'>
        
        {/* --- REFACTORED MEDIA SECTION --- */}
        <div className='flex-1 flex flex-col w-full lg:sticky lg:top-32'>
          {/* Main Display Area */}
          <div className='w-full relative bg-[#F9F9F9] flex items-center justify-center border border-black/5 p-8 h-[400px] md:h-[500px] overflow-hidden rounded-br-[80px]'>
              {activeVideo ? (
                <div className='absolute inset-0 z-30 bg-black animate-fade-in'>
                  <button onClick={() => setActiveVideo('')} className='absolute top-6 right-6 z-40 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-[#BC002D] transition-colors'>
                    <X size={20} />
                  </button>
                  <iframe className='w-full h-full' src={activeVideo} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
                </div>
              ) : (
                <img 
                  onLoad={() => setIsMainLoaded(true)}
                  className={`max-w-full max-h-full object-contain drop-shadow-2xl transition-all duration-1000 ${isMainLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
                  src={image} 
                  alt="" 
                />
              )}
          </div>

          {/* Conditional Small Preview Grid: Hidden if only one image and no video */}
          {(productData.image.length > 1 || productData.youtubeUrl) && (
            <div className='flex flex-row overflow-x-auto w-full hide-scrollbar gap-3 mt-4'>
                {productData.image.map((item, index) => {
                    const thumb = getWatermarkedUrl(item);
                    return (
                      <div
                        key={index}
                        onClick={() => { setImage(thumb); setActiveVideo(''); }}
                        className={`w-20 md:w-24 aspect-square cursor-pointer border-2 transition-all p-1.5 bg-[#F9F9F9] rounded-xl ${image === thumb && !activeVideo ? 'border-[#BC002D]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={thumb} className="w-full h-full object-contain" alt="" />
                      </div>
                    );
                })}

                {productData.youtubeUrl && (
                  <div 
                    onClick={() => setActiveVideo(getEmbedUrl(productData.youtubeUrl))}
                    className={`w-20 md:w-24 aspect-square flex flex-col items-center justify-center cursor-pointer border-2 p-1.5 bg-black text-white transition-all rounded-xl ${activeVideo ? 'border-[#BC002D]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <PlayCircle size={20} />
                    <span className='text-[7px] font-black uppercase mt-1'>Video</span>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* INFO SECTION */}
        <div className='flex-1 lg:max-w-[550px] py-4'>
          <div className='flex items-center gap-4 mb-6'>
            <span className='text-[#BC002D] text-[10px] font-black tracking-[0.4em] px-4 py-1.5 bg-[#BC002D]/5  rounded-full'>{productData.country}</span>
            <span className='text-gray-400 text-[10px] font-bold tracking-[0.4em] '>{productData.year} ARCHIVE</span>
          </div>

          <h1 className='text-2xl md:text-2xl font-black text-gray-900 tracking-tighter leading-none mb-8 '>{productData.name}</h1>
          
          <div className='grid grid-cols-2 gap-8 border-y border-black/[0.03] py-8 mb-8'>
              <div className='flex flex-col gap-1'>
                  <p className='text-[9px] font-black text-gray-400  tracking-widest'>Certified Condition</p>
                  <p className='text-xs font-black  text-gray-900'>{productData.condition || 'Mint State'}</p>
              </div>
              <div className='flex flex-col gap-1'>
                  <p className='text-[9px] font-black text-gray-400  tracking-widest'>Availability</p>
                  <p className={`text-xs font-black  ${productData.stock < 5 ? 'text-[#BC002D]' : 'text-green-600'}`}>
                    {productData.stock > 0 ? `${productData.stock} Specimens Left` : 'Registry Exhausted'}
                  </p>
              </div>
          </div>

         

          {/* TECHNICAL SPECIFICATIONS GRID */}
          <div className='bg-gray-50/50 rounded-3xl p-6 border border-black/[0.03] mb-10 grid grid-cols-2 gap-y-8 gap-x-4'>
                <div className='flex items-start gap-3'>
                    <div className='p-2 bg-white rounded-lg shadow-sm text-[#BC002D]'><Globe size={14}/></div>
                    <div>
                        <p className='text-[8px] font-black text-gray-400  tracking-widest mb-1'>Place of Origin</p>
                        <p className='text-[10px] font-bold text-gray-900 '>{productData.country}</p>
                    </div>
                </div>
                <div className='flex items-start gap-3'>
                    <div className='p-2 bg-white rounded-lg shadow-sm text-[#BC002D]'><CreditCard size={14}/></div>
                    <div>
                        <p className='text-[8px] font-black text-gray-400  tracking-widest mb-1'>Payment Terms</p>
                        <p className='text-[10px] font-bold text-gray-900 '>Sovereign Settlement</p>
                    </div>
                </div>
                <div className='flex items-start gap-3'>
                    <div className='p-2 bg-white rounded-lg shadow-sm text-[#BC002D]'><Layers size={14}/></div>
                    <div>
                        <p className='text-[8px] font-black text-gray-400  tracking-widest mb-1'>Produced Count</p>
                        <p className='text-[10px] font-bold text-gray-900 '>{productData.producedCount || 'Limited Edition'}</p>
                    </div>
                </div>
                <div className='flex items-start gap-3'>
                    <div className='p-2 bg-white rounded-lg shadow-sm text-[#BC002D]'><ShoppingBag size={14}/></div>
                    <div>
                        <p className='text-[8px] font-black text-gray-400  tracking-widest mb-1'>Min. Order Qty</p>
                        <p className='text-[10px] font-bold text-gray-900 '>01 Specimen</p>
                    </div>
                </div>
          </div>
          <div className='p-7 '>
          <h5 className='text-[10px] font-black text-[#BC002D]  tracking-[0.3em] mb-3'>
            Specimen Description
        </h5>
          <p className='text-sm md:text-base text-gray-500 leading-relaxed font-medium italic mb-10'>
            {productData.description}
          </p>
          </div>

          <div className='flex flex-col gap-2 mb-12'>
              <div className='flex items-baseline gap-2'>
                  <span className='text-3xl font-serif text-[#BC002D]'>{valuationSymbol}</span>
                  <p className='text-6xl md:text-7xl font-black text-gray-900 tracking-tighter tabular-nums leading-none'>
                      {String(formatPrice(productData.price * quantity)).replace(/[₹$]/g, '').trim()}
                  </p>
              </div>
              {productData.marketPrice > productData.price && (
                  <div className='flex items-baseline gap-2 opacity-30'>
                      <span className='text-sm font-serif text-gray-500'>{valuationSymbol}</span>
                      <p className='text-2xl font-bold text-gray-500 line-through decoration-[#BC002D] tabular-nums'>
                          {String(formatPrice(productData.marketPrice * quantity)).replace(/[₹$]/g, '').trim()}
                      </p>
                  </div>
              )}
          </div>

          <div className='flex flex-col gap-8'>
              <div className='flex items-center gap-6'>
                  <p className='text-[10px] font-black text-gray-900  tracking-widest'>Volume:</p>
                  <div className='flex items-center bg-gray-50 rounded-xl p-1 border border-black/5'>
                    <button onClick={() => updateQuantity(quantity - 1)} className='p-3 text-black hover:text-[#BC002D] transition-colors'>
                        <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className='w-12 text-center text-sm font-black text-black tabular-nums'>{quantity}</span>
                    <button onClick={() => updateQuantity(quantity + 1)} className='p-3 text-black hover:text-[#BC002D] transition-colors'>
                        <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-4'>
                {productData.stock > 0 ? (
                  <>
                    <button onClick={() => toggleWishlist(productData._id)} className='p-5 border border-black/5 rounded-2xl hover:bg-gray-50 transition-all'>
                        <Heart size={24} className={wishlist.includes(productData._id) ? 'fill-[#BC002D] text-[#BC002D]' : 'text-gray-300'} />
                    </button>
                    <button onClick={handleAddToCart} className='flex-1 bg-gray-900 text-white py-5 rounded-2xl text-[10px] font-black  tracking-[0.4em] hover:bg-black transition-all shadow-xl'>Add to Cart</button>
                    <button onClick={handleInstantCheckout} className='flex-1 bg-[#BC002D] text-white py-5 rounded-2xl text-[10px] font-black  tracking-[0.4em] hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl'>
                      <Zap size={16} fill="white" /> Buy Now
                    </button>
                  </>
                ) : (
                  <button disabled className='w-full bg-gray-100 text-gray-400 py-6 rounded-2xl text-[10px] font-black  tracking-[0.5em]'>Archive Fully Acquired</button>
                )}
              </div>
          </div>
        </div>
      </div>
      
      <div className='mt-32 border-t border-black/[0.03] pt-20'>
         <RelatedProducts category={productData.category[0]} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  ) : (
    <div className='min-h-screen flex flex-col items-center justify-center bg-white'>
        <Loader2 size={48} className='text-[#BC002D] animate-spin mb-6' />
        <p className='text-[10px] font-black  tracking-[0.6em] text-gray-400'>Initializing Sovereign Archive...</p>
    </div>
  );
};

export default Product;