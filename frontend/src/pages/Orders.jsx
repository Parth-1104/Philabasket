import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { backendUrl, token, fetchUserPoints } = useContext(ShopContext);
  const [orderData, setorderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getOrderSymbol = (savedCurrency) => {
    return savedCurrency === 'USD' ? '$' : '₹';
  }

  const loadOrderData = async (isManualRefresh = false) => {
    try {
      if (!token) return null;
      if (isManualRefresh) setLoading(true);

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
      
      if (response.data.success) {
        let allOrdersItem = [];
        // Use forEach for cleaner iteration and fresh object mapping
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            const freshItem = {
              ...item,
              status: order.status, // Directly sync from parent order
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
              savedCurrency: order.currency,
              totalAmount: order.amount,
              trackingNumber: order.trackingNumber,
              orderId: order._id,
              rewardPoints: Math.floor(item.price * 0.10)
            };
            allOrdersItem.push(freshItem);
          });
        });
        setorderData(allOrdersItem.reverse());
        
        // Only fetch points if an order status might have changed to Delivered
        await fetchUserPoints(); 
        
        if (isManualRefresh) toast.success("Order status synchronized");
      }
    } catch (error) {
      console.error("Sync Error:", error);
      if (isManualRefresh) toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  const cancelOrderHandler = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/order/cancel', { orderId }, { headers: { token } });
      if (response.data.success) {
        toast.success("Order cancelled successfully");
        await loadOrderData(); // Re-sync immediately
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error cancelling order");
    } finally {
      setLoading(false);
    }
  }

  // --- FEATURE: AUTOMATIC POLLING ---
  useEffect(() => {
    if (token) {
      loadOrderData();
      
      // Check for admin updates every 30 seconds
      const interval = setInterval(() => {
        loadOrderData();
      }, 30000);

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [token]);

  return (
    <div className='border-t pt-16 bg-[#FCF9F4] min-h-screen px-4'>
      <div className='text-2xl mb-8'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div className='max-w-5xl mx-auto pb-20'>
        {orderData.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <img src={assets.parcel_icon} className='w-20 opacity-20 mb-4 grayscale' alt="" />
            <h2 className='text-xl font-bold text-gray-400'>No orders found in your archive</h2>
            <p className='text-gray-500 mb-6'>Start your philatelic journey today.</p>
            <Link to='/collection' className='bg-black text-white px-8 py-3 rounded-sm text-sm font-bold uppercase hover:opacity-80 transition-all'>Explore Collection</Link>
          </div>
        ) : (
          orderData.map((item, index) => (
            <div key={index} className='py-6 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white px-4 mb-2 shadow-sm rounded-sm transition-all'>
              
              <div className='flex items-start gap-6 text-sm flex-1'>
                <div className='border border-gray-200 p-1 bg-white flex-shrink-0'>
                  <img draggable="false" className='w-16 sm:w-24 aspect-[3/4] object-contain select-none' src={item.image[0]} alt={item.name} />
                </div>
                
                <div className='flex flex-col gap-1 flex-1'>
                  <p className='sm:text-lg font-bold text-gray-900'>{item.name}</p>
                  
                  {item.trackingNumber && item.status !== 'Cancelled' && (
                    <div className='bg-blue-50 border border-blue-100 p-2 rounded flex items-center justify-between mb-2 animate-pulse'>
                       <div>
                         <p className='text-[10px] text-blue-500 font-black uppercase'>India Post Consignment</p>
                         <p className='text-xs font-mono font-bold text-blue-800'>{item.trackingNumber}</p>
                       </div>
                       <a href={`https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?p1=${item.trackingNumber}`} target="_blank" rel="noreferrer" className='text-[10px] bg-blue-600 text-white px-3 py-1 rounded font-bold uppercase'>Track Now</a>
                    </div>
                  )}

                  <div className='flex flex-col gap-1 mt-1'>
                    <div className='flex items-center gap-3 text-base font-medium'>
                      <p className='text-gray-600'>{getOrderSymbol(item.savedCurrency)}{item.savedCurrency === 'USD' ? (Number(item.price) / 83).toFixed(2) : item.price}</p>
                      <p className='text-gray-400'>|</p>
                      <p className='text-gray-500'>Qty: {item.quantity}</p>
                    </div>

                    <div className={`flex items-center gap-2 mt-1 py-1 px-2 rounded-sm w-fit border ${item.status === 'Delivered' ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                        <img src={assets.star_icon} className='w-3 h-3' alt="" />
                        <p className='text-[11px] font-bold uppercase tracking-tight'>
                            {item.status === 'Delivered' ? (
                                <span className='text-green-700'>Rewards Credited: +{item.rewardPoints} Pts</span>
                            ) : item.status === 'Cancelled' ? (
                                <span className='text-red-600'>Order Cancelled</span>
                            ) : (
                                <span className='text-orange-600'>Pending Rewards: +{item.rewardPoints} Pts</span>
                            )}
                        </p>
                    </div>
                  </div>
                  
                  <div className='text-xs sm:text-sm text-gray-500 mt-2 space-y-1'>
                    <p>Ordered on: <span className='font-medium text-gray-700'>{new Date(item.date).toDateString()}</span></p>
                    <p>Method: <span className='font-medium text-gray-700 uppercase'>{item.paymentMethod}</span></p>
                  </div>
                </div>
              </div>

              <div className='md:w-1/3 flex flex-col items-end gap-3'>
                <div className='flex items-center gap-2'>
                  <p className={`min-w-3 h-3 rounded-full ${item.status === 'Delivered' ? 'bg-green-500' : item.status === 'Cancelled' ? 'bg-gray-400' : 'bg-[#E63946]'}`}></p>
                  <p className='text-sm md:text-base font-medium'>{item.status}</p>
                </div>
                
                <div className='flex flex-col items-end gap-2'>
                    {/* --- CANCELLATION BUTTON LOCK --- */}
                    {/* Only show cancel if status is Placed/Packing AND no tracking number is assigned */}
                    {(item.status === 'Order Placed' || item.status === 'Packing') && !item.trackingNumber ? (
                        <button 
                            disabled={loading}
                            onClick={() => cancelOrderHandler(item.orderId)}
                            className='border border-red-300 text-red-600 px-4 py-2 text-xs font-bold rounded-sm hover:bg-red-600 hover:text-white transition-all shadow-sm'
                        >
                            Cancel Order
                        </button>
                    ) : (item.status === 'Shipped' || item.status === 'Out for delivery' || item.trackingNumber) && item.status !== 'Cancelled' && item.status !== 'Delivered' ? (
                        <div className='bg-gray-100 border border-gray-200 px-3 py-1 rounded-sm text-right'>
                           <p className='text-[10px] text-gray-500 font-black uppercase tracking-tighter'>
                              In Transit
                           </p>
                           <p className='text-[9px] text-gray-400 italic'>Cancellation unavailable</p>
                        </div>
                    ) : null}

                    <button 
                        disabled={loading}
                        onClick={() => loadOrderData(true)} 
                        className='border border-gray-300 px-6 py-2 text-sm font-semibold rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-sm'
                    >
                        {loading ? 'Syncing...' : 'Track Order'}
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders;