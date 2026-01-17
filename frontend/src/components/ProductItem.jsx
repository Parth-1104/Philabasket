import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'

const ProductItem = ({id,image,name,price}) => {
    
    const {currency} = useContext(ShopContext);

  return (
      <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
          <div className='overflow-hidden border rounded-sm'>
              {/* aspect-[3/4] creates a vertical stamp-like ratio. 
                object-cover ensures the image fills the box without stretching.
              */}
              <img 
                  className='hover:scale-110 transition ease-in-out aspect-[3/4] object-contain w-full h-full' 
                  src={image[0]} 
                  alt={name} 
              />
          </div>
          <p className='pt-3 pb-1 text-sm font-medium truncate'>{name}</p>
          <p className='text-sm font-bold text-orange-600'>${price}</p>
      </Link>
  )
}

export default ProductItem
