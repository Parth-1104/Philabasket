import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {

  const { backendUrl, token } = useContext(ShopContext);
  const [orderData, setorderData] = useState([])

  // Helper to get the correct symbol and handle conversion rate
  const getOrderSymbol = (savedCurrency) => {
    return savedCurrency === 'USD' ? '$' : '₹';
  }

  const loadOrderData = async () => {
    try {
      if (!token) return null

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        let allOrdersItem = []
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            // Capture the exact currency and amount from the order record
            item['savedCurrency'] = order.currency 
            item['totalAmount'] = order.amount
            allOrdersItem.push(item)
          })
        })
        setorderData(allOrdersItem.reverse())
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    loadOrderData()
  }, [token])

  return (
    <div className='border-t pt-16 bg-[#FCF9F4] min-h-screen px-4'>
      <div className='text-2xl mb-8'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div className='max-w-5xl mx-auto'>
        {
          orderData.map((item, index) => (
            <div key={index} className='py-6 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white px-4 mb-2 shadow-sm rounded-sm'>
              <div className='flex items-start gap-6 text-sm'>
                <div className='border border-gray-200 p-1 bg-white'>
                  <img className='w-16 sm:w-24 aspect-[3/4] object-contain' src={item.image[0]} alt={item.name} />
                </div>
                
                <div className='flex flex-col gap-1'>
                  <p className='sm:text-lg font-bold text-gray-900'>{item.name}</p>
                  
                  <div className='flex flex-col gap-1 mt-1'>
                    <div className='flex items-center gap-3 text-base font-medium'>
                      {/* FIXED: Logic to convert unit price if the transaction was in USD */}
                      <p className='text-gray-600'>
                        {getOrderSymbol(item.savedCurrency)}
                        {item.savedCurrency === 'USD' 
                          ? (Number(item.price) / 83).toFixed(2) 
                          : item.price}
                      </p>
                      <p className='text-gray-400'>|</p>
                      <p className='text-gray-500'>Qty: {item.quantity}</p>
                    </div>

                    {/* DISPLAY TOTAL INCLUSIVE OF DELIVERY */}
                    <div className='bg-red-50 p-2 rounded border border-red-100 mt-2'>
                        <p className='text-[#E63946] font-bold text-lg'>
                            Paid Total: {getOrderSymbol(item.savedCurrency)}
                            {/* FIXED: Rounding the total amount for USD orders */}
                            {item.savedCurrency === 'USD' 
                              ? Number(item.totalAmount).toFixed(2) 
                              : item.totalAmount}
                        </p>
                        <p className='text-[10px] text-gray-500 uppercase tracking-tighter'>
                            Transaction Currency: {item.savedCurrency}
                        </p>
                    </div>
                  </div>
                  
                  <div className='text-xs sm:text-sm text-gray-500 mt-2 space-y-1'>
                    <p>Ordered on: <span className='font-medium text-gray-700'>{new Date(item.date).toDateString()}</span></p>
                    <p>Method: <span className='font-medium text-gray-700 uppercase'>{item.paymentMethod}</span></p>
                  </div>
                </div>
              </div>

              <div className='md:w-1/3 flex justify-between items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <p className={`min-w-3 h-3 rounded-full ${item.status === 'Delivered' ? 'bg-green-500' : 'bg-[#E63946]'}`}></p>
                  <p className='text-sm md:text-base font-medium'>{item.status}</p>
                </div>
                <button onClick={loadOrderData} className='border border-gray-300 px-6 py-2 text-sm font-semibold rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-sm'>
                  Track Order
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders