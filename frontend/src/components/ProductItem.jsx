import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price }) => {
    
  const { formatPrice } = useContext(ShopContext);

  // Hard block for dragging
  const handleDragStart = (e) => e.preventDefault();

  return (
      <Link 
        className='text-gray-700 cursor-pointer group select-none' 
        to={`/product/${id}`}
        // Prevents the link itself from being dragged
        onDragStart={handleDragStart} 
      >
          <div className='overflow-hidden border border-gray-200 rounded-sm bg-white pointer-events-none group-hover:pointer-events-auto'>
              <img 
                  // 1. HTML Attribute
                  draggable="false"
                  // 2. JavaScript Block
                  onDragStart={handleDragStart}
                  // 3. CSS Block (via tailwind/style)
                  className='group-hover:scale-105 transition duration-500 aspect-[3/4] object-contain w-full h-full p-2 select-none pointer-events-none' 
                  src={image[0]} 
                  alt={name} 
                  style={{ userDrag: 'none', WebkitUserDrag: 'none' }}
              />
          </div>
          <p className='pt-3 pb-1 text-sm font-medium truncate'>{name}</p>
          <p className='text-sm font-bold text-[#E63946]'>
              {formatPrice(price)}
          </p>
      </Link>
  )
}

export default ProductItem