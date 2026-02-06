import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { Heart, Loader2, Minus, Plus, PlayCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Product = () => {
  const { productId } = useParams();
  const { products, addToCart, formatPrice, currency, navigate, wishlist, toggleWishlist ,backendUrl} = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [activeVideo, setActiveVideo] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [isMainLoaded, setIsMainLoaded] = useState(false);

  // --- AUTOMATED WATERMARK LOGIC ---
  const getWatermarkedUrl = (url) => {
    if (!url || !url.includes('cloudinary')) return url;
    const watermarkTransform = 'l_Logo-5_nqnyl4,o_50,w_0.6,c_scale';
    if (url.includes('f_auto,q_auto')) {
        return url.replace('/f_auto,q_auto/', `/f_auto,q_auto,${watermarkTransform}/`);
    }
    return url.replace('/upload/', `/upload/f_auto,q_auto,${watermarkTransform}/`);
  };

  // 
  const fetchProductData = async () => {
    // 1. Try to find in local context first
    let item = products.find((item) => item._id === productId);

    if (item) {
        setProductData(item);
        setImage(getWatermarkedUrl(item.image[0]));
    } else {
        // 2. FALLBACK: Fetch specifically from Backend if not in local array
        try {
            const response = await axios.get(`${backendUrl}/api/product/single`, { 
                params: { productId } 
            });
            if (response.data.success) {
                const fetchedItem = response.data.product;
                setProductData(fetchedItem);
                setImage(getWatermarkedUrl(fetchedItem.image[0]));
            } else {
                toast.error("Specimen not found in registry");
                navigate('/collection');
            }
        } catch (error) {
            console.error("Archive Fetch Error:", error);
        }
    }
};

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  useEffect(() => {
    if (!image) return;
    const img = new Image();
    img.src = image;
    if (img.complete) {
      setIsMainLoaded(true);
    } else {
      setIsMainLoaded(false);
    }
  }, [image]);

  const updateQuantity = (val) => {
    if (val < 1) return;
    if (productData && val > productData.stock) {
      toast.error(`Only ${productData.stock} specimens available in registry`);
      return;
    }
    setQuantity(val);
  };

  const handleAddToCart = () => {
    addToCart(productData._id, quantity); 
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleBuyNow = async () => {
    await addToCart(productData._id, quantity);
    navigate('/cart');
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1` : null;
  };

  const valuationSymbol = currency === 'USD' ? '$' : '₹';

  return productData ? (
    <div className='bg-white min-h-screen pt-20 pb-12 px-6 md:px-16 lg:px-24 text-black select-none animate-fade-in relative'>
      <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org/",
                    "@type": "Product",
                    "name": productData.name,
                    "image": productData.image,
                    "description": productData.description,
                    "brand": {
                        "@type": "Brand",
                        "name": "PhilaBasket Registry"
                    },
                    "offers": {
                        "@type": "Offer",
                        "url": window.location.href,
                        "priceCurrency": currency,
                        "price": productData.price,
                        "availability": productData.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                    }
                })}
            </script>
      {showPopup && (
        <div className='fixed top-6 left-1/2 -translate-x-1/2 z-[1000] animate-bounce-in'>
          <div className='bg-black text-white px-6 py-3 flex items-center gap-3 shadow-2xl border border-[#D4AF37]/50 rounded-sm backdrop-blur-md bg-opacity-90'>
            <p className='text-[9px] font-black uppercase tracking-[0.2em]'>Specimen Catalogued ({quantity})</p>
          </div>
        </div>
      )}

      <div className='flex gap-10 flex-col lg:flex-row items-start'>
        
        {/* MEDIA SECTION */}
        <div className='flex-1 flex flex-col-reverse gap-4 lg:flex-row w-full'>
          <div className='flex lg:flex-col overflow-x-auto lg:w-[12%] w-full hide-scrollbar gap-3'>
              {productData.image.map((item, index) => {
                  const watermarkedThumb = getWatermarkedUrl(item);
                  return (
                    <img 
                      draggable="false" 
                      onClick={() => { setImage(watermarkedThumb); setActiveVideo(''); }} 
                      src={watermarkedThumb} 
                      key={index} 
                      className={`w-[18%] lg:w-full aspect-square object-contain cursor-pointer border transition-all duration-500 p-1.5 bg-[#F9F9F9] ${image === watermarkedThumb && !activeVideo ? 'border-[#BC002D]' : 'border-black/5 opacity-50 hover:opacity-100'}`} 
                      alt="Thumbnail" 
                    />
                  );
              })}

              {productData.youtubeUrl && (
                <div 
                  onClick={() => setActiveVideo(getEmbedUrl(productData.youtubeUrl))}
                  className={`w-[18%] lg:w-full aspect-square flex flex-col items-center justify-center cursor-pointer border p-1.5 bg-black text-white transition-all ${activeVideo ? 'border-[#BC002D]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <PlayCircle size={20} />
                  <span className='text-[7px] font-black uppercase mt-1'>Video</span>
                </div>
              )}
          </div>

          <div className='w-full lg:w-[88%] relative group bg-[#F9F9F9] flex items-center justify-center border border-black/5 p-4 min-h-[350px] md:min-h-[450px] overflow-hidden'>
              {activeVideo ? (
                <div className='relative w-full h-full flex items-center justify-center animate-fade-in'>
                  <button 
                    onClick={() => setActiveVideo('')}
                    className='absolute top-2 right-2 z-30 bg-black/80 text-white p-2 rounded-full hover:bg-[#BC002D] transition-colors shadow-lg'
                  >
                    <X size={16} />
                  </button>
                  <iframe 
                    className='w-full aspect-video shadow-2xl border-4 border-white'
                    src={activeVideo}
                    title="Specimen Video Record"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <>
                  {!isMainLoaded && (
                    <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center z-10">
                       <Loader2 size={24} className='text-[#BC002D] animate-spin mb-2 opacity-20' />
                       <p className='text-[8px] font-black uppercase tracking-[0.3em] text-gray-300'>Accessing Registry</p>
                    </div>
                  )}
                  <img 
                    draggable="false" 
                    onLoad={() => setIsMainLoaded(true)}
                    className={`max-w-full max-h-[380px] object-contain drop-shadow-2xl transition-all duration-[1.2s] ease-out
                      ${isMainLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-2xl scale-95'}
                      cursor-pointer group-hover:scale-105`} 
                    src={image} 
                    alt="Main Specimen" 
                  />
                </>
              )}
          </div>
        </div>

        {/* INFO SECTION */}
        <div className='flex-1 lg:max-w-[480px]'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-[#BC002D] text-[8px] font-black tracking-[0.3em] px-3 py-1 bg-[#BC002D]/5 uppercase'>{productData.country}</span>
            <span className='text-gray-400 text-[8px] font-bold tracking-[0.3em] uppercase'>{productData.year} Archive</span>
          </div>

          <h1 className='font-serif text-3xl md:text-4xl text-black tracking-tight leading-tight mb-4 uppercase font-bold'>{productData._id}. {productData.name}</h1>
          
          {/* RESTORED DESCRIPTION SECTION */}
          <div className='mb-6'>
            <p className='text-[8px] font-black text-[#BC002D] uppercase tracking-[0.3em] mb-2'>Archival Records</p>
            <p className='text-xs text-gray-500 leading-relaxed font-medium italic'>
              {productData.description}
            </p>
          </div>

          <div className='flex items-center gap-2 mb-6 text-gray-400'>
              <div className='flex gap-1'>
                {[...Array(5)].map((_, i) => <div key={i} className={`w-1 h-1 rounded-full ${i < 4 ? 'bg-[#BC002D]' : 'bg-black/10'}`}></div>)}
              </div>
              <p className='text-[8px] tracking-[0.3em] uppercase font-black'>Certified Heritage Asset</p>
          </div>

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

          <div className='mb-8'>
              <p className='text-[7px] font-black text-[#BC002D] uppercase tracking-[0.3em] mb-3'>Acquisition Volume</p>
              <div className='flex items-center gap-4'>
                  <div className='flex items-center border border-black/5 bg-[#F9F9F9] rounded-sm'>
                      <button onClick={() => updateQuantity(quantity - 1)} className='p-3 hover:text-[#BC002D] transition-colors'>
                        <Minus size={10} />
                      </button>
                      <input 
                        type="number" 
                        readOnly 
                        value={quantity} 
                        className='w-8 text-center bg-transparent text-[10px] font-black outline-none' 
                      />
                      <button onClick={() => updateQuantity(quantity + 1)} className='p-3 hover:text-[#BC002D] transition-colors'>
                        <Plus size={10} />
                      </button>
                  </div>
                  <p className='text-[8px] font-bold text-gray-300 uppercase tracking-widest'>Max: {productData.stock}</p>
              </div>
          </div>

          <div className='flex items-end gap-3 mb-6'>
              <div className='flex items-end gap-0.5'>
                  <span className='text-xl font-serif text-[#D4AF37] mb-1'>{valuationSymbol}</span>
                  <p className='text-4xl md:text-5xl font-medium text-[#D4AF37] tracking-tighter tabular-nums'>
                      {String(formatPrice(productData.price * quantity)).replace(/[₹$]/g, '')}
                  </p>
              </div>
          </div>

          <div className='mb-10 flex flex-col sm:flex-row gap-3'>
            {productData.stock > 0 ? (
              <>
                <button onClick={() => toggleWishlist(productData._id)} className='flex-1 flex items-center justify-center border border-black/5 py-2 hover:bg-gray-50 transition-colors'>
                  <Heart size={18} className={wishlist.includes(productData._id) ? 'fill-[#BC002D] text-[#BC002D]' : 'text-gray-300'} />
                </button>
                <button onClick={handleAddToCart} className='flex-[2] bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.4em] rounded-sm hover:bg-[#BC002D] transition-all'>
                  Add to Cart
                </button>
                <button onClick={handleBuyNow} className='flex-[2] border border-black py-4 text-[10px] font-black uppercase tracking-[0.4em] rounded-sm hover:bg-black hover:text-white transition-all'>
                  Buy Now
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

      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } @keyframes bounce-in { 0% { transform: translate(-50%, -20px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } } .animate-bounce-in { animation: bounce-in 0.4s ease-out forwards; } .animate-fade-in { animation: fadeIn 0.5s ease-in forwards; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}} />
    </div>
  ) : (
    <div className='min-h-screen bg-white flex flex-col items-center justify-center'>
        <Loader2 size={40} className='text-[#BC002D] animate-spin mb-4' />
        <p className='text-[10px] font-black uppercase tracking-[0.5em] text-gray-400'>Synchronizing Specimen Data...</p>
    </div>
  )
}

export default Product;