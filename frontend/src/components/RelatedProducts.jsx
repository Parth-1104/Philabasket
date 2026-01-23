import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({ category, id }) => { // Added 'id' to props to exclude the current item

    const { products } = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        if (products.length > 0 && category) {
            
            let productsCopy = products.slice();
            
            // 1. Filter products that share at least ONE category with the current product
            // 2. Also exclude the current product itself (by checking the ID)
            productsCopy = productsCopy.filter((item) => {
                const isSameProduct = item._id === id;
                
                // Ensure item.category exists and is an array
                const hasMatchingCategory = item.category && item.category.some(cat => category.includes(cat));
                
                return !isSameProduct && hasMatchingCategory;
            });

            // Show 5 related items
            setRelated(productsCopy.slice(0, 5));
        }
        
    }, [products, category, id]) // Re-run if products or current category changes

  return (
    <div className='my-24 px-3'>
      <div className='text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={"PRODUCTS"} />
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.map((item, index) => (
            <ProductItem 
                key={index} 
                id={item._id} 
                name={item.name} 
                price={item.price} 
                image={item.image}
                category={item.category && item.category[0]} // Pass category back for link functionality
            />
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts