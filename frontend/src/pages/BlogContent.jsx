import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { ChevronLeft, Calendar, User } from 'lucide-react';

const BlogContent = () => {
    const { blogId } = useParams();
    const { backendUrl } = useContext(ShopContext);
    const [blog, setBlog] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogDetails = async () => {
            try {
                const response = await axios.get(backendUrl + "/api/blog/list");
                if (response.data.success) {
                    const found = response.data.blogs.find(b => b._id === blogId);
                    setBlog(found);
                }
            } catch (error) {
                console.error("Detail fetch failed", error);
            }
        };
        fetchBlogDetails();
        window.scrollTo(0, 0);
    }, [blogId, backendUrl]);

    if (!blog) return <div className='min-h-screen bg-white'></div>;

    return (
        <div className='bg-white min-h-screen pt-32 pb-24 px-6 select-none'>
            <div className='max-w-4xl mx-auto'>
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/blogs')}
                    className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#BC002D] transition-colors mb-12'
                >
                    <ChevronLeft size={14} /> Return to Archive
                </button>

                {/* Header Section */}
                <div className='mb-16'>
                    <p className='text-[#BC002D] text-[10px] font-black uppercase tracking-[0.5em] mb-6'>
                        {blog.category} // INTEL REPORT
                    </p>
                    <h1 className='text-4xl md:text-7xl font-bold text-gray-900 tracking-tighter leading-none mb-10 uppercase'>
                        {blog.title}
                    </h1>

                    <div className='flex flex-wrap items-center gap-8 py-8 border-y border-black/5'>
                        <div className='flex items-center gap-3'>
                            <Calendar size={14} className='text-[#BC002D]' />
                            <span className='text-[10px] font-black uppercase tracking-widest text-gray-400'>
                                {new Date(blog.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <User size={14} className='text-[#BC002D]' />
                            <span className='text-[10px] font-black uppercase tracking-widest text-gray-400'>
                                CURATOR: {blog.author || "Registry Staff"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className='mb-16 bg-gray-50 p-4 border border-black/5'>
                    <img src={blog.image} className='w-fit h-fit object-cover' alt="Specimen Analysis" />
                </div>

                {/* Full Narrative Content */}
                <div className='prose prose-lg max-w-none'>
                    <p className='text-gray-800 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium'>
                        {blog.content}
                    </p>
                </div>

                {/* Footer Quote */}
                <div className='mt-24 pt-12 border-t border-[#BC002D]/20 flex flex-col items-center'>
                    <div className='w-1 h-1 bg-[#BC002D] rounded-full mb-4'></div>
                    <p className='text-[9px] text-gray-300 font-black uppercase tracking-[0.8em]'>
                        Official Philabasket Intelligence Record
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BlogContent;