import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Truck, Copy, ExternalLink, RefreshCw } from 'lucide-react';

const Orders = () => {
  const { backendUrl, token, fetchUserData } = useContext(ShopContext);
  const [rawOrders, setRawOrders] = useState([]); // Store raw data from API
  const [loading, setLoading] = useState(true); // Initial load is true
  const [syncing, setSyncing] = useState(false); // For background refreshes

  // --- FEATURE: Registry Synchronization Engine ---
  const loadOrderData = async (isManual = false) => {
    try {
      if (!token) return;
      if (isManual) setSyncing(true);

      const response = await axios.post(`${backendUrl}/api/order/userorders`, {}, { headers: { token } });
      
      if (response.data.success) {
        setRawOrders(response.data.orders);
        // Refresh points/user data in background
        fetchUserData(); 
        if (isManual) toast.success("Ledger Synchronized");
      }
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  // --- OPTIMIZATION: Memoized Data Shaping ---
  // This only runs when rawOrders changes, making the UI feel much snappier
  const processedOrders = useMemo(() => {
    const allItems = [];
    [...rawOrders].reverse().forEach((order) => {
      const orderTotalPoints = Math.floor(order.amount * 0.10);
      const displayAmount = order.currency === 'USD' 
        ? (order.amount / 83).toFixed(2) 
        : order.amount;

      order.items.forEach((item) => {
        allItems.push({
          ...item,
          status: order.status,
          payment: order.payment,
          paymentMethod: order.paymentMethod,
          date: order.date,
          savedCurrency: order.currency,
          totalPaidAmount: displayAmount,
          trackingNumber: order.trackingNumber,
          orderId: order._id,
          rewardPoints: orderTotalPoints 
        });
      });
    });
    return allItems;
  }, [rawOrders]);

  const handleTrackAsset = (trackingNumber) => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    toast.info("ID Secured to Clipboard. Opening Registry...");
    setTimeout(() => {
        window.open(`https://t.17track.net/en#nums=${trackingNumber}`, "_blank");
    }, 600);
  };

  const cancelOrderHandler = async (orderId) => {
    if (!window.confirm("Rescind this acquisition request?")) return;
    setSyncing(true);
    try {
      const response = await axios.post(`${backendUrl}/api/order/cancel`, { orderId }, { headers: { token } });
      if (response.data.success) {
        toast.success("Consignment Revoked");
        loadOrderData();
      }
    } catch (error) {
      toast.error("Process failed.");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadOrderData();
      const interval = setInterval(() => loadOrderData(), 60000); // 1 minute is enough for production
      return () => clearInterval(interval);
    }
  }, [token]);

  if (loading) return (
    <div className='min-h-screen bg-[#FCF9F4] flex items-center justify-center'>
      <RefreshCw className='animate-spin text-[#BC002D]' size={32} />
    </div>
  );

  return (
    <div className='bg-[#FCF9F4] min-h-screen pt-24 pb-20 px-6 md:px-16 lg:px-24 text-black select-none animate-fade-in'>
      
      <div className='text-3xl mb-12 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
           <Title text1={'CONSIGNMENT'} text2={'LEDGER'} />
           {syncing && <RefreshCw size={16} className='animate-spin text-[#BC002D]' />}
        </div>
        <div className='hidden md:block h-[1px] flex-1 ml-6 bg-gradient-to-r from-[#BC002D]/20 to-transparent'></div>
      </div>

      <div className='max-w-6xl mx-auto'>
        {processedOrders.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-32 text-center'>
            <div className='w-24 h-24 border border-black/5 flex items-center justify-center rounded-full mb-8 bg-white shadow-sm'>
               <img src={assets.parcel_icon} className='w-10 opacity-10' alt="" />
            </div>
            <h2 className='text-xl font-serif text-black/30 tracking-[0.2em] uppercase'>Registry is currently empty</h2>
            <Link to='/collection' className='mt-8 bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#BC002D] transition-all shadow-lg'>Initialize Archive</Link>
          </div>
        ) : (
          processedOrders.map((item, index) => (
            <div key={`${item.orderId}-${index}`} className='group py-8 border border-black/5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-8 px-8 mb-6 rounded-sm transition-all duration-500 hover:border-[#BC002D]/30 shadow-sm hover:shadow-md'>
              
              <div className='flex items-start gap-8 flex-1'>
                <div className='border border-black/5 p-2 bg-[#F9F9F9] shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-500'>
                  {/* PRODUCTION TIP: Use Cloudinary f_auto,q_auto here for fast preview loading */}
                  <img draggable="false" loading="lazy" className='w-20 sm:w-28 aspect-[3/4] object-contain' src={item.image[0]} alt={item.name} />
                </div>
                
                <div className='flex flex-col gap-2 flex-1'>
                  <p className='text-lg sm:text-xl font-serif text-black tracking-tight leading-tight'>{item.name}</p>
                  
                  {item.trackingNumber && item.status !== 'Cancelled' && (
                    <div className='bg-[#FCF9F4] border border-[#BC002D]/20 p-4 rounded-sm flex flex-col sm:flex-row items-center justify-between my-2 border-l-4 border-l-[#BC002D] gap-4'>
                       <div className='space-y-1 w-full'>
                         <p className='text-[8px] text-[#BC002D] font-black uppercase tracking-[0.3em]'>Verified Transit ID</p>
                         <div className='flex items-center gap-3'>
                            <p className='text-xs font-mono font-bold text-black tracking-widest bg-white px-3 py-1 border border-black/5'>{item.trackingNumber}</p>
                            <Copy 
                                size={12} 
                                className='text-gray-300 hover:text-[#BC002D] cursor-pointer' 
                                onClick={() => { navigator.clipboard.writeText(item.trackingNumber); toast.success("Copied"); }} 
                            />
                         </div>
                       </div>
                       <button onClick={() => handleTrackAsset(item.trackingNumber)} className='w-full sm:w-auto text-[9px] bg-black text-white hover:bg-[#BC002D] px-6 py-3 transition-all font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2'>
                         <Truck size={14} /> Track Asset <ExternalLink size={10} />
                       </button>
                    </div>
                  )}

                  <div className='flex flex-wrap items-center gap-4 mt-2'>
                    <p className='text-[#BC002D] font-black text-lg tracking-tighter'>
                      <span className='text-[10px] uppercase tracking-widest mr-2 opacity-50'>Total Paid:</span>
                      {item.savedCurrency === 'USD' ? '$' : '₹'}{item.totalPaidAmount}
                    </p>
                    <span className='text-[10px] text-gray-200 tracking-[0.2em]'>|</span>
                    <p className='text-[10px] text-gray-400 uppercase tracking-widest font-black'>Specimens: {item.quantity}</p>
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

              <div className='md:w-1/4 flex flex-col items-end justify-center gap-6'>
                <div className='flex items-center gap-3'>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${item.status === 'Delivered' ? 'bg-green-500' : item.status === 'Cancelled' ? 'bg-gray-300' : 'bg-[#BC002D]'}`}></div>
                  <p className='text-xs font-black tracking-[0.4em] uppercase text-black'>{item.status}</p>
                </div>
                
                <div className='flex flex-col items-end gap-3 w-full'>
                    {(item.status === 'Order Placed' || item.status === 'Packing') && !item.trackingNumber && (
                        <button disabled={syncing} onClick={() => cancelOrderHandler(item.orderId)} className='w-full md:w-auto border border-red-200 text-[#BC002D] px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#BC002D] hover:text-white transition-all rounded-sm'>
                            Revoke
                        </button>
                    )}
                    <button disabled={syncing} onClick={() => loadOrderData(true)} className='w-full md:w-auto bg-white border border-black/10 px-8 py-3 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all duration-500 shadow-sm rounded-sm'>
                        {syncing ? 'Synchronizing...' : 'Refresh Registry'}
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