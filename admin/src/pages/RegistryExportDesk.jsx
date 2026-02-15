import React, { useState, useContext } from 'react';
import { Download, Database, Settings, ChevronDown, Filter, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify'; 
import { backendUrl } from '../App';
// CRITICAL: Import your context

const RegistryExportDesk = ({token}) => {
  // Pull variables from context
  // const { backendUrl, token } = useContext(ShopContext);

  const [format, setFormat] = useState('XLSX');
  const [filterBy, setFilterBy] = useState('Order Date');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statuses, setStatuses] = useState(['Order Placed', 'Packing', 'Shipped', 'Delivered']);
  const [sortBy, setSortBy] = useState('Date');
  const [sortOrder, setSortOrder] = useState('Descending');

  // Toggle statuses for filtering
  const handleStatusToggle = (status) => {
    setStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleExport = async () => {
    if (!token) return toast.error("Authentication Missing");
    
    const loadingToast = toast.loading(`Generating ${format} Archive...`);
    try {
      const response = await axios.post(`${backendUrl}/api/export/registry-export`, {
        format, 
        filterBy, 
        dateRange, 
        statuses, 
        sortBy, 
        sortOrder
      }, { 
        headers: { token }, 
        responseType: 'blob' // Critical for file handling
      });

      // Handle binary response
      const blob = new Blob([response.data], { 
          type: response.headers['content-type'] 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const ext = format.toLowerCase();
      link.setAttribute('download', `philabasket-registry-${Date.now()}.${ext}`);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.update(loadingToast, { render: "Registry Exported", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error("Export Error:", error);
      toast.update(loadingToast, { render: "Export Failed: Verify Date Range", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className='flex bg-[#f1f1f1] min-h-screen font-sans select-none'>
      <main className='flex-1 p-8 overflow-y-auto'>
        <div className='max-w-6xl mx-auto'>
          <h3 className='text-xl font-black text-gray-900 uppercase tracking-tighter mb-8'>Registry Export Desk</h3>
          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='space-y-6'>
              {/* Date Filters */}
              <section className='bg-white border border-gray-200 shadow-sm p-6 rounded-md'>
                <h4 className='text-[10px] font-black text-[#BC002D] uppercase tracking-widest mb-6'>Temporal Filters</h4>
                <div className='grid grid-cols-1 gap-4'>
                  <div className='flex items-center gap-4'>
                    <span className='text-[11px] font-bold w-24 uppercase'>Start Date</span>
                    <input type="date" className='border border-gray-200 p-2 text-xs flex-1 outline-none' onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                  </div>
                  <div className='flex items-center gap-4'>
                    <span className='text-[11px] font-bold w-24 uppercase'>End Date</span>
                    <input type="date" className='border border-gray-200 p-2 text-xs flex-1 outline-none' onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
                  </div>
                </div>
              </section>

              {/* Status Filters */}
              <section className='bg-white border border-gray-200 shadow-sm p-6 rounded-md'>
                <h4 className='text-[10px] font-black text-[#BC002D] uppercase tracking-widest mb-6'>Status Inclusion</h4>
                <div className='grid grid-cols-2 gap-3'>
                  {['Order Placed', 'Packing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                    <label key={s} className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-all ${statuses.includes(s) ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <input type="checkbox" checked={statuses.includes(s)} onChange={() => handleStatusToggle(s)} className='hidden' />
                      <span className='text-[9px] font-black uppercase tracking-widest'>{s}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className='space-y-6'>
              {/* Format Selection */}
              <section className='bg-white border border-gray-200 shadow-sm p-6 rounded-md'>
                <h4 className='text-[10px] font-black text-[#BC002D] uppercase tracking-widest mb-6'>Export Protocol</h4>
                <div className='grid grid-cols-3 gap-4'>
                  {['XLSX', 'CSV', 'JSON'].map(f => (
                    <button key={f} onClick={() => setFormat(f)} className={`p-4 border flex flex-col items-center gap-2 transition-all ${format === f ? 'border-black bg-black text-white' : 'bg-white text-gray-400 border-gray-100'}`}>
                      {f === 'JSON' ? <FileJson size={16}/> : f === 'XLSX' ? <FileSpreadsheet size={16}/> : <FileText size={16}/>}
                      <span className='text-[10px] font-black'>{f}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Sorting */}
              <section className='bg-white border border-gray-200 shadow-sm p-6 rounded-md'>
                <h4 className='text-[10px] font-black text-[#BC002D] uppercase tracking-widest mb-6'>Registry Sorting</h4>
                <div className='flex flex-col gap-4'>
                  <select className='border border-gray-100 p-3 text-[10px] font-black uppercase' value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="Date">Order Date</option>
                    <option value="Order ID">Registry ID</option>
                  </select>
                  <select className='border border-gray-100 p-3 text-[10px] font-black uppercase' value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="Descending">Descending (Newest First)</option>
                    <option value="Ascending">Ascending (Oldest First)</option>
                  </select>
                </div>
              </section>
            </div>
          </div>

          <div className='mt-12 bg-gray-200 p-8 flex justify-end items-center gap-6 rounded-md'>
             <p className='text-[9px] font-bold text-gray-500 uppercase tracking-widest'>Preparing dump for {statuses.length} status categories</p>
             <button onClick={handleExport} className='bg-black text-white px-12 py-4 text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-[#BC002D] transition-all flex items-center gap-3'>
                <Download size={18}/> Execute Export
             </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistryExportDesk;