import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import { Upload, FileText, Eye } from 'lucide-react';

const PresentationManager = ({ token }) => {
  const [presentationFile, setPresentationFile] = useState(null);
  const [presentationTitle, setPresentationTitle] = useState('');
  const [presentationDescription, setPresentationDescription] = useState('');
  const [presentationUploading, setPresentationUploading] = useState(false);
  const [currentPresentation, setCurrentPresentation] = useState(null);

  const fetchCurrentPresentation = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/presentation/active`);
      if (res.data.success) {
        setCurrentPresentation(res.data.presentation);
      }
    } catch (error) {
      console.error('Failed fetching current presentation:', error);
    }
  };

  useEffect(() => {
    fetchCurrentPresentation();
  }, []);

  const uploadPresentation = async (e) => {
    e.preventDefault();

    if (!presentationFile) {
      toast.error('Please select a PPTX/PPT/PDF file to upload');
      return;
    }

    setPresentationUploading(true);
    const formDataPayload = new FormData();
    formDataPayload.append('file', presentationFile);
    formDataPayload.append('title', presentationTitle);
    formDataPayload.append('description', presentationDescription);

    try {
      const res = await axios.post(`${backendUrl}/api/presentation/upload`, formDataPayload, {
        headers: {
          token,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success('Presentation uploaded successfully');
        setCurrentPresentation(res.data.presentation);
        setPresentationFile(null);
        setPresentationTitle('');
        setPresentationDescription('');
      } else {
        toast.error(res.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Presentation upload failed:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setPresentationUploading(false);
    }
  };

  return (
    <div className='font-["Nunito",sans-serif] flex flex-col w-full items-start gap-8 p-8 bg-[#FCF9F4] min-h-screen'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-xl font-black uppercase tracking-widest text-gray-900'>Presentation Manager</h2>
        <div className='flex items-center gap-2 text-gray-400'>
          <p className='text-[10px] font-bold uppercase tracking-widest'>Upload a new slideshow and set the active file for site visitors.</p>
        </div>
      </div>

      <div className='w-full max-w-6xl bg-white border border-gray-100 rounded-xl shadow-sm p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <FileText size={18} className='text-[#BC002D]' />
            <div>
              <h3 className='text-lg font-black tracking-tight'>Presentation Slideshow</h3>
              <p className='text-[10px] text-gray-500 mt-1'>Upload a PPTX/PPT/PDF and keep the active presentation available for users.</p>
            </div>
          </div>
          {currentPresentation && (
            <a
              href={currentPresentation.fileUrl}
              target='_blank'
              rel='noreferrer'
              className='text-[10px] font-black uppercase tracking-widest text-[#BC002D] hover:underline flex items-center gap-1'
            >
              <Eye size={14} /> View Active
            </a>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='md:col-span-2 space-y-3'>
            <label className='text-[10px] font-black uppercase tracking-widest text-gray-600'>Title</label>
            <input
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
              placeholder='Presentation title'
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#BC002D]'
            />

            <label className='text-[10px] font-black uppercase tracking-widest text-gray-600'>Description</label>
            <textarea
              value={presentationDescription}
              onChange={(e) => setPresentationDescription(e.target.value)}
              placeholder='Short description (optional)'
              rows={3}
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#BC002D] resize-none'
            />

            <label className='text-[10px] font-black uppercase tracking-widest text-gray-600'>File (PPTX / PPT / PDF)</label>
            <input
              type='file'
              accept='.ppt,.pptx,.pdf'
              onChange={(e) => setPresentationFile(e.target.files?.[0] ?? null)}
              className='w-full text-sm'
            />
          </div>

          <div className='flex flex-col justify-between p-4 border border-gray-100 rounded-lg bg-gray-50'>
            <p className='text-[10px] text-gray-500'>Current Active Presentation:</p>
            {currentPresentation ? (
              <div className='space-y-1'>
                <p className='text-sm font-bold'>{currentPresentation.title}</p>
                <p className='text-[10px] text-gray-500 line-clamp-2'>{currentPresentation.description}</p>
                <p className='text-[10px] font-black text-gray-500'>Uploaded: {new Date(currentPresentation.createdAt).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className='text-[10px] text-gray-400'>No active presentation yet.</p>
            )}
            <button
              onClick={uploadPresentation}
              type='button'
              disabled={presentationUploading}
              className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${presentationUploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#BC002D] text-white hover:bg-[#80001f]'}`}
            >
              {presentationUploading ? 'Uploading…' : 'Upload Presentation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationManager;
