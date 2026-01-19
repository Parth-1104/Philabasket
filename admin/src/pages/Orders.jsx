import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App' 
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])

  // UPDATED HELPER: Just show what is in the database
  const getCurrencySymbol = (orderCurrency) => {
    // Return the symbol based on the saved currency string
    return orderCurrency === 'USD' ? '$' : '₹';
  }

  const fetchAllOrders = async () => {
    if (!token) return null;

    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', { orderId, status: event.target.value }, { headers: { token } })
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to update status")
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token])

  return (
    <div className='p-4 bg-gray-50 min-h-screen'>
      <h3 className='text-xl font-bold mb-6 text-gray-800 uppercase tracking-wider'>Order Management</h3>
      <div className='max-w-6xl mx-auto'>
        {
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-4 items-start border border-gray-200 p-6 my-4 text-xs sm:text-sm text-gray-700 bg-white shadow-sm rounded-md' key={index}>
              <img draggable="false" className='w-12 opacity-80' src={assets.parcel_icon} alt="Parcel" />
              
              {/* Order Items & Customer Info */}
              <div>
                <div className='font-bold text-gray-900 mb-2'>
                  {order.items.map((item, i) => (
                    <p key={i} className='py-0.5'>
                      {item.name} x {item.quantity} {i !== order.items.length - 1 ? ',' : ''}
                    </p>
                  ))}
                </div>
                <p className='mt-4 font-bold text-[#E63946]'>{order.address.firstName + " " + order.address.lastName}</p>
                <div className='text-gray-500 mt-1'>
                  <p>{order.address.street},</p>
                  <p>{order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</p>
                </div>
                <p className='font-medium text-gray-700 mt-1'>{order.address.phone}</p>
              </div>

              {/* Order Details */}
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-gray-600'>Items: {order.items.length}</p>
                <p className='mt-3 font-medium'>Method: {order.paymentMethod}</p>
                <p>Payment: <span className={order.payment ? 'text-green-600 font-bold' : 'text-[#E63946] font-bold'}>{order.payment ? 'Success' : 'Pending'}</span></p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>
              
              {/* FIXED: DYNAMIC PRICE DISPLAY */}
              <div className='flex flex-col'>
                <p className='text-lg font-bold text-gray-900'>
                   {/* Display symbol + the exact amount stored in DB */}
                   {getCurrencySymbol(order.currency)}{order.amount}
                </p>
                <p className='text-[10px] text-gray-400 uppercase tracking-tighter'>Currency: {order.currency || 'INR'}</p>
              </div>

              {/* Order Status Selector */}
              <select 
                onChange={(event) => statusHandler(event, order._id)} 
                value={order.status} 
                className='p-2 font-semibold border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#E63946]'
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders