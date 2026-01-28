import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { backendUrl, token, fetchUserData, currency } = useContext(ShopContext);
  const [orderData, setorderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrderData = async (isManualRefresh = false) => {
    try {
      if (!token) return null;
      if (isManualRefresh) setLoading(true);

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
      
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
              savedCurrency: order.currency,
              totalAmount: order.amount,
              trackingNumber: order.trackingNumber,
              orderId: order._id,
              rewardPoints: Math.floor(item.price * 0.10)
            });
          });
        });
        setorderData(allOrdersItem.reverse());
        
        await fetchUserData(); 
        if (isManualRefresh) toast.success("Consignment synchronized");
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
    <div className='bg-[#0a0a0a] min-h-screen pt-20 pb-20 px-6 md:px-16 lg:px-24 text-white select-none animate-fade-in'>
      
      <div className='text-3xl mb-12 flex items-center gap-4'>
        <Title text1={'CONSIGNMENT'} text2={'LEDGER'} />
        <div className='h-[1px] flex-1 bg-gradient-to-r from-[#B8860B]/40 to-transparent'></div>
      </div>

      <div className='max-w-6xl mx-auto'>
        {orderData.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-32 text-center'>
            <div className='w-24 h-24 border border-white/5 flex items-center justify-center rounded-full mb-8 bg-[#111111]'>
               <img src={assets.parcel_icon} className='w-10 opacity-20 brightness-0 invert' alt="" />
            </div>
            <h2 className='text-xl font-serif text-white/40 tracking-[0.2em] uppercase'>Registry is currently empty</h2>
            <Link to='/collection' className='mt-8 bg-[#B8860B] text-black px-10 py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white transition-all'>Initialize Archive</Link>
          </div>
        ) : (
          orderData.map((item, index) => (
            <div key={index} className='group py-8 border border-white/5 bg-[#111111] flex flex-col md:flex-row md:items-center justify-between gap-8 px-8 mb-4 rounded-sm transition-all duration-500 hover:border-[#B8860B]/30 hover:shadow-[0_0_30px_rgba(184,134,11,0.05)]'>
              
              <div className='flex items-start gap-8 flex-1'>
                {/* Specimen Preview */}
                <div className='border border-[#B8860B]/20 p-2 bg-black shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-500'>
                  <img draggable="false" className='w-20 sm:w-28 aspect-[3/4] object-contain' src={item.image[0]} alt={item.name} />
                </div>
                
                <div className='flex flex-col gap-2 flex-1'>
                  <p className='text-lg sm:text-xl font-serif text-white tracking-tight'>{item.name}</p>
                  
                  {/* Tracking Sub-Panel */}
                  {item.trackingNumber && item.status !== 'Cancelled' && (
                    <div className='bg-[#0a0a0a] border border-[#B8860B]/30 p-4 rounded-sm flex items-center justify-between my-2'>
                       <div className='space-y-1'>
                         <p className='text-[8px] text-[#B8860B] font-black uppercase tracking-[0.3em]'>Verified Transit Registry</p>
                         <p className='text-xs font-mono font-bold text-white tracking-widest'>{item.trackingNumber}</p>
                       </div>
                       <a href={`https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?p1=${item.trackingNumber}`} target="_blank" rel="noreferrer" className='text-[9px] border border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-black px-4 py-2 transition-all font-bold uppercase tracking-widest'>Track Asset</a>
                    </div>
                  )}

                  <div className='flex flex-wrap items-center gap-4 mt-2'>
                    <p className='text-[#B8860B] font-bold text-lg tracking-tighter'>
                      {item.savedCurrency === 'USD' ? '$' : '₹'}
                      {item.savedCurrency === 'USD' ? (Number(item.price) / 83).toFixed(2) : item.price}
                    </p>
                    <span className='text-[10px] text-gray-600 tracking-[0.2em]'>|</span>
                    <p className='text-[10px] text-gray-400 uppercase tracking-widest font-light'>Quantity: {item.quantity}</p>
                    
                    {/* Points Indicator */}
                    <div className={`flex items-center gap-2 py-1 px-3 border rounded-full ${item.status === 'Delivered' ? 'border-green-900/50 bg-green-950/20' : 'border-[#B8860B]/20 bg-[#B8860B]/5'}`}>
                        <div className={`w-1 h-1 rounded-full ${item.status === 'Delivered' ? 'bg-green-500' : 'bg-[#B8860B]'}`}></div>
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${item.status === 'Delivered' ? 'text-green-500' : 'text-[#B8860B]'}`}>
                            {item.status === 'Delivered' ? `Vault Credit: +${item.rewardPoints} PTS` : `Pending Valuation: +${item.rewardPoints} PTS`}
                        </p>
                    </div>
                  </div>
                  
                  <div className='text-[10px] text-gray-500 mt-4 flex gap-6 tracking-[0.2em] uppercase font-light'>
                    <p>Registry Date: <span className='text-white'>{new Date(item.date).toDateString()}</span></p>
                    <p>Auth: <span className='text-white'>{item.paymentMethod}</span></p>
                  </div>
                </div>
              </div>

              {/* Status & Actions Panel */}
              <div className='md:w-1/4 flex flex-col items-end justify-center gap-6'>
                <div className='flex items-center gap-3'>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${item.status === 'Delivered' ? 'bg-green-500' : item.status === 'Cancelled' ? 'bg-white/20' : 'bg-[#B8860B]'}`}></div>
                  <p className='text-xs font-bold tracking-[0.4em] uppercase text-white'>{item.status}</p>
                </div>
                
                <div className='flex flex-col items-end gap-3 w-full'>
                    {/* Cancellation Logic */}
                    {(item.status === 'Order Placed' || item.status === 'Packing') && !item.trackingNumber ? (
                        <button 
                            disabled={loading}
                            onClick={() => cancelOrderHandler(item.orderId)}
                            className='w-full md:w-auto border border-red-900/50 text-red-500 px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-sm'
                        >
                            Cancel
                        </button>
                    ) : (item.status === 'Shipped' || item.trackingNumber) && item.status !== 'Cancelled' && item.status !== 'Delivered' ? (
                        <div className='text-right'>
                           <p className='text-[9px] text-gray-600 italic tracking-widest uppercase'>Locked in Transit</p>
                        </div>
                    ) : null}

                    <button 
                        disabled={loading}
                        onClick={() => loadOrderData(true)} 
                        className='w-full md:w-auto bg-white/5 border border-white/10 px-8 py-3 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#B8860B] hover:text-black transition-all duration-500 shadow-xl rounded-sm'
                    >
                        {loading ? 'Syncing Archive...' : 'Refresh Status'}
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