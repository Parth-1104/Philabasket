import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const { products , search , showSearch } = useContext(ShopContext);
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState([]);
  const [category,setCategory] = useState([]);
  const [condition,setCondition] = useState([]); // Changed from subCategory to Condition
  const [sortType,setSortType] = useState('relavent')

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
        setCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setCategory(prev => [...prev,e.target.value])
    }
  }

  const toggleCondition = (e) => {
    if (condition.includes(e.target.value)) {
      setCondition(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setCondition(prev => [...prev,e.target.value])
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    // UPDATED: Logic to filter items where item.category is an ARRAY
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => 
        item.category.some(cat => category.includes(cat))
      );
    }

    // Filtering by Stamp Condition (Mint/Used)
    if (condition.length > 0 ) {
      productsCopy = productsCopy.filter(item => condition.includes(item.condition))
    }

    setFilterProducts(productsCopy)
  }

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  }

  useEffect(()=>{
      applyFilter();
  },[category,condition,search,showSearch,products])

  useEffect(()=>{
    sortProduct();
  },[sortType])

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      
      {/* Filter Options */}
      <div className='min-w-60'>
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2 uppercase tracking-wider'>FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>

        {/* Category Filter - Updated for Stamps */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>COLLECTIONS</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {['Rare', 'Historical', 'Europe', 'Asia', 'Americas', 'Airmail'].map((item) => (
              <p key={item} className='flex gap-2'>
                <input className='w-3' type="checkbox" value={item} onChange={toggleCategory}/> {item}
              </p>
            ))}
          </div>
        </div>

        {/* Condition Filter - Replacing SubCategory */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CONDITION</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Mint'} onChange={toggleCondition}/> Mint (Unused)
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Used'} onChange={toggleCondition}/> Used
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Fine'} onChange={toggleCondition}/> Fine
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={'PHILATELIC'} text2={'COLLECTIONS'} />
            <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2 bg-white'>
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Sort by: Price: Low to High</option>
              <option value="high-low">Sort by: Price: High to Low</option>
            </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            filterProducts.map((item,index)=>(
              <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image} />
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Collection