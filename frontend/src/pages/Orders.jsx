import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { Truck, RefreshCw, Download, PackageCheck, ExternalLink } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Orders = () => {
  const { backendUrl, token, fetchUserData } = useContext(ShopContext);
  const [rawOrders, setRawOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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
        const logoImg = assets.og; // Ensure this is a base64 string or valid path
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

        const shipping = 100; // Standard shipping 
        const totalAmount = order.amount || 0; // Final amount paid by customer 
        
        // 1. Sub Total (Tax Inclusive): The value of items before shipping is added 
        const subtotalWithTax = totalAmount - shipping; 
        
        // 2. IGST (5%): Reverse calculate the tax from the inclusive subtotal 
        // Formula: Tax Inclusive Amount - (Tax Inclusive Amount / 1.05)
        const igst = parseFloat((subtotalWithTax - (subtotalWithTax / 1.05)).toFixed(2));
        
        // 3. Sub Total (Without Tax): The base rate before IGST 
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

        // --- FINANCIAL SUMMARY GRID ---
       // --- FINANCIAL SUMMARY GRID ---
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
        // Horizontal line effect using border
        [{ 
            content: 'Sub Total (Tax Inc.)', 
            styles: { fontStyle: 'bold', borderTop: [0.1, 200, 200, 200] } 
        }, 
        { 
            content: `Rs. ${subtotalWithTax.toFixed(2)}`, 
            styles: { fontStyle: 'bold', borderTop: [0.1, 200, 200, 200] } 
        }],
        ['Shipping Charge', `Rs. ${shipping.toFixed(2)}`],
        // Final Total Row
        [{ 
            content: 'Total', 
            styles: { fontStyle: 'bold', fontSize: 11, textColor: [188, 0, 45], borderTop: [0.5, 188, 0, 45] } 
        }, 
        { 
            content: `Rs. ${totalAmount.toFixed(2)}`, 
            styles: { fontStyle: 'bold', fontSize: 11, textColor: [188, 0, 45], borderTop: [0.5, 188, 0, 45] } 
        }]
    ],
    columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35, halign: 'right' }
    }
});

        // --- BANKING & FOOTER DETAILS ---
        const summaryY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(8);
        doc.setTextColor(100); // Subtle gray for bank details
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

      <div className='max-w-6xl mx-auto'>
        {processedOrders.length === 0 ? (
          <div className='py-32 text-center bg-white rounded-sm border border-black/5'>
            <p className='text-gray-400 font-serif uppercase tracking-[0.2em]'>Registry is empty</p>
          </div>
        ) : (
          processedOrders.map((order) => (
            <div key={order._id} className='group py-8 border border-black/5 bg-white flex flex-col gap-6 px-8 mb-8 rounded-sm shadow-sm hover:border-[#BC002D]/30 transition-all duration-500'>
              
              {/* STATUS & METADATA */}
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
                <button onClick={() => downloadInvoice(order)} className='flex items-center gap-2 text-[10px] font-black uppercase text-[#BC002D] hover:underline'>
                  <Download size={14} /> Download Invoice
                </button>
              </div>

              {/* ITEMS LIST */}
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

              {/* FINANCIALS & ACTIONS */}
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