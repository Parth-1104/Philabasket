import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price }) => {
    
  const { formatPrice } = useContext(ShopContext);

  return (
      <Link className='text-gray-700 cursor-pointer group' to={`/product/${id}`}>
          <div className='overflow-hidden border border-gray-200 rounded-sm bg-white'>
              {/* 1. Changed to object-contain to preserve stamp shapes.
                  2. Added group-hover for a smoother zoom effect.
                  3. Fixed the price variable error.
              */}
              <img 
                  className='group-hover:scale-105 transition duration-500 aspect-[3/4] object-contain w-full h-full p-2' 
                  src={image[0]} 
                  alt={name} 
              />
          </div>
          <p className='pt-3 pb-1 text-sm font-medium truncate'>{name}</p>
          <p className='text-sm font-bold text-[#E63946]'>
              {/* Corrected item.price to price */}
              {formatPrice(price)}
          </p>
      </Link>
  )
}

export default ProductItem