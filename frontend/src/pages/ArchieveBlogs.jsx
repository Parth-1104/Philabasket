import React, { useEffect, useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArchiveBlogs = () => {
    const { backendUrl } = useContext(ShopContext);
    const [blogs, setBlogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(backendUrl + "/api/blog/list");
                if(response.data.success) setBlogs(response.data.blogs);
            } catch (error) {
                console.error("Registry fetch failed", error);
            }
        };
        fetchBlogs();
    }, [backendUrl]);

    return (
        <div className='pt-32 pb-24 px-[6%] bg-white min-h-screen relative overflow-hidden'>
            <div className="absolute -right-[10vw] top-0 h-[50vh] w-[40vw] bg-[#BC002D]/5 rounded-bl-[500px] pointer-events-none"></div>

            <div className='mb-24 relative z-10'>
                <div className='flex items-center gap-4 mb-4'>
                    <span className='h-[1.5px] w-12 bg-[#BC002D]'></span>
                    <p className='text-[10px] font-black text-[#BC002D] tracking-[0.5em] uppercase'>Intel Briefings</p>
                </div>
                <h1 className='text-6xl md:text-9xl font-bold tracking-tighter text-gray-900 leading-none'>
                    THE <br />
                    <span className='text-[#BC002D] italic font-light'>ARCHIVE.</span>
                </h1>
            </div>

            {/* --- RECTANGULAR GRID --- */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10'>
                {blogs.map((blog, index) => (
                    <div 
                        key={index} 
                        onClick={() => navigate(`/blog/${blog._id}`)}
                        className='group cursor-pointer bg-white border border-black/5 hover:border-[#BC002D]/20 transition-all duration-500 flex flex-col'
                    >
                        {/* Rectangular Image */}
                        <div className='overflow-hidden relative bg-gray-100 aspect-[16/10]'>
                            <img 
                                src={blog.image} 
                                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000' 
                                alt={blog.title} 
                            />
                            <div className='absolute top-0 left-0 bg-[#BC002D] text-white px-4 py-2 text-[8px] font-black uppercase tracking-widest'>
                                {blog.category || "Classified"}
                            </div>
                        </div>

                        <div className='p-8 flex flex-col flex-1'>
                            <div className='flex items-center justify-between mb-6'>
                                <p className='text-[9px] font-black text-gray-400 uppercase tracking-widest'>
                                    {new Date(blog.date).toLocaleDateString('en-GB')}
                                </p>
                                <div className='w-8 h-8 rounded-full border border-black/5 flex items-center justify-center group-hover:bg-[#BC002D] group-hover:border-[#BC002D] transition-all'>
                                    <ArrowUpRight size={14} className='text-gray-300 group-hover:text-white transition-colors' />
                                </div>
                            </div>

                            <h2 className='text-xl font-bold text-gray-900 leading-tight mb-4 uppercase tracking-tighter'>
                                {blog.title}
                            </h2>
                            
                            <p className='text-gray-500 text-[11px] font-medium leading-relaxed mb-8 line-clamp-3 uppercase'>
                                {blog.content}
                            </p>

                            <div className='mt-auto flex items-center gap-3 pt-6 border-t border-black/[0.05]'>
                                <p className='text-[8px] font-black uppercase tracking-widest text-[#BC002D]'>
                                    Read Analysis —
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ArchiveBlogs;