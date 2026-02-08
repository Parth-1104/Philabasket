import React, { useState } from 'react';
import { Download, Database, Settings, ChevronDown, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const RegistryExportDesk = () => {
  const [format, setFormat] = useState('XLSX');
  const [filterBy, setFilterBy] = useState('Order Date');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [orderRange, setOrderRange] = useState({ from: '', to: '' });
  const [statuses, setStatuses] = useState(['Processing']);
  const [sortBy, setSortBy] = useState('Order ID');
  const [sortOrder, setSortOrder] = useState('Descending');

  const handleExport = async () => {
    try {
      const response = await axios.post('/api/export/orders', {
        format,
        filterBy,
        dateRange,
        orderRange,
        statuses,
        sortBy,
        sortOrder
      }, { responseType: 'blob' }); // Important for downloading files

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registry-export-${Date.now()}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      toast.success("Registry Exported Successfully");
    } catch (error) {
      toast.error("Export Failed: " + error.message);
    }
  };

  return (
    <div className='flex bg-[#f1f1f1] min-h-screen font-sans select-none'>
      {/* ... Sidebar remains same as provided ... */}
      <main className='flex-1 p-8 overflow-y-auto'>
        {/* Header and Breadcrumbs ... */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <div className='space-y-6'>
            <section className='bg-white border border-gray-200 shadow-sm rounded-sm p-6'>
              <h4 className='text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100'>Filter orders by:</h4>
              <div className='grid grid-cols-2 gap-4'>
                {['Order Date', 'Modification Date', 'Paid Date', 'Completed Date'].map(opt => (
                  <label key={opt} className='flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer'>
                    <input type="radio" checked={filterBy === opt} onChange={() => setFilterBy(opt)} className='accent-[#0073aa]' />
                    {opt}
                  </label>
                ))}
              </div>
              <div className='mt-8 space-y-6'>
                <div className='flex items-center gap-4'>
                  <span className='text-[13px] font-bold w-24'>Date range:</span>
                  <input type="date" className='border border-gray-300 p-2 text-sm' onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                  <input type="date" className='border border-gray-300 p-2 text-sm' onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
                </div>
              </div>
            </section>
            
            {/* Format Selector */}
            <section className='bg-white border border-gray-200 shadow-sm rounded-sm p-6'>
              <h4 className='text-sm font-bold text-gray-700 mb-6'>Format</h4>
              <div className='grid grid-cols-3 gap-4'>
                {['XLSX', 'CSV', 'JSON', 'PDF'].map(f => (
                  <label key={f} className={`flex items-center justify-between border p-3 rounded-sm cursor-pointer ${format === f ? 'border-[#0073aa] bg-blue-50' : 'border-gray-200'}`}>
                    <span className='text-[12px] font-bold uppercase'>{f}</span>
                    <input type="radio" checked={format === f} onChange={() => setFormat(f)} className='accent-[#0073aa]' />
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className='space-y-6'>
            {/* Sort Settings */}
            <section className='bg-white border border-gray-200 shadow-sm rounded-sm p-6'>
               <div className='flex items-center gap-4'>
                 <span className='text-[13px] font-bold'>Sort by:</span>
                 <select className='border border-gray-300 p-2 text-sm flex-1' onChange={(e) => setSortBy(e.target.value)}>
                   <option>Order ID</option><option>Date</option>
                 </select>
                 <select className='border border-gray-300 p-2 text-sm' onChange={(e) => setSortOrder(e.target.value)}>
                   <option>Descending</option><option>Ascending</option>
                 </select>
               </div>
            </section>
          </div>
        </div>

        <div className='mt-12 bg-[#eee] p-8 border-t border-gray-300 flex justify-end gap-4'>
           <button onClick={handleExport} className='bg-[#0073aa] text-white px-10 py-3 rounded-sm font-bold text-sm shadow-md hover:bg-[#006799] flex items-center gap-2'>
              <Download size={16}/> EXPORT REGISTRY
           </button>
        </div>
      </main>
    </div>
  );
};

export default RegistryExportDesk;