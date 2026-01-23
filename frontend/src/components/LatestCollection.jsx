import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { Link, useNavigate } from 'react-router-dom';

const LatestCollection = () => {

    const { products } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setLatestProducts(products.slice(0, 10));
    }, [products])

    return (
        <div className='my-10 px-4'>
            {/* Wrapping the header in a Link or adding a click handler 
               to navigate to the full collection page 
            */}
            <div 
                onClick={() => { navigate('/collection'); window.scrollTo(0,0); }} 
                className='text-center py-8 text-3xl cursor-pointer group'
            >
                <Title text1={'LATEST'} text2={'COLLECTIONS'} />
                <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600 group-hover:text-black transition-colors'>
                    Discover our newest additions to the Philabasket archive. Click here to view the full collection.
                </p>
            </div>

            {/* Rendering Products */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
            {
  latestProducts.map((item, index) => (
    <ProductItem 
      key={index} 
      id={item._id} 
      image={item.image} 
      name={item.name} 
      price={item.price} 
      category={item.category[0]}
      linkToFilter={true} // <--- This sends them to the Collection page
    />
  ))
}
            </div>
            
            {/* Optional "View All" button at the bottom for better UX */}
            <div className='text-center mt-10'>
                <Link 
                    to='/collection' 
                    onClick={() => window.scrollTo(0,0)}
                    className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 uppercase tracking-widest'
                >
                    View Entire Collection
                </Link>
            </div>
        </div>
    )
}

export default LatestCollection