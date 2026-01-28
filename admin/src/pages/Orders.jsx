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

  const openEditTracking = (order) => {
    setActiveOrder(order);
    setTempTracking(order.trackingNumber || "");
    setShowTrackingModal(true);
  };

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

  // Priority Sorting: Placed -> Packing -> Shipped -> Delivered -> Cancelled
  const sortedOrders = useMemo(() => {
    const priority = { "Order Placed": 1, "Packing": 2, "Shipped": 3, "Out for delivery": 4, "Delivered": 5, "Cancelled": 6 };
    return [...orders].sort((a, b) => (priority[a.status] || 99) - (priority[b.status] || 99));
  }, [orders]);

  const exportPlacedCSV = (timeframe = 'all') => {
    const now = new Date();
    const placedOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      const isPlaced = order.status === "Order Placed";
      if (timeframe === 'today') return isPlaced && orderDate.toDateString() === now.toDateString();
      return isPlaced;
    });

    if (placedOrders.length === 0) return toast.info("No 'Order Placed' records found.");

    const headers = ["Date", "Collector", "Phone", "Full Address", "Items", "Amount"];
    const rows = placedOrders.map(o => [
      new Date(o.date).toLocaleDateString(),
      `${o.address.firstName} ${o.address.lastName}`,
      o.address.phone,
      `"${o.address.street}, ${o.address.city}, ${o.address.zipcode}"`,
      `"${o.items.map(i => `${i.name} x${i.quantity}`).join(' | ')}"`,
      o.amount
    ].join(","));

    const content = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(content));
    link.setAttribute("download", `Packing_List_${timeframe}.csv`);
    link.click();
  };

  const statusHandler = async (event, order) => {
    const newStatus = event.target.value; // Capture the exact value selected
    
    // Logic for tracking number entry remains the same
    if (newStatus === "Shipped") {
      setActiveOrder({ ...order, status: "Shipped" }); 
      setTempTracking(order.trackingNumber || "");
      setShowTrackingModal(true);
    } else {
      // For all other status changes, pass the newStatus directly
      await updateOrder(order._id, newStatus, order.trackingNumber);
    }
  };

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
          <p className='text-[10px] text-gray-400 font-bold uppercase mt-1'>Only "Placed" orders are exported</p>
        </div>
        <div className='flex gap-2'>
            <button onClick={() => exportPlacedCSV('today')} className='px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase hover:opacity-80 transition-all shadow-lg shadow-green-100'>Today's Placed</button>
            <button onClick={() => exportPlacedCSV('all')} className='px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all'>Export All Placed</button>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className='max-w-7xl mx-auto space-y-4'>
        {sortedOrders.map((order) => (
          <div key={order._id} className={`grid grid-cols-1 md:grid-cols-[0.5fr_2.5fr_1fr_1fr_1.5fr] gap-6 items-center p-6 bg-white border rounded-2xl border-gray-100 hover:border-blue-200 transition-all shadow-sm`}>
            <img className='w-12 opacity-30 grayscale' src={assets.parcel_icon} alt="" />
            
            <div className='cursor-pointer' onClick={() => { setActiveOrder(order); setShowAddressModal(true); }}>
              <p className='font-black text-gray-900 text-sm mb-1 line-clamp-1'>{order.items.map(i => i.name).join(', ')}</p>
              <p className='text-[10px] font-bold text-red-600 uppercase'>{order.address.firstName} {order.address.lastName} • <span className='text-gray-400 font-normal'>{order.address.city}</span></p>
              
              {order.trackingNumber && (
                <div className='mt-2 flex items-center gap-2'>
                  <span className='text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-mono font-bold'>
                    ID: {order.trackingNumber}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditTracking(order); }}
                    className='text-[9px] text-gray-400 hover:text-blue-600 underline font-black uppercase'
                  >
                    Edit ID
                  </button>
                </div>
              )}
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
                    onChange={(e) => statusHandler(e, order)} 
                    value={order.status} 
                    className='p-2 text-[10px] font-bold border border-gray-200 rounded-lg bg-gray-50 focus:outline-none uppercase cursor-pointer'
                >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <button onClick={() => { setActiveOrder(order); setShowAddressModal(true); }} className='w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all'>
                    <span className='text-xs'>ℹ️</span>
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- LOGISTICS INTEL POPUP --- */}
      {showAddressModal && activeOrder && (
          <div className='fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4'>
              <div className='bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200'>
                  <div className='p-8 bg-gray-900 text-white flex justify-between items-center'>
                      <div>
                          <p className='text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1'>Shipping Registry</p>
                          <h4 className='text-2xl font-black italic'>{activeOrder.address.firstName} {activeOrder.address.lastName}</h4>
                      </div>
                      <button onClick={() => setShowAddressModal(false)} className='text-3xl font-light hover:text-red-500 transition-colors'>×</button>
                  </div>
                  <div className='p-10 grid grid-cols-2 gap-8'>
                      <div className='space-y-4'>
                          <div><p className='text-[9px] font-bold text-gray-400 uppercase'>Contact</p><p className='font-black'>{activeOrder.address.phone}</p></div>
                          <div><p className='text-[9px] font-bold text-gray-400 uppercase'>Method</p><p className='font-black uppercase'>{activeOrder.paymentMethod}</p></div>
                          {activeOrder.trackingNumber && (
                             <div><p className='text-[9px] font-bold text-gray-400 uppercase'>India Post ID</p><p className='font-mono font-black text-blue-600 text-sm'>{activeOrder.trackingNumber}</p></div>
                          )}
                      </div>
                      <div className='bg-gray-50 p-6 rounded-xl relative'>
                          <p className='text-[11px] font-medium leading-relaxed font-mono'>
                              {activeOrder.address.street}, {activeOrder.address.city},<br/>
                              {activeOrder.address.state} - {activeOrder.address.zipcode}<br/>
                              <span className='font-black text-blue-600 uppercase'>{activeOrder.address.country}</span>
                          </p>
                          <button onClick={() => copyAddress(activeOrder.address)} className='mt-4 w-full bg-black text-white py-2 rounded-lg text-[10px] font-black uppercase hover:opacity-80'>Copy Address</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- TRACKING ID MODAL --- */}
      {showTrackingModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4'>
          <div className='bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200'>
            <div className='p-6 bg-blue-600 text-white'><h4 className='text-lg font-black italic uppercase'>India Post Entry</h4></div>
            <div className='p-6 space-y-4'>
              <input autoFocus placeholder="Consignment Number" className='w-full border-2 border-gray-100 p-3 rounded-xl font-mono text-sm uppercase outline-blue-600'
                value={tempTracking} onChange={(e) => setTempTracking(e.target.value.toUpperCase())} />
              <div className='flex gap-2'>
                {/* FIX: Explicitly passing "Shipped" status to ensure database update */}
                <button disabled={loading} onClick={() => updateOrder(activeOrder._id, "Shipped", tempTracking)} className='flex-1 bg-black text-white py-3 rounded-xl font-black text-xs uppercase hover:opacity-90 disabled:opacity-50'>
                   {loading ? "Processing..." : "Save & Ship"}
                </button>
                <button onClick={() => setShowTrackingModal(false)} className='flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-black text-xs uppercase hover:bg-gray-200'>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;