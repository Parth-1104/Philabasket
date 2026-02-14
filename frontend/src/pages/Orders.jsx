import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Truck, Copy, ExternalLink, RefreshCw, PackageCheck, Archive } from 'lucide-react';

const Orders = () => {
  const { backendUrl, token, fetchUserData } = useContext(ShopContext);
  const [rawOrders, setRawOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // --- FEATURE: Registry Synchronization Engine ---
  const loadOrderData = useCallback(async (isManual = false) => {
    try {
      if (!token) return;
      if (isManual) setSyncing(true);

      const response = await axios.post(`${backendUrl}/api/order/userorders`, {}, { headers: { token } });
      
      if (response.data.success) {
        setRawOrders(response.data.orders);
        fetchUserData(); 
        if (isManual) toast.success("Ledger Synchronized");
      }
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [backendUrl, token, fetchUserData]);

  // --- OPTIMIZATION: Memoized Order Grouping ---
  const processedOrders = useMemo(() => {
    return [...rawOrders].reverse().map((order) => {
      // Calculate points (10% of amount)
      const orderTotalPoints = Math.floor((order.amount || 0) * 0.10);
      
      // Handle Currency conversion display
      const displayAmount = order.currency === 'USD' 
        ? (order.amount / 83).toFixed(2) 
        : order.amount;

      return {
        ...order,
        displayAmount,
        rewardPoints: orderTotalPoints,
        formattedDate: new Date(order.date).toDateString()
      };
    });
  }, [rawOrders]);

  const handleTrackAsset = (trackingNumber) => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    toast.info("ID Secured to Clipboard. Opening Registry...");
    setTimeout(() => {
        window.open(`https://t.17track.net/en#nums=${trackingNumber}`, "_blank");
    }, 600);
  };

  useEffect(() => {
    if (token) {
      loadOrderData();
      const interval = setInterval(() => loadOrderData(), 60000);
      return () => clearInterval(interval);
    }
  }, [token, loadOrderData]);

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
          processedOrders.map((order) => (
            <div key={order._id} className='group py-8 border border-black/5 bg-white flex flex-col gap-6 px-8 mb-8 rounded-sm transition-all duration-500 hover:border-[#BC002D]/30 shadow-sm'>
              
              {/* Top Row: Order Metadata */}
              <div className='flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4'>
                <div className='flex items-center gap-6'>
                  <div>
                    <p className='text-[8px] text-gray-400 uppercase tracking-widest font-black'>Registry Date</p>
                    <p className='text-xs font-bold'>{order.formattedDate}</p>
                  </div>
                  <div>
                    <p className='text-[8px] text-gray-400 uppercase tracking-widest font-black'>Sovereign ID</p>
                    <p className='text-[10px] font-mono font-bold text-[#BC002D]'>#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className='px-3 py-1 bg-black text-white rounded-xs'>
                    <p className='text-[8px] font-black uppercase tracking-widest'>{order.paymentMethod}</p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-[#BC002D]'}`}></div>
                  <p className='text-xs font-black tracking-[0.4em] uppercase text-black'>{order.status}</p>
                </div>
              </div>

              {/* Middle Row: Items List */}
              <div className='flex flex-col gap-6'>
                {order.items.map((item, idx) => (
                  <div key={idx} className='flex items-center gap-6'>
                    <div className='w-16 h-20 bg-[#F9F9F9] border border-black/5 flex items-center justify-center overflow-hidden shrink-0'>
                      <img 
                        src={item.image && item.image[0] ? item.image[0] : assets.logo} 
                        alt={item.name} 
                        className='w-full h-full object-contain p-1'
                      />
                    </div>
                    <div className='flex-1'>
                      <p className='text-md font-serif text-black tracking-tight'>{item.name}</p>
                      <div className='flex items-center gap-4 mt-1'>
                        <p className='text-[10px] text-gray-400 uppercase tracking-widest font-black'>Quantity: {item.quantity}</p>
                        {item.size && <p className='text-[10px] text-gray-400 uppercase tracking-widest font-black'>Spec: {item.size}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Row: Financials & Tracking */}
              <div className='bg-[#FCF9F4] p-6 rounded-sm flex flex-col lg:flex-row items-center justify-between gap-6'>
                <div className='flex flex-wrap items-center gap-8'>
                  <div>
                    <p className='text-[8px] text-[#BC002D] font-black uppercase tracking-[0.3em] mb-1'>Ledger Value</p>
                    <p className='text-xl font-black tracking-tighter'>
                      {order.currency === 'USD' ? '$' : '₹'}{order.displayAmount}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 py-2 px-4 border rounded-sm ${order.status === 'Delivered' ? 'border-green-100 bg-green-50' : 'border-[#BC002D]/10 bg-white'}`}>
                    <PackageCheck size={14} className={order.status === 'Delivered' ? 'text-green-600' : 'text-[#BC002D]'} />
                    <p className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'text-green-600' : 'text-[#BC002D]'}`}>
                        Vault Credit: +{order.rewardPoints} PTS
                    </p>
                  </div>
                </div>

                <div className='flex gap-4 w-full lg:w-auto'>
                  {order.trackingNumber && (
                    <button onClick={() => handleTrackAsset(order.trackingNumber)} className='flex-1 lg:flex-none bg-black text-white px-8 py-4 text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2 hover:bg-[#BC002D] transition-all'>
                      <Truck size={14} /> Track Asset <ExternalLink size={10} />
                    </button>
                  )}
                  <button onClick={() => loadOrderData(true)} className='flex-1 lg:flex-none bg-white border border-black/10 px-8 py-4 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all'>
                    Refresh
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