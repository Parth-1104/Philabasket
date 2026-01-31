import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { backendUrl } from '../App'; 
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [tempTracking, setTempTracking] = useState("");

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, [token, backendUrl]);

  // Initial fetch and 30-second background sync
  useEffect(() => { 
    if (token) {
      fetchAllOrders();
      const interval = setInterval(fetchAllOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchAllOrders]);

  // Priority Sorting: Placed -> Packing -> Shipped -> Out for delivery -> Delivered -> Cancelled
  const sortedOrders = useMemo(() => {
    const priority = { "Order Placed": 1, "Packing": 2, "Shipped": 3, "Out for delivery": 4, "Delivered": 5, "Cancelled": 6 };
    return [...orders].sort((a, b) => (priority[a.status] || 99) - (priority[b.status] || 99));
  }, [orders]);

  const updateOrder = async (orderId, status, trackingNumber) => {
    setLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/order/status', 
        { orderId, status, trackingNumber }, { headers: { token } });
      
      if (response.data.success) {
        toast.success(`Status updated to ${status}`);
        setShowTrackingModal(false);
        fetchAllOrders(); // Refresh list to reflect DB changes
      }
    } catch (error) {
      toast.error("Status Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (addr) => {
    const text = `${addr.firstName} ${addr.lastName}\n${addr.phone}\n${addr.street}\n${addr.city}, ${addr.state} ${addr.zipcode}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied for India Post");
  };

  return (
    <div className='p-6 bg-gray-50 min-h-screen font-sans'>
      
      {/* HEADER COMMAND BAR */}
      <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
        <div>
          <h3 className='text-2xl font-black text-gray-900 uppercase tracking-tighter'>Packing Station</h3>
          <p className='text-[10px] text-gray-400 font-bold uppercase mt-1'>Archive Logistics Management</p>
        </div>
        <div className='flex gap-2'>
            <button onClick={() => fetchAllOrders()} className='px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 uppercase'>Sync Ledger</button>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className='max-w-7xl mx-auto space-y-4'>
        {sortedOrders.map((order) => (
          <div key={order._id} className={`grid grid-cols-1 md:grid-cols-[0.5fr_2.5fr_1fr_1fr_1fr_1.5fr] gap-6 items-center p-6 bg-white border rounded-2xl border-gray-100 hover:border-blue-200 transition-all shadow-sm`}>
            <img className='w-12 opacity-30 grayscale' src={assets.parcel_icon} alt="" />
            
            <div className='cursor-pointer' onClick={() => { setActiveOrder(order); setShowAddressModal(true); }}>
              <p className='font-black text-gray-900 text-sm mb-1 line-clamp-1'>{order.items.map(i => i.name).join(', ')}</p>
              <p className='text-[10px] font-bold text-red-600 uppercase'>{order.address.firstName} {order.address.lastName} • <span className='text-gray-400 font-normal'>{order.address.city}</span></p>
            </div>

            <div className='text-center'>
              <p className='text-[10px] font-black text-gray-400 uppercase mb-1'>Order Date</p>
              <p className='text-[11px] font-bold text-gray-900'>{new Date(order.date).toLocaleDateString('en-IN')}</p>
            </div>

            <div className='text-center'>
              <p className='text-[10px] font-black text-gray-400 uppercase mb-1'>Revenue</p>
              <p className='text-sm font-black text-gray-900'>₹{order.amount.toFixed(2)}</p>
            </div>

            <div className='text-center'>
                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${order.status === 'Order Placed' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                </span>
            </div>

            <div className='flex items-center gap-3 justify-end'>
                <select 
                    onChange={(e) => {
                      if (e.target.value === "Shipped") {
                        setActiveOrder(order);
                        setTempTracking(order.trackingNumber || "");
                        setShowTrackingModal(true);
                      } else {
                        updateOrder(order._id, e.target.value, order.trackingNumber);
                      }
                    }} 
                    value={order.status} 
                    className='p-2 text-[10px] font-bold border border-gray-200 rounded-lg bg-gray-50 outline-none uppercase cursor-pointer'
                >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <button onClick={() => { setActiveOrder(order); setShowAddressModal(true); }} className='w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all'>
                    <span className='text-xs font-black'>i</span>
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- COLLECTOR DOSSIER POPUP (Full User Data Sync) --- */}
      {showAddressModal && activeOrder && (
          <div className='fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4'>
              <div className='bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200'>
                  
                  {/* Header: Identity pulled from the populated userId object */}
                  <div className='p-8 bg-gray-900 text-white flex justify-between items-start'>
                      <div>
                          <p className='text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2'>Collector Dossier</p>
                          <h4 className='text-3xl font-black italic uppercase'>
                            {activeOrder.userId?.name || activeOrder.address.firstName}
                          </h4>
                          {/* Registered Email ID */}
                          <p className='text-[11px] font-bold text-blue-200 mt-2 lowercase opacity-80'>
                            {activeOrder.userId?.email || "Registry Email Missing"}
                          </p>
                      </div>
                      <button onClick={() => setShowAddressModal(false)} className='text-3xl font-light hover:text-red-500 transition-colors'>×</button>
                  </div>

                  <div className='p-10 grid grid-cols-1 md:grid-cols-2 gap-12'>
                      {/* Left Column: Logistics */}
                      <div className='space-y-8'>
                          <div className='grid grid-cols-2 gap-6'>
                              <div>
                                <p className='text-[9px] font-black text-gray-400 uppercase mb-1'>Registry Contact</p>
                                <p className='font-bold text-sm'>{activeOrder.address.phone}</p>
                              </div>
                              <div>
                                <p className='text-[9px] font-black text-gray-400 uppercase mb-1'>Payment Method</p>
                                <p className='font-bold text-sm uppercase text-green-600'>{activeOrder.paymentMethod}</p>
                              </div>
                          </div>

                          <div className='bg-gray-50 p-6 rounded-2xl border border-gray-100'>
                              <p className='text-[9px] font-black text-gray-400 uppercase mb-3'>Shipping Destination</p>
                              <p className='text-[13px] font-medium leading-relaxed font-mono text-gray-700'>
                                  {activeOrder.address.firstName}<br/>
                                  {activeOrder.address.lastName}<br/>
                                  {activeOrder.address.email}<br/>
                                  {activeOrder.address.street},<br/>
                                  {activeOrder.address.city}, {activeOrder.address.state}<br/>
                                  <span className='font-black text-blue-600'>{activeOrder.address.zipcode} • {activeOrder.address.country}</span>
                              </p>
                              <button onClick={() => copyAddress(activeOrder.address)} className='mt-4 w-full bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase hover:opacity-80 transition-all'>Copy for India Post</button>
                          </div>
                      </div>

                      {/* Right Column: Registry Analytics & Membership Details */}
                      <div className='space-y-8'>
                          <div className='grid grid-cols-2 gap-4'>
                              <div className='bg-blue-50 p-4 rounded-xl border border-blue-100'>
                                  <p className='text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1'>Archive Points</p>
                                  {/* Displays collector's current points */}
                                  <p className='text-xl font-black text-blue-700'>{activeOrder.userId?.totalRewardPoints || 0} PTS</p>
                              </div>
                              <div className='bg-red-50 p-4 rounded-xl border border-red-100'>
                                  <p className='text-[8px] font-black text-red-400 uppercase tracking-widest mb-1'>Invites (Cap)</p>
                                  {/* Displays collector's referral count */}
                                  <p className='text-xl font-black text-red-700'>{activeOrder.userId?.referralCount || 0} / 3</p>
                              </div>
                          </div>

                          <div className='space-y-4 pt-4 border-t border-gray-100'>
                              <div className='flex justify-between border-b border-gray-50 pb-2'>
                                  <p className='text-[9px] font-black text-gray-400 uppercase'>Member ID</p>
                                  <p className='text-[10px] font-mono font-bold uppercase'>
                                      {/* THE CRITICAL FIX: Safe conversion to string before slice */}
                                      {activeOrder.userId?._id 
                                          ? String(activeOrder.userId._id).slice(-12) 
                                          : String(activeOrder.userId || "").slice(-12)}
                                  </p>
                              </div>
                              <div className='flex justify-between'>
                                  <p className='text-[9px] font-black text-gray-400 uppercase'>Registry Date</p>
                                  <p className='text-[10px] font-bold'>{new Date(activeOrder.date).toLocaleString('en-IN')}</p>
                              </div>
                              <div className='flex justify-between'>
                                  <p className='text-[9px] font-black text-gray-400 uppercase'>Referral Code</p>
                                  <p className='text-[10px] font-mono font-bold text-gray-900'>{activeOrder.userId?.referralCode || "NONE"}</p>
                              </div>
                              <div className='flex justify-between'>
                                  <p className='text-[9px] font-black text-gray-400 uppercase'>Consignment ID</p>
                                  <p className='text-[10px] font-mono font-bold text-blue-600'>{activeOrder.trackingNumber || "PENDING"}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- TRACKING ID MODAL --- */}
      {showTrackingModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4'>
          <div className='bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200'>
            <div className='p-6 bg-blue-600 text-white'><h4 className='text-lg font-black italic uppercase'>India Post Entry</h4></div>
            <div className='p-6 space-y-4'>
              <input autoFocus placeholder="Consignment Number" className='w-full border-2 border-gray-100 p-4 rounded-2xl font-mono text-sm uppercase outline-blue-600'
                value={tempTracking} onChange={(e) => setTempTracking(e.target.value.toUpperCase())} />
              <div className='flex gap-2'>
                <button disabled={loading} onClick={() => updateOrder(activeOrder._id, "Shipped", tempTracking)} className='flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase hover:opacity-90 disabled:opacity-50'>
                   {loading ? "Syncing..." : "Save & Ship"}
                </button>
                <button onClick={() => setShowTrackingModal(false)} className='flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black text-xs uppercase hover:bg-gray-200'>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;