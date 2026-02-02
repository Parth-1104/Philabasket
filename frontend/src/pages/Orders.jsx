import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { backendUrl, token, fetchUserData } = useContext(ShopContext);
  const [orderData, setorderData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- FEATURE: Registry Synchronization Engine ---
  const loadOrderData = async (isManualRefresh = false) => {
    try {
      if (!token) return null;
      if (isManualRefresh) setLoading(true);

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
      
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          // 1. Reward Points: Always 10% of the stored base INR amount
          const orderTotalPoints = Math.floor(order.amount * 0.10);

          // 2. Currency UI Logic: Reverse the backend conversion for USD orders
          // The database stores "amount": 116260 for USD checkouts. We divide by 83 to show $1400.72.
          const displayAmount = order.currency === 'USD' 
            ? (order.amount / 83).toFixed(2) 
            : order.amount;

          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
              savedCurrency: order.currency, // e.g., "USD"
              totalPaidAmount: displayAmount, // e.g., 1400.72
              trackingNumber: order.trackingNumber,
              orderId: order._id,
              rewardPoints: orderTotalPoints 
            });
          });
        });
        setorderData(allOrdersItem.reverse());
        
        await fetchUserData(); 
        if (isManualRefresh) toast.success("Ledger Synchronized");
      }
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const cancelOrderHandler = async (orderId) => {
    if (!window.confirm("Rescind this acquisition request?")) return;
    setLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/order/cancel', { orderId }, { headers: { token } });
      if (response.data.success) {
        toast.success("Consignment Revoked");
        await loadOrderData();
      }
    } catch (error) {
      toast.error("Process failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadOrderData();
      const interval = setInterval(() => loadOrderData(), 45000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <div className='bg-[#FCF9F4] min-h-screen pt-24 pb-20 px-6 md:px-16 lg:px-24 text-black select-none animate-fade-in'>
      
      <div className='text-3xl mb-12 flex items-center gap-4'>
        <Title text1={'CONSIGNMENT'} text2={'LEDGER'} />
        <div className='h-[1px] flex-1 bg-gradient-to-r from-[#BC002D]/20 to-transparent'></div>
      </div>

      <div className='max-w-6xl mx-auto'>
        {orderData.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-32 text-center'>
            <div className='w-24 h-24 border border-black/5 flex items-center justify-center rounded-full mb-8 bg-white shadow-sm'>
               <img src={assets.parcel_icon} className='w-10 opacity-10' alt="" />
            </div>
            <h2 className='text-xl font-serif text-black/30 tracking-[0.2em] uppercase'>Registry is currently empty</h2>
            <Link to='/collection' className='mt-8 bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#BC002D] transition-all shadow-lg'>Initialize Archive</Link>
          </div>
        ) : (
          orderData.map((item, index) => (
            <div key={index} className='group py-8 border border-black/5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-8 px-8 mb-6 rounded-sm transition-all duration-500 hover:border-[#BC002D]/30 shadow-sm hover:shadow-md'>
              
              <div className='flex items-start gap-8 flex-1'>
                {/* Specimen Preview */}
                <div className='border border-black/5 p-2 bg-[#F9F9F9] shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-500'>
                  <img draggable="false" className='w-20 sm:w-28 aspect-[3/4] object-contain' src={item.image[0]} alt={item.name} />
                </div>
                
                <div className='flex flex-col gap-2 flex-1'>
                  <p className='text-lg sm:text-xl font-serif text-black tracking-tight leading-tight'>{item.name}</p>
                  
                  {/* Tracking Sub-Panel */}
                  {item.trackingNumber && item.status !== 'Cancelled' && (
                    <div className='bg-[#FCF9F4] border border-[#BC002D]/20 p-4 rounded-sm flex items-center justify-between my-2 border-l-4 border-l-[#BC002D]'>
                       <div className='space-y-1'>
                         <p className='text-[8px] text-[#BC002D] font-black uppercase tracking-[0.3em]'>Verified Transit ID</p>
                         <p className='text-xs font-mono font-bold text-black tracking-widest'>{item.trackingNumber}</p>
                       </div>
                       <a href={`https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?p1=${item.trackingNumber}`} target="_blank" rel="noreferrer" className='text-[9px] bg-black text-white hover:bg-[#BC002D] px-4 py-2 transition-all font-bold uppercase tracking-widest'>Track Asset</a>
                    </div>
                  )}

                  <div className='flex flex-wrap items-center gap-4 mt-2'>
                    {/* FIXED: Displays correctly converted price with appropriate symbol */}
                    <p className='text-[#BC002D] font-black text-lg tracking-tighter'>
                      <span className='text-[10px] uppercase tracking-widest mr-2 opacity-50'>Total Paid:</span>
                      {item.savedCurrency === 'USD' ? '$' : '₹'}
                      {item.totalPaidAmount}
                    </p>
                    <span className='text-[10px] text-gray-200 tracking-[0.2em]'>|</span>
                    <p className='text-[10px] text-gray-400 uppercase tracking-widest font-black'>Specimens: {item.quantity}</p>
                    
                    {/* FIXED: Points logic now reflects 10% of total INR amount */}
                    <div className={`flex items-center gap-2 py-1 px-3 border rounded-sm ${item.status === 'Delivered' ? 'border-green-100 bg-green-50' : 'border-[#BC002D]/10 bg-[#BC002D]/5'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Delivered' ? 'bg-green-600' : 'bg-[#BC002D]'}`}></div>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${item.status === 'Delivered' ? 'text-green-600' : 'text-[#BC002D]'}`}>
                            {item.status === 'Delivered' ? `Vault Credit: +${item.rewardPoints} PTS` : `Pending Valuation: +${item.rewardPoints} PTS`}
                        </p>
                    </div>
                  </div>
                  
                  <div className='text-[10px] text-gray-400 mt-4 flex gap-6 tracking-[0.2em] uppercase font-bold'>
                    <p>Registry Date: <span className='text-black'>{new Date(item.date).toDateString()}</span></p>
                    <p>Auth: <span className='text-white bg-black px-2 py-0.5 rounded-xs'>{item.paymentMethod}</span></p>
                  </div>
                </div>
              </div>

              {/* Status & Actions Panel */}
              <div className='md:w-1/4 flex flex-col items-end justify-center gap-6'>
                <div className='flex items-center gap-3'>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${item.status === 'Delivered' ? 'bg-green-500' : item.status === 'Cancelled' ? 'bg-gray-300' : 'bg-[#BC002D]'}`}></div>
                  <p className='text-xs font-black tracking-[0.4em] uppercase text-black'>{item.status}</p>
                </div>
                
                <div className='flex flex-col items-end gap-3 w-full'>
                    {(item.status === 'Order Placed' || item.status === 'Packing') && !item.trackingNumber ? (
                        <button 
                            disabled={loading}
                            onClick={() => cancelOrderHandler(item.orderId)}
                            className='w-full md:w-auto border border-red-200 text-[#BC002D] px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#BC002D] hover:text-white transition-all rounded-sm'
                        >
                            Revoke
                        </button>
                    ) : (item.status === 'Shipped' || item.trackingNumber) && item.status !== 'Cancelled' && item.status !== 'Delivered' ? (
                        <div className='text-right px-4 py-1 bg-gray-50 border border-black/5 rounded-sm'>
                           <p className='text-[9px] text-gray-400 italic tracking-widest uppercase font-bold'>Locked in Transit</p>
                        </div>
                    ) : null}

                    <button 
                        disabled={loading}
                        onClick={() => loadOrderData(true)} 
                        className='w-full md:w-auto bg-white border border-black/10 px-8 py-3 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all duration-500 shadow-sm rounded-sm'
                    >
                        {loading ? 'Synchronizing...' : 'Refresh Registry'}
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fade-in { animation: fadeIn 1s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  )
}

export default Orders;