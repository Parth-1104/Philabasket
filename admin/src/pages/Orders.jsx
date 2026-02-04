import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { backendUrl } from '../App'; 
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { Bell, RefreshCw, X, PackageCheck, AlertCircle } from 'lucide-react';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Notification States
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const prevOrdersRef = useRef([]); // Stores previous fetch for comparison

  // Modal States
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [tempTracking, setTempTracking] = useState("");

  // --- FEATURE: CSV EXPORT ENGINE ---
  const downloadCSV = (data, filename) => {
    if (data.length === 0) {
      toast.error("No data found for this period");
      return;
    }
    const headers = ["Order_ID", "Date", "Customer", "Email", "Phone", "Items", "Amount_INR", "Status", "Tracking"];
    const rows = data.map(order => [
      `#${String(order._id).slice(-8)}`,
      new Date(order.date).toLocaleDateString('en-IN'),
      `${order.address.firstName} ${order.address.lastName}`,
      order.userId?.email || order.address.email,
      order.address.phone,
      order.items.map(i => `${i.name}(x${i.quantity})`).join(' | '),
      order.amount,
      order.status,
      order.trackingNumber || "N/A"
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchAllOrders = useCallback(async (isManual = false) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
      if (response.data.success) {
        const incomingOrders = response.data.orders;

        // --- REAL-TIME CHANGE DETECTION LOGIC ---
        if (prevOrdersRef.current.length > 0 && !isManual) {
          // 1. Detect Status Changes (Cancellations etc)
          incomingOrders.forEach(newOrder => {
            const oldOrder = prevOrdersRef.current.find(o => o._id === newOrder._id);
            if (oldOrder && oldOrder.status !== newOrder.status) {
              setNewOrderAlert({
                type: "UPDATE",
                message: `Order #${String(newOrder._id).slice(-6)} updated to ${newOrder.status}`,
                customer: `${newOrder.address.firstName} ${newOrder.address.lastName}`,
                status: newOrder.status
              });
            }
          });

          // 2. Detect New Orders
          if (incomingOrders.length > prevOrdersRef.current.length) {
            setNewOrderAlert({
              type: "NEW",
              message: "New Consignment Received",
              customer: "Check Manifest"
            });
          }
        }

        setOrders(incomingOrders);
        prevOrdersRef.current = incomingOrders;
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, [token, backendUrl]);

  // Initial fetch and 15-second background sync
  useEffect(() => { 
    if (token) {
      fetchAllOrders(true);
      const interval = setInterval(() => fetchAllOrders(false), 15000); 
      return () => clearInterval(interval);
    }
  }, [token, fetchAllOrders]);

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
        fetchAllOrders(true); 
      }
    } catch (error) {
      toast.error("Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (addr) => {
    const text = `${addr.firstName} ${addr.lastName}\n${addr.phone}\n${addr.street}\n${addr.city}, ${addr.state} ${addr.zipcode}`;
    navigator.clipboard.writeText(text);
    toast.success("Address Copied");
  };

  return (
    <div className='p-6 bg-gray-50 min-h-screen font-sans relative'>
      
      {/* --- REAL-TIME REGISTRY ALERTS --- */}
      {newOrderAlert && (
        <div className='fixed top-6 right-6 z-[300] w-80 animate-in slide-in-from-right duration-500'>
          <div className={`p-5 rounded-2xl shadow-2xl border-l-4 flex flex-col gap-2 ${newOrderAlert.status === 'Cancelled' ? 'bg-red-50 border-red-600' : 'bg-gray-900 border-blue-500 text-white'}`}>
            <div className='flex justify-between items-start'>
                <div className='flex items-center gap-2'>
                  {newOrderAlert.status === 'Cancelled' ? <AlertCircle size={16} className='text-red-600'/> : <Bell size={16} className='text-blue-400'/>}
                  <span className={`text-[10px] font-black uppercase tracking-widest ${newOrderAlert.status === 'Cancelled' ? 'text-red-600' : 'text-blue-400'}`}>Registry Alert</span>
                </div>
                <button onClick={() => setNewOrderAlert(null)}><X size={18} className='opacity-50 hover:opacity-100'/></button>
            </div>
            <p className={`text-sm font-black italic ${newOrderAlert.status === 'Cancelled' ? 'text-red-900' : 'text-white'}`}>{newOrderAlert.message}</p>
            <p className={`text-[10px] font-bold uppercase ${newOrderAlert.status === 'Cancelled' ? 'text-red-700' : 'text-gray-400'}`}>Collector: {newOrderAlert.customer}</p>
            <button 
                onClick={() => { fetchAllOrders(true); setNewOrderAlert(null); }}
                className={`mt-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${newOrderAlert.status === 'Cancelled' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-blue-600 text-white shadow-lg shadow-blue-900'}`}
            >
                Acknowledge & Refresh
            </button>
          </div>
        </div>
      )}

      {/* HEADER COMMAND BAR */}
      <div className='max-w-7xl mx-auto flex flex-col gap-6 mb-8'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
          <div>
            <h3 className='text-2xl font-black text-gray-900 uppercase tracking-tighter'>Packing Station</h3>
            <p className='text-[10px] text-gray-400 font-bold uppercase mt-1'>Archive Logistics Management</p>
          </div>
          <div className='flex gap-2'>
              <button onClick={() => fetchAllOrders(true)} className='px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95'>
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/> Sync Ledger
              </button>
          </div>
        </div>

        {/* EXPORT CONTROLS */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <button onClick={() => downloadCSV(orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()), "Todays_Ledger")} className='flex items-center justify-center gap-3 bg-white border border-gray-100 p-4 rounded-2xl hover:bg-amber-50 transition-all group'>
                <div className='w-2 h-2 bg-amber-400 rounded-full animate-pulse'></div>
                <span className='text-[10px] font-black uppercase tracking-widest text-gray-700'>Download Todays CSV</span>
            </button>
            <button onClick={() => downloadCSV(orders, "Full_Registry")} className='flex items-center justify-center gap-3 bg-white border border-gray-100 p-4 rounded-2xl hover:bg-blue-50 transition-all group'>
                <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
                <span className='text-[10px] font-black uppercase tracking-widest text-gray-700'>Global Status CSV</span>
            </button>
            <button onClick={() => downloadCSV(orders.filter(o => o.status === "Delivered"), "Delivered_Archive")} className='flex items-center justify-center gap-3 bg-white border border-gray-100 p-4 rounded-2xl hover:bg-green-50 transition-all group'>
                <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                <span className='text-[10px] font-black uppercase tracking-widest text-gray-700'>Delivered Archive CSV</span>
            </button>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className='max-w-7xl mx-auto space-y-4'>
        {sortedOrders.map((order) => (
          <div key={order._id} className={`grid grid-cols-1 md:grid-cols-[0.5fr_2fr_0.8fr_0.8fr_1fr_1fr_1.5fr] gap-6 items-center p-6 bg-white border rounded-2xl border-gray-100 hover:border-blue-200 transition-all shadow-sm`}>
            <img className='w-12 opacity-30 grayscale' src={assets.parcel_icon} alt="" />
            <div className='cursor-pointer' onClick={() => { setActiveOrder(order); setShowAddressModal(true); }}>
              <p className='font-black text-gray-900 text-sm mb-1 line-clamp-1'>{order.items.map(i => i.name).join(', ')}</p>
              <p className='text-[10px] font-bold text-red-600 uppercase'>{order.address.firstName} {order.address.lastName} • <span className='text-gray-400 font-normal'>{order.address.city}</span></p>
            </div>
            <div className='text-center'>
              <p className='text-[10px] font-black text-gray-400 uppercase mb-1'>Items</p>
              <p className='text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block'>{order.items.reduce((acc, item) => acc + item.quantity, 0)} Units</p>
            </div>
            <div className='text-center'>
              <p className='text-[10px] font-black text-gray-400 uppercase mb-1'>Date</p>
              <p className='text-[11px] font-bold text-gray-900'>{new Date(order.date).toLocaleDateString('en-IN')}</p>
            </div>
            <div className='text-center'>
              <p className='text-[10px] font-black text-gray-400 uppercase mb-1'>Revenue</p>
              <p className='text-sm font-black text-gray-900'>₹{order.amount.toFixed(2)}</p>
            </div>
            <div className='text-center'>
                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${order.status === 'Cancelled' ? 'bg-red-600 text-white' : order.status === 'Order Placed' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
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

      {/* --- COLLECTOR DOSSIER POPUP --- */}
      {showAddressModal && activeOrder && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4'>
            <div className='bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]'>
                <div className='p-8 bg-gray-900 text-white flex justify-between items-start shrink-0'>
                    <div>
                        <p className='text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2'>Collector Dossier</p>
                        <h4 className='text-3xl font-black italic uppercase'>{activeOrder.userId?.name || activeOrder.address.firstName}</h4>
                        <p className='text-[11px] font-bold text-blue-200 mt-2 lowercase opacity-80'>{activeOrder.userId?.email || activeOrder.address.email}</p>
                    </div>
                    <button onClick={() => setShowAddressModal(false)} className='text-3xl font-light hover:text-red-500 transition-colors'>×</button>
                </div>
                <div className='overflow-y-auto p-8 lg:p-10'>
                    <div className='mb-10'>
                        <div className='flex items-center gap-3 mb-6'>
                            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Manifest</p>
                            <div className='h-[1px] flex-1 bg-gray-100'></div>
                            <span className='bg-blue-600 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase'>{activeOrder.items.reduce((acc, i) => acc + i.quantity, 0)} Units</span>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {activeOrder.items.map((item, index) => (
                                <div key={index} className='flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-blue-200 transition-all'>
                                    <div className='flex items-center gap-4'>
                                        <div className='w-12 h-14 bg-white rounded-lg border border-gray-200 p-1 flex items-center justify-center shadow-sm'>
                                            <img src={item.image[0]} className='max-w-full max-h-full object-contain' alt="" />
                                        </div>
                                        <div>
                                            <p className='text-xs font-black text-gray-900 line-clamp-1'>{item.name}</p>
                                            <p className='text-[9px] font-bold text-gray-400 uppercase'>{item.category?.[0] || 'Specimen'}</p>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-xl font-black text-blue-600 tracking-tighter'>×{item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-10'>
                        <div className='space-y-8'>
                            <div className='grid grid-cols-2 gap-6'>
                                <div>
                                    <p className='text-[9px] font-black text-gray-400 uppercase mb-1'>Contact</p>
                                    <p className='font-bold text-sm'>{activeOrder.address.phone}</p>
                                </div>
                                <div>
                                    <p className='text-[9px] font-black text-gray-400 uppercase mb-1'>Payment</p>
                                    <p className='font-bold text-sm uppercase text-green-600'>{activeOrder.paymentMethod}</p>
                                </div>
                            </div>
                            <div className='bg-gray-50 p-6 rounded-2xl border border-gray-100'>
                                <p className='text-[9px] font-black text-gray-400 uppercase mb-3'>Shipping Destination</p>
                                <p className='text-[13px] font-medium leading-relaxed font-mono text-gray-700'>
                                    {activeOrder.address.firstName} {activeOrder.address.lastName}<br/>
                                    {activeOrder.address.street},<br/>
                                    {activeOrder.address.city}, {activeOrder.address.state}<br/>
                                    <span className='font-black text-blue-600'>{activeOrder.address.zipcode}</span>
                                </p>
                                <button onClick={() => copyAddress(activeOrder.address)} className='mt-4 w-full bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase hover:opacity-80 transition-all'>Copy for India Post</button>
                            </div>
                        </div>
                        <div className='space-y-8'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='bg-blue-50 p-4 rounded-xl border border-blue-100'>
                                    <p className='text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1'>Points</p>
                                    <p className='text-xl font-black text-blue-700'>{activeOrder.userId?.totalRewardPoints || 0} PTS</p>
                                </div>
                                <div className='bg-red-50 p-4 rounded-xl border border-red-100'>
                                    <p className='text-[8px] font-black text-red-400 uppercase tracking-widest mb-1'>Invites</p>
                                    <p className='text-xl font-black text-red-700'>{activeOrder.userId?.referralCount || 0} / 3</p>
                                </div>
                            </div>
                            <div className='space-y-4 pt-4 border-t border-gray-100'>
                                <div className='flex justify-between'>
                                    <p className='text-[9px] font-black text-gray-400 uppercase'>Member ID</p>
                                    <p className='text-[10px] font-mono font-bold uppercase'>{activeOrder.userId?._id ? String(activeOrder.userId._id).slice(-12) : "GUEST"}</p>
                                </div>
                                <div className='flex justify-between'>
                                    <p className='text-[9px] font-black text-gray-400 uppercase'>Registry Date</p>
                                    <p className='text-[10px] font-bold'>{new Date(activeOrder.date).toLocaleString('en-IN')}</p>
                                </div>
                                <div className='flex justify-between'>
                                    <p className='text-[9px] font-black text-gray-400 uppercase'>Tracking</p>
                                    <p className='text-[10px] font-mono font-bold text-blue-600'>{activeOrder.trackingNumber || "PENDING"}</p>
                                </div>
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