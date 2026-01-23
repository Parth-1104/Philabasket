import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price, category, linkToFilter = false }) => {
    
  const { formatPrice } = useContext(ShopContext);
  const handleDragStart = (e) => e.preventDefault();
  const points = Math.floor(price * 0.10);

  // Decide the URL based on the prop
  const destination = linkToFilter 
    ? `/collection?category=${encodeURIComponent(category || "")}` 
    : `/product/${id}`;

  return (
      <Link 
        className='text-gray-700 cursor-pointer group select-none relative block' 
        to={destination}
        onClick={() => window.scrollTo(0,0)} 
        onDragStart={handleDragStart} 
      >
          {points > 0 && (
            <div className='absolute top-2 right-2 z-20 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity'>
              +{points} PTS
            </div>
          )}

          <div className='overflow-hidden border border-gray-200 rounded-sm bg-white pointer-events-none group-hover:pointer-events-auto'>
              <img 
                  draggable="false"
                  onDragStart={handleDragStart}
                  className='group-hover:scale-105 transition duration-500 aspect-[3/4] object-contain w-full h-full p-2' 
                  src={image[0]} 
                  alt={name} 
              />
          </div>
          
          <p className='pt-3 pb-1 text-sm font-medium truncate'>{name}</p>
          
          <div className='flex justify-between items-center'>
            <p className='text-sm font-bold text-[#E63946]'>
                {formatPrice(price)}
            </p>
            {/* Show different hint text depending on the link type */}
            <p className='text-[10px] text-gray-400 font-light italic'>
                {linkToFilter ? `More ${category}` : 'View Details'}
            </p>
          </div>
      </Link>
  )
}

export default ProductItem