import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { Truck, RefreshCw, Download, PackageCheck, ExternalLink, MessageSquare, Camera, X,Star } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Orders = () => {
  const { backendUrl, token, fetchUserData } = useContext(ShopContext);
  const [rawOrders, setRawOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Feedback States
  // --- UPDATED FEEDBACK STATES ---
const [showFeedbackModal, setShowFeedbackModal] = useState(false);
const [currentOrder, setCurrentOrder] = useState(null);
const [feedbackText, setFeedbackText] = useState("");
const [feedbackImage, setFeedbackImage] = useState(null);
const [rating, setRating] = useState(5); // Default rating
const [submitting, setSubmitting] = useState(false);
const [hoverRating, setHoverRating] = useState(0); // For star hover effect

const handleFeedbackSubmit = async (e) => {
  e.preventDefault();
  if (!feedbackText.trim() && !feedbackImage) return toast.error("Please add text or an image");

  setSubmitting(true);
  const formData = new FormData();
  formData.append("orderId", currentOrder._id);
  formData.append("text", feedbackText);
  formData.append("rating", rating); // Append the rating
  if (feedbackImage) formData.append("image", feedbackImage);

  try {
    const response = await axios.post(`${backendUrl}/api/feedback/add`, formData, { 
      headers: { token } 
    });

    if (response.data.success) {
      toast.success("Feedback recorded in the Archive");
      setShowFeedbackModal(false);
      setFeedbackText("");
      setFeedbackImage(null);
      setRating(5); // Reset rating
    } else {
      toast.error(response.data.message || "Archive sync failed.");
    }
  } catch (error) {
    console.error("Feedback Error:", error);
    toast.error("Submission failed.");
  } finally {
    setSubmitting(false);
  }
};

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

  const downloadInvoice = (order) => {
    try {
        const doc = new jsPDF();
        const logoImg = assets.og; 
        doc.addImage(logoImg, 'PNG', 10, 10, 20, 20);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text("Phila Art", 35, 18);
        doc.setFontSize(8);
        doc.text("G-3, Prakash Kunj Apartment, Kavi Raman Path, Boring Road", 35, 23);
        doc.text("Patna 800001 Bihar India | philapragya@gmail.com", 35, 27);
        doc.text("GSTIN: 10AGUPJ4257E1ZI", 35, 31);

        doc.setFontSize(14);
        doc.text("TAX INVOICE", 140, 18);
        doc.setFontSize(9);
        doc.text(`Invoice #: INV/${order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}`, 140, 25);
        doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 140, 30);

        const addr = order.address || {};
        doc.setFontSize(10);
        doc.text("BILL TO / SHIP TO:", 14, 45);
        doc.setFontSize(9);
        doc.text(`${addr.firstName || ''} ${addr.lastName || ''}`, 14, 50);
        doc.text(`${addr.street || ''}`, 14, 54);
        doc.text(`${addr.city || ''}, ${addr.state || ''} ${addr.zipcode || ''}`, 14, 58);

        const shipping = 100; 
        const totalAmount = order.amount || 0; 
        const subtotalWithTax = totalAmount - shipping; 
        const igst = parseFloat((subtotalWithTax - (subtotalWithTax / 1.05)).toFixed(2));
        const subtotalWithoutTax = subtotalWithTax - igst;

        const tableRows = (order.items || []).map((item, index) => [
            index + 1,
            item.name || 'Specimen',
            "9704",
            item.quantity || 1,
            (item.price || 0).toFixed(2),
            "5%",
            ((item.price || 0) * (item.quantity || 1)).toFixed(2)
        ]);

        autoTable(doc, {
            startY: 70,
            head: [['#', 'Item & Description', 'HSN', 'Qty', 'Rate', 'IGST', 'Amount']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [188, 0, 45] }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        autoTable(doc, {
            startY: finalY,
            margin: { left: 110 }, 
            tableWidth: 85,
            theme: 'plain', 
            styles: { fontSize: 9, cellPadding: 2, textColor: [50, 50, 50] },
            body: [
                ['Sub Total (Without Tax)', `Rs. ${subtotalWithoutTax.toFixed(2)}`],
                ['IGST (5%)', `Rs. ${igst.toFixed(2)}`],
                [{ content: 'Sub Total (Tax Inc.)', styles: { fontStyle: 'bold', borderTop: [0.1, 200, 200, 200] } }, { content: `Rs. ${subtotalWithTax.toFixed(2)}`, styles: { fontStyle: 'bold', borderTop: [0.1, 200, 200, 200] } }],
                ['Shipping Charge', `Rs. ${shipping.toFixed(2)}`],
                [{ content: 'Total', styles: { fontStyle: 'bold', fontSize: 11, textColor: [188, 0, 45], borderTop: [0.5, 188, 0, 45] } }, { content: `Rs. ${totalAmount.toFixed(2)}`, styles: { fontStyle: 'bold', fontSize: 11, textColor: [188, 0, 45], borderTop: [0.5, 188, 0, 45] } }]
            ],
            columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 35, halign: 'right' } }
        });

        const summaryY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(8);
        doc.setTextColor(100); 
        doc.text("BANKING DETAILS:", 14, summaryY);
        doc.text("Bank: HDFC Bank ltd | Branch: Exhibition Road, Patna", 14, summaryY + 5);
        doc.text(`A/c No: 01868730000112 | IFSC Code: HDFC0000186`, 14, summaryY + 9);
        doc.text("UPI ID: philapragya@okhdfcbank", 14, summaryY + 13);

        doc.save(`Invoice_PhilaArt_${order._id ? order._id.slice(-6) : 'Order'}.pdf`);
    } catch (err) {
        toast.error("Invoice generation failed.");
    }
  };

  const handleTrackAsset = (trackingNumber) => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    toast.info("ID Secured to Clipboard. Opening Registry...");
    setTimeout(() => {
        window.open(`https://t.17track.net/en#nums=${trackingNumber}`, "_blank");
    }, 600);
  };

  const processedOrders = useMemo(() => {
    return [...rawOrders].reverse().map((order) => ({
      ...order,
      rewardPoints: Math.floor((order.amount || 0) * 0.10),
      formattedDate: new Date(order.date).toDateString()
    }));
  }, [rawOrders]);

  useEffect(() => {
    if (token) loadOrderData();
  }, [token, loadOrderData]);

  if (loading) return (
    <div className='min-h-screen bg-[#FCF9F4] flex items-center justify-center'>
      <RefreshCw className='animate-spin text-[#BC002D]' size={32} />
    </div>
  );

  return (
    <div className='bg-[#FCF9F4] min-h-screen pt-24 pb-20 px-6 md:px-16 lg:px-24 text-black select-none animate-fade-in'>
      
      {/* SECTION HEADER */}
      <div className='text-3xl mb-12 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
           <Title text1={'CONSIGNMENT'} text2={'LEDGER'} />
           {syncing && <RefreshCw size={16} className='animate-spin text-[#BC002D]' />}
        </div>
        <div className='hidden md:block h-[1px] flex-1 ml-6 bg-gradient-to-r from-[#BC002D]/20 to-transparent'></div>
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
  <div className='fixed inset-0 z-[5000] flex items-center justify-center p-6'>
    <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={() => setShowFeedbackModal(false)}></div>
    <div className='bg-white w-full max-w-lg relative z-10 p-8 rounded-sm shadow-2xl animate-fade-in'>
       <div className='flex justify-between items-center mb-6'>
          <h3 className='font-black uppercase tracking-widest text-sm'>Consignment Feedback</h3>
          <X className='cursor-pointer' onClick={() => setShowFeedbackModal(false)} />
       </div>
       
       <form onSubmit={handleFeedbackSubmit} className='flex flex-col gap-6'>
          
          {/* STAR RATING SECTION */}
          <div className='flex flex-col items-center gap-2 py-4 border-b border-gray-50'>
             <p className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Specimen Grade</p>
             <div className='flex items-center gap-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className='transition-transform hover:scale-125 focus:outline-none'
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    {/* Ensure Star is imported from lucide-react */}
                    <Star 
                      size={24} 
                      className={`transition-colors duration-200 ${
                        (hoverRating || rating) >= star 
                          ? 'fill-[#BC002D] text-[#BC002D]' 
                          : 'text-gray-200'
                      }`} 
                    />
                  </button>
                ))}
             </div>
             <p className='text-[9px] font-bold text-[#BC002D] uppercase tracking-tighter'>
                {rating === 5 ? 'Excellent' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
             </p>
          </div>

          <textarea 
            className='w-full border border-gray-100 p-4 text-xs font-medium outline-none focus:border-[#BC002D] transition-colors' 
            rows="4" 
            placeholder="Describe the specimen quality or service..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          ></textarea>

          <div className='flex items-center gap-4'>
             <label className='flex-1 border-2 border-dashed border-gray-100 p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 transition-all'>
                <Camera size={20} className='text-gray-400' />
                <span className='text-[10px] font-black uppercase text-gray-400 truncate max-w-[200px]'>
                  {feedbackImage ? feedbackImage.name : "Attach Specimen Photo"}
                </span>
                <input type="file" hidden accept="image/*" onChange={(e) => setFeedbackImage(e.target.files[0])} />
             </label>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className='bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#BC002D] transition-all flex items-center justify-center gap-2 disabled:bg-gray-400'
          >
            {submitting ? <RefreshCw className='animate-spin' size={14} /> : "Submit to Archive"}
          </button>
       </form>
    </div>
  </div>
)}

      <div className='max-w-6xl mx-auto'>
        {processedOrders.length === 0 ? (
          <div className='py-32 text-center bg-white rounded-sm border border-black/5'>
            <p className='text-gray-400 font-serif uppercase tracking-[0.2em]'>Registry is empty</p>
          </div>
        ) : (
          processedOrders.map((order) => (
            <div key={order._id} className='group py-8 border border-black/5 bg-white flex flex-col gap-6 px-8 mb-8 rounded-sm shadow-sm hover:border-[#BC002D]/30 transition-all duration-500'>
              
              <div className='flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4'>
                <div className='flex items-center gap-6'>
                  <div>
                    <p className='text-[8px] text-gray-400 uppercase tracking-widest font-black'>Sovereign ID</p>
                    <p className='text-[10px] font-mono font-bold text-[#BC002D]'>#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-[#BC002D]'}`}></div>
                    <p className='text-xs font-black tracking-[0.4em] uppercase text-black'>{order.status}</p>
                  </div>
                </div>
                <div className='flex items-center gap-6'>
                    <button 
                        onClick={() => { setCurrentOrder(order); setShowFeedbackModal(true); }}
                        className='flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-black transition-colors'
                    >
                        <MessageSquare size={14} /> Give Feedback
                    </button>
                    <button onClick={() => downloadInvoice(order)} className='flex items-center gap-2 text-[10px] font-black uppercase text-[#BC002D] hover:underline'>
                        <Download size={14} /> Download Invoice
                    </button>
                </div>
              </div>

              <div className='flex flex-col gap-6'>
                {order.items.map((item, idx) => (
                  <div key={idx} className='flex items-center gap-6'>
                    <div className='w-16 h-20 bg-[#F9F9F9] border border-black/5 flex items-center justify-center overflow-hidden shrink-0'>
                      <img src={item.image?.[0] || assets.logo} alt="" className='w-full h-full object-contain p-1' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-md font-serif text-black tracking-tight'>{item.name}</p>
                      <div className='flex items-center gap-4 mt-1'>
                        <p className='text-[10px] text-gray-400 uppercase font-black'>Quantity: {item.quantity}</p>
                        <p className='text-[10px] text-gray-400 uppercase font-black'>{order.formattedDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className='bg-[#FCF9F4] p-6 rounded-sm flex flex-col lg:flex-row items-center justify-between gap-6'>
                <div className='flex flex-wrap items-center gap-8'>
                  <div>
                    <p className='text-[8px] text-[#BC002D] font-black uppercase tracking-[0.3em] mb-1'>Ledger Value</p>
                    <p className='text-xl font-black tracking-tighter'>₹{order.amount.toFixed(2)}</p>
                  </div>
                  <div className={`flex items-center gap-2 py-2 px-4 border rounded-sm ${order.status === 'Delivered' ? 'border-green-100 bg-green-50' : 'border-[#BC002D]/10 bg-white'}`}>
                    <PackageCheck size={14} className={order.status === 'Delivered' ? 'text-green-600' : 'text-[#BC002D]'} />
                    <p className='text-[10px] font-black uppercase tracking-widest text-black'>Vault Credit: +{order.rewardPoints} PTS</p>
                  </div>
                </div>

                <div className='flex gap-4 w-full lg:w-auto'>
                  {order.trackingNumber && (
                    <button 
                        onClick={() => handleTrackAsset(order.trackingNumber)} 
                        className='flex-1 lg:flex-none bg-black text-white px-8 py-4 text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2 hover:bg-[#BC002D] transition-all'
                    >
                      <Truck size={14} /> Track Asset <ExternalLink size={10} />
                    </button>
                  )}
                  <button 
                    onClick={() => loadOrderData(true)} 
                    className='flex-1 lg:flex-none bg-white border border-black/10 px-8 py-4 text-[9px] font-black uppercase tracking-[0.4em]'
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;