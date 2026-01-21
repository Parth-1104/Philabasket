import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price }) => {
    
  const { formatPrice, currency } = useContext(ShopContext);

  // Hard block for dragging
  const handleDragStart = (e) => e.preventDefault();

  // Calculate points (10% of price)
  const points = Math.floor(price * 0.10);

  return (
      <Link 
        className='text-gray-700 cursor-pointer group select-none relative' 
        to={`/product/${id}`}
        onDragStart={handleDragStart} 
      >
          {/* Reward Point Badge */}
          {points > 0 && (
            <div className='absolute top-2 right-2 z-20 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity'>
              +{points} PTS
            </div>
          )}

          <div className='overflow-hidden border border-gray-200 rounded-sm bg-white pointer-events-none group-hover:pointer-events-auto'>
              <img 
                  draggable="false"
                  onDragStart={handleDragStart}
                  className='group-hover:scale-105 transition duration-500 aspect-[3/4] object-contain w-full h-full p-2 select-none' 
                  src={image[0]} 
                  alt={name} 
                  style={{ userDrag: 'none', WebkitUserDrag: 'none' }}
              />
          </div>
          
          <p className='pt-3 pb-1 text-sm font-medium truncate'>{name}</p>
          
          <div className='flex justify-between items-center'>
            <p className='text-sm font-bold text-[#E63946]'>
                {formatPrice(price)}
            </p>
            {/* Subtle point hint */}
            <p className='text-[10px] text-gray-400 font-light'>Earn {points} pts</p>
          </div>
      </Link>
  )
}

export default ProductItem